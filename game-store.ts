import { create } from "zustand";
import {
  DRAFT_TILE_SET,
  RACK_SIZE,
  cellId,
  coordOf,
  createBag,
  createRng,
  drawTiles,
  shuffleRack,
  sortRack,
  type Tile,
} from "@/engine";

/**
 * Sandbox board store (Phase 1).
 * Holds ONLY presentation state. Rules, validation and scoring live in `@/engine`
 * and, for competitive play, on the server (Phase 2–4).
 *
 * Each board cell subscribes to `placed[index]` alone, so placing one tile
 * re-renders exactly one cell.
 */
interface GameStore {
  ready: boolean;
  seed: number;
  bagCount: number;
  rack: Tile[];
  /** Tiles placed this turn, keyed by flat cell index. */
  placed: Record<number, Tile>;
  selectedTileId: string | null;

  init: (seed?: number) => void;
  selectTile: (id: string | null) => void;
  placeTile: (tileId: string, cellIndex: number) => void;
  recallCell: (cellIndex: number) => void;
  recallAll: () => void;
  shuffle: () => void;
  sort: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ready: false,
  seed: 0,
  bagCount: 0,
  rack: [],
  placed: {},
  selectedTileId: null,

  init: (seed = Date.now() % 2147483647) => {
    const bag = createBag(DRAFT_TILE_SET, createRng(seed));
    const { bag: rest, drawn } = drawTiles(bag, RACK_SIZE);
    set({ ready: true, seed, bagCount: rest.tiles.length, rack: drawn, placed: {}, selectedTileId: null });
  },

  selectTile: (id) => set((s) => ({ selectedTileId: s.selectedTileId === id ? null : id })),

  placeTile: (tileId, cellIndex) => {
    const { rack, placed } = get();
    if (placed[cellIndex]) return;
    const tile = rack.find((t) => t.id === tileId);
    if (!tile) return;
    set({
      rack: rack.filter((t) => t.id !== tileId),
      placed: { ...placed, [cellIndex]: tile },
      selectedTileId: null,
    });
  },

  recallCell: (cellIndex) => {
    const { rack, placed } = get();
    const tile = placed[cellIndex];
    if (!tile) return;
    const next = { ...placed };
    delete next[cellIndex];
    set({ rack: [...rack, tile], placed: next });
  },

  recallAll: () => {
    const { rack, placed } = get();
    set({ rack: [...rack, ...Object.values(placed)], placed: {}, selectedTileId: null });
  },

  shuffle: () => set((s) => ({ rack: shuffleRack(s.rack, createRng(Math.floor(Math.random() * 2 ** 31))) })),
  sort: () => set((s) => ({ rack: sortRack(s.rack) })),
}));

/** Derived: human-readable list of pending placements for the side panel. */
export function describePlacements(placed: Record<number, Tile>): Array<{ cell: string; tile: Tile }> {
  return Object.entries(placed)
    .map(([index, tile]) => {
      const { row, col } = coordOf(Number(index));
      return { cell: cellId(row, col), tile };
    })
    .sort((a, b) => a.cell.localeCompare(b.cell, "en", { numeric: true }));
}
