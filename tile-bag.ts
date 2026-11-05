import { shuffled } from "./rng";
import { RACK_SIZE, type Rng, type Tile, type TileSetConfig } from "./types";

/** Expand a tile-set configuration into concrete tiles with unique, stable IDs. */
export function buildTileSet(config: TileSetConfig): Tile[] {
  const tiles: Tile[] = [];
  let serial = 1;
  for (const def of config.definitions) {
    for (let i = 0; i < def.count; i++) {
      tiles.push({
        id: `T${String(serial++).padStart(3, "0")}`,
        defKey: def.key,
        kind: def.kind,
        label: def.label,
        value: def.value,
        operators: def.operators,
        points: def.points,
      });
    }
  }
  return tiles;
}

export interface TileBag {
  readonly tiles: readonly Tile[];
}

export function createBag(config: TileSetConfig, rng: Rng): TileBag {
  return { tiles: shuffled(buildTileSet(config), rng) };
}

/** Draw up to `count` tiles from the top of the bag. Returns the new bag and drawn tiles. */
export function drawTiles(bag: TileBag, count: number): { bag: TileBag; drawn: Tile[] } {
  const n = Math.max(0, Math.min(count, bag.tiles.length));
  return { bag: { tiles: bag.tiles.slice(n) }, drawn: bag.tiles.slice(0, n) };
}

/** Refill a rack up to RACK_SIZE. */
export function replenishRack(bag: TileBag, rack: readonly Tile[]): { bag: TileBag; rack: Tile[] } {
  const { bag: nextBag, drawn } = drawTiles(bag, RACK_SIZE - rack.length);
  return { bag: nextBag, rack: [...rack, ...drawn] };
}

/**
 * Exchange tiles: return chosen tiles to the bag, draw replacements, reshuffle bag.
 * Fails (returns null) if the bag cannot supply that many tiles.
 */
export function exchangeTiles(
  bag: TileBag,
  rack: readonly Tile[],
  tileIds: readonly string[],
  rng: Rng,
): { bag: TileBag; rack: Tile[] } | null {
  const ids = new Set(tileIds);
  if (ids.size !== tileIds.length || ids.size === 0) return null;
  const returning = rack.filter((t) => ids.has(t.id));
  if (returning.length !== ids.size) return null; // unauthorized tile
  if (bag.tiles.length < returning.length) return null;
  const { bag: afterDraw, drawn } = drawTiles(bag, returning.length);
  const nextBag: TileBag = { tiles: shuffled([...afterDraw.tiles, ...returning], rng) };
  return { bag: nextBag, rack: [...rack.filter((t) => !ids.has(t.id)), ...drawn] };
}

/* ---------------- Rack ordering ---------------- */

const KIND_ORDER: Record<Tile["kind"], number> = {
  number: 0,
  operator: 1,
  "dual-operator": 2,
  equals: 3,
  blank: 4,
};

export function sortRack(rack: readonly Tile[]): Tile[] {
  return rack.slice().sort((a, b) => {
    if (a.kind !== b.kind) return KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
    if (a.kind === "number") return (a.value ?? 0) - (b.value ?? 0) || a.id.localeCompare(b.id);
    return a.label.localeCompare(b.label) || a.id.localeCompare(b.id);
  });
}

export function shuffleRack(rack: readonly Tile[], rng: Rng): Tile[] {
  return shuffled(rack, rng);
}

export function reorderRack(rack: readonly Tile[], from: number, to: number): Tile[] {
  if (from < 0 || from >= rack.length || to < 0 || to >= rack.length) return rack.slice();
  const out = rack.slice();
  const [moved] = out.splice(from, 1);
  out.splice(to, 0, moved);
  return out;
}
