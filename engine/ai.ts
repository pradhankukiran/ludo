import { GameState, Move } from './types';
import {
  SAFE_SQUARES,
  FINISHED_INDEX,
  HOME_STRETCH_START,
  MAIN_PATH_LENGTH,
  isOnMainPath,
} from './constants';
import { toAbsoluteIndex } from './pathmap';

// ── Scoring weights ─────────────────────────────────────────────────
const W_FINISH       = 200;
const W_CAPTURE      = 100;
const W_EXIT_HOME    = 50;
const W_HOME_STRETCH = 40;
const W_ESCAPE       = 30;
const W_DANGER       = -25;
const W_SAFE_SQUARE  = 20;
const W_ADVANCE      = 0.3;

/** Max dice roll — defines the "danger zone" radius. */
const THREAT_RANGE = 6;

/**
 * Pick the best move for an AI player from a non-empty list.
 */
export function pickBestMove(state: GameState, moves: Move[]): Move {
  if (moves.length === 0) {
    throw new Error('pickBestMove called with empty moves array');
  }
  if (moves.length === 1) return moves[0];

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const s = scoreMove(state, move);
    if (s > bestScore) {
      bestScore = s;
      bestMove = move;
    }
  }

  return bestMove;
}

// ── Internal scoring ────────────────────────────────────────────────

function scoreMove(state: GameState, move: Move): number {
  const player = state.players[state.currentPlayerIndex];
  if (!player) return 0;

  let score = 0;

  // Leaving home is valuable
  if (move.from === -1) score += W_EXIT_HOME;

  // Capturing is very valuable
  if (move.captures) score += W_CAPTURE;

  // Finishing a token is the most valuable
  if (move.to === FINISHED_INDEX) score += W_FINISH;

  // Moving into home stretch is good (immune to capture)
  if (move.to >= HOME_STRETCH_START && move.to < FINISHED_INDEX) {
    score += W_HOME_STRETCH + (move.to - HOME_STRETCH_START) * 5;
  }

  // Main path destination analysis
  if (isOnMainPath(move.to)) {
    const destAbs = toAbsoluteIndex(player.color, move.to);

    if (destAbs !== -1 && SAFE_SQUARES.includes(destAbs)) {
      score += W_SAFE_SQUARE;
    } else if (destAbs !== -1) {
      // Penalize landing in an opponent's capture range
      score += countThreats(state, player.color, destAbs) * W_DANGER;
    }
  }

  // Reward escaping danger from the current position
  if (isOnMainPath(move.from)) {
    const fromAbs = toAbsoluteIndex(player.color, move.from);
    if (fromAbs !== -1 && !SAFE_SQUARES.includes(fromAbs)) {
      score += countThreats(state, player.color, fromAbs) * W_ESCAPE;
    }
  }

  // Slight bias towards advancing further
  score += move.to * W_ADVANCE;

  // Randomise ±10% so the AI isn't deterministic
  score *= 0.9 + Math.random() * 0.2;

  return score;
}

/**
 * Count how many opponent tokens can reach `absPosition` within THREAT_RANGE steps.
 */
function countThreats(state: GameState, myColor: string, absPosition: number): number {
  let threats = 0;

  for (const opp of state.players) {
    if (opp.color === myColor || opp.type === 'none') continue;

    for (const t of opp.tokens) {
      if (t.state !== 'active' || t.pathIndex >= HOME_STRETCH_START) continue;

      const oppAbs = toAbsoluteIndex(opp.color, t.pathIndex);
      if (oppAbs === -1) continue;

      const dist = (absPosition - oppAbs + MAIN_PATH_LENGTH) % MAIN_PATH_LENGTH;
      if (dist > 0 && dist <= THREAT_RANGE) {
        threats++;
      }
    }
  }

  return threats;
}
