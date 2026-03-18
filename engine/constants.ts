import { PlayerColor } from './types';

// ── Grid ────────────────────────────────────────────────────────────
export const GRID_SIZE = 15;
export const TOKENS_PER_PLAYER = 4;

// ── Path boundaries ─────────────────────────────────────────────────
/** Number of cells on the shared main path. */
export const MAIN_PATH_LENGTH = 52;
/** Number of cells a single player traverses on the main path before entering home stretch. */
export const PLAYER_PATH_LENGTH = 51;
/** First player-relative index that maps to the home stretch (not the main path). */
export const HOME_STRETCH_START = 51;
/** Length of each player's home stretch (colored lane + center). */
export const HOME_STRETCH_LENGTH = 6;
/** Player-relative index of the final (center) home cell. Landing here = finished. */
export const FINISHED_INDEX = HOME_STRETCH_START + HOME_STRETCH_LENGTH - 1; // 56
/** Dice value required to leave the home base. */
export const EXIT_ROLL = 6;
/** Max consecutive sixes before a turn is forfeited. */
export const MAX_CONSECUTIVE_SIXES = 3;

// ── Colors ──────────────────────────────────────────────────────────
export const PLAYER_COLORS: readonly PlayerColor[] = ['red', 'green', 'yellow', 'blue'] as const;

export const COLOR_VALUES: Readonly<Record<PlayerColor, string>> = {
  red: '#DC2626',
  green: '#16A34A',
  yellow: '#CA8A04',
  blue: '#2563EB',
};

export const COLOR_LIGHT: Readonly<Record<PlayerColor, string>> = {
  red: '#FEE2E2',
  green: '#DCFCE7',
  yellow: '#FEF9C3',
  blue: '#DBEAFE',
};

export const COLOR_DARK: Readonly<Record<PlayerColor, string>> = {
  red: '#991B1B',
  green: '#166534',
  yellow: '#854D0E',
  blue: '#1E40AF',
};

// ── Main path ───────────────────────────────────────────────────────
/**
 * The 52-cell main path as [row, col] on the 15×15 grid.
 * Indexed clockwise starting from Red's entry point.
 *
 * Layout reminder (15×15 grid):
 *   Rows 0-5,  Cols 0-5  = Green base (top-left)
 *   Rows 0-5,  Cols 9-14 = Yellow base (top-right)
 *   Rows 9-14, Cols 0-5  = Red base (bottom-left)
 *   Rows 9-14, Cols 9-14 = Blue base (bottom-right)
 *   Rows 6-8,  Cols 6-8  = Center home
 */
export const MAIN_PATH: readonly [number, number][] = [
  // 0–4: Bottom arm, left column — going UP from Red entry
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  // 5–10: Left arm, middle row — going LEFT
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  // 11: Left arm corner — turn UP
  [7, 0],
  // 12–17: Left arm, top row — going RIGHT (Green entry at 13)
  [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  // 18–23: Top arm, left column — going UP
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  // 24: Top arm corner — turn RIGHT
  [0, 7],
  // 25–30: Top arm, right column — going DOWN (Yellow entry at 26)
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  // 31–36: Right arm, top row — going RIGHT
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  // 37: Right arm corner — turn DOWN
  [7, 14],
  // 38–43: Right arm, bottom row — going LEFT (Blue entry at 39)
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  // 44–49: Bottom arm, right column — going DOWN
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  // 50: Bottom arm corner — turn LEFT
  [14, 7],
  // 51: Completes the loop (only visited by non-Red players passing through)
  [14, 6],
] as const;

// ── Player start offsets ────────────────────────────────────────────
/**
 * Absolute index into MAIN_PATH where each player's token enters the board.
 * A token at player-relative index `r` sits at MAIN_PATH[(START_OFFSETS[color] + r) % 52].
 */
export const START_OFFSETS: Readonly<Record<PlayerColor, number>> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// ── Home stretches ──────────────────────────────────────────────────
/**
 * Each player's 6-cell home stretch as [row, col].
 * Index 0 = first cell entered from the main path.
 * Index 5 = center home (token is "finished" upon reaching this).
 *
 * Adjacency invariant: HOME_STRETCHES[color][0] is exactly 1 Manhattan
 * distance from MAIN_PATH[(START_OFFSETS[color] + 50) % 52].
 */
export const HOME_STRETCHES: Readonly<Record<PlayerColor, readonly [number, number][]>> = {
  red:    [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
  green:  [[7, 1],  [7, 2],  [7, 3],  [7, 4],  [7, 5], [7, 6]],
  yellow: [[1, 7],  [2, 7],  [3, 7],  [4, 7],  [5, 7], [6, 7]],
  blue:   [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
};

// ── Home bases ──────────────────────────────────────────────────────
/**
 * Visual positions for tokens sitting in the home base (before entering the board).
 * 4 slots per player, indexed 0-3 matching Token.index.
 * Coordinates are fractional grid positions (not cell centres) — the renderer adds +0.5
 * to convert to cell-centre pixel coordinates.
 */
export const HOME_BASES: Readonly<Record<PlayerColor, readonly [number, number][]>> = {
  red:    [[10.5, 1.5], [10.5, 3.5], [12.5, 1.5], [12.5, 3.5]],
  green:  [[1.5, 1.5],  [1.5, 3.5],  [3.5, 1.5],  [3.5, 3.5]],
  yellow: [[1.5, 10.5], [1.5, 12.5], [3.5, 10.5], [3.5, 12.5]],
  blue:   [[10.5, 10.5],[10.5, 12.5],[12.5, 10.5],[12.5, 12.5]],
};

// ── Safe squares ────────────────────────────────────────────────────
/**
 * Absolute MAIN_PATH indices where tokens cannot be captured.
 * Comprises 4 start/entry squares + 4 star squares = 8 total.
 */
export const SAFE_SQUARES: readonly number[] = [
  0, 13, 26, 39,  // Start/entry squares (one per player)
  8, 21, 34, 47,  // Star squares
] as const;

/** Subset of SAFE_SQUARES that should render a star icon. */
export const STAR_SQUARES: readonly number[] = [8, 21, 34, 47] as const;

// ── Validation helpers ──────────────────────────────────────────────
export function isValidDiceValue(v: number): boolean {
  return Number.isInteger(v) && v >= 1 && v <= 6;
}

export function isOnMainPath(pathIndex: number): boolean {
  return pathIndex >= 0 && pathIndex < HOME_STRETCH_START;
}

export function isOnHomeStretch(pathIndex: number): boolean {
  return pathIndex >= HOME_STRETCH_START && pathIndex <= FINISHED_INDEX;
}
