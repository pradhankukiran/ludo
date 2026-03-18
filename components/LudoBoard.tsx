'use client';

import { useRef, useEffect, useCallback } from 'react';
import { GameState, Move } from '../engine/types';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { drawBoard } from '../renderer/board';
import { drawTokens, hitTestToken } from '../renderer/tokens';

interface Props {
  state: GameState;
  legalMoves: Move[];
  onTokenClick: (tokenId: string) => void;
  animatingTokenId: string | null;
  animPos: [number, number] | null;
}

export default function LudoBoard({ state, legalMoves, onTokenClick, animatingTokenId, animPos }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardCacheRef = useRef<HTMLCanvasElement | null>(null);
  const size = useCanvasSize(containerRef);

  const legalMoveTokenIds = new Set(legalMoves.map(m => m.tokenId));

  // Cache static board
  useEffect(() => {
    const offscreen = document.createElement('canvas');
    offscreen.width = size;
    offscreen.height = size;
    const ctx = offscreen.getContext('2d');
    if (ctx) drawBoard(ctx, size);
    boardCacheRef.current = offscreen;
  }, [size]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    const render = () => {
      if (!running) return;
      ctx.clearRect(0, 0, size, size);
      if (boardCacheRef.current) ctx.drawImage(boardCacheRef.current, 0, 0);
      drawTokens(ctx, size, state, legalMoveTokenIds, animatingTokenId, animPos);
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
    return () => { running = false; };
  }, [size, state, legalMoveTokenIds, animatingTokenId, animPos]);

  // Unified pointer handler for mouse + touch
  const handlePointer = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (size / rect.width);
    const y = (clientY - rect.top) * (size / rect.height);
    const tokenId = hitTestToken(state, x, y, size, legalMoveTokenIds);
    if (tokenId) onTokenClick(tokenId);
  }, [state, size, legalMoveTokenIds, onTokenClick]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handlePointer(e.clientX, e.clientY);
  };

  const handleTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length !== 1) return;
    e.preventDefault(); // prevent double-fire with click
    handlePointer(e.touches[0].clientX, e.touches[0].clientY);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: '720px',
        aspectRatio: '1',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
        touchAction: 'manipulation', // prevent zoom on double-tap
      }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        onClick={handleClick}
        onTouchStart={handleTouch}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: legalMoves.length > 0 ? 'pointer' : 'default',
        }}
      />
    </div>
  );
}
