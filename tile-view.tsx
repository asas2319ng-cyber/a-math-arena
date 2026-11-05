import { memo, type HTMLAttributes } from "react";
import type { Tile } from "@/engine";

type TileFace = Pick<Tile, "kind" | "label" | "points">;

interface TileViewProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  tile: TileFace;
  variant?: "board" | "rack" | "large";
  selected?: boolean;
  pending?: boolean;
}

/** Visual tile. Purely presentational: the engine owns all values and scores. */
export const TileView = memo(function TileView({
  tile,
  variant = "rack",
  selected = false,
  pending = false,
  className = "",
  ...rest
}: TileViewProps) {
  const variantClass = variant === "board" ? "tile-board" : variant === "large" ? "tile-lg" : "tile-rack";
  return (
    <div
      className={`tile ${variantClass} ${className}`}
      data-kind={tile.kind}
      data-selected={selected || undefined}
      data-pending={pending || undefined}
      {...rest}
    >
      {tile.kind === "blank" ? (
        <span
          aria-hidden="true"
          className="block h-[42%] w-[42%] rounded-[0.12em] border-[0.06em] border-dashed border-current opacity-50"
        />
      ) : (
        <span className="tile-face">{tile.label}</span>
      )}
      {tile.kind !== "blank" ? <span className="tile-pts">{tile.points}</span> : null}
    </div>
  );
});

export function tileAriaLabel(tile: TileFace): string {
  if (tile.kind === "blank") return "Blank tile";
  if (tile.kind === "equals") return `Equals tile, ${tile.points} points`;
  return `${tile.label} tile, ${tile.points} ${tile.points === 1 ? "point" : "points"}`;
}
