/**
 * Lightweight tween system for token movement animation.
 */

export interface TweenState {
  cells: [number, number][]; // Sequence of cells to move through
  currentStep: number;
  progress: number; // 0-1 within current step
  startTime: number;
  stepDuration: number; // ms per cell
  done: boolean;
}

const STEP_DURATION = 120; // ms per cell traversal

export function createTween(cells: [number, number][]): TweenState {
  return {
    cells,
    currentStep: 0,
    progress: 0,
    startTime: performance.now(),
    stepDuration: STEP_DURATION,
    done: cells.length === 0,
  };
}

/**
 * Update tween state. Returns current interpolated [row, col].
 */
export function updateTween(tween: TweenState, now: number): [number, number] {
  if (tween.done || tween.cells.length === 0) {
    return tween.cells[tween.cells.length - 1] || [0, 0];
  }

  const elapsed = now - tween.startTime;
  const totalSteps = tween.cells.length;
  const stepIndex = Math.floor(elapsed / tween.stepDuration);

  if (stepIndex >= totalSteps) {
    tween.done = true;
    tween.currentStep = totalSteps - 1;
    return tween.cells[totalSteps - 1];
  }

  tween.currentStep = stepIndex;
  const stepProgress = (elapsed % tween.stepDuration) / tween.stepDuration;
  tween.progress = easeInOut(stepProgress);

  // Interpolate between current cell and the previous one
  const current = tween.cells[stepIndex];
  const prev = stepIndex > 0 ? tween.cells[stepIndex - 1] : current;

  const row = prev[0] + (current[0] - prev[0]) * tween.progress;
  const col = prev[1] + (current[1] - prev[1]) * tween.progress;

  return [row, col];
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Dice roll animation state.
 */
export interface DiceAnimation {
  startTime: number;
  duration: number; // Total animation time in ms
  finalValue: number;
  done: boolean;
}

export function createDiceAnimation(finalValue: number): DiceAnimation {
  return {
    startTime: performance.now(),
    duration: 600,
    finalValue,
    done: false,
  };
}

/**
 * Update dice animation. Returns the current face to display.
 */
export function updateDiceAnimation(anim: DiceAnimation, now: number): number {
  const elapsed = now - anim.startTime;

  if (elapsed >= anim.duration) {
    anim.done = true;
    return anim.finalValue;
  }

  // Cycle through random values, slowing down
  const progress = elapsed / anim.duration;
  const interval = 50 + progress * 200; // Start fast, slow down
  const cycleIndex = Math.floor(elapsed / interval);

  // Use a seeded-ish sequence that ends on the right value
  if (progress > 0.85) return anim.finalValue;
  return (cycleIndex % 6) + 1;
}
