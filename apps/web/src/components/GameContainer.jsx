import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { buildLevel } from '../utils/mazeGeneration';
import { ORIENTS, matMul, matVec, orientIndex, upAxisOf, horizDirs, RX, RXn, RZ, RZn } from '../utils/matrixMath';
import { solvePath } from '../utils/solver';
import { isOpen } from '../utils/mazeGeneration';
import HUD from './HUD';
import Controls from './Controls';
import Toast from './Toast';
import Help from './Help';
import RotationHint from './RotationHint';

const LIMIT_FACTOR = 2.5;
const ROT_OPS = [RZ, RZn, RX, RXn];
const ROT_DUR = 640;
const MOVE_DUR = 150;

const COL = {
  floor: 0x223066,
  floorEdge: 0x4a5db5,
  wall: 0x6f7fd6,
  wallTop: 0x9fb0ff,
  ghost: 0x1b2447,
  ghostEdge: 0x2c3a72,
  player: 0xffd45a,
  goal: 0x5affa1,
  pivot: 0xc77dff,
};

function smoother(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export default function GameContainer() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const cubeGroupRef = useRef(null);
  const trailGroupRef = useRef(null);
  const playerObjRef = useRef(null);

  const [gameState, setGameState] = useState({
    level: null,
    N: 5,
    R: null,
    p: null,
    visited: new Set(),
    trail: [],
    moves: 0,
    rots: 0,
    won: false,
    lost: false,
    is2D: false,
    auto: false,
    autoStates: [],
    autoIdx: 0,
    curSize: 5,
    moveLimit: 0,
    currentSeed: 0,
  });

  const animRotRef = useRef(null);
  const animMoveRef = useRef(null);
  const orbitRef = useRef({ az: 0.7, el: 0.62, dist: 0, drag: false, px: 0, py: 0 });
  const raRef = useRef(null);
  const dynamicRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c1020, 0.045);

    const w = window.innerWidth;
    const h = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h);
    containerRef.current.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0x90a0ff, 0.55);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(6, 12, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x6a8cff, 0.5);
    rim.position.set(-8, 4, -6);
    scene.add(rim);

    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    const trailGroup = new THREE.Group();
    cubeGroup.add(trailGroup);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    cubeGroupRef.current = cubeGroup;
    trailGroupRef.current = trailGroup;

    // Orbit controls
    const onPointerDown = (e) => {
      orbitRef.current.drag = true;
      orbitRef.current.px = e.clientX;
      orbitRef.current.py = e.clientY;
    };

    const onPointerUp = () => {
      orbitRef.current.drag = false;
    };

    const onPointerMove = (e) => {
      if (!orbitRef.current.drag || gameState.is2D) return;
      orbitRef.current.az -= (e.clientX - orbitRef.current.px) * 0.008;
      orbitRef.current.el = Math.max(
        0.08,
        Math.min(1.45, orbitRef.current.el - (e.clientY - orbitRef.current.py) * 0.006)
      );
      orbitRef.current.px = e.clientX;
      orbitRef.current.py = e.clientY;
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (gameState.is2D) {
        setupOrtho(camera);
      } else {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    const startLevel = (size, seed) => {
      const N = size;
      const level = buildLevel(N, seed || ((Math.random() * 1e9) | 0));
      const R = ORIENTS.list[level.startOri];
      const p = level.startCell.slice();
      const currentSeed = level.seed;
      const moveLimit = Math.max(level.par + 8, Math.round(level.par * LIMIT_FACTOR));

      setGameState((prev) => ({
        ...prev,
        level,
        N,
        R,
        p,
        visited: new Set([p.join(',')]),
        trail: [p.slice()],
        moves: 0,
        rots: 0,
        won: false,
        lost: false,
        auto: false,
        autoStates: [],
        autoIdx: 0,
        curSize: size,
        moveLimit,
        currentSeed,
      }));

      cubeGroup.quaternion.identity();
      buildScene(N, level, R, p);
      animate();
    };

    const buildScene = (N, level, R, p) => {
      clearDynamic();
      const spacing = 1.0;
      const up = upAxisOf(R);
      const upVal = p[up.axis];

      const cubeSize = N * spacing;
      const wf = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)),
        new THREE.LineBasicMaterial({ color: 0x3a4677, transparent: true, opacity: 0.35 })
      );
      cubeGroup.add(wf);
      dynamicRef.current.push(wf);

      const tile = 0.9 * spacing;
      const center = (N - 1) / 2;

      for (let x = 0; x < N; x++) {
        for (let y = 0; y < N; y++) {
          for (let z = 0; z < N; z++) {
            const c = [x, y, z];
            const inLayer = c[up.axis] === upVal;
            const v = [c[0] - center, c[1] - center, c[2] - center];
            const w = matVec(R, v);
            const wpos = new THREE.Vector3(w[0] * spacing, w[1] * spacing, w[2] * spacing);

            if (inLayer) {
              const isPivot = level.pivots.has(`${x},${y},${z}`);
              const isGoal = x === level.goal[0] && y === level.goal[1] && z === level.goal[2];
              const col = isGoal ? COL.goal : isPivot ? COL.pivot : COL.floor;
              const t = tileMesh(tile, col, 1, isGoal || isPivot ? col : 0);
              t.position.copy(wpos);
              cubeGroup.add(t);
              dynamicRef.current.push(t);

              const eb = edgeBox(
                tile,
                0.08,
                isGoal ? COL.goal : isPivot ? COL.pivot : COL.floorEdge,
                0.9
              );
              eb.position.copy(wpos);
              cubeGroup.add(eb);
              dynamicRef.current.push(eb);

              for (const hd of horizDirs(R)) {
                const nc = [x + hd[0], y + hd[1], z + hd[2]];
                const oob =
                  nc[0] < 0 || nc[1] < 0 || nc[2] < 0 || nc[0] >= N || nc[1] >= N || nc[2] >= N;
                const blocked = oob || !isOpen(level.open, N, c, hd);
                if (!blocked) continue;

                const worldDir = matVec(R, hd);
                const wallMesh = new THREE.Mesh(
                  new THREE.BoxGeometry(tile * 1.02, 0.42, 0.07),
                  new THREE.MeshStandardMaterial({
                    color: COL.wall,
                    emissive: COL.wall,
                    emissiveIntensity: 0.12,
                    roughness: 0.6,
                  })
                );
                const mid = wpos
                  .clone()
                  .add(new THREE.Vector3(worldDir[0], worldDir[1], worldDir[2]).multiplyScalar(tile * 0.5));
                mid.y += 0.21;
                wallMesh.position.copy(mid);
                wallMesh.lookAt(
                  mid.clone().add(new THREE.Vector3(worldDir[0], 0, worldDir[2]))
                );
                cubeGroup.add(wallMesh);
                dynamicRef.current.push(wallMesh);
              }
            } else {
              const g = tileMesh(tile * 0.92, COL.ghost, 0.13, 0);
              g.position.copy(wpos);
              cubeGroup.add(g);
              dynamicRef.current.push(g);

              if (x === level.goal[0] && y === level.goal[1] && z === level.goal[2]) {
                const gm = tileMesh(tile * 0.5, COL.goal, 0.4, COL.goal);
                gm.position.copy(wpos);
                cubeGroup.add(gm);
                dynamicRef.current.push(gm);
              }
            }
          }
        }
      }

      addPlayer(N, level, R, p, spacing);
      rebuildTrail(N, level, R, p, spacing);
    };

    const tileMesh = (size, color, opacity, emissive) => {
      const g = new THREE.BoxGeometry(size, 0.08, size);
      const m = new THREE.MeshStandardMaterial({
        color,
        transparent: opacity < 1,
        opacity,
        emissive: emissive || 0x000000,
        emissiveIntensity: emissive ? 0.55 : 0,
        roughness: 0.8,
        metalness: 0.05,
      });
      return new THREE.Mesh(g, m);
    };

    const edgeBox = (size, h, color, opacity) => {
      const g = new THREE.BoxGeometry(size, h, size);
      const e = new THREE.EdgesGeometry(g);
      const m = new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity });
      return new THREE.LineSegments(e, m);
    };

    const clearDynamic = () => {
      for (const o of dynamicRef.current) {
        cubeGroup.remove(o);
        if (o.geometry) o.geometry.dispose();
        if (o.material && o.material.dispose) o.material.dispose();
      }
      dynamicRef.current = [];
    };

    const addPlayer = (N, level, R, p, spacing) => {
      const pg = new THREE.Group();
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.26, 24, 18),
        new THREE.MeshStandardMaterial({
          color: COL.player,
          emissive: COL.player,
          emissiveIntensity: 0.5,
          roughness: 0.3,
        })
      );
      ball.position.y = 0.28;
      pg.add(ball);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.34, 0.03, 8, 28),
        new THREE.MeshStandardMaterial({
          color: COL.player,
          emissive: COL.player,
          emissiveIntensity: 0.6,
        })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.06;
      pg.add(ring);

      const center = (N - 1) / 2;
      const v = [p[0] - center, p[1] - center, p[2] - center];
      const w = matVec(R, v);
      const wpos = new THREE.Vector3(w[0] * spacing, w[1] * spacing, w[2] * spacing);
      pg.position.copy(wpos);
      cubeGroup.add(pg);
      dynamicRef.current.push(pg);
      playerObjRef.current = pg;
    };

    const clearTrail = () => {
      while (trailGroup.children.length) {
        const c = trailGroup.children.pop();
        if (c.geometry) c.geometry.dispose();
        if (c.material && c.material.dispose) c.material.dispose();
      }
    };

    const rebuildTrail = (N, level, R, p, spacing) => {
      clearTrail();
      drawPath(N, level, R, p, spacing, false);
    };

    const drawPath = (N, level, R, p, spacing, spin) => {
      const up = upAxisOf(R);
      const upVal = p[up.axis];
      const op = spin ? 0.4 : 0.96;
      const thick = 0.055 * spacing;
      const lift = 0.17;
      const center = (N - 1) / 2;

      const wp = (c) => {
        const v = [c[0] - center, c[1] - center, c[2] - center];
        const w = matVec(R, v);
        const pos = new THREE.Vector3(w[0] * spacing, w[1] * spacing, w[2] * spacing);
        pos.y += lift;
        return pos;
      };

      for (let i = 1; i < gameState.trail.length; i++) {
        const a = gameState.trail[i - 1];
        const b = gameState.trail[i];
        if (a[0] === b[0] && a[1] === b[1] && a[2] === b[2]) continue;
        if (!spin && (a[up.axis] !== upVal || b[up.axis] !== upVal)) continue;
        addSeg(wp(a), wp(b), op, thick);
      }

      for (const k of gameState.visited) {
        const c = k.split(',').map(Number);
        if (!spin && c[up.axis] !== upVal) continue;
        const s = new THREE.Mesh(
          new THREE.SphereGeometry(thick * 1.6, 12, 10),
          new THREE.MeshStandardMaterial({
            color: 0xffe14d,
            emissive: 0xffd000,
            emissiveIntensity: 0.75,
            transparent: op < 1,
            opacity: op,
            roughness: 0.3,
          })
        );
        s.position.copy(wp(c));
        trailGroup.add(s);
      }
    };

    const addSeg = (wa, wb, opacity, thick) => {
      const len = wa.distanceTo(wb);
      if (len < 1e-4) return;
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(thick, thick, len, 8),
        new THREE.MeshStandardMaterial({
          color: 0xffe14d,
          emissive: 0xffd000,
          emissiveIntensity: 0.75,
          transparent: opacity < 1,
          opacity,
          roughness: 0.3,
        })
      );
      m.position.copy(wa.clone().add(wb).multiplyScalar(0.5));
      m.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        wb.clone().sub(wa).normalize()
      );
      trailGroup.add(m);
    };

    const setupOrtho = (cam) => {
      const N = gameState.N;
      const spacing = 1.0;
      const N0 = N * spacing;
      const aspect = window.innerWidth / window.innerHeight;
      const s = N0 * 0.62;
      cameraRef.current = new THREE.OrthographicCamera(
        -s * aspect,
        s * aspect,
        s,
        -s,
        0.1,
        200
      );
      cameraRef.current.position.set(0, 12, 0.001);
      cameraRef.current.lookAt(0, 0, 0);
    };

    const updateCamera = () => {
      const spacing = 1.0;
      if (gameState.is2D) {
        cameraRef.current.position.set(0, 14, 0.001);
        cameraRef.current.up.set(0, 0, -1);
        cameraRef.current.lookAt(0, 0, 0);
      } else {
        const d = gameState.N * spacing * 1.7 + 3;
        cameraRef.current.position.set(
          d * Math.cos(orbitRef.current.el) * Math.sin(orbitRef.current.az),
          d * Math.sin(orbitRef.current.el),
          d * Math.cos(orbitRef.current.el) * Math.cos(orbitRef.current.az)
        );
        cameraRef.current.up.set(0, 1, 0);
        cameraRef.current.lookAt(0, 0, 0);
      }
    };

    let lastT = performance.now();

    const animate = () => {
      raRef.current = requestAnimationFrame(animate);
      const now = performance.now();
      let dt = now - lastT;
      lastT = now;
      if (dt > 60) dt = 60;

      if (animRotRef.current) {
        animRotRef.current.el += dt;
        const t = Math.min(1, animRotRef.current.el / ROT_DUR);
        const e = smoother(t);
        THREE.Quaternion.slerp(
          animRotRef.current.q0,
          animRotRef.current.q1,
          cubeGroup.quaternion,
          e
        );
        if (t >= 1) {
          cubeGroup.quaternion.identity();
          // Handle rotation completion
          animRotRef.current = null;
        }
      }

      if (animMoveRef.current && playerObjRef.current) {
        animMoveRef.current.el += dt;
        const t = Math.min(1, animMoveRef.current.el / MOVE_DUR);
        const e = smoother(t);
        playerObjRef.current.position.lerpVectors(
          animMoveRef.current.from,
          animMoveRef.current.to,
          e
        );
        if (t >= 1) {
          animMoveRef.current = null;
        }
      }

      updateCamera();
      renderer.render(scene, cameraRef.current);
    };

    startLevel(5);

    return () => {
      cancelAnimationFrame(raRef.current);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <div ref={containerRef} id="scene" />
      {gameState.level && (
        <>
          <HUD state={gameState} />
          <Controls state={gameState} />
          <Toast state={gameState} />
          <Help />
          <RotationHint state={gameState} />
        </>
      )}
    </>
  );
}
