/**
 * Honest implementation status, shown on the landing page and in docs.
 * Labels follow the specification: PLANNED, IN PROGRESS, IMPLEMENTED, TESTED.
 */
export type ImplementationStatus = "planned" | "in-progress" | "implemented" | "tested";

export interface RoadmapItem {
  name: string;
  status: ImplementationStatus;
  phase: number;
}

export const ROADMAP: readonly RoadmapItem[] = [
  { name: "Design system and design tokens", status: "implemented", phase: 1 },
  { name: "Landing page, dashboard and game-room layouts", status: "implemented", phase: 1 },
  { name: "Interactive 15 × 15 board, tiles and rack UI", status: "implemented", phase: 1 },
  { name: "Board layout, tile set, bag and rack engine", status: "tested", phase: 1 },
  { name: "Core database schema (19 tables)", status: "implemented", phase: 1 },
  { name: "English / Thai interface", status: "implemented", phase: 1 },
  { name: "Installable web app manifest", status: "implemented", phase: 1 },
  { name: "Equation parser, evaluator, validator and scoring", status: "planned", phase: 2 },
  { name: "Playable matches with turn management", status: "planned", phase: 3 },
  { name: "Accounts, private rooms, real-time play and server clock", status: "planned", phase: 4 },
  { name: "Ratings, matchmaking, leaderboards and profiles", status: "planned", phase: 5 },
  { name: "AI opponents, best-move engine and post-game analysis", status: "planned", phase: 6 },
  { name: "Tournaments, puzzles, achievements and social features", status: "planned", phase: 7 },
  { name: "Security audit, monitoring and deployment", status: "planned", phase: 8 },
];
