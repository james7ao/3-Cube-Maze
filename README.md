# Cube Maze Monorepo

A Turborepo-based monorepo for **Cube Maze**, a 3D maze game built with React and Three.js.

## Project Structure

```
cube-maze-monorepo/
├── apps/
│   └── web/              # React + Vite web application
├── packages/
│   ├── types/            # Shared TypeScript type definitions
│   ├── game-engine/      # Core game logic (maze generation, solver)
│   ├── ui/               # Shared React UI components
│   ├── eslint-config/    # Shared ESLint configuration
│   └── tsconfig/         # Shared TypeScript configurations
├── turbo.json            # Turborepo configuration
└── package.json          # Root workspace configuration
```

## Packages

### Apps

#### `apps/web`
- **Type**: React + Vite Application
- **Purpose**: Main Cube Maze game web interface
- **Key Dependencies**: `react`, `three`, `@cube-maze/game-engine`, `@cube-maze/ui`

### Packages

#### `packages/types`
- **Type**: TypeScript Type Definitions
- **Purpose**: Shared type interfaces for the entire monorepo
- **Exports**: Game state, level data, animation types, utility types

#### `packages/game-engine`
- **Type**: TypeScript/JavaScript Library
- **Purpose**: Core game logic including:
  - Maze generation algorithms
  - BFS pathfinding solver
  - Matrix math operations
  - Cube orientation calculations
- **Exports**: All game mechanics functions

#### `packages/ui`
- **Type**: React Component Library
- **Purpose**: Reusable React components for UI elements
- **Exports**: Game HUD, Controls, Toast notifications, Help panel

#### `packages/eslint-config`
- **Type**: ESLint Configuration
- **Purpose**: Shared ESLint rules and configurations
- **Exports**: Base config, React-specific config

## Quick Start

### Install Dependencies
```bash
npm install
```

### Development

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
3. **Testing**: Make changes and test locally
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

## Next Steps

1. **UI Components**: Expand `packages/ui` with additional reusable components
2. **Testing**: Add Vitest for unit tests
3. **Documentation**: Create component Storybook
4. **CI/CD**: Integrate with GitHub Actions
5. **Deployment**: Set up Vercel deployment configuration
