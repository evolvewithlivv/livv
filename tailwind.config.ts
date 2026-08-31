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
          surface: "#121214",
          border: "#222226",
          muted: "#8a8a92",
          accent: "#FF6A1A",
          "accent-soft": "#FFB088",
          glow: "#FF8A3D",
          energy: "#FFC46B",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-outfit)",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      backgroundImage: {
        "livv-gradient":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 106, 26, 0.22), transparent)",
        "livv-glow":
          "radial-gradient(circle at 50% 0%, rgba(255, 106, 26, 0.16), transparent 60%)",
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
