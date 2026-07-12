# @cube-maze/types

Shared TypeScript type definitions for the monorepo. No build step — consumed directly from `src/index.ts` (the package's `main`/`types` fields point straight at the source file).

## Exports (`src/index.ts`)

- `Vector3`, `Matrix3x3` — geometry primitives
- `GameLevel` — a generated maze level (grid size, open passages, pivot cells, start/goal, seed, par)
- `GameState` — full runtime game state (position, orientation, trail, move/rotation counts, win/lose flags, auto-solve state)
- `UpAxis` — which cube face is "up" (axis + sign)
- `RotationAnimation`, `MoveAnimation` — in-flight animation state
- `OrientationIndex` — index into the 24-element orientation group
