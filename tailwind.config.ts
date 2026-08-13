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
          black: "#050505",
          dark: "#0a0a0b",
          surface: "#111113",
          border: "#1c1c1f",
          muted: "#8b8b93",
          accent: "#7c5cff",
          "accent-soft": "#a78bfa",
          glow: "#6366f1",
          energy: "#22d3ee",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "livv-gradient":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124, 92, 255, 0.25), transparent)",
        "livv-glow":
          "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15), transparent 60%)",
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
