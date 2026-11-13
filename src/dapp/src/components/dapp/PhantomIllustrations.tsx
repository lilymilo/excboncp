import React from "react";

type SvgProps = { className?: string };

/** Static Botanical x Phantom emblem rendered inside authenticated wallet cards. */
export function BotanicalSpiritMark({ className = "" }: SvgProps) {
  return (
    <svg viewBox="0 0 72 72" fill="none" className={className} aria-hidden="true">
      <rect x="10" y="10" width="52" height="52" rx="18" fill="#1D211E" stroke="#39423C" strokeWidth="1.75" />
      <path
        d="M36 20C26.5 24 23 33 26.5 43.5C32.5 43.5 39 40 43.5 33.5C46 29.5 45 23 36 20Z"
        fill="#23865A"
        fillOpacity="0.28"
        stroke="#72C99A"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M27 47.5C31.5 42 36.5 36.5 43 29" stroke="#72C99A" strokeWidth="2" strokeLinecap="round" />
      <path d="M52 19L53.5 22.5L57 24L53.5 25.5L52 29L50.5 25.5L47 24L50.5 22.5L52 19Z" fill="#AA9AF5" />
    </svg>
  );
}

/** Kept for symbol compatibility across existing dashboard imports. */
export function ForestSpirit({ className = "" }: SvgProps) {
  return <BotanicalSpiritMark className={className} />;
}

/** Phantom-style empty token/credit state icon in lavender on obsidian surfaces. */
export function CoinsPlusIcon({ className = "" }: SvgProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <circle cx="25" cy="25" r="13" stroke="#AA9AF5" strokeWidth="3.2" strokeOpacity="0.82" />
      <circle cx="38" cy="38" r="13.5" fill="#151816" stroke="#AA9AF5" strokeWidth="3.2" />
      <path d="M38 32.5V43.5M32.5 38H43.5" stroke="#AA9AF5" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Empty attestation/collectibles mark inspired by the Phantom collectibles empty view. */
export function CollectiblesEmptyIcon({ className = "" }: SvgProps) {
  return (
    <svg viewBox="0 0 88 72" fill="none" className={className} aria-hidden="true">
      <rect x="18" y="22" width="26" height="32" rx="6" transform="rotate(-10 18 22)" fill="#1D211E" stroke="#AA9AF5" strokeWidth="2.5" />
      <rect x="23" y="28" width="16" height="14" rx="2.5" transform="rotate(-10 23 28)" fill="#AA9AF5" fillOpacity="0.28" />
      <path d="M50 18L52 12L57 14L55 24C55 26 53 27 51 26C49 25 49 22 50 18Z" fill="#72C99A" />
      <path d="M54 31L68 38L55 47L54 31Z" fill="#ED7770" />
    </svg>
  );
}

/** Clean attestation certificate graphic for verification and audit empty states. */
export function SealsIllustration({ className = "" }: SvgProps) {
  return (
    <svg viewBox="0 0 112 84" fill="none" className={className} aria-hidden="true">
      <rect x="16" y="14" width="52" height="56" rx="10" fill="#1D211E" stroke="#39423C" strokeWidth="2" />
      <path d="M27 29H57M27 39H51M27 49H44" stroke="#8B948D" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="74" cy="48" r="18" fill="#151816" stroke="#72C99A" strokeWidth="2.4" />
      <path d="M67 48L72 53L82 42" stroke="#72C99A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
