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
        title: ["var(--font-prompt)", "sans-serif"],
        sans: ["var(--font-sarabun)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        paper: {
          bg: "#f7f4ee",
          card: "#fdfbf7",
          raised: "#efe9df",
          hover: "#e6dfd3",
          ink: "#1f1b16",
          secondary: "#5e554a",
          muted: "#7b7266",
          accent: "#1e3a8a",
          accentHover: "#172e6e",
          pass: "#15803d",
          passBg: "#f0f7f2",
          fail: "#b91c1c",
          failBg: "#fbf2f2",
          warn: "#9a5b13",
          warnBg: "#f9f3eb",
        },
      },
      transitionTimingFunction: {
        calm: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
