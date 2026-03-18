import { GameState, GameAction, Token } from './types';
import {
  PLAYER_COLORS,
  TOKENS_PER_PLAYER,
  EXIT_ROLL,
  MAX_CONSECUTIVE_SIXES,
  isValidDiceValue,
} from './constants';
import { getLegalMoves, applyMove, setNextPlayer } from './rules';

// ═══════════════════════════════════════════════════════════════════════
// Factory
// ═══════════════════════════════════════════════════════════════════════

function createTokens(color: string): Token[] {
  return Array.from({ length: TOKENS_PER_PLAYER }, (_, i) => ({
    id: `${color}-${i}`,
    index: i,
    color: color as Token['color'],
    state: 'home' as const,
    pathIndex: -1,
  }));
}

export function createInitialState(): GameState {
  return {
    players: PLAYER_COLORS.map(color => ({
      color,
      type: 'none' as const,
      tokens: createTokens(color),
      finishedCount: 0,
    })),
    currentPlayerIndex: 0,
    diceValue: null,
    phase: 'setup',
    consecutiveSixes: 0,
    winner: null,
    message: 'Set up your game',
    lastCapture: null,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// Reducer
// ═══════════════════════════════════════════════════════════════════════

/**
 * Pure reducer: (state, action) → new state.
 * Never mutates the input state.
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return handleStartGame(state, action);
    case 'ROLL_DICE':
      return handleRollDice(state, action);
    case 'MOVE_TOKEN':
      return handleMoveToken(state, action);
    case 'NEXT_TURN':
      return handleNextTurn(state);
    case 'RESET':
      return createInitialState();
  }
}

// ── Action handlers ─────────────────────────────────────────────────

function handleStartGame(
  _state: GameState,
  action: { config: { players: { color: string; type: string }[] } },
): GameState {
  const s = createInitialState();
  s.phase = 'rolling';

  for (const cfg of action.config.players) {
    const player = s.players.find(p => p.color === cfg.color);
    if (player) {
      player.type = cfg.type as 'human' | 'ai' | 'none';
    }
  }

  // First active player starts
  const firstIdx = s.players.findIndex(p => p.type !== 'none');
  if (firstIdx === -1) {
    // No players configured — stay in setup
    s.phase = 'setup';
    s.message = 'No players configured.';
    return s;
  }

  s.currentPlayerIndex = firstIdx;
  s.message = `${s.players[firstIdx].color.toUpperCase()}'s turn — Roll the dice!`;
  return s;
}

function handleRollDice(
  state: GameState,
  action: { value: number },
): GameState {
  if (state.phase !== 'rolling') return state;
  if (!isValidDiceValue(action.value)) return state;

  const s = structuredClone(state) as GameState;
  s.diceValue = action.value;
  const playerName = s.players[s.currentPlayerIndex].color.toUpperCase();

  // ── Three consecutive sixes → forfeit turn ──────────────────────
  if (action.value === EXIT_ROLL && state.consecutiveSixes >= MAX_CONSECUTIVE_SIXES - 1) {
    s.message = `Three sixes in a row! ${playerName} loses this turn.`;
    setNextPlayer(s);
    return s;
  }

  // ── Check for legal moves ───────────────────────────────────────
  s.phase = 'moving';
  const moves = getLegalMoves(s);

  if (moves.length === 0) {
    s.message = `No moves available for ${playerName}.`;
    setNextPlayer(s);
    return s;
  }

  s.message = `Rolled ${action.value} — choose a token to move`;
  return s;
}

function handleMoveToken(
  state: GameState,
  action: { tokenId: string },
): GameState {
  if (state.phase !== 'moving') return state;

  // Validate that the requested move is legal
  const moves = getLegalMoves(state);
  const move = moves.find(m => m.tokenId === action.tokenId);
  if (!move) return state;

  return applyMove(state, move);
}

function handleNextTurn(state: GameState): GameState {
  const s = structuredClone(state) as GameState;
  setNextPlayer(s);
  return s;
}
