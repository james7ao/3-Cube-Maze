# Cube Maze

A 3D puzzle game where you navigate a cube through layered mazes by rotating it at "pivot" tiles to shift your perspective. Solve increasingly complex levels across themed worlds, unlock achievements, and discover the mystery behind the cube.

**Play now:** Open [index.html](index.html) in your browser, or visit [cube-maze.vercel.app](https://cube-maze.vercel.app).

> **For developers:** This is a Turborepo-based monorepo built with React, Vite, and Three.js. See [CLAUDE.md](CLAUDE.md) for architecture details, including the fact that a more complete standalone implementation lives in the root [index.html](index.html) alongside the React port in `apps/web/`.

## Features

**Cube Maze** is a 3D puzzle game where you navigate a cube through multi-layered mazes by rotating it at pivot tiles to change perspective:

- **3D Puzzle Mechanics** — Navigate a cube through layered mazes with 6 faces and 24 possible orientations. Rotate the cube at designated "pivot" tiles to shift which face is "up."
- **Move Budget Challenge** — Each level has a move limit; solve puzzles efficiently to stay within budget and earn stars.
- **Themed Worlds** — Journey through distinct environments (Origin, Ember, Vault) with atmospheric backdrops and narrative context.
- **Campaign Mode** — Unlock and complete 3 story-driven world campaigns with escalating difficulty.
- **Endless Mode** — Test your skills with infinite procedurally-generated levels of varying difficulty.
- **Tutorial & Onboarding** — Learn mechanics through an interactive tutorial that guides you step-by-step.
- **Auto-Solve** — Stuck? Use the BFS pathfinding solver to reveal the optimal solution path.
- **Achievements** — Complete challenges and unlock achievements throughout your journey.
- **Responsive Design** — Play on desktop (mouse + keyboard) or mobile (touch controls).

## Project Structure

```
cube-maze-monorepo/
├── apps/
│   └── web/              # React + Vite web application
├── packages/
│   ├── types/            # Shared TypeScript type definitions
│   ├── game-engine/      # Core game logic (maze generation, solver)
│   ├── ui/               # Shared React UI components (currently a stub, no src/ yet)
│   └── eslint-config/    # Shared ESLint configuration
├── index.html             # Standalone game — most complete implementation, not yet merged into apps/web
├── turbo.json            # Turborepo configuration
└── package.json          # Root workspace configuration
```

Note: there is no `packages/tsconfig/` — TypeScript config is managed via the root `tsconfig.json`.

## Packages

### Apps

#### `apps/web`
- **Type**: React + Vite Application (React 19)
- **Purpose**: Cube Maze game web interface — currently **incomplete** (keyboard input, win/lose transitions, and auto-solve wiring are stubbed/partial)
- **Key Dependencies**: `react`, `three`
- **Note**: currently imports its own JS copies of the maze/solver logic from `src/utils/`, not `@cube-maze/game-engine` (see `packages/game-engine` below)

### Packages

#### `packages/types`
- **Type**: TypeScript Type Definitions
- **Purpose**: Shared type interfaces for the entire monorepo
- **Exports**: Game state, level data, animation types, utility types

#### `packages/game-engine`
- **Type**: TypeScript Library
- **Purpose**: Canonical game logic including:
  - Maze generation algorithms
  - BFS pathfinding solver
  - Matrix math operations
  - Cube orientation calculations
- **Exports**: All game mechanics functions
- **Note**: not currently consumed by `apps/web` — see that package's note above

#### `packages/ui`
- **Type**: React Component Library (planned)
- **Status**: **Stub only** — `package.json` exists but there is no `src/` yet
- **Purpose**: Intended home for reusable components (HUD, Controls, Toast, Help), which currently live in `apps/web/src/components/`

#### `packages/eslint-config`
- **Type**: ESLint Configuration
- **Purpose**: Shared ESLint rules and configurations
- **Exports**: Base config, React-specific config

## Quick Start

### Play the Game

**Standalone (fastest):** Open [index.html](index.html) directly in your browser. No build required.

**React version (development mode):**
```bash
npm install
cd apps/web
npm run dev
```
Then open http://localhost:5173 in your browser.

### For Developers

Install dependencies:
```bash
npm install
```

Run all dev servers:
```bash
npm run dev
```

Run specific app:
```bash
cd apps/web
npm run dev
```

### Build

Build all packages:
```bash
npm run build
```

Build specific package:
```bash
cd packages/game-engine
npm run build
```

### Linting & Type Checking

Run linter:
```bash
npm run lint
```

Type check all packages:
```bash
npm run typecheck
```

## Turborepo Features

This monorepo uses [Turborepo](https://turbo.build) for:

- **Parallel execution**: Run multiple build tasks in parallel
- **Caching**: Cache build artifacts to speed up rebuilds
- **Dependency graph**: Automatically manage package dependencies
- **Task orchestration**: Define global build pipelines in `turbo.json`

### Task Configuration (turbo.json)

- `build`: Depends on `^build` (dependencies must build first)
- `dev`: Continuous development mode with caching disabled
- `typecheck`: Type checking without build artifacts
- `lint`: ESLint without output caching

## Development Workflow

1. **Install**: `npm install`
2. **Development**: `npm run dev` (runs all dev servers)
3. **Testing**: `npm run test` currently no-ops — no test runner (e.g. Vitest) is wired up yet despite the turbo `test` task existing. For algorithm validation, run `node verify.js` from the repo root.
4. **Building**: `npm run build` (builds all packages)
5. **Type Checking**: `npm run typecheck` (validates types)

## Dependency Management

- **Workspace dependencies**: Use `workspace:*` in package.json
- **Internal imports**: Use `@cube-maze/` namespace for packages
- **TypeScript paths**: Configured in root `tsconfig.json`

## Architecture Decisions

1. **Turborepo**: Scalable build orchestration
2. **TypeScript**: Full type safety across packages
3. **Workspace packages**: Shared utilities and configurations
4. **Vite**: Fast development server and bundling
5. **Three.js**: 3D rendering capabilities

## Known Inconsistencies

- **React version mismatch**: `apps/web` depends on React 19; `packages/ui` currently pins React 18.
- **Lint tooling split**: `apps/web` uses oxlint (`.oxlintrc.json`); the rest of the monorepo uses eslint 8 via `packages/eslint-config`.
- **Three implementations of the game**: the standalone [index.html](index.html) (most complete), the `apps/web` React port (in progress), and `packages/game-engine` (canonical logic, not yet wired into `apps/web`). See [CLAUDE.md](CLAUDE.md) for details.

## Next Steps

1. **UI Components**: Expand `packages/ui` with additional reusable components
2. **Testing**: Add Vitest for unit tests
3. **Documentation**: Create component Storybook
4. **CI/CD**: Integrate with GitHub Actions
5. **Deployment**: Set up Vercel deployment configuration
