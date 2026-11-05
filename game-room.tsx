"use client";

import { useEffect } from "react";
import { InteractiveBoard } from "@/components/board/interactive-board";
import { CellLegend } from "@/components/board/cell-legend";
import { Rack } from "@/components/board/rack";
import { TileView } from "@/components/board/tile-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useT } from "@/i18n/provider";
import { describePlacements, useGameStore } from "@/store/game-store";

function PlayerCard({ name, note, score, active }: { name: string; note?: string; score: number; active?: boolean }) {
  const t = useT();
  return (
    <Card className={`flex items-center justify-between gap-4 p-4 ${active ? "border-gold-dim" : ""}`}>
      <div className="min-w-0">
        <p className="truncate font-display text-base font-bold text-ivory">{name}</p>
        {note ? <p className="mt-0.5 text-xs text-muted">{note}</p> : null}
      </div>
      <div className="text-right">
        <p className="text-[0.65rem] font-medium uppercase tracking-wider text-muted">{t("play.score")}</p>
        <p className="font-display text-2xl font-extrabold tabular-nums text-ivory">{score}</p>
      </div>
    </Card>
  );
}

function PendingList() {
  const t = useT();
  const placed = useGameStore((s) => s.placed);
  const items = describePlacements(placed);
  if (items.length === 0) return <p className="text-sm text-muted">{t("play.pending.empty")}</p>;
  return (
    <ul className="flex flex-wrap gap-2" aria-live="polite">
      {items.map(({ cell, tile }) => (
        <li key={cell} className="flex items-center gap-2 rounded-control border border-line bg-graphite px-2 py-1">
          <span className="font-mono text-xs text-muted">{cell}</span>
          <TileView tile={tile} variant="board" className="!h-7 !w-7 !text-base" />
        </li>
      ))}
    </ul>
  );
}

export function GameRoom() {
  const t = useT();
  const init = useGameStore((s) => s.init);
  const ready = useGameStore((s) => s.ready);
  const bagCount = useGameStore((s) => s.bagCount);
  const pendingCount = useGameStore((s) => Object.keys(s.placed).length);
  const recallAll = useGameStore((s) => s.recallAll);
  const shuffle = useGameStore((s) => s.shuffle);
  const sort = useGameStore((s) => s.sort);

  useEffect(() => {
    if (!useGameStore.getState().ready) init();
  }, [init]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{t("play.title")}</h1>
        <Badge tone="warning">Sandbox</Badge>
      </div>
      <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted">{t("play.sandbox")}</p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        {/* Main area: board + rack */}
        <section aria-label={t("play.title")} className="mx-auto w-full max-w-[46rem] lg:mx-0 lg:max-w-none">
          <div className="mx-auto w-full lg:max-w-[min(100%,calc(100vh-17rem))] lg:min-w-[28rem]">
            <InteractiveBoard label="A-MATH 15 by 15 board" />
          </div>

          <div className="mx-auto mt-5 w-full max-w-[46rem]">
            {ready ? <Rack label={t("play.rack")} /> : <div className="h-[5.5rem] rounded-card border border-line bg-graphite" />}
            <p className="mt-2 text-center text-xs text-muted">{t("play.hint")}</p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button variant="secondary" size="sm" onClick={recallAll} disabled={pendingCount === 0}>
                {t("play.recall")}
              </Button>
              <Button variant="secondary" size="sm" onClick={shuffle}>
                {t("play.shuffle")}
              </Button>
              <Button variant="secondary" size="sm" onClick={sort}>
                {t("play.sort")}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => init()}>
                {t("play.newRack")}
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <Button variant="ghost" size="sm" disabled title={t("phase", { n: 3 })}>
                {t("play.exchange")}
              </Button>
              <Button variant="ghost" size="sm" disabled title={t("phase", { n: 2 })}>
                {t("play.preview")}
              </Button>
              <Button variant="primary" size="sm" disabled title={t("phase", { n: 3 })}>
                {t("play.submit")}
              </Button>
              <Badge>{t("phase", { n: 2 })} – {t("phase", { n: 3 })}</Badge>
            </div>
          </div>
        </section>

        {/* Side panel */}
        <aside className="flex flex-col gap-4" aria-label="Match panel">
          <PlayerCard name={t("play.opponent")} note={t("play.opponent.empty")} score={0} />
          <PlayerCard name={t("play.you")} score={0} active />

          <Card className="p-4">
            <h2 className="text-sm font-bold text-ivory">{t("play.clock")}</h2>
            <p className="mt-1 text-sm text-muted">{t("play.clock.none")}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-ivory">{t("play.pending")}</h2>
              <span className="text-xs tabular-nums text-muted">
                {t("play.bag")}: {bagCount}
              </span>
            </div>
            <div className="mt-3">
              <PendingList />
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-sm font-bold text-ivory">{t("play.history")}</h2>
            <p className="mt-1 text-sm text-muted">{t("play.history.empty")}</p>
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 text-sm font-bold text-ivory">{t("play.legend")}</h2>
            <CellLegend countLabel={t("board.legend.count")} />
          </Card>
        </aside>
      </div>
    </div>
  );
}
