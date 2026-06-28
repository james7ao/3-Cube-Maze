import type { Vector3, Matrix3x3, UpAxis } from '@cube-maze/types';

export const I3: Matrix3x3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

export function matMul(A: Matrix3x3, B: Matrix3x3): Matrix3x3 {
  const C: Matrix3x3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let s = 0;
      for (let k = 0; k < 3; k++) {
        s += A[i][k] * B[k][j];
      }
      C[i][j] = s;
    }
  }
  return C;
}

export function matT(A: Matrix3x3): Matrix3x3 {
  return [
    [A[0][0], A[1][0], A[2][0]],
    [A[0][1], A[1][1], A[2][1]],
    [A[0][2], A[1][2], A[2][2]]
  ];
}

export function matVec(A: Matrix3x3, v: Vector3): Vector3 {
  return [
    A[0][0] * v[0] + A[0][1] * v[1] + A[0][2] * v[2],
    A[1][0] * v[0] + A[1][1] * v[1] + A[1][2] * v[2],
    A[2][0] * v[0] + A[2][1] * v[1] + A[2][2] * v[2]
  ];
}

export function matKey(A: Matrix3x3): string {
  return A.map(r => r.join(',')).join(';');
}

const RX: Matrix3x3 = [[1, 0, 0], [0, 0, -1], [0, 1, 0]];
const RY: Matrix3x3 = [[0, 0, 1], [0, 1, 0], [-1, 0, 0]];
export const RZ: Matrix3x3 = [[0, -1, 0], [1, 0, 0], [0, 0, 1]];
const RXn = matT(RX);
const RYn = matT(RY);
export const RZn = matT(RZ);
export const RXmat = RX;
export const RXnmat = RXn;

export function generateOrientations() {
  const seen = new Map<string, number>();
  const list: Matrix3x3[] = [];
  const stack: Matrix3x3[] = [I3];

  while (stack.length) {
    const M = stack.pop()!;
    const k = matKey(M);
    if (seen.has(k)) continue;
    seen.set(k, list.length);
    list.push(M);
    for (const G of [RX, RY, RZ]) {
      stack.push(matMul(G, M));
    }
  }
  return { list, index: seen };
}

export const ORIENTS = generateOrientations();

export function orientIndex(R: Matrix3x3): number {
  const idx = ORIENTS.index.get(matKey(R));
  if (idx === undefined) throw new Error('Invalid orientation matrix');
  return idx;
}

export function upAxisOf(R: Matrix3x3): UpAxis {
  const v = matVec(matT(R), [0, 1, 0]);
  for (let a = 0; a < 3; a++) {
    if (v[a as 0 | 1 | 2] !== 0) {
      return { axis: a as 0 | 1 | 2, sign: v[a as 0 | 1 | 2] as -1 | 1 };
    }
  }
  throw new Error('No up axis found');
}

export function horizDirs(R: Matrix3x3): Vector3[] {
  const Rt = matT(R);
  return [
    matVec(Rt, [0, 0, -1]),
    matVec(Rt, [0, 0, 1]),
    matVec(Rt, [-1, 0, 0]),
    matVec(Rt, [1, 0, 0])
  ];
}

export const ROT_OPS: Matrix3x3[] = [RZ, RZn, RXmat, RXnmat];
