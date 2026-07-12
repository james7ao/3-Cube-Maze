# @cube-maze/game-engine

Canonical TypeScript implementation of the Cube Maze game logic. Builds via `tsc` to `dist/`.

## Modules

- **`matrixMath.ts`** — 3×3 rotation matrix ops (`matMul`, `matT`, `matVec`), rotation generators `RX`/`RY`/`RZ` (+ inverses), `generateOrientations()` (BFS over the 24-element cube rotation group), `orientIndex`, `upAxisOf`, `horizDirs`, `ROT_OPS`.
- **`mazeGeneration.ts`** — `genMaze` (DFS backtracker over an N³ grid), `isOpen`, `makeRng` (seeded LCG PRNG), `solveBFS` (BFS over cell+orientation state, accounting for pivot rotations), `buildLevel` (retries up to 200 seeds to find a level meeting a minimum par; ~32% of cells are pivots).
- **`solver.ts`** — `solvePath`: BFS returning the actual optimal move path (list of `{cell, ori}`) used for auto-solve.
- **`index.ts`** — re-exports all of the above.

## ⚠️ Not currently used by `apps/web`

`apps/web/src/utils/{matrixMath,mazeGeneration,solver}.js` are hand-maintained JavaScript **copies** of these modules, not imports of this package. If you change logic here, check whether `apps/web`'s copies need the same fix (or consider wiring the app to import `@cube-maze/game-engine` directly instead of maintaining both).

Depends on `@cube-maze/types` for shared type definitions.
