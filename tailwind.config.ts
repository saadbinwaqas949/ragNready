import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "var(--color-cream)",
        paper: "var(--color-paper)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        brand: "var(--color-blue)",
        lavender: "var(--color-lavender)",
        seafoam: "var(--color-seafoam)",
        sand: "var(--color-sand)",
        sky: "var(--color-sky)",
        sunshine: "var(--color-sunshine)",
        blush: "var(--color-blush)",
      },
      borderRadius: { card: "var(--radius-card)", pill: "var(--radius-pill)" },
      boxShadow: { soft: "var(--shadow-soft)" },
      fontFamily: { sans: ["var(--font-body)", "Arial", "sans-serif"], display: ["var(--font-display)", "Georgia", "serif"] },
    },
  },
  plugins: [],
};

export default config;
