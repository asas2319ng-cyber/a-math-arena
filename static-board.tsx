"use client";

import { BOARD_LAYOUT, indexOf, type Tile } from "@/engine";
import { CellView } from "./cell-view";

export interface StaticPlacement {
  row: number;
  col: number;
  tile: Tile;
}

/** Read-only board for showcases, replays and spectators. */
export function StaticBoard({ placements = [], label }: { placements?: StaticPlacement[]; label: string }) {
  const byIndex = new Map(placements.map((p) => [indexOf(p.row, p.col), p.tile]));
  return (
    <div className="board-frame">
      <div className="board-grid" role="grid" aria-label={label} aria-readonly="true">
        {BOARD_LAYOUT.map((type, index) => (
          <CellView key={index} index={index} type={type} tile={byIndex.get(index)} />
        ))}
      </div>
    </div>
  );
}
