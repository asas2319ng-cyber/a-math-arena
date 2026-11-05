import { getT } from "@/i18n/server";
import { LogoMark } from "./logo";

export async function Footer() {
  const { t } = await getT();
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-10 sm:px-6">
        <div className="flex items-center gap-3">
          <LogoMark size={24} />
          <p className="font-display text-sm font-bold text-ivory">{t("brand.tagline")}</p>
        </div>
        <p className="text-xs text-muted">{t("footer.rights")}</p>
        <p className="text-xs text-muted">{t("footer.rules")}</p>
      </div>
    </footer>
  );
}
