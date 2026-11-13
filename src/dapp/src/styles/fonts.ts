// Self-hosted dashboard typography imported strictly within the authenticated dashboard shell.
// Keeps public landing typography in app/layout.tsx untouched.
import "@fontsource-variable/atkinson-hyperlegible-next";
import "@fontsource-variable/source-serif-4";
import "@fontsource/atkinson-hyperlegible-mono/400.css";
import "@fontsource/atkinson-hyperlegible-mono/500.css";
import "@fontsource/atkinson-hyperlegible-mono/700.css";

export const DASHBOARD_FONT_STACKS = {
  display: '"Source Serif 4 Variable", Georgia, serif',
  ui: '"Atkinson Hyperlegible Next Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  code: '"Atkinson Hyperlegible Mono", ui-monospace, SFMono-Regular, monospace',
} as const;
