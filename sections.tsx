import { CellLegend } from "@/components/board/cell-legend";
import { Badge } from "@/components/ui/badge";
import { Card, SectionHeading, Stat } from "@/components/ui/card";
import { RATING_TIERS } from "@/config/rating-tiers";
import { ROADMAP, type ImplementationStatus } from "@/config/roadmap";
import { LOCALES, formatNumber } from "@/i18n/core";
import { getT } from "@/i18n/server";
import { getPlatformStats, getRecentTournaments } from "@/server/stats";

const sectionClass = "mx-auto max-w-7xl px-4 pt-20 sm:px-6";

export async function StatsStrip() {
  const { t, locale } = await getT();
  const stats = await getPlatformStats();
  return (
    <section aria-labelledby="stats-title" className="border-b border-line bg-graphite">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="stats-title" className="text-sm font-bold uppercase tracking-wider text-ivory">
            {t("stats.title")}
          </h2>
          <p className="text-xs text-muted">{t("stats.source")}</p>
        </div>
        {stats ? (
          <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <Stat label={t("stats.players")} value={formatNumber(stats.players, locale)} />
            <Stat label={t("stats.matches")} value={formatNumber(stats.matches, locale)} />
            <Stat label={t("stats.tournaments")} value={formatNumber(stats.tournaments, locale)} />
            <Stat label={t("stats.puzzles")} value={formatNumber(stats.puzzles, locale)} />
          </dl>
        ) : (
          <p className="text-sm text-warning">{t("stats.unavailable")}</p>
        )}
      </div>
    </section>
  );
}

export async function HowToPlay() {
  const { t } = await getT();
  const steps = [1, 2, 3, 4] as const;
  return (
    <section aria-labelledby="how-title" className={sectionClass}>
      <SectionHeading id="how-title" eyebrow="01" title={t("how.title")} />
      <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((n) => (
          <li key={n}>
            <Card className="h-full">
              <span className="font-display text-sm font-extrabold tabular-nums text-gold">0{n}</span>
              <h3 className="mt-3 text-lg font-bold text-ivory">{t(`how.${n}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(`how.${n}.body`)}</p>
            </Card>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-muted">{t("how.note")}</p>
    </section>
  );
}

export async function BoardSection() {
  const { t } = await getT();
  return (
    <section aria-labelledby="board-title" className={sectionClass}>
      <div className="grid gap-8 lg:grid-cols-2">
        <SectionHeading id="board-title" eyebrow="02" title={t("board.title")}>
          {t("board.body")}
        </SectionHeading>
        <Card>
          <CellLegend countLabel={t("board.legend.count")} />
        </Card>
      </div>
    </section>
  );
}

export async function RankedSection() {
  const { t, locale } = await getT();
  return (
    <section aria-labelledby="ranked-title" className={sectionClass}>
      <SectionHeading id="ranked-title" eyebrow="03" title={t("ranked.title")}>
        {t("ranked.body")}
      </SectionHeading>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {RATING_TIERS.map((tier) => (
          <li key={tier.id} className="rounded-card border border-line bg-raised p-4">
            <p className="font-display text-base font-bold text-ivory">{t(`ranked.tier.${tier.id}`)}</p>
            <p className="mt-1 text-xs tabular-nums text-muted">
              {t("ranked.threshold", { rating: formatNumber(tier.minRating, locale) })}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export async function TournamentsSection() {
  const { t, locale } = await getT();
  const list = await getRecentTournaments(4);
  return (
    <section aria-labelledby="tournaments-title" className={sectionClass}>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <SectionHeading id="tournaments-title" eyebrow="04" title={t("tournaments.title")}>
            {t("tournaments.body")}
          </SectionHeading>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Swiss", "Single elimination", "Double elimination"].map((f) => (
              <Badge key={f}>{f}</Badge>
            ))}
            <Badge tone="gold">{t("phase", { n: 7 })}</Badge>
          </div>
        </div>
        <Card>
          <h3 className="mb-3 text-sm font-bold text-ivory">{t("tournaments.upcoming")}</h3>
          {list.length === 0 ? (
            <p className="text-sm text-muted">{t("tournaments.empty")}</p>
          ) : (
            <ul className="divide-y divide-line">
              {list.map((tn) => (
                <li key={tn.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="font-medium text-ivory">{tn.name}</span>
                  <span className="text-xs text-muted">
                    {tn.startsAt ? new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", { dateStyle: "medium" }).format(tn.startsAt) : tn.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </section>
  );
}

export async function CommunitySection() {
  const { t } = await getT();
  return (
    <section aria-labelledby="community-title" className={sectionClass}>
      <SectionHeading id="community-title" eyebrow="05" title={t("community.title")}>
        {t("community.body")}
      </SectionHeading>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">{t("community.languages")}:</span>
        {LOCALES.map((l) => (
          <Badge key={l.code} tone="gold">
            <span lang={l.code}>{l.label}</span>
          </Badge>
        ))}
      </div>
    </section>
  );
}

const STATUS_TONE: Record<ImplementationStatus, "neutral" | "gold" | "success" | "warning"> = {
  planned: "neutral",
  "in-progress": "warning",
  implemented: "gold",
  tested: "success",
};

export async function StatusSection() {
  const { t } = await getT();
  return (
    <section aria-labelledby="status-title" className={sectionClass}>
      <SectionHeading id="status-title" eyebrow="06" title={t("status.title")} />
      <Card className="mt-8 p-0">
        <ul className="divide-y divide-line">
          {ROADMAP.map((item) => (
            <li key={item.name} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <span className="text-sm text-ivory">{item.name}</span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-muted">{t("phase", { n: item.phase })}</span>
                <Badge tone={STATUS_TONE[item.status]}>{item.status.replace("-", " ")}</Badge>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
