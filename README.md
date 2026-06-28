# Cube Maze

A 3D maze game in a single HTML file. The maze is a cube made of stacked
maze layers — you walk one layer at a time, and to change layers you stand on
a glowing **pivot** tile and **rotate the whole cube**, which turns a wall you
couldn't pass into a new floor and reveals fresh layers.

Built with [Three.js](https://threejs.org/) (loaded from a CDN). No build step,
no dependencies to install — just open the file in a browser.

## Play

Open `cube-maze.html` in any modern browser, or play it locally:

```bash
# optional: serve it (any static server works)
python3 -m http.server 8000
# then visit http://localhost:8000/cube-maze.html
```

### Controls

| Action | Keys |
| --- | --- |
| Move through the current layer | `W` `A` `S` `D` or arrow keys |
| Roll the cube (on a pivot tile) | `Q` / `E` |
| Tumble the cube (on a pivot tile) | `R` / `F` |
| Toggle flat 2D view | `V` |
| Orbit the camera | drag the mouse |

Reach the **green goal** with the **gold marker**. A **yellow line** traces the
squares you've already explored on the current layer.

## Features

- **True 3D cube** rendered with Three.js, plus a flat **2D view** toggle.
- **Smooth, time-based 90° rotations** with a translucent "spinning cube"
  transition so no layer pops in or out mid-turn.
- **Yellow breadcrumb line** showing your explored route on each layer.
- **Auto-solve** — breadth-first search from your current position that replays
  the shortest sequence of moves and rotations to the goal.
- **Move budget** — every cube shows the provably optimal solve length and gives
  you a budget (~2.5× optimal). Run out and you can retry the same cube or
  generate a new one.
- **Sizes** 3³, 5³, 7³. Every generated cube is guaranteed solvable.

## How it works

The cube is a 3D *perfect maze* (a spanning tree over every cell), so every cell
connects to every other through some path of passages. The player only moves
horizontally within the current layer; rotating the cube (one of the 24 cube
orientations) changes which axis is "up," making previously-vertical passages
horizontal. A BFS over `(cell, orientation)` states guarantees the goal is
reachable and computes the optimal solve length.

`verify.js` is a small Node script that checks the core logic: it confirms there
are exactly 24 orientations closed under rotation, and that generated mazes are
always solvable across many seeds and sizes.

```bash
node verify.js
```

## License

MIT
