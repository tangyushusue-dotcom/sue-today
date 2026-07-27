import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
      },
      colors: {
        cream: "#FFF8F3",
        blush: "#FBEAE4",
        rose: "#F4A6A0",
        terracotta: "#E7A08C",
        sage: "#A9C5A0",
        sky: "#A7C4D4",
        peach: "#F6C8A8",
        ink: "#5B5048",
        muted: "#A89C92",
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(180,140,120,0.25)",
        card: "0 6px 24px -10px rgba(180,140,120,0.30)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp .7s cubic-bezier(.22,.61,.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
