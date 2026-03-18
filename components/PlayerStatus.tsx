'use client';

import { PlayerState } from '../engine/types';

const COLORS: Record<string, { bg: string; text: string; border: string }> = {
  red:    { bg: '#E53935', text: '#FFF', border: '#C62828' },
  green:  { bg: '#43A047', text: '#FFF', border: '#2E7D32' },
  yellow: { bg: '#F9A825', text: '#333', border: '#F57F17' },
  blue:   { bg: '#1E88E5', text: '#FFF', border: '#1565C0' },
};

interface Props {
  players: PlayerState[];
  currentPlayerIndex: number;
  compact?: boolean;
}

export default function PlayerStatus({ players, currentPlayerIndex, compact = false }: Props) {
  return (
    <div style={{
      display: 'flex',
      gap: compact ? '4px' : '6px',
      flexWrap: 'wrap',
      justifyContent: 'center',
      width: '100%',
      maxWidth: compact ? '480px' : undefined,
    }}>
      {players.map((player, idx) => {
        if (player.type === 'none') return null;
        const isCurrent = idx === currentPlayerIndex;
        const c = COLORS[player.color];
        const finished = player.finishedCount;
        const active = player.tokens.filter(t => t.state === 'active').length;
        const home = player.tokens.filter(t => t.state === 'home').length;

        if (compact) {
          // Mobile: tiny colored chips
          return (
            <div
              key={player.color}
              style={{
                flex: '1 1 0',
                minWidth: '70px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 8px',
                background: isCurrent ? c.bg : '#FFF',
                color: isCurrent ? c.text : '#444',
                border: `1.5px solid ${isCurrent ? c.border : '#DDD'}`,
                fontSize: '10px',
              }}
            >
              {!isCurrent && (
                <div style={{ width: '8px', height: '8px', background: c.bg, flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }}>
                  {player.color.slice(0, 3)}
                  {player.type === 'ai' ? ' AI' : ''}
                </div>
                <div style={{ opacity: 0.7, fontSize: '9px', whiteSpace: 'nowrap' }}>
                  {finished > 0 ? `${finished}` : ''}{finished > 0 ? ' done' : ''}
                  {active > 0 ? ` ${active} out` : ''}
                  {home === 4 ? '4 home' : ''}
                </div>
              </div>
            </div>
          );
        }

        // Desktop: full cards
        return (
          <div
            key={player.color}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 14px',
              background: isCurrent ? c.bg : '#FFFFFF',
              color: isCurrent ? c.text : '#333',
              border: `2px solid ${isCurrent ? c.border : '#E0E0E0'}`,
              boxShadow: isCurrent ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              transition: 'all 0.2s',
              minWidth: '130px',
            }}
          >
            {!isCurrent && (
              <div style={{ width: '10px', height: '10px', background: c.bg, flexShrink: 0 }} />
            )}
            <div style={{ fontSize: '12px' }}>
              <div style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                {player.color}
                {player.type === 'ai' ? ' (AI)' : ''}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.75, marginTop: '1px', display: 'flex', gap: '6px' }}>
                {home > 0 && <span>{home} home</span>}
                {active > 0 && <span>{active} out</span>}
                {finished > 0 && <span>{finished} done</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
