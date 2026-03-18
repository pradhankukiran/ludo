import { PlayerColor, GameState, Token } from '../engine/types';
import { GRID_SIZE } from '../engine/constants';
import { getTokenPosition } from '../engine/pathmap';

// Token palette — brighter than board quadrants for contrast
const TOKEN_FILL: Record<PlayerColor, string> = {
  red:    '#D32F2F',
  green:  '#388E3C',
  yellow: '#F9A825',
  blue:   '#1565C0',
};
const TOKEN_DARK: Record<PlayerColor, string> = {
  red:    '#B71C1C',
  green:  '#1B5E20',
  yellow: '#F57F17',
  blue:   '#0D47A1',
};
const TOKEN_LIGHT: Record<PlayerColor, string> = {
  red:    '#EF5350',
  green:  '#66BB6A',
  yellow: '#FFEE58',
  blue:   '#42A5F5',
};

interface TokenDrawInfo {
  token: Token;
  color: PlayerColor;
  x: number;
  y: number;
  highlight: boolean;
}

export function drawTokens(
  ctx: CanvasRenderingContext2D,
  size: number,
  state: GameState,
  legalMoveTokenIds: Set<string>,
  animatingTokenId: string | null,
  animPos: [number, number] | null,
): void {
  const cell = size / GRID_SIZE;
  const drawInfos: TokenDrawInfo[] = [];

  for (const player of state.players) {
    if (player.type === 'none') continue;
    for (const token of player.tokens) {
      if (animatingTokenId === token.id) continue;
      const [row, col] = getTokenPosition(token, player.color);
      drawInfos.push({
        token,
        color: player.color,
        x: (col + 0.5) * cell,
        y: (row + 0.5) * cell,
        highlight: legalMoveTokenIds.has(token.id),
      });
    }
  }

  // Stack offset for tokens at same position
  const posMap = new Map<string, TokenDrawInfo[]>();
  for (const info of drawInfos) {
    const key = `${Math.round(info.x)},${Math.round(info.y)}`;
    if (!posMap.has(key)) posMap.set(key, []);
    posMap.get(key)!.push(info);
  }
  for (const [, group] of posMap) {
    if (group.length > 1) {
      const offsets = [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]];
      group.forEach((info, i) => {
        const off = offsets[i % offsets.length];
        info.x += off[0] * cell * 0.45;
        info.y += off[1] * cell * 0.45;
      });
    }
  }

  // Draw all tokens
  for (const info of drawInfos) {
    drawPawn(ctx, info.x, info.y, cell, info.color, info.highlight);
  }

  // Draw animating token
  if (animatingTokenId && animPos) {
    const found = findToken(state, animatingTokenId);
    if (found) {
      drawPawn(
        ctx,
        (animPos[1] + 0.5) * cell,
        (animPos[0] + 0.5) * cell,
        cell * 1.08,
        found.color,
        false,
      );
    }
  }
}

/**
 * Draw a 3D pawn-like game piece.
 */
function drawPawn(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  cell: number,
  color: PlayerColor,
  highlight: boolean,
): void {
  const baseR = cell * 0.32;
  const bodyH = cell * 0.22;
  const headR = cell * 0.18;

  // ── Selection glow ──────────────────────────────────────────────
  if (highlight) {
    const pulse = 0.6 + 0.4 * Math.sin(performance.now() / 200);
    ctx.strokeStyle = `rgba(255,215,0,${pulse})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y - bodyH * 0.3, baseR + 5, 0, Math.PI * 2);
    ctx.stroke();

    // Dashed outer
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(x, y - bodyH * 0.3, baseR + 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ── Drop shadow ─────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(x + 1.5, y + 2, baseR * 0.9, baseR * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Base (dark ellipse) ─────────────────────────────────────────
  ctx.fillStyle = TOKEN_DARK[color];
  ctx.beginPath();
  ctx.ellipse(x, y, baseR, baseR * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Body (tapered shape from base to neck) ──────────────────────
  const neckW = baseR * 0.45;
  const bodyTop = y - bodyH;

  ctx.fillStyle = TOKEN_FILL[color];
  ctx.beginPath();
  ctx.moveTo(x - baseR, y);
  ctx.quadraticCurveTo(x - baseR * 0.9, bodyTop + bodyH * 0.3, x - neckW, bodyTop);
  ctx.lineTo(x + neckW, bodyTop);
  ctx.quadraticCurveTo(x + baseR * 0.9, bodyTop + bodyH * 0.3, x + baseR, y);
  ctx.closePath();
  ctx.fill();

  // Body edge
  ctx.strokeStyle = TOKEN_DARK[color];
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Head (circle) ───────────────────────────────────────────────
  const headY = bodyTop - headR * 0.6;

  ctx.fillStyle = TOKEN_FILL[color];
  ctx.beginPath();
  ctx.arc(x, headY, headR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = TOKEN_DARK[color];
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, headY, headR, 0, Math.PI * 2);
  ctx.stroke();

  // ── Specular highlight on head ──────────────────────────────────
  ctx.fillStyle = TOKEN_LIGHT[color];
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(x - headR * 0.25, headY - headR * 0.25, headR * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // ── Small white glint ───────────────────────────────────────────
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(x - headR * 0.3, headY - headR * 0.35, headR * 0.15, 0, Math.PI * 2);
  ctx.fill();
}

function findToken(state: GameState, tokenId: string): { token: Token; color: PlayerColor } | null {
  for (const player of state.players) {
    const token = player.tokens.find(t => t.id === tokenId);
    if (token) return { token, color: player.color };
  }
  return null;
}

/**
 * Hit-test: check if canvas coordinates are on a legal-move token.
 */
export function hitTestToken(
  state: GameState,
  canvasX: number,
  canvasY: number,
  size: number,
  legalMoveTokenIds: Set<string>,
): string | null {
  const cell = size / GRID_SIZE;
  const hitR = cell * 0.45;

  for (const player of state.players) {
    if (player.type === 'none') continue;
    for (const token of player.tokens) {
      if (!legalMoveTokenIds.has(token.id)) continue;
      const [row, col] = getTokenPosition(token, player.color);
      const tx = (col + 0.5) * cell;
      const ty = (row + 0.5) * cell;
      if (Math.hypot(canvasX - tx, canvasY - ty) <= hitR) return token.id;
    }
  }
  return null;
}
