import { BOARD_LAYOUT, CELL_META, type CellType } from "@/engine";

const ORDER: CellType[] = ["3E", "2E", "3P", "2P", "center"];

export function CellSwatch({ type, size = "2.25rem" }: { type: CellType; size?: string }) {
  return (
    <span
      className="cell shrink-0"
      data-type={type}
      data-readonly="true"
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: "0.8rem", borderRadius: "0.4rem" }}
    >
      {CELL_META[type].short}
    </span>
  );
}

/** Legend with live counts derived from the single board-layout configuration. */
export function CellLegend({ countLabel }: { countLabel: string }) {
  const counts = new Map<CellType, number>();
  for (const type of BOARD_LAYOUT) counts.set(type, (counts.get(type) ?? 0) + 1);

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {ORDER.map((type) => (
        <li key={type} className="flex items-center gap-3">
          <CellSwatch type={type} />
          <div>
            <p className="text-sm font-semibold text-ivory">{CELL_META[type].label}</p>
            <p className="text-xs tabular-nums text-muted">
              {counts.get(type)} {countLabel}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
