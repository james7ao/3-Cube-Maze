import { ORIENTS, matMul, orientIndex, horizDirs, RZ, RZn, RX, RXn } from './matrixMath';

const DIRS = [
  [1, 0, 0], [-1, 0, 0],
  [0, 1, 0], [0, -1, 0],
  [0, 0, 1], [0, 0, -1]
];

function dirKey(d) {
  return d.join(',');
}

function negDir(d) {
  return [-d[0], -d[1], -d[2]];
}

export function genMaze(N, rng) {
  const open = {};
  const key = (x, y, z) => `${x},${y},${z}`;

  for (let x = 0; x < N; x++)
    for (let y = 0; y < N; y++)
      for (let z = 0; z < N; z++)
        open[key(x, y, z)] = new Set();

  const visited = new Set();
  const start = [(N / 2) | 0, (N / 2) | 0, (N / 2) | 0];
  const stack = [start];
  visited.add(key(...start));

  while (stack.length) {
    const [x, y, z] = stack[stack.length - 1];
    const nbrs = [];

    for (const d of DIRS) {
      const nx = x + d[0], ny = y + d[1], nz = z + d[2];
      if (nx < 0 || ny < 0 || nz < 0 || nx >= N || ny >= N || nz >= N) continue;
      if (!visited.has(key(nx, ny, nz))) nbrs.push(d);
    }

    if (nbrs.length === 0) {
      stack.pop();
      continue;
    }

    const d = nbrs[(rng() * nbrs.length) | 0];
    const nx = x + d[0], ny = y + d[1], nz = z + d[2];
    open[key(x, y, z)].add(dirKey(d));
    open[key(nx, ny, nz)].add(dirKey(negDir(d)));
    visited.add(key(nx, ny, nz));
    stack.push([nx, ny, nz]);
  }

  return open;
}

export function isOpen(open, N, c, d) {
  return open[`${c[0]},${c[1]},${c[2]}`].has(dirKey(d));
}

export function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function solveBFS(open, N, pivots, startCell, startOri) {
  const key = (c, o) => `${c[0]},${c[1]},${c[2]}|${o}`;
  const dist = new Map();
  const q = [];
  const s = { c: startCell, o: startOri };
  dist.set(key(startCell, startOri), 0);
  q.push(s);

  let head = 0;
  const rotUsed = new Map();
  rotUsed.set(key(startCell, startOri), false);

  while (head < q.length) {
    const { c, o } = q[head++];
    const R = ORIENTS.list[o];
    const kk = key(c, o);
    const d0 = dist.get(kk);
    const usedRot = rotUsed.get(kk);

    // Horizontal moves
    for (const hd of horizDirs(R)) {
      const nc = [c[0] + hd[0], c[1] + hd[1], c[2] + hd[2]];
      if (nc[0] < 0 || nc[1] < 0 || nc[2] < 0 || nc[0] >= N || nc[1] >= N || nc[2] >= N) continue;
      if (!isOpen(open, N, c, hd)) continue;
      const nk = key(nc, o);
      if (dist.has(nk)) continue;
      dist.set(nk, d0 + 1);
      rotUsed.set(nk, usedRot);
      q.push({ c: nc, o });
    }

    // Rotations on pivot
    if (pivots.has(`${c[0]},${c[1]},${c[2]}`)) {
      for (const G of [RZ, RZn, RX, RXn]) {
        const nR = matMul(G, R);
        const no = orientIndex(nR);
        const nk = key(c, no);
        if (dist.has(nk)) continue;
        dist.set(nk, d0 + 1);
        rotUsed.set(nk, true);
        q.push({ c, o: no });
      }
    }
  }

  const cellBest = new Map();
  for (const [k, d] of dist) {
    const cell = k.split('|')[0];
    if (!cellBest.has(cell) || d < cellBest.get(cell)) cellBest.set(cell, d);
  }

  return { dist, cellBest };
}

export function buildLevel(N, seed) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const rng = makeRng(seed + attempt * 7919);
    const open = genMaze(N, rng);

    const pivots = new Set();
    const cx = (N / 2) | 0;
    pivots.add(`${cx},${cx},${cx}`);

    const target = Math.max(3, Math.round(N * N * N * 0.32));
    while (pivots.size < target) {
      const x = (rng() * N) | 0;
      const y = (rng() * N) | 0;
      const z = (rng() * N) | 0;
      pivots.add(`${x},${y},${z}`);
    }

    const startCell = [cx, cx, cx];
    const startOri = 0;
    const { cellBest } = solveBFS(open, N, pivots, startCell, startOri);

    let best = null, bestD = -1;
    for (const [cell, d] of cellBest) {
      if (d > bestD) {
        bestD = d;
        best = cell;
      }
    }

    const minWanted = N <= 3 ? 4 : (N <= 5 ? 9 : 12);
    if (best && bestD >= minWanted) {
      const goal = best.split(',').map(Number);
      return {
        N, open, pivots, startCell, startOri,
        goal, seed: seed + attempt * 7919, par: bestD
      };
    }
  }

  const rng = makeRng(seed);
  const open = genMaze(N, rng);
  const cx = (N / 2) | 0;
  const pivots = new Set([`${cx},${cx},${cx}`]);

  return {
    N, open, pivots, startCell: [cx, cx, cx], startOri: 0,
    goal: [0, 0, 0], seed, par: 0
  };
}
