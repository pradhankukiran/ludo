'use client';

import { PlayerColor } from '../engine/types';

const COLORS: Record<PlayerColor, { bg: string; text: string }> = {
  red:    { bg: '#E53935', text: '#FFF' },
  green:  { bg: '#43A047', text: '#FFF' },
  yellow: { bg: '#F9A825', text: '#333' },
  blue:   { bg: '#1E88E5', text: '#FFF' },
};

interface Props {
  winner: PlayerColor;
  onPlayAgain: () => void;
}

export default function WinModal({ winner, onPlayAgain }: Props) {
  const c = COLORS[winner];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)',
      zIndex: 100,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#FFFFFF',
        padding: '52px 48px',
        textAlign: 'center',
        border: `3px solid ${c.bg}`,
        maxWidth: '380px',
        width: '90%',
        boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
      }}>
        {/* Trophy icon */}
        <div style={{
          width: '64px', height: '64px',
          background: c.bg,
          margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px',
          color: c.text,
        }}>
          &#9813;
        </div>

        <h2 style={{
          fontSize: '32px',
          fontWeight: 800,
          color: c.bg,
          margin: '0 0 6px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}>
          {winner} Wins!
        </h2>
        <p style={{ fontSize: '14px', color: '#888', margin: '0 0 32px' }}>
          All four tokens reached home.
        </p>
        <button
          onClick={onPlayAgain}
          style={{
            padding: '12px 40px',
            border: 'none',
            background: c.bg,
            color: c.text,
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
          }}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
