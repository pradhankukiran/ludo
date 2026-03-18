'use client';

import { useState } from 'react';
import { PlayerColor, PlayerType, GameConfig } from '../engine/types';
import { PLAYER_COLORS } from '../engine/constants';

const C: Record<PlayerColor, { bg: string; text: string }> = {
  red:    { bg: '#E53935', text: '#FFF' },
  green:  { bg: '#43A047', text: '#FFF' },
  yellow: { bg: '#F9A825', text: '#333' },
  blue:   { bg: '#1E88E5', text: '#FFF' },
};

const PRESETS: { label: string; config: PlayerType[] }[] = [
  { label: '2 Players',  config: ['human', 'none', 'human', 'none'] },
  { label: '4 Players',  config: ['human', 'human', 'human', 'human'] },
  { label: 'vs AI',      config: ['human', 'ai', 'ai', 'ai'] },
  { label: '2 vs 2 AI',  config: ['human', 'ai', 'human', 'ai'] },
];

interface Props {
  onStart: (config: GameConfig) => void;
  mobile?: boolean;
}

export default function GameSetup({ onStart, mobile = false }: Props) {
  const [playerTypes, setPlayerTypes] = useState<PlayerType[]>(['human', 'ai', 'ai', 'ai']);

  const setType = (idx: number, type: PlayerType) => {
    const next = [...playerTypes];
    next[idx] = type;
    setPlayerTypes(next);
  };

  const hasHuman = playerTypes.some(t => t === 'human');
  const hasPlayers = playerTypes.filter(t => t !== 'none').length >= 2;
  const canStart = hasHuman && hasPlayers;

  const handleStart = () => {
    if (!canStart) return;
    onStart({ players: PLAYER_COLORS.map((color, i) => ({ color, type: playerTypes[i] })) });
  };

  const isPresetActive = (config: PlayerType[]) =>
    config.every((t, i) => t === playerTypes[i]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: mobile ? '20px' : '28px',
      padding: mobile ? '28px 16px' : '48px 28px',
      maxWidth: '460px',
      width: '100%',
      background: '#FFF',
      border: '1px solid #E0E0E0',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: mobile ? '32px' : '40px',
          fontWeight: 800,
          letterSpacing: '6px',
          color: '#333',
          margin: 0,
        }}>
          LUDO
        </h1>
        <p style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
          Classic board game
        </p>
      </div>

      {/* Presets */}
      <div style={{
        display: 'flex',
        gap: '5px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {PRESETS.map(p => {
          const active = isPresetActive(p.config);
          return (
            <button
              key={p.label}
              onClick={() => setPlayerTypes([...p.config])}
              style={{
                padding: mobile ? '8px 12px' : '7px 16px',
                border: active ? '2px solid #333' : '1px solid #CCC',
                background: active ? '#333' : '#FFF',
                color: active ? '#FFF' : '#555',
                cursor: 'pointer',
                fontSize: mobile ? '11px' : '12px',
                fontWeight: 600,
                minHeight: '36px',
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Player rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        {PLAYER_COLORS.map((color, idx) => {
          const c = C[color];
          return (
            <div
              key={color}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: mobile ? '8px' : '12px',
                padding: mobile ? '8px 10px' : '10px 14px',
                border: '1px solid #E8E8E8',
                background: playerTypes[idx] !== 'none' ? '#FAFAFA' : '#F5F5F5',
                opacity: playerTypes[idx] === 'none' ? 0.5 : 1,
              }}
            >
              <div style={{
                width: mobile ? '24px' : '28px',
                height: mobile ? '24px' : '28px',
                background: c.bg,
                flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: c.text, fontSize: mobile ? '10px' : '11px', fontWeight: 700,
              }}>
                {color[0].toUpperCase()}
              </div>
              <span style={{
                flex: 1, fontSize: mobile ? '12px' : '13px', fontWeight: 600,
                textTransform: 'uppercase', color: '#444',
              }}>
                {color}
              </span>
              <div style={{ display: 'flex', gap: '3px' }}>
                {(['human', 'ai', 'none'] as PlayerType[]).map(type => {
                  const active = playerTypes[idx] === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setType(idx, type)}
                      style={{
                        padding: mobile ? '6px 8px' : '4px 10px',
                        border: active ? `1.5px solid ${c.bg}` : '1px solid #DDD',
                        background: active ? c.bg : '#FFF',
                        color: active ? c.text : '#777',
                        cursor: 'pointer',
                        fontSize: mobile ? '10px' : '11px',
                        fontWeight: active ? 700 : 500,
                        textTransform: 'uppercase',
                        minHeight: mobile ? '32px' : undefined,
                      }}
                    >
                      {type === 'none' ? 'OFF' : type}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Start */}
      <button
        onClick={handleStart}
        disabled={!canStart}
        style={{
          padding: mobile ? '14px 40px' : '13px 52px',
          border: 'none',
          background: canStart ? '#333' : '#CCC',
          color: '#FFF',
          fontSize: '15px',
          fontWeight: 700,
          cursor: canStart ? 'pointer' : 'not-allowed',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          minHeight: '48px',
          width: mobile ? '100%' : undefined,
        }}
      >
        Start Game
      </button>

      {!canStart && (
        <p style={{ color: '#AAA', fontSize: '12px', margin: 0 }}>
          Need at least 1 human and 2 total players.
        </p>
      )}
    </div>
  );
}
