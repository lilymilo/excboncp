// Self-hosted dashboard typography imported strictly within the authenticated dashboard shell.
// Keeps public landing typography in app/layout.tsx untouched.
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/sora/800.css";
import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-sans/700.css";
import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/500.css";
import "@fontsource/geist-mono/600.css";

export const DASHBOARD_FONT_STACKS = {
  display: '"Sora", "Geist Sans", system-ui, sans-serif',
  ui: '"Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  code: '"Geist Mono", ui-monospace, SFMono-Regular, monospace',
} as const;

