import type { Vector3, GameLevel } from '@cube-maze/types';
import { ORIENTS, matMul, orientIndex, horizDirs, RZ, RZn, RXmat, RXnmat } from './matrixMath';
import { isOpen } from './mazeGeneration';

export function solvePath(
  level: GameLevel,
  N: number,
  startCell: Vector3,
  startOri: number
): Array<{ cell: Vector3; ori: number }> | null {
  const key = (c: Vector3, o: number) => `${c.join(',')},${o}`;
  const prev = new Map<string, { c: Vector3; o: number } | null>();
  prev.set(key(startCell, startOri), null);
  const q: Array<{ c: Vector3; o: number }> = [{ c: startCell, o: startOri }];
  let head = 0;
  let end: { c: Vector3; o: number } | null = null;

  while (head < q.length) {
    const { c, o } = q[head++];

    if (c[0] === level.goal[0] && c[1] === level.goal[1] && c[2] === level.goal[2]) {
      end = { c, o };
      break;
    }

    const Rm = ORIENTS.list[o];

    for (const hd of horizDirs(Rm)) {
      const nc: Vector3 = [c[0] + hd[0], c[1] + hd[1], c[2] + hd[2]];
      if (nc[0] < 0 || nc[1] < 0 || nc[2] < 0 || nc[0] >= N || nc[1] >= N || nc[2] >= N) continue;
      if (!isOpen(level.open, N, c, hd)) continue;

      const nk = key(nc, o);
      if (prev.has(nk)) continue;
      prev.set(nk, { c, o });
      q.push({ c: nc, o });
    }

    if (level.pivots.has(`${c[0]},${c[1]},${c[2]}`)) {
      for (const G of [RZ, RZn, RXmat, RXnmat]) {
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

  const path: Array<{ cell: Vector3; ori: number }> = [];
  let s: { c: Vector3; o: number } | null = end;
  while (s) {
    path.push({ cell: s.c, ori: s.o });
    s = prev.get(key(s.c, s.o))!;
  }

  return path.reverse();
}
