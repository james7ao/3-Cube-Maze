import { ORIENTS, matMul, orientIndex, horizDirs, RZ, RZn, RX, RXn } from './matrixMath';
import { isOpen } from './mazeGeneration';

export function solvePath(level, N, startCell, startOri) {
  const key = (c, o) => `${c.join(',')},${o}`;
  const prev = new Map();
  prev.set(key(startCell, startOri), null);
  const q = [{ c: startCell, o: startOri }];
  let head = 0;
  let end = null;

  while (head < q.length) {
    const { c, o } = q[head++];

    if (c[0] === level.goal[0] && c[1] === level.goal[1] && c[2] === level.goal[2]) {
      end = { c, o };
      break;
    }

    const Rm = ORIENTS.list[o];

    // Horizontal moves
    for (const hd of horizDirs(Rm)) {
      const nc = [c[0] + hd[0], c[1] + hd[1], c[2] + hd[2]];
      if (nc[0] < 0 || nc[1] < 0 || nc[2] < 0 || nc[0] >= N || nc[1] >= N || nc[2] >= N) continue;
      if (!isOpen(level.open, N, c, hd)) continue;

      const nk = key(nc, o);
      if (prev.has(nk)) continue;
      prev.set(nk, { c, o });
      q.push({ c: nc, o });
    }

    // Rotations on pivot
    if (level.pivots.has(`${c[0]},${c[1]},${c[2]}`)) {
      for (const G of [RZ, RZn, RX, RXn]) {
        const nR = matMul(G, Rm);
        const no = orientIndex(nR);
        const nk = key(c, no);
        if (prev.has(nk)) continue;
        prev.set(nk, { c, o });
        q.push({ c, o: no });
      }
    }
  }

  if (!end) return null;

  const path = [];
  let s = end;
  while (s) {
    path.push({ cell: s.c, ori: s.o });
    s = prev.get(key(s.c, s.o));
  }

  return path.reverse();
}
