/**
 * Draw a realistic dice face.
 */
export function drawDice(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  faceSize: number,
  value: number | null,
): void {
  const r = faceSize * 0.12; // corner radius
  const pip = faceSize * 0.1;

  ctx.save();

  // ── Drop shadow ─────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  roundRect(ctx, x + 3, y + 3, faceSize, faceSize, r);
  ctx.fill();

  // ── Dice body ───────────────────────────────────────────────────
  ctx.fillStyle = '#FAFAFA';
  roundRect(ctx, x, y, faceSize, faceSize, r);
  ctx.fill();

  // Edge highlight (top-left)
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x + 1, y + 1, faceSize - 2, faceSize - 2, r);
  ctx.stroke();

  // Border
  ctx.strokeStyle = '#9E9E9E';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, faceSize, faceSize, r);
  ctx.stroke();

  if (value === null) {
    ctx.fillStyle = '#BDBDBD';
    ctx.font = `bold ${faceSize * 0.45}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', x + faceSize / 2, y + faceSize / 2);
    ctx.restore();
    return;
  }

  // ── Pips ────────────────────────────────────────────────────────
  const positions = getPipPositions(value, faceSize);
  for (const [px, py] of positions) {
    // Pip shadow (inset feel)
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.arc(x + px + 0.5, y + py + 0.5, pip, 0, Math.PI * 2);
    ctx.fill();

    // Pip fill — red for 1 and 4 (classic Indian Ludo dice), black for rest
    ctx.fillStyle = (value === 1 || value === 4) ? '#D32F2F' : '#212121';
    ctx.beginPath();
    ctx.arc(x + px, y + py, pip, 0, Math.PI * 2);
    ctx.fill();

    // Pip glint
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(x + px - pip * 0.2, y + py - pip * 0.3, pip * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function getPipPositions(value: number, size: number): [number, number][] {
  const q1 = size * 0.26;
  const q2 = size * 0.5;
  const q3 = size * 0.74;

  switch (value) {
    case 1: return [[q2, q2]];
    case 2: return [[q1, q3], [q3, q1]];
    case 3: return [[q1, q3], [q2, q2], [q3, q1]];
    case 4: return [[q1, q1], [q1, q3], [q3, q1], [q3, q3]];
    case 5: return [[q1, q1], [q1, q3], [q2, q2], [q3, q1], [q3, q3]];
    case 6: return [[q1, q1], [q1, q2], [q1, q3], [q3, q1], [q3, q2], [q3, q3]];
    default: return [];
  }
}
