import { describe, expect, it } from "vitest";
import {
  BOARD_LAYOUT,
  CELL_COUNT,
  DRAFT_TILE_SET,
  EXPECTED_SPECIAL_COUNTS,
  REQUIRED_TILE_TOTAL,
  RACK_SIZE,
  BOARD_SIZE,
  buildTileSet,
  cellId,
  coordOf,
  createBag,
  createEmptyBoard,
  createRng,
  drawTiles,
  exchangeTiles,
  parseCellId,
  replenishRack,
  restoreBoard,
  serializeBoard,
  sortRack,
  totalTileCount,
  type CellType,
} from "../index";

describe("board layout", () => {
  it("has 225 cells", () => {
    expect(BOARD_LAYOUT.length).toBe(CELL_COUNT);
    expect(CELL_COUNT).toBe(225);
  });

  it("matches the required special-cell quantities", () => {
    const counts: Record<string, number> = {};
    for (const t of BOARD_LAYOUT) counts[t] = (counts[t] ?? 0) + 1;
    for (const [type, expected] of Object.entries(EXPECTED_SPECIAL_COUNTS)) {
      expect(counts[type], type).toBe(expected);
    }
  });

  it("places the centre on H8", () => {
    expect(BOARD_LAYOUT[7 * BOARD_SIZE + 7]).toBe("center");
    expect(cellId(7, 7)).toBe("H8");
  });

  it("is symmetric under all board reflections", () => {
    const at = (r: number, c: number): CellType => BOARD_LAYOUT[r * BOARD_SIZE + c];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        expect(at(r, c)).toBe(at(c, r));
        expect(at(r, c)).toBe(at(r, BOARD_SIZE - 1 - c));
        expect(at(r, c)).toBe(at(BOARD_SIZE - 1 - r, c));
      }
    }
  });

  it("round-trips cell ids and indices", () => {
    for (let i = 0; i < CELL_COUNT; i++) {
      const { row, col } = coordOf(i);
      expect(parseCellId(cellId(row, col))).toEqual({ row, col });
    }
    expect(() => parseCellId("P1")).toThrow();
    expect(() => cellId(15, 0)).toThrow();
  });
});

describe("tile set", () => {
  it("totals exactly 100 tiles with unique ids", () => {
    expect(totalTileCount(DRAFT_TILE_SET)).toBe(REQUIRED_TILE_TOTAL);
    const tiles = buildTileSet(DRAFT_TILE_SET);
    expect(tiles.length).toBe(100);
    expect(new Set(tiles.map((t) => t.id)).size).toBe(100);
  });
});

describe("bag and rack", () => {
  it("is deterministic for a given seed", () => {
    const a = createBag(DRAFT_TILE_SET, createRng(42));
    const b = createBag(DRAFT_TILE_SET, createRng(42));
    const c = createBag(DRAFT_TILE_SET, createRng(43));
    expect(a.tiles.map((t) => t.id)).toEqual(b.tiles.map((t) => t.id));
    expect(a.tiles.map((t) => t.id)).not.toEqual(c.tiles.map((t) => t.id));
  });

  it("draws and replenishes to 8 tiles", () => {
    const bag = createBag(DRAFT_TILE_SET, createRng(1));
    const first = drawTiles(bag, RACK_SIZE);
    expect(first.drawn.length).toBe(8);
    expect(first.bag.tiles.length).toBe(92);
    const refilled = replenishRack(first.bag, first.drawn.slice(0, 3));
    expect(refilled.rack.length).toBe(8);
    expect(refilled.bag.tiles.length).toBe(87);
  });

  it("exchanges only tiles owned by the rack and conserves tile count", () => {
    const rng = createRng(7);
    const bag = createBag(DRAFT_TILE_SET, rng);
    const { bag: rest, drawn } = drawTiles(bag, RACK_SIZE);
    expect(exchangeTiles(rest, drawn, ["NOT-MINE"], rng)).toBeNull();
    const result = exchangeTiles(rest, drawn, [drawn[0].id, drawn[1].id], rng);
    expect(result).not.toBeNull();
    expect(result!.rack.length).toBe(8);
    expect(result!.bag.tiles.length + result!.rack.length).toBe(100);
  });

  it("sorts numbers ascending before operators", () => {
    const tiles = buildTileSet(DRAFT_TILE_SET);
    const sorted = sortRack([tiles.at(-1)!, tiles[30], tiles[0], tiles[20]]);
    expect(sorted[0].kind).toBe("number");
    expect(sorted.at(-1)!.kind).toBe("blank");
  });
});

describe("board serialization", () => {
  it("round-trips a populated board", () => {
    const tiles = buildTileSet(DRAFT_TILE_SET);
    const cells = createEmptyBoard().slice();
    cells[7 * 15 + 7] = { tile: tiles[0] };
    cells[7 * 15 + 8] = { tile: tiles[60], assigned: "+" };
    const serialized = serializeBoard(cells);
    const restored = restoreBoard(JSON.parse(JSON.stringify(serialized)));
    expect(restored).toEqual(cells);
  });
});
