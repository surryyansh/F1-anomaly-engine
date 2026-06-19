import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Add this line!
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["var(--font-orbitron)", "sans-serif"],
        mono: ["var(--font-tech-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;