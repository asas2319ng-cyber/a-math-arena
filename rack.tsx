"use client";

import { RACK_SIZE } from "@/engine";
import { useGameStore } from "@/store/game-store";
import { TileView, tileAriaLabel } from "./tile-view";

export function Rack({ label }: { label: string }) {
  const rack = useGameStore((s) => s.rack);
  const selectedTileId = useGameStore((s) => s.selectedTileId);
  const selectTile = useGameStore((s) => s.selectTile);
  const emptySlots = Math.max(0, RACK_SIZE - rack.length);

  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center justify-center gap-1.5 rounded-card border border-line bg-graphite p-3 sm:gap-2.5 sm:p-4"
    >
      {rack.map((tile) => (
        <button
          key={tile.id}
          type="button"
          draggable
          aria-pressed={selectedTileId === tile.id}
          aria-label={tileAriaLabel(tile)}
          onClick={() => selectTile(tile.id)}
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", tile.id);
            e.dataTransfer.effectAllowed = "move";
          }}
          className="cursor-grab rounded-[0.35rem] transition-transform duration-150 active:cursor-grabbing"
        >
          <TileView tile={tile} selected={selectedTileId === tile.id} />
        </button>
      ))}
      {Array.from({ length: emptySlots }, (_, i) => (
        <span
          key={`empty-${i}`}
          aria-hidden="true"
          className="tile-rack rounded-[0.35rem] border border-dashed border-line"
        />
      ))}
    </div>
  );
}
