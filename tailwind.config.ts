import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* BRUTALIST PALETTE */
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        
        background: "var(--bg-primary)",
        surface: "var(--bg-surface)",
        accent: "var(--bg-accent)",
        hover: "var(--bg-hover)",
        
        border: "var(--border)",
        "border-light": "var(--border-light)",
        
        /* ACCENT COLORS */
        brutal: {
          red: "#FF2D00",
          blue: "#0000FF",
          green: "#00AA00",
          yellow: "#FFAA00",
          black: "#000000",
          white: "#FFFFFF",
        },
      },
      fontFamily: {
        mono: ["Space Mono", "IBM Plex Mono", "monospace"],
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
        serif: ["Instrument Serif", "Georgia", "serif"],
      },
      fontSize: {
        "xxs": "10px",
        "xs": "11px",
        "sm": "13px",
        "base": "15px",
        "lg": "18px",
        "xl": "24px",
        "2xl": "32px",
        "3xl": "48px",
        "4xl": "64px",
        "5xl": "96px",
      },
      letterSpacing: {
        tighter: "-0.03em",
        tight: "-0.02em",
        normal: "0",
        wide: "0.05em",
        wider: "0.1em",
        widest: "0.15em",
      },
      borderWidth: {
        DEFAULT: "2px",
        "0": "0",
        "2": "2px",
        "3": "3px",
        "4": "4px",
      },
      borderRadius: {
        none: "0",
        sm: "0",
        DEFAULT: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
        "3xl": "0",
        full: "0",
      },
      boxShadow: {
        none: "none",
      },
      spacing: {
        "0": "0",
        "px": "1px",
        "0.5": "2px",
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
        "20": "80px",
        "24": "96px",
      },
      animation: {
        "blink": "blink 1s step-end infinite",
        "marquee": "marquee 20s linear infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
