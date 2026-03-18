import { PlayerColor, Token } from './types';
import {
  MAIN_PATH,
  MAIN_PATH_LENGTH,
  START_OFFSETS,
  HOME_STRETCHES,
  HOME_STRETCH_LENGTH,
  HOME_STRETCH_START,
  HOME_BASES,
  TOKENS_PER_PLAYER,
  isOnHomeStretch,
} from './constants';

// ── Position lookup ─────────────────────────────────────────────────

/**
 * Convert a token to its [row, col] on the 15×15 grid.
 *
 * - home   → HOME_BASES slot (uses Token.index)
 * - active → main path or home stretch cell (uses Token.pathIndex)
 * - finished → centre home cell (HOME_STRETCHES[color][5])
 */
export function getTokenPosition(token: Token, color: PlayerColor): [number, number] {
  if (token.state === 'home') {
    const idx = token.index;
    const bases = HOME_BASES[color];
    if (idx < 0 || idx >= bases.length) return bases[0]; // defensive fallback
    return [bases[idx][0], bases[idx][1]];
  }

  if (token.state === 'finished') {
    const last = HOME_STRETCHES[color][HOME_STRETCH_LENGTH - 1];
    return [last[0], last[1]];
  }

  // Active — on main path or home stretch
  const pi = token.pathIndex;

  if (isOnHomeStretch(pi)) {
    const hsIdx = pi - HOME_STRETCH_START;
    const stretch = HOME_STRETCHES[color];
    if (hsIdx < 0 || hsIdx >= stretch.length) return [stretch[0][0], stretch[0][1]];
    return [stretch[hsIdx][0], stretch[hsIdx][1]];
  }

  // Main path (0–50)
  const absIdx = (START_OFFSETS[color] + pi) % MAIN_PATH_LENGTH;
  const cell = MAIN_PATH[absIdx];
  return [cell[0], cell[1]];
}

// ── Move path (for animation) ───────────────────────────────────────

/**
 * Return the sequence of [row, col] cells a token passes through
 * when moving from `fromIndex` to `toIndex` (both player-relative).
 *
 * The returned array does NOT include the starting cell — only every
 * intermediate and final cell. The caller should prepend the start
 * position if needed for animation purposes.
 *
 * `fromIndex` may be -1 (entering from home), in which case the path
 * starts at index 0 (the player's start square).
 */
export function getMovePath(
  color: PlayerColor,
  fromIndex: number,
  toIndex: number,
): [number, number][] {
  const cells: [number, number][] = [];
  const start = Math.max(fromIndex, -1) + 1; // if from=-1, start at 0

  for (let i = start; i <= toIndex; i++) {
    if (i >= HOME_STRETCH_START) {
      const hsIdx = i - HOME_STRETCH_START;
      const stretch = HOME_STRETCHES[color];
      if (hsIdx >= 0 && hsIdx < stretch.length) {
        cells.push([stretch[hsIdx][0], stretch[hsIdx][1]]);
      }
    } else if (i >= 0) {
      const absIdx = (START_OFFSETS[color] + i) % MAIN_PATH_LENGTH;
      const cell = MAIN_PATH[absIdx];
      cells.push([cell[0], cell[1]]);
    }
  }

  return cells;
}

// ── Index conversions ───────────────────────────────────────────────

/**
 * Convert a player-relative path index to an absolute MAIN_PATH index.
 * Returns -1 for indices on the home stretch (they have no absolute equivalent).
 */
export function toAbsoluteIndex(color: PlayerColor, relativeIndex: number): number {
  if (relativeIndex < 0 || relativeIndex >= HOME_STRETCH_START) return -1;
  return (START_OFFSETS[color] + relativeIndex) % MAIN_PATH_LENGTH;
}

/**
 * Convert an absolute MAIN_PATH index to a player-relative index.
 * The result is always 0–51 — the caller must know whether the token
 * has already lapped that point.
 */
export function toRelativeIndex(color: PlayerColor, absoluteIndex: number): number {
  return (absoluteIndex - START_OFFSETS[color] + MAIN_PATH_LENGTH) % MAIN_PATH_LENGTH;
}
