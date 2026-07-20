/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0D652D",
          light: "#148A3F",
          dark: "#08441E",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#174EA6",
          light: "#2563EB",
          dark: "#103978",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#A50E0E",
          light: "#DC2626",
          dark: "#7A0A0A",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#E37400",
          foreground: "#FFFFFF",
        },
        amber: {
          DEFAULT: "#E37400",
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#E37400",
          600: "#D96500",
          700: "#B45300",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#111827",
        },
      },
    },
  },
  plugins: [],
};
