export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="14" fill="#101827" />
      <rect x="6" y="6" width="52" height="52" rx="10" fill="none" stroke="#D6AD5D" strokeWidth="2.5" />
      <rect x="14" y="21" width="36" height="6" rx="2" fill="#F3F0E8" />
      <rect x="14" y="37" width="36" height="6" rx="2" fill="#D6AD5D" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-[0.95rem] font-extrabold tracking-[0.12em] text-ivory">
        A-MATH <span className="text-gold">ARENA</span>
      </span>
    </span>
  );
}
