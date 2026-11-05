import { count, desc } from "drizzle-orm";
import { db } from "@/db";
import { matches, puzzles, tournaments, users } from "@/db/schema";

export interface PlatformStats {
  players: number;
  matches: number;
  tournaments: number;
  puzzles: number;
}

/** Real counts from the database. Returns null if the database cannot be queried. */
export async function getPlatformStats(): Promise<PlatformStats | null> {
  try {
    const [[p], [m], [tn], [pz]] = await Promise.all([
      db.select({ n: count() }).from(users),
      db.select({ n: count() }).from(matches),
      db.select({ n: count() }).from(tournaments),
      db.select({ n: count() }).from(puzzles),
    ]);
    return { players: p.n, matches: m.n, tournaments: tn.n, puzzles: pz.n };
  } catch (error) {
    console.error("[stats] query failed", error);
    return null;
  }
}

export interface TournamentSummary {
  id: string;
  name: string;
  format: string;
  status: string;
  startsAt: Date | null;
}

export async function getRecentTournaments(limit = 5): Promise<TournamentSummary[]> {
  try {
    return await db
      .select({
        id: tournaments.id,
        name: tournaments.name,
        format: tournaments.format,
        status: tournaments.status,
        startsAt: tournaments.startsAt,
      })
      .from(tournaments)
      .orderBy(desc(tournaments.startsAt))
      .limit(limit);
  } catch (error) {
    console.error("[tournaments] query failed", error);
    return [];
  }
}
