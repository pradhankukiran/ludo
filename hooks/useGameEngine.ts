import { useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { GameAction, GameConfig, Move } from '../engine/types';
import { createInitialState, gameReducer } from '../engine/state';
import { getLegalMoves } from '../engine/rules';
import { rollDice } from '../engine/dice';
import { pickBestMove } from '../engine/ai';
import { getMovePath, getTokenPosition } from '../engine/pathmap';
import {
  createTween,
  updateTween,
  createDiceAnimation,
  updateDiceAnimation,
  TweenState,
  DiceAnimation,
} from '../renderer/animation';

export interface EngineHandle {
  state: ReturnType<typeof createInitialState>;
  dispatch: React.Dispatch<GameAction>;
  legalMoves: Move[];
  roll: () => void;
  selectToken: (tokenId: string) => void;
  startGame: (config: GameConfig) => void;
  reset: () => void;
  animatingTokenId: string | null;
  animPos: [number, number] | null;
  diceDisplayValue: number | null;
  isDiceRolling: boolean;
}

export function useGameEngine(): EngineHandle {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const [animatingTokenId, setAnimatingTokenId] = useState<string | null>(null);
  const [animPos, setAnimPos] = useState<[number, number] | null>(null);
  const [diceDisplayValue, setDiceDisplayValue] = useState<number | null>(null);
  const [isDiceRolling, setIsDiceRolling] = useState(false);

  const tweenRef = useRef<TweenState | null>(null);
  const diceAnimRef = useRef<DiceAnimation | null>(null);
  const rafRef = useRef<number>(0);
  const pendingMoveRef = useRef<string | null>(null);
  const isAnimatingRef = useRef(false);

  // Expose legal moves only when the game is in the moving phase and not animating
  const legalMoves = state.phase === 'moving' && !isAnimatingRef.current
    ? getLegalMoves(state)
    : [];

  // ── Animation frame loop ──────────────────────────────────────────
  useEffect(() => {
    let active = true;

    const tick = () => {
      if (!active) return;
      const now = performance.now();

      // Dice roll animation
      if (diceAnimRef.current && !diceAnimRef.current.done) {
        const val = updateDiceAnimation(diceAnimRef.current, now);
        setDiceDisplayValue(val);

        if (diceAnimRef.current.done) {
          setIsDiceRolling(false);
          const finalVal = diceAnimRef.current.finalValue;
          diceAnimRef.current = null;
          dispatch({ type: 'ROLL_DICE', value: finalVal });
        }
      }

      // Token movement animation
      if (tweenRef.current && !tweenRef.current.done) {
        const pos = updateTween(tweenRef.current, now);
        setAnimPos(pos);

        if (tweenRef.current.done) {
          const tokenId = pendingMoveRef.current;
          tweenRef.current = null;
          pendingMoveRef.current = null;
          setAnimatingTokenId(null);
          setAnimPos(null);
          isAnimatingRef.current = false;

          if (tokenId) {
            dispatch({ type: 'MOVE_TOKEN', tokenId });
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [animatingTokenId]);

  // ── AI: auto-roll ─────────────────────────────────────────────────
  useEffect(() => {
    if (state.phase !== 'rolling' || isAnimatingRef.current) return;
    const player = state.players[state.currentPlayerIndex];
    if (!player || player.type !== 'ai') return;

    const timer = setTimeout(doRoll, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.currentPlayerIndex, state.diceValue]);

  // ── AI: auto-select move / human: auto-select when only one option ─
  useEffect(() => {
    if (state.phase !== 'moving' || isAnimatingRef.current) return;

    const player = state.players[state.currentPlayerIndex];
    if (!player) return;
    const moves = getLegalMoves(state);
    if (moves.length === 0) return;

    if (player.type === 'ai') {
      const best = pickBestMove(state, moves);
      const timer = setTimeout(() => doSelectToken(best.tokenId), 500);
      return () => clearTimeout(timer);
    }

    if (player.type === 'human' && moves.length === 1) {
      const timer = setTimeout(() => doSelectToken(moves[0].tokenId), 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.diceValue]);

  // ── Keyboard: space / enter to roll ───────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      if (state.phase !== 'rolling') return;
      const player = state.players[state.currentPlayerIndex];
      if (!player || player.type !== 'human') return;
      e.preventDefault();
      doRoll();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.phase, state.currentPlayerIndex, state.players]);

  // ── Core actions ──────────────────────────────────────────────────

  function doRoll() {
    if (state.phase !== 'rolling' || isDiceRolling || isAnimatingRef.current) return;
    const value = rollDice();
    setIsDiceRolling(true);
    setDiceDisplayValue(1);
    diceAnimRef.current = createDiceAnimation(value);
  }

  function doSelectToken(tokenId: string) {
    if (state.phase !== 'moving' || isAnimatingRef.current) return;

    const moves = getLegalMoves(state);
    const move = moves.find(m => m.tokenId === tokenId);
    if (!move) return;

    const player = state.players[state.currentPlayerIndex];
    const token = player?.tokens.find(t => t.id === tokenId);
    if (!token) return;

    // Build animation path: current visual position → each traversed cell
    const startPos = getTokenPosition(token, player.color);
    const moveCells = getMovePath(
      player.color,
      token.pathIndex === -1 ? -1 : token.pathIndex,
      move.to,
    );

    if (moveCells.length > 0) {
      isAnimatingRef.current = true;
      setAnimatingTokenId(tokenId);
      pendingMoveRef.current = tokenId;
      tweenRef.current = createTween([startPos, ...moveCells]);
    } else {
      // No cells to animate (shouldn't happen in normal play)
      dispatch({ type: 'MOVE_TOKEN', tokenId });
    }
  }

  // ── Stable callbacks for external consumers ───────────────────────

  const roll = useCallback(doRoll, [state.phase, isDiceRolling]);

  const selectToken = useCallback(doSelectToken, [state]);

  const startGame = useCallback((config: GameConfig) => {
    dispatch({ type: 'START_GAME', config });
  }, []);

  const reset = useCallback(() => {
    isAnimatingRef.current = false;
    setAnimatingTokenId(null);
    setAnimPos(null);
    setDiceDisplayValue(null);
    setIsDiceRolling(false);
    tweenRef.current = null;
    diceAnimRef.current = null;
    pendingMoveRef.current = null;
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    dispatch,
    legalMoves,
    roll,
    selectToken,
    startGame,
    reset,
    animatingTokenId,
    animPos,
    diceDisplayValue,
    isDiceRolling,
  };
}
