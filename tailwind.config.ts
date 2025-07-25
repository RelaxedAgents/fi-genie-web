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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#00D4FF",
          dark: "#00A8CC",
          light: "#33DDFF",
        },
        secondary: {
          DEFAULT: "#6B46F2",
          dark: "#5535C1",
          light: "#9945FF",
        },
        success: {
          DEFAULT: "#00FF88",
          dark: "#00CC6A",
          light: "#33FFA3",
        },
        warning: {
          DEFAULT: "#FF6B35",
          dark: "#CC552A",
          light: "#FF8A5C",
        },
        dark: {
          DEFAULT: "#0A0B0F",
          lighter: "#0D0E14",
          card: "#121318",
          border: "#1A1B23",
        },
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-1": ["72px", { lineHeight: "1.1", fontWeight: "800" }],
        "display-2": ["60px", { lineHeight: "1.2", fontWeight: "700" }],
        "heading-1": ["48px", { lineHeight: "1.2", fontWeight: "700" }],
        "heading-2": ["36px", { lineHeight: "1.3", fontWeight: "600" }],
        "heading-3": ["24px", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        small: ["14px", { lineHeight: "1.4", fontWeight: "500" }],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "slide-in": "slideIn 0.5s ease-out",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        "gradient-x": "gradient-x 15s ease infinite",
        "gradient-y": "gradient-y 15s ease infinite",
        "gradient-xy": "gradient-xy 15s ease infinite",
        sparkle: "sparkle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        "gradient-y": {
          "0%, 100%": {
            "background-size": "400% 400%",
            "background-position": "center top",
          },
          "50%": {
            "background-size": "400% 400%",
            "background-position": "center bottom",
          },
        },
        "gradient-xy": {
          "0%, 100%": {
            "background-size": "400% 400%",
            "background-position": "left center",
          },
          "25%": {
            "background-size": "400% 400%",
            "background-position": "right center",
          },
          "50%": {
            "background-size": "400% 400%",
            "background-position": "right bottom",
          },
          "75%": {
            "background-size": "400% 400%",
            "background-position": "left bottom",
          },
        },
        sparkle: {
          "0%, 100%": { opacity: "0", transform: "scale(0)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #00D4FF 0%, #6B46F2 100%)",
        "gradient-secondary": "linear-gradient(135deg, #6B46F2 0%, #9945FF 100%)",
        "gradient-success": "linear-gradient(135deg, #00FF88 0%, #00CC6A 100%)",
        "gradient-dark": "linear-gradient(180deg, #0A0B0F 0%, #0D0E14 100%)",
        "grid-pattern": `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
