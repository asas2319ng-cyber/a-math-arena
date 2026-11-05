import type { Operator, TileDefinition, TileSetConfig } from "../types";

/**
 * CONFIGURABLE TILE INVENTORY
 * ---------------------------
 * ASSUMPTION (unresolved rule specification — see docs/ARCHITECTURE.md §7):
 * The spec requires a 100-tile collection but does not publish the exact
 * counts or base scores. The values below are a DRAFT that totals exactly 100
 * tiles and is validated by tests. Replace by publishing a new
 * `TileSetConfig` with a new `id`; never edit a published one in place.
 */

const num = (value: number, count: number, points: number): TileDefinition => ({
  key: `n:${value}`,
  kind: "number",
  label: String(value),
  value,
  points,
  count,
});

const op = (symbol: Operator, count: number, points: number): TileDefinition => ({
  key: `op:${symbol}`,
  kind: "operator",
  label: symbol === "-" ? "−" : symbol,
  operators: [symbol],
  points,
  count,
});

export const DRAFT_TILE_SET: TileSetConfig = {
  id: "amath-tileset-draft-1",
  description: "Draft 100-tile distribution (assumption pending official specification).",
  definitions: [
    // Numbers 0–9
    num(0, 5, 1),
    num(1, 6, 1),
    num(2, 6, 1),
    num(3, 5, 1),
    num(4, 5, 2),
    num(5, 4, 2),
    num(6, 4, 2),
    num(7, 4, 2),
    num(8, 4, 2),
    num(9, 4, 2),
    // Numbers 10–20
    num(10, 2, 3),
    num(11, 1, 4),
    num(12, 2, 3),
    num(13, 1, 6),
    num(14, 1, 4),
    num(15, 1, 4),
    num(16, 1, 4),
    num(17, 1, 6),
    num(18, 1, 4),
    num(19, 1, 7),
    num(20, 1, 5),
    // Operators
    op("+", 4, 2),
    op("-", 4, 2),
    op("×", 4, 2),
    op("÷", 4, 2),
    {
      key: "dual:+-",
      kind: "dual-operator",
      label: "+/−",
      operators: ["+", "-"],
      points: 1,
      count: 5,
    },
    {
      key: "dual:×÷",
      kind: "dual-operator",
      label: "×/÷",
      operators: ["×", "÷"],
      points: 1,
      count: 4,
    },
    // Equality
    { key: "eq", kind: "equals", label: "=", points: 1, count: 11 },
    // Blank (assigned any value when played)
    { key: "blank", kind: "blank", label: "", points: 0, count: 4 },
  ],
};

export const REQUIRED_TILE_TOTAL = 100;

export function totalTileCount(config: TileSetConfig): number {
  return config.definitions.reduce((sum, d) => sum + d.count, 0);
}
