export const I3 = [[1,0,0],[0,1,0],[0,0,1]];

export function matMul(A, B) {
  const C = [[0,0,0],[0,0,0],[0,0,0]];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      let s = 0;
      for (let k = 0; k < 3; k++) s += A[i][k] * B[k][j];
      C[i][j] = s;
    }
  return C;
}

export function matT(A) {
  return [
    [A[0][0], A[1][0], A[2][0]],
    [A[0][1], A[1][1], A[2][1]],
    [A[0][2], A[1][2], A[2][2]]
  ];
}

export function matVec(A, v) {
  return [
    A[0][0]*v[0] + A[0][1]*v[1] + A[0][2]*v[2],
    A[1][0]*v[0] + A[1][1]*v[1] + A[1][2]*v[2],
    A[2][0]*v[0] + A[2][1]*v[1] + A[2][2]*v[2]
  ];
}

export function matKey(A) {
  return A.map(r => r.join(',')).join(';');
}

// World-frame 90° rotations
const RX = [[1,0,0],[0,0,-1],[0,1,0]];
const RY = [[0,0,1],[0,1,0],[-1,0,0]];
const RZ = [[0,-1,0],[1,0,0],[0,0,1]];
const RXn = matT(RX);
const RYn = matT(RY);
const RZn = matT(RZ);

export { RX, RY, RZ, RXn, RYn, RZn };

// Generate 24 orientations
function generateOrientations() {
  const seen = new Map();
  const list = [];
  const stack = [I3];

  while (stack.length) {
    const M = stack.pop();
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

export function orientIndex(R) {
  return ORIENTS.index.get(matKey(R));
}

export function upAxisOf(R) {
  const v = matVec(matT(R), [0, 1, 0]);
  for (let a = 0; a < 3; a++) {
    if (v[a] !== 0) return { axis: a, sign: v[a] };
  }
}

export function horizDirs(R) {
  const Rt = matT(R);
  return [
    matVec(Rt, [0, 0, -1]),
    matVec(Rt, [0, 0, 1]),
    matVec(Rt, [-1, 0, 0]),
    matVec(Rt, [1, 0, 0])
  ];
}

export const ROT_OPS = [RZ, RZn, RX, RXn];
