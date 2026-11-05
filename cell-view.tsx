"use client";

import { memo, type DragEventHandler, type MouseEventHandler } from "react";
import { motion } from "framer-motion";
import { cellId, coordOf, CELL_META, type CellType, type Tile } from "@/engine";
import { TileView, tileAriaLabel } from "./tile-view";

interface CellViewProps {
  index: number;
  type: CellType;
  tile?: Tile;
  /** Tile placed this turn but not yet committed. */
  pending?: boolean;
  interactive?: boolean;
  onActivate?: MouseEventHandler<HTMLButtonElement>;
  onDrop?: DragEventHandler<HTMLButtonElement>;
}

/**
 * A single board square. Memoised: a cell only re-renders when its own
 * tile / pending state changes.
 */
export const CellView = memo(function CellView({
  index,
  type,
  tile,
  pending = false,
  interactive = false,
  onActivate,
  onDrop,
}: CellViewProps) {
  const { row, col } = coordOf(index);
  const id = cellId(row, col);
  const meta = CELL_META[type];
  const label = `${id}, ${meta.label}, ${tile ? tileAriaLabel(tile) + (pending ? ", pending" : "") : "empty"}`;

  const content = tile ? (
    <motion.div
      className="h-full w-full"
      initial={pending ? { scale: 0.82, opacity: 0.4 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.14, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <TileView tile={tile} variant="board" pending={pending} />
    </motion.div>
  ) : meta.short ? (
    <span className="cell-label" aria-hidden="true">
      {meta.short}
    </span>
  ) : null;

  if (!interactive) {
    return (
      <div
        role="gridcell"
        aria-label={label}
        className="cell"
        data-type={type}
        data-filled={tile ? "true" : undefined}
        data-readonly="true"
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      role="gridcell"
      aria-label={label}
      className="cell"
      data-type={type}
      data-index={index}
      data-filled={tile ? "true" : undefined}
      tabIndex={type === "center" ? 0 : -1}
      onClick={onActivate}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {content}
    </button>
  );
});
