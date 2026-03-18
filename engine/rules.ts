import { GameState, Move, PlayerColor } from './types';
import {
  SAFE_SQUARES,
  TOKENS_PER_PLAYER,
  HOME_STRETCH_START,
  FINISHED_INDEX,
  EXIT_ROLL,
  MAX_CONSECUTIVE_SIXES,
  isOnMainPath,
  isValidDiceValue,
} from './constants';
import { toAbsoluteIndex } from './pathmap';

// ═══════════════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════════════

/**
 * Compute every legal move for the current player given the dice value
 * stored in `state.diceValue`. Returns an empty array when there are
 * no legal moves or the dice hasn't been rolled.
 */
export function getLegalMoves(state: GameState): Move[] {
  const player = state.players[state.currentPlayerIndex];
  if (!player || player.type === 'none') return [];

  const dice = state.diceValue;
  if (dice === null || !isValidDiceValue(dice)) return [];

  const moves: Move[] = [];

  for (const token of player.tokens) {
    if (token.state === 'finished') continue;

    // ── Token is in the home base ──────────────────────────────────
    if (token.state === 'home') {
      if (dice === EXIT_ROLL) {
        if (!isBlockedByOwn(player, 0)) {
          const capture = findCapture(state, player.color, 0);
          moves.push({ tokenId: token.id, from: -1, to: 0, captures: capture });
        }
      }
      continue;
    }

    // ── Token is active on the board ───────────────────────────────
    const dest = token.pathIndex + dice;

    // Cannot overshoot the centre home cell
    if (dest > FINISHED_INDEX) continue;

    // Cannot land on own token
    if (isBlockedByOwn(player, dest)) continue;

    // Capture check (main path only — home stretch is private)
    const capture = isOnMainPath(dest) ? findCapture(state, player.color, dest) : undefined;

    moves.push({ tokenId: token.id, from: token.pathIndex, to: dest, captures: capture });
  }

  return moves;
}

/**
 * Apply a validated move to produce a new game state.
 * The move MUST come from `getLegalMoves` — this function trusts it.
 *
 * Returns a brand-new state object; the input is never mutated.
 */
export function applyMove(state: GameState, move: Move): GameState {
  const s = cloneState(state);
  const player = s.players[s.currentPlayerIndex];
  const token = player.tokens.find(t => t.id === move.tokenId);

  // Defensive: if token not found, return unchanged clone
  if (!token) return s;

  // ── Move the token ───────────────────────────────────────────────
  token.pathIndex = move.to;
  if (move.to === FINISHED_INDEX) {
    token.state = 'finished';
    player.finishedCount++;
  } else {
    token.state = 'active';
  }

  // ── Capture ──────────────────────────────────────────────────────
  let captured = false;
  if (move.captures) {
    captured = applyCaptureToState(s, move.captures);
  }
  s.lastCapture = captured ? (move.captures ?? null) : null;

  // ── Win / game-over check ────────────────────────────────────────
  if (player.finishedCount === TOKENS_PER_PLAYER) {
    s.winner = player.color;
    s.phase = 'gameover';
    s.message = `${player.color.toUpperCase()} wins!`;
    return s;
  }

  if (countActivePlayers(s) <= 1) {
    s.phase = 'gameover';
    s.winner = player.color;
    s.message = `${player.color.toUpperCase()} wins! Game over.`;
    return s;
  }

  // ── Turn progression ─────────────────────────────────────────────
  const rolledSix = state.diceValue === EXIT_ROLL;
  const earnedBonusTurn = rolledSix || captured;

  // A bonus turn is granted unless this was the MAX_CONSECUTIVE_SIXES'th six
  if (earnedBonusTurn && !(rolledSix && state.consecutiveSixes >= MAX_CONSECUTIVE_SIXES - 1)) {
    s.phase = 'rolling';
    s.diceValue = null;
    s.consecutiveSixes = rolledSix ? state.consecutiveSixes + 1 : 0;
    s.message = `${player.color.toUpperCase()} gets another turn!`;
  } else {
    setNextPlayer(s);
  }

  return s;
}

/**
 * Advance the current player index to the next eligible player.
 *
 * **Mutates `state` in place** — callers must pass a cloned state.
 *
 * Sets `phase` to 'gameover' if no eligible player is found.
 * Returns `true` if a valid next player was found.
 */
export function setNextPlayer(state: GameState): boolean {
  const n = state.players.length;
  let next = (state.currentPlayerIndex + 1) % n;

  for (let i = 0; i < n; i++) {
    const p = state.players[next];
    if (p.type !== 'none' && p.finishedCount < TOKENS_PER_PLAYER) {
      state.currentPlayerIndex = next;
      state.phase = 'rolling';
      state.diceValue = null;
      state.consecutiveSixes = 0;
      state.message = `${p.color.toUpperCase()}'s turn`;
      return true;
    }
    next = (next + 1) % n;
  }

  // No eligible player — game is over
  state.phase = 'gameover';
  state.message = 'Game over!';
  return false;
}

/**
 * Count players that are still active (not 'none' and not finished).
 */
export function countActivePlayers(state: GameState): number {
  return state.players.filter(
    p => p.type !== 'none' && p.finishedCount < TOKENS_PER_PLAYER,
  ).length;
}

// ═══════════════════════════════════════════════════════════════════════
// Internal helpers
// ═══════════════════════════════════════════════════════════════════════

function cloneState(state: GameState): GameState {
  return structuredClone(state);
}

/**
 * Check whether the player already has one of their own tokens at `pathIndex`.
 */
function isBlockedByOwn(player: { tokens: { state: string; pathIndex: number }[] }, pathIndex: number): boolean {
  return player.tokens.some(t => t.state === 'active' && t.pathIndex === pathIndex);
}

/**
 * Find an opponent token that can be captured at the given player-relative
 * `relativeIndex`. Returns the captured token's ID, or undefined if the
 * square is safe or empty.
 */
function findCapture(
  state: GameState,
  movingColor: PlayerColor,
  relativeIndex: number,
): string | undefined {
  if (relativeIndex >= HOME_STRETCH_START) return undefined;

  const absIdx = toAbsoluteIndex(movingColor, relativeIndex);
  if (absIdx === -1) return undefined;

  // Safe squares protect all tokens
  if (SAFE_SQUARES.includes(absIdx)) return undefined;

  for (const opponent of state.players) {
    if (opponent.color === movingColor || opponent.type === 'none') continue;

    for (const t of opponent.tokens) {
      if (t.state !== 'active' || t.pathIndex >= HOME_STRETCH_START) continue;

      if (toAbsoluteIndex(opponent.color, t.pathIndex) === absIdx) {
        return t.id;
      }
    }
  }

  return undefined;
}

/**
 * Send a captured token back to its home base.
 * Mutates `state` in place. Returns true if the token was found and captured.
 */
function applyCaptureToState(state: GameState, capturedTokenId: string): boolean {
  for (const player of state.players) {
    const token = player.tokens.find(t => t.id === capturedTokenId);
    if (token) {
      token.state = 'home';
      token.pathIndex = -1;
      return true;
    }
  }
  return false;
}
