import { BOARD_SIZE, type CellType } from "../types";

/**
 * CENTRALIZED BOARD LAYOUT CONFIGURATION
 * ---------------------------------------
 * ASSUMPTION (unresolved rule specification — see docs/ARCHITECTURE.md §7):
 * The official A-MATH premium-square coordinates were not supplied with the
 * specification. This layout satisfies the REQUIRED quantities
 * (3E: 8, 2E: 16, 3P: 24, 2P: 36, Center: 1) and is 8-fold symmetric.
 * It is versioned so an official layout can replace it without breaking
 * stored matches (matches record `BOARD_LAYOUT_ID`).
 *
 * Coordinates are (row, col), zero-indexed, 0..14. Each seed below is expanded
 * into its symmetry orbit (reflections across both axes and the diagonals).
 * Nothing is random: the result is fully deterministic.
 */
export const BOARD_LAYOUT_ID = "amath-layout-draft-1";

type PremiumType = Exclude<CellType, "normal" | "center">;

/** Fundamental-domain seeds (0 <= row <= col <= 7). */
const ORBIT_SEEDS: Readonly<Record<PremiumType, ReadonlyArray<readonly [number, number]>>> = {
  // 2 seeds × 4 cells = 8
  "3E": [
    [0, 0],
    [0, 7],
  ],
  // 4 diagonal seeds × 4 cells = 16
  "2E": [
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4],
  ],
  // 8 + 8 + 4 + 4 = 24
  "3P": [
    [1, 5],
    [2, 6],
    [5, 5],
    [3, 7],
  ],
  // 8 + 8 + 8 + 8 + 4 = 36
  "2P": [
    [0, 3],
    [0, 5],
    [2, 4],
    [4, 6],
    [6, 6],
  ],
};

export const CENTER: { readonly row: number; readonly col: number } = {
  row: (BOARD_SIZE - 1) / 2,
  col: (BOARD_SIZE - 1) / 2,
};

/** All 8 symmetric images of a coordinate on the square board. */
function orbit(row: number, col: number): Array<[number, number]> {
  const m = BOARD_SIZE - 1;
  const pts: Array<[number, number]> = [
    [row, col],
    [col, row],
    [row, m - col],
    [m - col, row],
    [m - row, col],
    [col, m - row],
    [m - row, m - col],
    [m - col, m - row],
  ];
  const seen = new Set<string>();
  return pts.filter(([r, c]) => {
    const k = `${r},${c}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function buildLayout(): readonly CellType[] {
  const cells: CellType[] = new Array(BOARD_SIZE * BOARD_SIZE).fill("normal");
  (Object.keys(ORBIT_SEEDS) as PremiumType[]).forEach((type) => {
    for (const [r, c] of ORBIT_SEEDS[type]) {
      for (const [or, oc] of orbit(r, c)) {
        const idx = or * BOARD_SIZE + oc;
        if (cells[idx] !== "normal") {
          throw new Error(`Board layout conflict at (${or},${oc})`);
        }
        cells[idx] = type;
      }
    }
  });
  cells[CENTER.row * BOARD_SIZE + CENTER.col] = "center";
  return Object.freeze(cells);
}

/** Flat, row-major array of 225 cell types. */
export const BOARD_LAYOUT: readonly CellType[] = buildLayout();

export const EXPECTED_SPECIAL_COUNTS: Readonly<Record<Exclude<CellType, "normal">, number>> = {
  "3E": 8,
  "2E": 16,
  "3P": 24,
  "2P": 36,
  center: 1,
};

/** Human-readable metadata. Multipliers are consumed by the scoring engine (Phase 2). */
export const CELL_META: Readonly<
  Record<CellType, { label: string; short: string; multiplier: number; scope: "piece" | "equation" | "none" }>
> = {
  normal: { label: "Standard cell", short: "", multiplier: 1, scope: "none" },
  "2P": { label: "Double Piece Score", short: "2P", multiplier: 2, scope: "piece" },
  "3P": { label: "Triple Piece Score", short: "3P", multiplier: 3, scope: "piece" },
  "2E": { label: "Double Equation Score", short: "2E", multiplier: 2, scope: "equation" },
  "3E": { label: "Triple Equation Score", short: "3E", multiplier: 3, scope: "equation" },
  center: { label: "Start (centre)", short: "★", multiplier: 1, scope: "none" },
};
