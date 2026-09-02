import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        livv: {
          black: "var(--livv-bg)",
          dark: "var(--livv-bg)",
          surface: "rgb(var(--livv-surface) / <alpha-value>)",
          border: "rgb(var(--livv-border) / <alpha-value>)",
          muted: "rgb(var(--livv-muted) / <alpha-value>)",
          accent: "rgb(var(--livv-accent) / <alpha-value>)",
          "accent-soft": "rgb(var(--livv-accent-soft) / <alpha-value>)",
          glow: "rgb(var(--livv-accent) / <alpha-value>)",
          energy: "rgb(var(--livv-accent-soft) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "livv-gradient":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgb(var(--livv-accent) / 0.22), transparent)",
        "livv-glow":
          "radial-gradient(circle at 50% 0%, rgb(var(--livv-accent) / 0.16), transparent 60%)",
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
