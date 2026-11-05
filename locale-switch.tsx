"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, LOCALE_COOKIE, type Locale } from "@/i18n/core";
import { useLocale } from "@/i18n/provider";

export function LocaleSwitch() {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(code: Locale) {
    if (code === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div role="group" aria-label={t("nav.language")} className="flex rounded-control border border-line p-0.5">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => choose(l.code)}
          aria-pressed={l.code === locale}
          disabled={pending}
          lang={l.code}
          className={`h-8 rounded-[0.4rem] px-2.5 text-xs font-semibold transition-colors ${
            l.code === locale ? "bg-gold text-midnight" : "text-muted hover:text-ivory"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
