import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#1A1A1A",
        surface:    "#242424",
        elevated:   "#2E2E2E",
        border:     "#3A3A3A",
        orange:     "#F36E22",
        "orange-dim": "#C45A18",
        "text-primary":   "#F0F0F0",
        "text-secondary": "#8A8A8A",
        "text-muted":     "#555555",
        green:   "#4CAF50",
        red:     "#E05252",
        blue:    "#4A9ECA",
      },
      fontFamily: {
        heading: ["var(--font-barlow)", "sans-serif"],
        body:    ["var(--font-inter)",  "sans-serif"],
        mono:    ["var(--font-mono)",   "monospace"],
      },
      keyframes: {
        "flip-in":  { from: { transform: "rotateY(-90deg)", opacity: "0" }, to: { transform: "rotateY(0deg)",  opacity: "1" } },
        "flip-out": { from: { transform: "rotateY(0deg)",   opacity: "1" }, to: { transform: "rotateY(90deg)", opacity: "0" } },
        "slide-up": { from: { transform: "translateY(12px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        "xp-toast": { "0%": { opacity: "0", transform: "translateY(0) scale(0.9)" }, "20%": { opacity: "1", transform: "translateY(-8px) scale(1)" }, "80%": { opacity: "1" }, "100%": { opacity: "0", transform: "translateY(-24px)" } },
        "progress-fill": { from: { width: "0%" }, to: { width: "var(--target-width)" } },
        "pulse-green": { "0%,100%": { boxShadow: "0 0 0 0 rgba(76,175,80,0)" }, "50%": { boxShadow: "0 0 0 8px rgba(76,175,80,0.3)" } },
      },
      animation: {
        "flip-in":  "flip-in 0.3s ease-out",
        "flip-out": "flip-out 0.3s ease-in",
        "slide-up": "slide-up 0.25s ease-out",
        "xp-toast": "xp-toast 2s ease-in-out forwards",
        "pulse-green": "pulse-green 0.6s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
