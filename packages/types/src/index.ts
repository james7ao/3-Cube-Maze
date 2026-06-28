export type Vector3 = [number, number, number];
export type Matrix3x3 = [[number, number, number], [number, number, number], [number, number, number]];

export interface GameLevel {
  N: number;
  open: Record<string, Set<string>>;
  pivots: Set<string>;
  startCell: Vector3;
  startOri: number;
  goal: Vector3;
  seed: number;
  par: number;
}

export interface GameState {
  level: GameLevel | null;
  N: number;
  R: Matrix3x3 | null;
  p: Vector3 | null;
  visited: Set<string>;
  trail: Vector3[];
  moves: number;
  rots: number;
  won: boolean;
  lost: boolean;
  is2D: boolean;
  auto: boolean;
  autoStates: Array<{ cell: Vector3; ori: number }>;
  autoIdx: number;
  curSize: number;
  moveLimit: number;
  currentSeed: number;
}

export interface UpAxis {
  axis: 0 | 1 | 2;
  sign: -1 | 1;
}

export interface RotationAnimation {
  el: number;
  q0: any;
  q1: any;
  newR: Matrix3x3;
}

export interface MoveAnimation {
  el: number;
  from: any;
  to: any;
}

export type OrientationIndex = number;
