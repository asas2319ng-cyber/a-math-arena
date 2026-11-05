/**
 * A-MATH engine — shared types.
 * The engine has NO dependency on React, Next.js or the database.
 */

export const BOARD_SIZE = 15 as const;
export const CELL_COUNT = BOARD_SIZE * BOARD_SIZE; // 225
export const RACK_SIZE = 8 as const;

export type CellType = "normal" | "2P" | "3P" | "2E" | "3E" | "center";

export type Operator = "+" | "-" | "×" | "÷";

export type TileKind = "number" | "operator" | "dual-operator" | "equals" | "blank";

/** A line in the configurable tile inventory. */
export interface TileDefinition {
  /** Stable key, e.g. "n:12", "op:+", "dual:+-", "eq", "blank". */
  readonly key: string;
  readonly kind: TileKind;
  /** Text rendered on the tile face. */
  readonly label: string;
  /** Numeric value for number tiles. */
  readonly value?: number;
  /** Selectable operators for operator / dual-operator tiles. */
  readonly operators?: readonly Operator[];
  /** Base score of the tile. */
  readonly points: number;
  /** How many copies exist in the bag. */
  readonly count: number;
}

/** A concrete physical tile with a unique ID. */
export interface Tile {
  readonly id: string;
  readonly defKey: string;
  readonly kind: TileKind;
  readonly label: string;
  readonly value?: number;
  readonly operators?: readonly Operator[];
  readonly points: number;
}

export interface TileSetConfig {
  /** Identifier recorded with every match for backward compatibility. */
  readonly id: string;
  readonly description: string;
  readonly definitions: readonly TileDefinition[];
}

export interface Coordinate {
  readonly row: number;
  readonly col: number;
}

/** Deterministic random source: returns a float in [0, 1). */
export type Rng = () => number;
