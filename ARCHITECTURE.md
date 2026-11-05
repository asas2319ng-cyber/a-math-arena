# A-MATH ARENA — Architecture and Phase 1 Delivery

Status labels: **PLANNED · IN PROGRESS · IMPLEMENTED · TESTED · PRODUCTION READY**

## 0. Codebase inspection (expansion prompt, Part 9)

The project started from a bare Next.js 16 + Drizzle + PostgreSQL template. No game engine, auth, match, tournament or replay code existed, so there was nothing to duplicate. The expansion systems (Championship Circuit, Clubs, Coach, …) are **PLANNED** and will be built on top of the tables and engine below. No Roblox/Luau components are used anywhere.

**Stack decision.** The master prompt recommends NestJS + Prisma. The environment already provides Next.js (App Router) + Drizzle ORM + PostgreSQL, so we keep them rather than running two backends. The game engine is a framework-free TypeScript module (`src/engine`), so it can be lifted into a NestJS service or a separate realtime server later without changes. Socket.IO and Redis (Phase 4) need a long-lived process; they will run as a separate `realtime` service that imports `src/engine`.

## 1. System architecture

```
 Browser / PWA ──HTTP──▶ Next.js (App Router: pages, route handlers)
      │                         │ Drizzle ORM
      └──WebSocket (Phase 4)──▶ Realtime service (Socket.IO) ──▶ PostgreSQL
                                   │  imports src/engine          (source of truth)
                                   └──▶ Redis (queues, presence, live match state)
```

Layers (dependencies point downward only):

| Layer | Location | Rule |
|---|---|---|
| UI | `src/app`, `src/components` | Presentation only. Never computes scores. |
| State | `src/store` | Zustand, presentation state only. |
| i18n | `src/i18n` | Interface language only; rules never read it. |
| Server services | `src/server` | Queries and competitive logic (server-authoritative). |
| Game engine | `src/engine` | Pure TS: no React, DB or network. |
| Data | `src/db` | Drizzle schema and client. |

## 2. Database schema (IMPLEMENTED, `src/db/schema.ts`)

19 tables, pushed with `npx drizzle-kit push`:

- **Identity:** `users`, `user_profiles` (country, locale, cosmetics, privacy).
- **Rules and seasons:** `rule_versions` (append-only once approved), `tile_inventories`, `seasons`.
- **Ratings:** `ratings` (rating, deviation = uncertainty, peak; `season_id` null = all-time).
- **Matches:** `matches` (rule version, seed, time control, room code), `match_players`, `match_moves` (unique `(match_id, ply)` blocks replayed or duplicate moves), `match_replays` (versioned, checksummed, immutable).
- **Tournaments:** `tournaments` (stores `rule_config` verbatim), `tournament_participants`, `tournament_matches`.
- **Training:** `puzzles`, `puzzle_attempts`.
- **Progression and social:** `achievements`, `user_achievements`, `friendships`, `notifications`.
- **Governance:** `audit_logs` (append-only admin actions).

Indexes exist for leaderboards (`ratings(season_id, rating)`), match lookup, tournament rounds and notifications. Expansion tables (teams, clubs, disputes, fair-play cases, …) are added per phase through migrations; none are faked now.

## 3. Folder structure

```
src/
  app/            routes: /, /play, /dashboard, /design, /api/health, manifest, icon
  components/
    ui/           Button, Card, Badge, Stat
    layout/       Navbar, Footer, Logo, LocaleSwitch
    board/        TileView, CellView, InteractiveBoard, StaticBoard, Rack, CellLegend
    game/         GameRoom
    landing/      Hero, sections
  engine/         framework-free game engine (+ __tests__)
    config/       board-layout.ts, tile-set.ts   ← centralized, versioned rule data
  i18n/           core, server, provider, dictionaries/{en,th}
  store/          game-store.ts
  server/         stats.ts (future: matchmaking, rating, tournaments, analysis)
  config/         rating-tiers.ts, roadmap.ts
  db/             index.ts, schema.ts
docs/ARCHITECTURE.md
```

Planned additions: `src/engine/{parser,evaluator,validator,scoring}.ts` (Phase 2), `src/server/{auth,matches,rating,tournaments}` (4–7), `realtime/` (4).

## 4. Engine interfaces

Implemented now (**TESTED**, `src/engine/__tests__/foundation.test.ts`): `cellId/parseCellId/indexOf/coordOf`, `createEmptyBoard`, `serializeBoard/restoreBoard` (versioned `v:1`), `buildTileSet`, `createBag`, `drawTiles`, `replenishRack`, `exchangeTiles` (rejects tiles not in the rack), `sortRack`, `shuffleRack`, `reorderRack`, seedable `createRng`.

Planned contracts for Phase 2:

```ts
validatePlacement(board, placements, { firstMove }): PlacementResult      // line, contiguity, centre, adjacency
parseLines(board, placements): ParsedLine[]                              // structured tiles, never display text
evaluate(tokens): Result<bigint | number, EvalError>                     // no eval(); BODMAS; exact integers; no ÷0
findEquations(board, placements): Equation[]                             // every new H/V equation, deduplicated
scoreMove(board, placements, rules): ScoreBreakdown                      // P cells for new tiles, E cells, +40 bingo
```

## 5. Multiplayer protocol (PLANNED, Phase 4)

Server-authoritative. Clients send intents; the server validates and broadcasts results.

Client → server: `queue:join {mode, region}`, `queue:leave`, `room:create {timeControl}`, `room:join {code}`, `match:move {matchId, ply, placements[{tileId,row,col,assigned?}]}`, `match:exchange {matchId, ply, tileIds}`, `match:pass`, `match:resign`, `match:resume {matchId}`, `match:spectate {matchId}`.

Server → client: `queue:matched`, `match:state` (full snapshot for reconnect; opponent rack hidden), `match:moved {ply, move, score, clocks}`, `match:clock {serverTime, remainingMs}`, `match:ended {result, ratingDelta}`, `match:error {code}`.

Safeguards: authenticated socket, `ply` must equal the server's next ply (replay protection), tile IDs checked against the server-held rack, rate limiting per socket, zod validation of every payload, clock computed only on the server, ratings changed only inside a DB transaction from server-derived results.

## 6. Design system (IMPLEMENTED)

Tokens live in `src/app/globals.css` (`@theme`). See `/design` for the rendered reference.

- **Palette:** Midnight `#101827`, Graphite `#171C27`, Slate `#273244`, Gold `#D6AD5D`, Ivory `#F3F0E8`, Muted `#9BA5B5`, Success `#36B37E`, Warning `#E8A94B`, Error `#D95C63`.
- **Type:** Manrope (display), Inter (UI), IBM Plex Sans Thai (Thai), tabular figures everywhere numbers matter.
- **Board:** container-query sizing (`cqw`) so cells and tiles scale from 320px to desktop. Premium squares carry text labels (2P/3P/2E/3E/★), so colour is not the only cue.
- **Tiles:** ivory face, ink digits, amber operators, green equals, dashed blank, base points bottom-right.
- **Motion:** ≤150 ms; respects `prefers-reduced-motion`.
- **Accessibility:** skip link, visible gold focus ring, `role=grid` board with arrow-key navigation, descriptive `aria-label` on every cell and tile.

## 7. Unresolved rule specifications (assumptions)

| # | Ambiguity | Current assumption | How it is configurable |
|---|---|---|---|
| 1 | Exact premium-square coordinates | 8-fold-symmetric layout meeting the required counts (3E 8, 2E 16, 3P 24, 2P 36, centre 1). **Not asserted to be official.** | `src/engine/config/board-layout.ts`, id `amath-layout-draft-1`, stored per match |
| 2 | Tile counts and base scores | Draft 100-tile set | `src/engine/config/tile-set.ts`, id `amath-tileset-draft-1` |
| 3 | Dual-operator and blank rules | Dual tile: player picks one operator when placing. Blank: any value when placing. | Phase 2 `RuleSet` |
| 4 | Rating thresholds | Beginner 0, Intermediate 1000, Advanced 1400, Expert 1800, Master 2200, Grandmaster 2500 | `src/config/rating-tiers.ts` |
| 5 | Rating algorithm | Glicko-style rating + deviation columns reserved; algorithm chosen in Phase 5 | `ratings.deviation` |
| 6 | End-game deductions, draws, timeout rules | Unspecified | Phase 2/4 `RuleSet`, versioned in `rule_versions` |
| 7 | Operator scoring per tile | Draft values | Same tile-set config |

Changing any of these means publishing a **new** id/version. Stored matches keep the version they were played under.

## 8. Roadmap

| Phase | Scope | Status |
|---|---|---|
| 1 | Design system, landing, dashboard, game-room UI, board and tile components, engine foundation, DB schema, i18n, manifest | **IMPLEMENTED** (engine foundation **TESTED**) |
| 2 | Parser, evaluator, validator, cross-equation checker, scoring, tests | PLANNED |
| 3 | Playable local matches, drag-and-drop, preview, turn flow | PLANNED |
| 4 | Auth, rooms, Socket.IO, server clock, reconnection | PLANNED |
| 5 | Rating, matchmaking, leaderboards, profiles | PLANNED |
| 6 | AI levels, best-move engine, replay, analysis | PLANNED |
| 7 | Tournaments, puzzles, achievements, social, wider i18n | PLANNED |
| 8 | Security audit, monitoring, service worker, deployment, docs | PLANNED |
| A–G | Expansion: championship circuit, Swiss, rulebook versioning, openings, coach, clubs, titles, replay studio, fair-play, world ranking, broadcast, teams | PLANNED (after Phase 8 foundations they depend on) |

## 9. Phase 1 quality report

**System overview.** Brand foundation, visual system and a usable board sandbox.

**User-facing features (IMPLEMENTED):** landing page with live DB counts, dashboard layout, game room (click or drag tiles onto the board, recall, shuffle, sort, new rack), design reference, English/Thai switch, installable manifest.

**Backend:** `GET /api/health`; server components read counts through `src/server/stats.ts`.

**Database changes:** all 19 tables above.

**Security:** no accounts or competitive writes exist yet. Locale cookie is non-sensitive. No secrets in client code.

**Testing:** `npx vitest run` (board counts, symmetry, id round-trip, tile total = 100, deterministic bag, exchange safety, serialization). Then `npx next typegen && npx tsc --noEmit && npm run build`.

**Known limitations**
- Sandbox placement is free-form: no validation, equations or scoring until Phase 2. Submit, preview and exchange are disabled and labelled.
- Dashboard personal data is empty because there are no accounts. Guest state is shown honestly.
- Board layout and tile set are drafts (§7).
- Cell legend names and design page copy are English-only; the main interface strings are translated.
- No service worker yet (offline support is Phase 8).
- Fonts load from Google Fonts at runtime and fall back to system fonts if blocked.

**Running locally**
```
npm install
npx drizzle-kit push        # apply schema (DATABASE_URL in .env)
npm run dev                 # http://localhost:3000
npx vitest run              # engine tests
```
