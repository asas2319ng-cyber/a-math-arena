import { BOARD_LAYOUT, BOARD_LAYOUT_ID } from "./config/board-layout";
import { BOARD_SIZE, CELL_COUNT, type CellType, type Coordinate, type Tile } from "./types";

/** Column letter A–O + row number 1–15, e.g. centre = "H8". */
export function cellId(row: number, col: number): string {
  assertInBounds(row, col);
  return `${String.fromCharCode(65 + col)}${row + 1}`;
}

export function parseCellId(id: string): Coordinate {
  const match = /^([A-O])(1[0-5]|[1-9])$/.exec(id);
  if (!match) throw new Error(`Invalid cell id: ${id}`);
  return { row: Number(match[2]) - 1, col: match[1].charCodeAt(0) - 65 };
}

export function indexOf(row: number, col: number): number {
  assertInBounds(row, col);
  return row * BOARD_SIZE + col;
}

export function coordOf(index: number): Coordinate {
  if (!Number.isInteger(index) || index < 0 || index >= CELL_COUNT) {
    throw new RangeError(`Cell index out of range: ${index}`);
  }
  return { row: Math.floor(index / BOARD_SIZE), col: index % BOARD_SIZE };
}

function assertInBounds(row: number, col: number) {
  if (!Number.isInteger(row) || !Number.isInteger(col) || row < 0 || col < 0 || row >= BOARD_SIZE || col >= BOARD_SIZE) {
    throw new RangeError(`Coordinate out of range: (${row}, ${col})`);
  }
}

export function cellTypeAt(row: number, col: number): CellType {
  return BOARD_LAYOUT[indexOf(row, col)];
}

export interface PlacedTile {
  readonly tile: Tile;
  /** Value chosen for a blank tile or the operator chosen for a dual tile. */
  readonly assigned?: string;
}

/** Immutable-friendly board: flat array of 225 slots. */
export type BoardState = ReadonlyArray<PlacedTile | null>;

export function createEmptyBoard(): BoardState {
  return Object.freeze(new Array<PlacedTile | null>(CELL_COUNT).fill(null));
}

export function isOccupied(board: BoardState, row: number, col: number): boolean {
  return board[indexOf(row, col)] !== null;
}

export function countOccupied(board: BoardState): number {
  let n = 0;
  for (const slot of board) if (slot) n++;
  return n;
}

/* ---------------- Serialization (versioned) ---------------- */

export interface SerializedBoardV1 {
  readonly v: 1;
  readonly layout: string;
  readonly tiles: ReadonlyArray<{ c: string; t: Tile; a?: string }>;
}

export function serializeBoard(board: BoardState): SerializedBoardV1 {
  const tiles: Array<{ c: string; t: Tile; a?: string }> = [];
  board.forEach((slot, index) => {
    if (!slot) return;
    const { row, col } = coordOf(index);
    tiles.push({ c: cellId(row, col), t: slot.tile, ...(slot.assigned ? { a: slot.assigned } : {}) });
  });
  return { v: 1, layout: BOARD_LAYOUT_ID, tiles };
}

export function restoreBoard(data: SerializedBoardV1): BoardState {
  if (data.v !== 1) throw new Error(`Unsupported board serialization version: ${String(data.v)}`);
  const cells = new Array<PlacedTile | null>(CELL_COUNT).fill(null);
  for (const entry of data.tiles) {
    const { row, col } = parseCellId(entry.c);
    const idx = indexOf(row, col);
    if (cells[idx]) throw new Error(`Duplicate tile on ${entry.c}`);
    cells[idx] = { tile: entry.t, ...(entry.a ? { assigned: entry.a } : {}) };
  }
  return Object.freeze(cells);
}
