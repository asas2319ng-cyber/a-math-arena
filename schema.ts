import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */
export const userRole = pgEnum("user_role", ["player", "moderator", "admin"]);
export const ruleStatus = pgEnum("rule_status", ["draft", "approved", "retired"]);
export const matchMode = pgEnum("match_mode", ["ranked", "casual", "private", "practice", "tournament"]);
export const matchStatus = pgEnum("match_status", ["waiting", "active", "finished", "abandoned"]);
export const matchResult = pgEnum("match_result", ["win", "loss", "draw"]);
export const moveType = pgEnum("move_type", ["play", "exchange", "pass", "resign", "timeout"]);
export const tournamentFormat = pgEnum("tournament_format", ["swiss", "single_elimination", "double_elimination"]);
export const tournamentStatus = pgEnum("tournament_status", ["draft", "registration", "running", "finished", "cancelled"]);
export const participantStatus = pgEnum("participant_status", ["registered", "active", "withdrawn", "disqualified"]);
export const puzzleKind = pgEnum("puzzle_kind", ["daily", "weekly", "standard"]);
export const puzzleDifficulty = pgEnum("puzzle_difficulty", ["easy", "medium", "hard", "expert"]);
export const friendStatus = pgEnum("friend_status", ["pending", "accepted", "blocked"]);
export const achievementRarity = pgEnum("achievement_rarity", ["common", "uncommon", "rare", "epic", "legendary"]);
export const seasonStatus = pgEnum("season_status", ["upcoming", "active", "ended"]);

/* ------------------------------------------------------------------ */
/* Identity                                                            */
/* ------------------------------------------------------------------ */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    username: varchar("username", { length: 32 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRole("role").notNull().default("player"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("users_email_uq").on(t.email), uniqueIndex("users_username_uq").on(t.username)],
);

export const userProfiles = pgTable(
  "user_profiles",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: varchar("display_name", { length: 64 }),
    avatarUrl: text("avatar_url"),
    /** ISO 3166-1 alpha-2. Voluntary. */
    countryCode: varchar("country_code", { length: 2 }),
    region: varchar("region", { length: 32 }),
    locale: varchar("locale", { length: 8 }).notNull().default("en"),
    isJunior: boolean("is_junior").notNull().default(false),
    bio: text("bio"),
    /** Cosmetic only: frames, board themes, tile skins. Never read by the game engine. */
    cosmetics: jsonb("cosmetics").$type<Record<string, string>>().notNull().default({}),
    privacy: jsonb("privacy").$type<Record<string, boolean>>().notNull().default({}),
  },
  (t) => [index("user_profiles_country_idx").on(t.countryCode)],
);

/* ------------------------------------------------------------------ */
/* Rules, seasons                                                      */
/* ------------------------------------------------------------------ */
/** Every match references the exact rule version it was played under. Rows are append-only once approved. */
export const ruleVersions = pgTable(
  "rule_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    version: varchar("version", { length: 32 }).notNull(),
    status: ruleStatus("status").notNull().default("draft"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }),
    boardLayoutId: varchar("board_layout_id", { length: 64 }).notNull(),
    tileSetId: varchar("tile_set_id", { length: 64 }).notNull(),
    scoring: jsonb("scoring").$type<Record<string, unknown>>().notNull().default({}),
    changelog: text("changelog"),
    createdBy: uuid("created_by").references(() => users.id),
    approvedBy: uuid("approved_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("rule_versions_version_uq").on(t.version)],
);

/** Tile distribution per rule version (configurable, versioned). */
export const tileInventories = pgTable(
  "tile_inventories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ruleVersionId: uuid("rule_version_id")
      .notNull()
      .references(() => ruleVersions.id, { onDelete: "restrict" }),
    key: varchar("key", { length: 32 }).notNull(),
    kind: varchar("kind", { length: 16 }).notNull(),
    label: varchar("label", { length: 8 }).notNull(),
    value: integer("value"),
    points: integer("points").notNull(),
    count: integer("count").notNull(),
  },
  (t) => [uniqueIndex("tile_inventories_rule_key_uq").on(t.ruleVersionId, t.key)],
);

export const seasons = pgTable(
  "seasons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 48 }).notNull(),
    name: varchar("name", { length: 96 }).notNull(),
    status: seasonStatus("status").notNull().default("upcoming"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  },
  (t) => [uniqueIndex("seasons_slug_uq").on(t.slug)],
);

/* ------------------------------------------------------------------ */
/* Ratings                                                             */
/* ------------------------------------------------------------------ */
export const ratings = pgTable(
  "ratings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** null = all-time rating; otherwise rating scoped to a season. */
    seasonId: uuid("season_id").references(() => seasons.id),
    rating: integer("rating").notNull().default(1200),
    /** Rating deviation (uncertainty). High value = provisional. */
    deviation: integer("deviation").notNull().default(350),
    peak: integer("peak").notNull().default(1200),
    gamesPlayed: integer("games_played").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("ratings_user_idx").on(t.userId),
    index("ratings_leaderboard_idx").on(t.seasonId, t.rating),
  ],
);

/* ------------------------------------------------------------------ */
/* Tournaments (declared before matches that reference them)           */
/* ------------------------------------------------------------------ */
export const tournaments = pgTable(
  "tournaments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 64 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    format: tournamentFormat("format").notNull(),
    status: tournamentStatus("status").notNull().default("draft"),
    seasonId: uuid("season_id").references(() => seasons.id),
    ruleVersionId: uuid("rule_version_id").references(() => ruleVersions.id),
    /** Exact rule configuration used (rounds, tie-breaks, clocks, eligibility). Stored verbatim. */
    ruleConfig: jsonb("rule_config").$type<Record<string, unknown>>().notNull().default({}),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("tournaments_slug_uq").on(t.slug), index("tournaments_status_idx").on(t.status, t.startsAt)],
);

export const tournamentParticipants = pgTable(
  "tournament_participants",
  {
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    seed: integer("seed"),
    status: participantStatus("status").notNull().default("registered"),
    /** Match points ×2 (so half-points stay integral). */
    pointsX2: integer("points_x2").notNull().default(0),
    tiebreaks: jsonb("tiebreaks").$type<Record<string, number>>().notNull().default({}),
    registeredAt: timestamp("registered_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.tournamentId, t.userId] })],
);

/* ------------------------------------------------------------------ */
/* Matches                                                             */
/* ------------------------------------------------------------------ */
export const matches = pgTable(
  "matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ruleVersionId: uuid("rule_version_id").references(() => ruleVersions.id),
    mode: matchMode("mode").notNull(),
    status: matchStatus("status").notNull().default("waiting"),
    /** { totalMs, perTurnMs, incrementMs } — enforced by the server clock. */
    timeControl: jsonb("time_control").$type<Record<string, number>>().notNull().default({}),
    /** Bag seed — makes the tile draw deterministic and replayable. */
    seed: varchar("seed", { length: 64 }).notNull(),
    roomCode: varchar("room_code", { length: 8 }),
    isPublic: boolean("is_public").notNull().default(false),
    seasonId: uuid("season_id").references(() => seasons.id),
    tournamentId: uuid("tournament_id").references(() => tournaments.id),
    winnerId: uuid("winner_id").references(() => users.id),
    endReason: varchar("end_reason", { length: 32 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("matches_room_code_uq").on(t.roomCode),
    index("matches_status_idx").on(t.status, t.isPublic),
    index("matches_finished_idx").on(t.finishedAt),
    index("matches_tournament_idx").on(t.tournamentId),
  ],
);

export const matchPlayers = pgTable(
  "match_players",
  {
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    seat: integer("seat").notNull(),
    ratingBefore: integer("rating_before"),
    ratingAfter: integer("rating_after"),
    finalScore: integer("final_score"),
    result: matchResult("result"),
  },
  (t) => [primaryKey({ columns: [t.matchId, t.userId] }), index("match_players_user_idx").on(t.userId)],
);

/** One row per ply. Server-written only; (match_id, ply) is unique which blocks duplicate/replayed moves. */
export const matchMoves = pgTable(
  "match_moves",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    ply: integer("ply").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    type: moveType("type").notNull(),
    placements: jsonb("placements").$type<unknown[]>().notNull().default([]),
    equations: jsonb("equations").$type<unknown[]>().notNull().default([]),
    score: integer("score").notNull().default(0),
    scoreBreakdown: jsonb("score_breakdown").$type<Record<string, unknown>>().notNull().default({}),
    clockRemainingMs: integer("clock_remaining_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("match_moves_ply_uq").on(t.matchId, t.ply)],
);

/** Immutable, versioned replay record. */
export const matchReplays = pgTable("match_replays", {
  matchId: uuid("match_id")
    .primaryKey()
    .references(() => matches.id, { onDelete: "cascade" }),
  formatVersion: integer("format_version").notNull().default(1),
  data: jsonb("data").$type<Record<string, unknown>>().notNull(),
  checksum: varchar("checksum", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tournamentMatches = pgTable(
  "tournament_matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    round: integer("round").notNull(),
    board: integer("board").notNull(),
    player1Id: uuid("player1_id").references(() => users.id),
    player2Id: uuid("player2_id").references(() => users.id),
    matchId: uuid("match_id").references(() => matches.id),
    isBye: boolean("is_bye").notNull().default(false),
    result: matchResult("result"),
  },
  (t) => [index("tournament_matches_round_idx").on(t.tournamentId, t.round)],
);

/* ------------------------------------------------------------------ */
/* Puzzles                                                             */
/* ------------------------------------------------------------------ */
export const puzzles = pgTable(
  "puzzles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 64 }).notNull(),
    title: varchar("title", { length: 128 }).notNull(),
    kind: puzzleKind("kind").notNull().default("standard"),
    difficulty: puzzleDifficulty("difficulty").notNull(),
    boardState: jsonb("board_state").$type<Record<string, unknown>>().notNull(),
    rack: jsonb("rack").$type<unknown[]>().notNull(),
    targetScore: integer("target_score").notNull(),
    maxMoves: integer("max_moves").notNull().default(1),
    publishedOn: date("published_on"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("puzzles_slug_uq").on(t.slug), index("puzzles_published_idx").on(t.kind, t.publishedOn)],
);

export const puzzleAttempts = pgTable(
  "puzzle_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    puzzleId: uuid("puzzle_id")
      .notNull()
      .references(() => puzzles.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    score: integer("score").notNull().default(0),
    movesUsed: integer("moves_used").notNull().default(0),
    hintsUsed: integer("hints_used").notNull().default(0),
    solved: boolean("solved").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("puzzle_attempts_user_idx").on(t.userId, t.createdAt), index("puzzle_attempts_puzzle_idx").on(t.puzzleId)],
);

/* ------------------------------------------------------------------ */
/* Achievements, social, notifications, audit                          */
/* ------------------------------------------------------------------ */
export const achievements = pgTable("achievements", {
  /** Unique, stable identifier, e.g. "first_win". */
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 96 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 32 }).notNull(),
  rarity: achievementRarity("rarity").notNull().default("common"),
  /** Machine-readable unlock condition evaluated server-side. */
  condition: jsonb("condition").$type<Record<string, unknown>>().notNull().default({}),
});

export const userAchievements = pgTable(
  "user_achievements",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievementId: varchar("achievement_id", { length: 64 })
      .notNull()
      .references(() => achievements.id),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull().defaultNow(),
    displayed: boolean("displayed").notNull().default(true),
  },
  (t) => [primaryKey({ columns: [t.userId, t.achievementId] })],
);

export const friendships = pgTable(
  "friendships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requesterId: uuid("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addresseeId: uuid("addressee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: friendStatus("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("friendships_pair_uq").on(t.requesterId, t.addresseeId), index("friendships_addressee_idx").on(t.addresseeId)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 48 }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notifications_user_idx").on(t.userId, t.readAt)],
);

/** Append-only log of every administrative action (rule changes, bans, tournament edits). */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => users.id),
    action: varchar("action", { length: 64 }).notNull(),
    entity: varchar("entity", { length: 48 }).notNull(),
    entityId: varchar("entity_id", { length: 64 }),
    before: jsonb("before").$type<Record<string, unknown>>(),
    after: jsonb("after").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_logs_entity_idx").on(t.entity, t.entityId), index("audit_logs_actor_idx").on(t.actorId, t.createdAt)],
);
