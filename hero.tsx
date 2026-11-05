import Link from "next/link";
import { StaticBoard, type StaticPlacement } from "@/components/board/static-board";
import { buttonClasses } from "@/components/ui/button";
import { DRAFT_TILE_SET, buildTileSet } from "@/engine";
import { getT } from "@/i18n/server";

/** Illustrative position: 12 + 8 = 20 (row H) crossing 0 + 5 = 5 (column K) through the shared 0. */
function showcasePlacements(): StaticPlacement[] {
  const pool = buildTileSet(DRAFT_TILE_SET);
  const used = new Set<string>();
  const take = (defKey: string) => {
    const tile = pool.find((t) => t.defKey === defKey && !used.has(t.id));
    if (!tile) throw new Error(`Showcase tile unavailable: ${defKey}`);
    used.add(tile.id);
    return tile;
  };
  const row = 7;
  const horizontal = ["n:1", "n:2", "op:+", "n:8", "eq", "n:2", "n:0"];
  const placements: StaticPlacement[] = horizontal.map((key, i) => ({ row, col: 4 + i, tile: take(key) }));
  const sharedZero = placements[6];
  const vertical = ["op:+", "n:5", "eq", "n:5"];
  vertical.forEach((key, i) => placements.push({ row: row + 1 + i, col: sharedZero.col, tile: take(key) }));
  return placements;
}

export async function Hero() {
  const { t } = await getT();
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_minmax(0,34rem)] lg:py-20">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-gold">{t("hero.eyebrow")}</p>
          <h1 className="text-4xl font-extrabold leading-[1.08] text-ivory sm:text-5xl lg:text-6xl">{t("hero.title")}</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{t("hero.body")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/play" className={buttonClasses("primary", "lg")}>
              {t("hero.cta.play")}
            </Link>
            <Link href="/dashboard" className={buttonClasses("secondary", "lg")}>
              {t("hero.cta.dashboard")}
            </Link>
          </div>
          <p className="mt-8 font-display text-sm font-bold tracking-wide text-ivory/80">{t("brand.tagline")}</p>
        </div>
        <figure>
          <StaticBoard placements={showcasePlacements()} label="Illustrative A-MATH position" />
          <figcaption className="mt-3 text-xs text-muted">{t("hero.caption")}</figcaption>
        </figure>
      </div>
    </section>
  );
}
