/**
 * Rating category thresholds — CONFIGURABLE.
 * ASSUMPTION: the thresholds are draft values (docs/ARCHITECTURE.md §7).
 * `minRating` is inclusive. Tiers must be sorted ascending.
 */
export interface RatingTier {
  readonly id: "beginner" | "intermediate" | "advanced" | "expert" | "master" | "grandmaster";
  readonly minRating: number;
}

export const RATING_TIERS: readonly RatingTier[] = [
  { id: "beginner", minRating: 0 },
  { id: "intermediate", minRating: 1000 },
  { id: "advanced", minRating: 1400 },
  { id: "expert", minRating: 1800 },
  { id: "master", minRating: 2200 },
  { id: "grandmaster", minRating: 2500 },
];

export function tierForRating(rating: number): RatingTier {
  let current = RATING_TIERS[0];
  for (const tier of RATING_TIERS) if (rating >= tier.minRating) current = tier;
  return current;
}
