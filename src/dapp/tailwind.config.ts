import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        sans: ["var(--font-ui)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        ui: ["var(--font-ui)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-telemetry)", "SFMono-Regular", "ui-monospace", "monospace"],
        telemetry: ["var(--font-telemetry)", "SFMono-Regular", "ui-monospace", "monospace"],
        rounded: ["var(--font-rounded)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      colors: {
        page: "#0B100C",
        surface: {
          DEFAULT: "#101610",
          raised: "#171C16",
          soft: "#1D231B",
        },
        border: {
          DEFAULT: "#252D22",
          subtle: "#1B211A",
        },
        lime: {
          DEFAULT: "#AEDA2D",
          hover: "#BCEB3B",
          muted: "#64753E",
        },
        text: {
          primary: "#F0F2EC",
          secondary: "#A8AFA2",
          muted: "#747D70",
          onlime: "#11160B",
        },
        chart: {
          neutral: "#D9DED4",
        },
        ph: {
          bg: "#09090B",
          surface: "#1B1B1D",
          elevated: "#29292D",
          text: "#F5F5F7",
          mute: "#77777F",
          lilac: "#AA9AF5",
          verified: "#10B981",
          warning: "#F59E0B",
          blocked: "#EF4444",
          card: "#1C1C1C",
          raised: "#2A2A2A",
          line: "#262626",
          green: "#21E56F",
          red: "#FF5C66",
          orange: "#FF7243",
          cream: "#FFFDD8",
        },
        xb: {
          bg: "#0B0D0C",
          surface: "#101412",
          raised: "#161B18",
          soft: "#1C231F",
          line: "#242C27",
          "line-soft": "#1A211D",
          text: "#EDF2EE",
          mute: "#8A968F",
          dim: "#5E6A63",
          forest: "#3DD68C",
          "forest-dim": "#2A9A64",
          "forest-ink": "#07130C",
          tech: "#82B7D9",
          verified: "#3DD68C",
          warning: "#E8B33C",
          blocked: "#EF5D6B",
          pending: "#82B7D9",
          dispute: "#E8863C",
        },
      },
      borderRadius: {
        card: "1rem",
        panel: "0.875rem",
        pill: "999px",
      },
      maxWidth: {
        shell: "78rem",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
        "phantom-micro": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "phantom-smooth": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      transitionDuration: {
        micro: "120ms",
        component: "200ms",
        drawer: "300ms",
      },
      boxShadow: {
        "lime-glow": "0 0 60px -15px rgba(174, 218, 45, 0.25)",
        "halo-glow": "0 0 140px -20px rgba(100, 117, 62, 0.35)",
        panel: "0 12px 32px -8px rgba(0, 0, 0, 0.6)",
        "phantom-soft": "0 2px 8px rgba(0, 0, 0, 0.32)",
        "phantom-card": "0 4px 12px rgba(0, 0, 0, 0.48)",
        "forest-glow": "0 0 48px -12px rgba(61, 214, 140, 0.35)",
        "terminal": "0 18px 48px -24px rgba(0, 0, 0, 0.85)",
      },
    },
  },
  plugins: [],
};

export default config;
