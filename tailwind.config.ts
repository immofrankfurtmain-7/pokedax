import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
      colors: {
        brand: {
          red:    "#EE1515",
          gold:   "#FACC15",
          gold2:  "#f59e0b",
          cyan:   "#00E5FF",
          green:  "#22C55E",
          purple: "#A855F7",
        },
        bg: {
          DEFAULT: "#0A0A0A",
          2: "#111111",
          3: "#181818",
          4: "#1f1f1f",
        },
        border: {
          subtle:  "rgba(255,255,255,0.07)",
          DEFAULT: "rgba(255,255,255,0.12)",
          strong:  "rgba(255,255,255,0.20)",
        },
        type: {
          fire:      "#F97316",
          water:     "#3B82F6",
          grass:     "#22C55E",
          lightning: "#FACC15",
          psychic:   "#A855F7",
          fighting:  "#EF4444",
          darkness:  "#6B7280",
          metal:     "#9CA3AF",
          dragon:    "#7C3AED",
          fairy:     "#EC4899",
        },
      },
      borderRadius: {
        sm:  "6px",
        DEFAULT: "8px",
        md:  "10px",
        lg:  "12px",
        xl:  "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      spacing: {
        "18": "72px",
        "22": "88px",
      },
      animation: {
        "fade-up":     "fadeUp 0.4s ease forwards",
        "pulse-slow":  "pulse 3s ease-in-out infinite",
        "float":       "float 4s ease-in-out infinite",
        "float-delay": "float 4s ease-in-out infinite 2s",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "none" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%":     { transform: "translateY(-12px)" },
        },
      },
      backgroundImage: {
        "hero-radial": "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(238,21,21,0.08), transparent)",
        "red-glow":    "radial-gradient(circle, rgba(238,21,21,0.15), transparent 70%)",
        "gold-glow":   "radial-gradient(circle, rgba(250,204,21,0.12), transparent 70%)",
      },
      boxShadow: {
        "red-sm":  "0 0 16px rgba(238,21,21,0.3)",
        "red-md":  "0 0 32px rgba(238,21,21,0.4)",
        "gold-sm": "0 0 16px rgba(250,204,21,0.3)",
        "card":    "0 4px 24px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
