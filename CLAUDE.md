# CLAUDE.md — Cube Maze

Orienting context for an AI assistant starting a task in this repo. Read this before touching code.

## What this is

A Turborepo monorepo for **Cube Maze**, a 3D layered-maze puzzle game: navigate a cube through a maze, rotating it at "pivot" tiles to change which face is "up," aiming to reach the goal within a move budget.

## ⚠️ Read first: three implementations exist

| Implementation | Location | Status |
|---|---|---|
| Standalone HTML | [index.html](index.html) (root, ~131 KB, untracked) + [three.min.js](three.min.js) | **Most complete/current.** Full game loop, themed worlds, achievements. Served by the preview server (`.claude/launch.json` → `py -m http.server 3456`). |
| React port | [apps/web](apps/web/) | **Incomplete.** Three.js scene/render loop works, but keyboard input, win/lose transitions, and auto-solve wiring are stubbed/partial; `Controls.jsx` buttons aren't wired to handlers yet. |
| Canonical engine | [packages/game-engine](packages/game-engine/) | TypeScript maze/solver logic. **Not currently imported by `apps/web`** — see duplication note below. |

**Before editing, confirm which implementation a task actually targets.** A fix in one does not apply to the others.

## Repo layout

```
apps/
  web/                    # React 19 + Vite port (see apps/web/README.md)
packages/
  types/                  # @cube-maze/types — shared TS types, no build step (import src/index.ts directly)
  game-engine/             # @cube-maze/game-engine — canonical maze/solver logic (see packages/game-engine/README.md)
  ui/                      # @cube-maze/ui — STUB ONLY, no src/ yet; real components live in apps/web/src/components/
  eslint-config/           # @cube-maze/eslint-config — shared lint rules (index.js, react.js)
index.html                 # standalone game (untracked, most complete implementation)
three.min.js                # vendored Three.js for index.html (untracked)
verify.js                   # Node script validating the core maze algorithm
```

Note: `packages/tsconfig/` does **not** exist, despite being mentioned in older docs.

## Commands

```bash
npm install                 # install workspace deps
npm run dev                  # turbo: all dev servers
npm run build                 # turbo: build all packages (tsc for packages, vite build for web)
npm run lint                   # turbo: lint (apps/web uses oxlint; packages use eslint 8)
npm run typecheck / type-check  # turbo: tsc --noEmit per package
```

Per-app: `cd apps/web && npm run dev` (Vite dev server), `npm run build`, `npm run preview`.

Standalone game: open [index.html](index.html) directly, or use the preview server on port 3456.

**`npm run test` no-ops** — no test runner is wired up despite the turbo `test` task existing. For algorithm validation, run `node verify.js` — it asserts exactly 24 cube orientations, that the orientation group is closed under rotation, and that generated levels are solvable/non-trivial across seeds and sizes (N=3,5,7).

## Known gotchas

- **Duplication:** `apps/web/src/utils/{matrixMath,mazeGeneration,solver}.js` are hand-maintained JS copies of `packages/game-engine/src/*.ts`. The web app imports its own `../utils/...`, not `@cube-maze/game-engine`. If you fix a bug in one, check whether it needs mirroring in the other.
- **React version mismatch:** `apps/web` uses React 19; `packages/ui` pins React 18.
- **Lint split:** `apps/web` uses oxlint (`.oxlintrc.json`); the rest of the monorepo uses eslint 8 via `packages/eslint-config`.
- **README drift:** the root `README.md` has been corrected, but if you see other docs referencing `packages/tsconfig` or working `packages/ui` exports, they're stale — that package is an empty stub.

## Core algorithm invariants

Source of truth: [packages/game-engine/src/](packages/game-engine/src/) and [verify.js](verify.js).

- Exactly **24 cube orientations**, generated via BFS over rotation matrices (`generateOrientations()` in `matrixMath.ts`).
- Maze generation: DFS backtracker over an N³ grid, seeded LCG PRNG (`makeRng`) for reproducibility.
- Solving: BFS over (cell × orientation) state space, accounting for pivot-tile rotations (`solveBFS` in `mazeGeneration.ts`, `solvePath` in `solver.ts` for the actual auto-solve path).
- `buildLevel` retries up to 200 seeds to find a level meeting a minimum par (solution length); ~32% of cells are pivots.
