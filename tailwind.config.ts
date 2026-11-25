import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ground: "var(--ground)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--ink-soft)",
        accent: "var(--accent)",
      },
      borderRadius: { card: "var(--radius-card)", pill: "999px" },
      boxShadow: { soft: "var(--shadow)" },
      fontFamily: { sans: ["var(--font-body)", "Arial", "sans-serif"], display: ["var(--font-display)", "Georgia", "serif"] },
    },
  },
  plugins: [],
};

export default config;
