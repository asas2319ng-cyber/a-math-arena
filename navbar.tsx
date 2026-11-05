import Link from "next/link";
import { getT } from "@/i18n/server";
import { LocaleSwitch } from "./locale-switch";
import { Wordmark } from "./logo";

export async function Navbar() {
  const { t } = await getT();
  const links = [
    { href: "/play", label: t("nav.play") },
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/design", label: t("nav.design") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-midnight/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="A-MATH ARENA" className="shrink-0">
          <Wordmark />
        </Link>
        <nav aria-label="Primary" className="order-3 flex w-full items-center gap-1 sm:order-none sm:w-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-control px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-slate/60 hover:text-ivory"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <LocaleSwitch />
      </div>
    </header>
  );
}
