/**
 * Roll a fair 6-sided die.
 * Uses Math.random() — sufficient for casual gameplay, not cryptographic.
 */
export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}
