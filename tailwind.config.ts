import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0F172A",      // dark navy
        secondary: "#2563EB",    // blue accent
        accent: "#7C3AED",       // optional purple (brand feel)
        success: "#10B981",
        bg: "#F8FAFC",
        card: "#FFFFFF",
        border: "#E2E8F0",
      },
      fontFamily: {
        sans: ["Inter", "Plus Jakarta Sans", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
