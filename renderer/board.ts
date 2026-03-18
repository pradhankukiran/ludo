import { PlayerColor } from '../engine/types';
import {
  GRID_SIZE,
  COLOR_VALUES,
  MAIN_PATH,
  STAR_SQUARES,
  HOME_STRETCHES,
  HOME_BASES,
  START_OFFSETS,
  PLAYER_COLORS,
} from '../engine/constants';

// Board palette
const BOARD_BG      = '#F7F0E3';   // warm parchment
const CELL_BG       = '#FFFEF8';   // path cells
const CELL_BORDER   = '#C8BFA8';   // subtle warm grid
const FRAME_COLOR   = '#3E2723';   // dark wood frame
const FRAME_INNER   = '#5D4037';   // lighter frame accent
const STAR_FILL     = '#FFD600';   // gold star
const STAR_STROKE   = '#F9A825';
const CENTER_BORDER = '#5D4037';

const QUADRANT: Record<PlayerColor, string> = {
  red:    '#E53935',
  green:  '#43A047',
  yellow: '#FDD835',
  blue:   '#1E88E5',
};
const QUADRANT_LIGHT: Record<PlayerColor, string> = {
  red:    '#FFCDD2',
  green:  '#C8E6C9',
  yellow: '#FFF9C4',
  blue:   '#BBDEFB',
};
const HOME_LANE: Record<PlayerColor, string> = {
  red:    '#EF5350',
  green:  '#66BB6A',
  yellow: '#FFEE58',
  blue:   '#42A5F5',
};

export function drawBoard(ctx: CanvasRenderingContext2D, size: number): void {
  const cell = size / GRID_SIZE;
  const frame = cell * 0.35;

  // ── Background ────────────────────────────────────────────────────
  ctx.fillStyle = FRAME_COLOR;
  ctx.fillRect(0, 0, size, size);

  // Inner board area
  ctx.fillStyle = BOARD_BG;
  ctx.fillRect(frame, frame, size - frame * 2, size - frame * 2);

  // Frame bevel
  ctx.strokeStyle = FRAME_INNER;
  ctx.lineWidth = 2;
  ctx.strokeRect(frame + 1, frame + 1, size - frame * 2 - 2, size - frame * 2 - 2);

  // ── Quadrants (home bases) ────────────────────────────────────────
  drawQuadrant(ctx, cell, 'red',    9, 0);
  drawQuadrant(ctx, cell, 'green',  0, 0);
  drawQuadrant(ctx, cell, 'yellow', 0, 9);
  drawQuadrant(ctx, cell, 'blue',   9, 9);

  // ── Path cells ────────────────────────────────────────────────────
  drawPathCells(ctx, cell);

  // ── Home stretch lanes ────────────────────────────────────────────
  drawHomeStretchLanes(ctx, cell);

  // ── Center home ───────────────────────────────────────────────────
  drawCenterHome(ctx, cell);

  // ── Star markers ──────────────────────────────────────────────────
  drawStarMarkers(ctx, cell);

  // ── Start position markers ────────────────────────────────────────
  drawStartMarkers(ctx, cell);

  // ── Home base token parking ───────────────────────────────────────
  drawHomeBaseSlots(ctx, cell);

  // ── Outer frame shadow line ───────────────────────────────────────
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, size - 1, size - 1);
}

// ── Quadrant ──────────────────────────────────────────────────────────

function drawQuadrant(
  ctx: CanvasRenderingContext2D,
  cell: number,
  color: PlayerColor,
  startRow: number,
  startCol: number,
): void {
  const x = startCol * cell;
  const y = startRow * cell;
  const w = 6 * cell;

  // Colored fill
  ctx.fillStyle = QUADRANT[color];
  ctx.fillRect(x, y, w, w);

  // Border
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, w);

  // Inner white yard
  const inset = cell * 0.8;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + inset, y + inset, w - inset * 2, w - inset * 2);

  // Yard border
  ctx.strokeStyle = QUADRANT[color];
  ctx.lineWidth = 3;
  ctx.strokeRect(x + inset, y + inset, w - inset * 2, w - inset * 2);
}

// ── Path cells ────────────────────────────────────────────────────────

function drawPathCells(ctx: CanvasRenderingContext2D, cell: number): void {
  const arms: [number, number][] = [];

  // Top arm (rows 0-5, cols 6-8)
  for (let r = 0; r < 6; r++)
    for (let c = 6; c <= 8; c++) arms.push([r, c]);
  // Bottom arm (rows 9-14, cols 6-8)
  for (let r = 9; r < 15; r++)
    for (let c = 6; c <= 8; c++) arms.push([r, c]);
  // Left arm (rows 6-8, cols 0-5)
  for (let r = 6; r <= 8; r++)
    for (let c = 0; c < 6; c++) arms.push([r, c]);
  // Right arm (rows 6-8, cols 9-14)
  for (let r = 6; r <= 8; r++)
    for (let c = 9; c < 15; c++) arms.push([r, c]);

  for (const [r, c] of arms) {
    ctx.fillStyle = CELL_BG;
    ctx.fillRect(c * cell, r * cell, cell, cell);
    ctx.strokeStyle = CELL_BORDER;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(c * cell, r * cell, cell, cell);
  }
}

// ── Home stretch lanes ────────────────────────────────────────────────

function drawHomeStretchLanes(ctx: CanvasRenderingContext2D, cell: number): void {
  for (const color of PLAYER_COLORS) {
    const stretch = HOME_STRETCHES[color];
    for (let i = 0; i < stretch.length - 1; i++) {
      const [r, c] = stretch[i];
      ctx.fillStyle = HOME_LANE[color];
      ctx.fillRect(c * cell, r * cell, cell, cell);
      ctx.strokeStyle = CELL_BORDER;
      ctx.lineWidth = 0.8;
      ctx.strokeRect(c * cell, r * cell, cell, cell);

      // Inner triangle pointing towards center
      if (i === stretch.length - 2) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        const cx = (c + 0.5) * cell;
        const cy = (r + 0.5) * cell;
        ctx.beginPath();
        ctx.arc(cx, cy, cell * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

// ── Center home ───────────────────────────────────────────────────────

function drawCenterHome(ctx: CanvasRenderingContext2D, cell: number): void {
  const cx = 7.5 * cell;
  const cy = 7.5 * cell;
  const half = 1.5 * cell;

  // White base
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(cx - half, cy - half, half * 2, half * 2);

  // 4 colored triangles
  const triangles: [PlayerColor, number, number, number, number, number, number][] = [
    ['red',    cx - half, cy + half, cx + half, cy + half, cx, cy],
    ['green',  cx - half, cy - half, cx - half, cy + half, cx, cy],
    ['yellow', cx - half, cy - half, cx + half, cy - half, cx, cy],
    ['blue',   cx + half, cy - half, cx + half, cy + half, cx, cy],
  ];

  for (const [color, x1, y1, x2, y2, x3, y3] of triangles) {
    ctx.fillStyle = QUADRANT[color];
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fill();

    // Triangle edge
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Center dot
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx, cy, cell * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = CENTER_BORDER;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Outer border
  ctx.strokeStyle = CENTER_BORDER;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(cx - half, cy - half, half * 2, half * 2);
}

// ── Stars ─────────────────────────────────────────────────────────────

function drawStarMarkers(ctx: CanvasRenderingContext2D, cell: number): void {
  for (const idx of STAR_SQUARES) {
    const [r, c] = MAIN_PATH[idx];
    const cx = (c + 0.5) * cell;
    const cy = (r + 0.5) * cell;

    // Star background
    ctx.fillStyle = STAR_FILL;
    ctx.fillRect(c * cell + 1, r * cell + 1, cell - 2, cell - 2);

    // Star shape
    drawStar(ctx, cx, cy, cell * 0.32, cell * 0.14, 5, STAR_STROKE, '#FFFFFF');
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  outerR: number, innerR: number,
  points: number,
  stroke: string, fill: string,
): void {
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

// ── Start markers ─────────────────────────────────────────────────────

function drawStartMarkers(ctx: CanvasRenderingContext2D, cell: number): void {
  for (const color of PLAYER_COLORS) {
    const idx = START_OFFSETS[color];
    const [r, c] = MAIN_PATH[idx];

    // Colored cell fill
    ctx.fillStyle = QUADRANT_LIGHT[color];
    ctx.fillRect(c * cell, r * cell, cell, cell);
    ctx.strokeStyle = CELL_BORDER;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(c * cell, r * cell, cell, cell);

    // Arrow
    const cx = (c + 0.5) * cell;
    const cy = (r + 0.5) * cell;
    const arrowSize = cell * 0.28;

    ctx.fillStyle = QUADRANT[color];
    ctx.beginPath();
    const dirs: Record<PlayerColor, number> = {
      red: -Math.PI / 2,    // up
      green: 0,              // right
      yellow: Math.PI / 2,   // down
      blue: Math.PI,         // left
    };
    const angle = dirs[color];
    // Arrow triangle
    ctx.moveTo(cx + Math.cos(angle) * arrowSize, cy + Math.sin(angle) * arrowSize);
    ctx.lineTo(cx + Math.cos(angle + 2.3) * arrowSize * 0.7, cy + Math.sin(angle + 2.3) * arrowSize * 0.7);
    ctx.lineTo(cx + Math.cos(angle - 2.3) * arrowSize * 0.7, cy + Math.sin(angle - 2.3) * arrowSize * 0.7);
    ctx.closePath();
    ctx.fill();
  }
}

// ── Home base slots ───────────────────────────────────────────────────

function drawHomeBaseSlots(ctx: CanvasRenderingContext2D, cell: number): void {
  for (const color of PLAYER_COLORS) {
    const bases = HOME_BASES[color];
    for (const [r, c] of bases) {
      const cx = (c + 0.5) * cell;
      const cy = (r + 0.5) * cell;
      const radius = cell * 0.38;

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.beginPath();
      ctx.arc(cx + 1, cy + 1, radius, 0, Math.PI * 2);
      ctx.fill();

      // Circle
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Ring
      ctx.strokeStyle = QUADRANT[color];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner ring
      ctx.strokeStyle = QUADRANT[color];
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
