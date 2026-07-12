# apps/web — Cube Maze (React port)

React 19 + Vite + Three.js port of the Cube Maze game. **Incomplete** relative to the standalone [../../index.html](../../index.html) — see the gaps list below.

## Entry chain

`src/main.jsx` → `src/App.jsx` → `src/components/GameContainer.jsx`

## Key files

- **`components/GameContainer.jsx`** (~520 lines) — the Three.js heart: builds the scene/camera/renderer, orbit controls, cube/maze/walls/player/trail meshes, and the animation loop (slerp for rotations, lerp for moves). Owns all `gameState`. Supports both 2D and 3D camera modes.
- **`components/HUD.jsx`** — layer/moves/rotations/budget display.
- **`components/Controls.jsx`** — view + size controls; restart/solve buttons exist but are **not yet wired to handlers**.
- **`components/Toast.jsx`** — win/lose overlay.
- **`components/Help.jsx`** — instructions panel.
- **`components/RotationHint.jsx`** — pivot-tile rotation prompt.
- **`utils/{matrixMath,mazeGeneration,solver}.js`** — JavaScript copies of the logic in `packages/game-engine` (TypeScript). This app does **not** import `@cube-maze/game-engine`; see that package's README for why this matters.

## Known gaps vs. the standalone `index.html`

- Keyboard input handling is stubbed/partial.
- Win/lose transitions are incomplete.
- Auto-solve wiring is incomplete.
- `Controls.jsx` restart/solve buttons aren't connected to game actions yet.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # production build
npm run preview   # preview a production build
npm run lint       # oxlint
```

## Tooling notes

- Linting uses **oxlint** (`.oxlintrc.json`), not the eslint config used elsewhere in the monorepo.
- Uses React 19, while `packages/ui` (the planned shared component library this app should eventually consume) currently pins React 18.
