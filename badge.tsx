import type { ReactNode } from "react";

type Tone = "neutral" | "gold" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "border-line bg-slate/50 text-muted",
  gold: "border-gold-dim bg-gold/10 text-gold",
  success: "border-success/40 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/10 text-warning",
  danger: "border-danger/40 bg-danger/10 text-danger",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
