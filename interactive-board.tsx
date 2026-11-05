"use client";

import { memo, useCallback, type DragEvent, type KeyboardEvent } from "react";
import { BOARD_LAYOUT, BOARD_SIZE, CELL_COUNT, type CellType } from "@/engine";
import { useGameStore } from "@/store/game-store";
import { CellView } from "./cell-view";

const InteractiveCell = memo(function InteractiveCell({ index, type }: { index: number; type: CellType }) {
  // Subscribing to a single slot means a placement re-renders exactly one cell.
  const tile = useGameStore((s) => s.placed[index]);

  const onActivate = useCallback(() => {
    const s = useGameStore.getState();
    if (s.placed[index]) s.recallCell(index);
    else if (s.selectedTileId) s.placeTile(s.selectedTileId, index);
  }, [index]);

  const onDrop = useCallback(
    (e: DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const tileId = e.dataTransfer.getData("text/plain");
      if (tileId) useGameStore.getState().placeTile(tileId, index);
    },
    [index],
  );

  return (
    <CellView index={index} type={type} tile={tile} pending={Boolean(tile)} interactive onActivate={onActivate} onDrop={onDrop} />
  );
});

const ARROWS: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

export function InteractiveBoard({ label }: { label: string }) {
  const armed = useGameStore((s) => s.selectedTileId !== null);

  const onKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const delta = ARROWS[e.key];
    const current = (e.target as HTMLElement).closest<HTMLElement>("[data-index]");
    if (!delta || !current) return;
    e.preventDefault();
    const index = Number(current.dataset.index);
    const row = Math.min(BOARD_SIZE - 1, Math.max(0, Math.floor(index / BOARD_SIZE) + delta[0]));
    const col = Math.min(BOARD_SIZE - 1, Math.max(0, (index % BOARD_SIZE) + delta[1]));
    e.currentTarget.querySelector<HTMLElement>(`[data-index="${row * BOARD_SIZE + col}"]`)?.focus();
  }, []);

  return (
    <div className="board-frame">
      <div
        className="board-grid"
        role="grid"
        aria-label={label}
        data-armed={armed || undefined}
        onKeyDown={onKeyDown}
      >
        {Array.from({ length: CELL_COUNT }, (_, index) => (
          <InteractiveCell key={index} index={index} type={BOARD_LAYOUT[index]} />
        ))}
      </div>
    </div>
  );
}
