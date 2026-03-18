export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';
export type PlayerType = 'human' | 'ai' | 'none';
export type TokenState = 'home' | 'active' | 'finished';
export type GamePhase = 'setup' | 'rolling' | 'moving' | 'gameover';

export interface Token {
  readonly id: string;
  /** 0-3: position within the player's 4-token set. Used for home base slot assignment. */
  readonly index: number;
  readonly color: PlayerColor;
  state: TokenState;
  /**
   * -1 when home.
   * 0–50 on the main path (player-relative).
   * 51–56 on the home stretch (51 = first home cell, 56 = center/finished).
   */
  pathIndex: number;
}

export interface PlayerState {
  readonly color: PlayerColor;
  type: PlayerType;
  tokens: Token[];
  finishedCount: number;
}

export interface GameConfig {
  players: { color: PlayerColor; type: PlayerType }[];
}

export interface Move {
  readonly tokenId: string;
  readonly from: number;
  readonly to: number;
  readonly captures?: string;
}

export interface GameState {
  players: PlayerState[];
  currentPlayerIndex: number;
  diceValue: number | null;
  phase: GamePhase;
  consecutiveSixes: number;
  winner: PlayerColor | null;
  message: string;
  lastCapture: string | null;
}

export type GameAction =
  | { type: 'ROLL_DICE'; value: number }
  | { type: 'MOVE_TOKEN'; tokenId: string }
  | { type: 'START_GAME'; config: GameConfig }
  | { type: 'NEXT_TURN' }
  | { type: 'RESET' };
