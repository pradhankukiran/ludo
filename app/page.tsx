'use client';

import { useGameEngine } from '../hooks/useGameEngine';
import { useIsMobile } from '../hooks/useIsMobile';
import GameSetup from '../components/GameSetup';
import LudoBoard from '../components/LudoBoard';
import DicePanel from '../components/DicePanel';
import PlayerStatus from '../components/PlayerStatus';
import WinModal from '../components/WinModal';

export default function Home() {
  const engine = useGameEngine();
  const { state } = engine;
  const mobile = useIsMobile();

  if (state.phase === 'setup') {
    return (
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F5F5F5',
        padding: mobile ? '16px' : 0,
      }}>
        <GameSetup onStart={engine.startGame} mobile={mobile} />
      </main>
    );
  }

  const currentPlayer = state.players[state.currentPlayerIndex];

  // ── Mobile: vertical stack ──────────────────────────────────────
  if (mobile) {
    return (
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#F0EDE6',
        padding: '8px 4px',
        gap: '8px',
      }}>
        <PlayerStatus
          players={state.players}
          currentPlayerIndex={state.currentPlayerIndex}
          compact
        />

        <LudoBoard
          state={state}
          legalMoves={engine.legalMoves}
          onTokenClick={engine.selectToken}
          animatingTokenId={engine.animatingTokenId}
          animPos={engine.animPos}
        />

        <DicePanel
          currentPlayer={currentPlayer.color}
          currentPlayerType={currentPlayer.type as 'human' | 'ai'}
          canRoll={state.phase === 'rolling'}
          diceValue={engine.diceDisplayValue}
          isDiceRolling={engine.isDiceRolling}
          message={state.message}
          onRoll={engine.roll}
          compact
        />

        <button
          onClick={engine.reset}
          style={{
            padding: '8px 24px',
            border: '1px solid #CCC',
            background: '#FFF',
            color: '#666',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          New Game
        </button>

        {state.phase === 'gameover' && state.winner && (
          <WinModal winner={state.winner} onPlayAgain={engine.reset} />
        )}
      </main>
    );
  }

  // ── Desktop: side-by-side ───────────────────────────────────────
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: '#F0EDE6',
      padding: '20px 16px',
      gap: '16px',
    }}>
      <PlayerStatus
        players={state.players}
        currentPlayerIndex={state.currentPlayerIndex}
      />

      <div style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '980px',
      }}>
        <div style={{ flex: '1 1 400px', maxWidth: '720px' }}>
          <LudoBoard
            state={state}
            legalMoves={engine.legalMoves}
            onTokenClick={engine.selectToken}
            animatingTokenId={engine.animatingTokenId}
            animPos={engine.animPos}
          />
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minWidth: '200px',
        }}>
          <DicePanel
            currentPlayer={currentPlayer.color}
            currentPlayerType={currentPlayer.type as 'human' | 'ai'}
            canRoll={state.phase === 'rolling'}
            diceValue={engine.diceDisplayValue}
            isDiceRolling={engine.isDiceRolling}
            message={state.message}
            onRoll={engine.roll}
          />
          <button
            onClick={engine.reset}
            style={{
              padding: '9px 16px',
              border: '1px solid #CCC',
              background: '#FFF',
              color: '#666',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            New Game
          </button>
        </div>
      </div>

      {state.phase === 'gameover' && state.winner && (
        <WinModal winner={state.winner} onPlayAgain={engine.reset} />
      )}
    </main>
  );
}
