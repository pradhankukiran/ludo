'use client';

import { useRef, useEffect } from 'react';
import { PlayerColor } from '../engine/types';
import { drawDice } from '../renderer/dice';

const PLAYER_LABELS: Record<PlayerColor, string> = {
  red: 'Red', green: 'Green', yellow: 'Yellow', blue: 'Blue',
};
const PLAYER_BG: Record<PlayerColor, string> = {
  red: '#E53935', green: '#43A047', yellow: '#F9A825', blue: '#1E88E5',
};

interface Props {
  currentPlayer: PlayerColor;
  currentPlayerType: 'human' | 'ai' | 'none';
  canRoll: boolean;
  diceValue: number | null;
  isDiceRolling: boolean;
  message: string;
  onRoll: () => void;
  compact?: boolean;
}

export default function DicePanel({
  currentPlayer, currentPlayerType, canRoll,
  diceValue, isDiceRolling, message, onRoll,
  compact = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const DICE_SIZE = compact ? 56 : 88;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, DICE_SIZE + 8, DICE_SIZE + 8);
    drawDice(ctx, 4, 4, DICE_SIZE, diceValue);
  }, [diceValue, DICE_SIZE]);

  const showRollButton = canRoll && currentPlayerType === 'human' && !isDiceRolling;
  const bg = PLAYER_BG[currentPlayer];
  const textColor = currentPlayer === 'yellow' ? '#333' : '#FFF';

  // ── Compact / mobile layout: horizontal strip ──────────────────
  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        background: '#FFFFFF',
        border: '1px solid #E0E0E0',
        width: '100%',
        maxWidth: '480px',
      }}>
        {/* Player badge */}
        <div style={{
          padding: '4px 10px',
          background: bg,
          color: textColor,
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {PLAYER_LABELS[currentPlayer]}
          {currentPlayerType === 'ai' ? ' AI' : ''}
        </div>

        {/* Dice */}
        <canvas
          ref={canvasRef}
          width={DICE_SIZE + 8}
          height={DICE_SIZE + 8}
          style={{ display: 'block', flexShrink: 0 }}
        />

        {/* Roll button or message */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
          {showRollButton ? (
            <button
              onClick={onRoll}
              style={{
                padding: '12px 0',
                border: 'none',
                background: bg,
                color: textColor,
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                width: '100%',
                minHeight: '44px',
              }}
            >
              Roll
            </button>
          ) : isDiceRolling ? (
            <div style={{ fontSize: '12px', color: '#888', fontStyle: 'italic', textAlign: 'center' }}>
              Rolling...
            </div>
          ) : null}
          <p style={{
            fontSize: '11px', color: '#666', margin: 0,
            lineHeight: '14px', textAlign: 'center',
            overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {message}
          </p>
        </div>
      </div>
    );
  }

  // ── Desktop layout: vertical card ──────────────────────────────
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '14px',
      padding: '20px 24px',
      background: '#FFFFFF',
      border: '1px solid #E0E0E0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 16px',
        background: bg,
        color: textColor,
        fontSize: '13px',
        fontWeight: 700,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
      }}>
        {PLAYER_LABELS[currentPlayer]}
        {currentPlayerType === 'ai' ? ' \u2022 AI' : ''}
      </div>

      <canvas
        ref={canvasRef}
        width={DICE_SIZE + 8}
        height={DICE_SIZE + 8}
        style={{ display: 'block' }}
      />

      {showRollButton ? (
        <button
          onClick={onRoll}
          style={{
            padding: '10px 40px',
            border: 'none',
            background: bg,
            color: textColor,
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            minHeight: '44px',
          }}
        >
          Roll Dice
        </button>
      ) : isDiceRolling ? (
        <div style={{ fontSize: '13px', color: '#888', fontStyle: 'italic', padding: '10px 0' }}>
          Rolling...
        </div>
      ) : (
        <div style={{ height: '42px' }} />
      )}

      <p style={{
        fontSize: '12px', color: '#555', textAlign: 'center',
        margin: 0, minHeight: '32px', lineHeight: '16px', maxWidth: '180px',
      }}>
        {message}
      </p>
    </div>
  );
}
