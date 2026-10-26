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
        primary: {
          DEFAULT: "#087443",
          deep: "#075B38",
          light: "#0fa360",
          soft: "#e8f6f0",
        },
        navy: {
          DEFAULT: "#103B70",
          deep: "#08284F",
          dark: "#051A33",
          light: "#1a5196",
          soft: "#EAF3FB",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#F5F9F8",
          alt: "#EAF3FB",
          border: "#DCE7E8",
        },
        brandText: {
          primary: "#142A43",
          secondary: "#5D6B7A",
          muted: "#8896A6",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      boxShadow: {
        card: "0 2px 12px -2px rgba(16, 59, 112, 0.08)",
        "card-hover": "0 10px 25px -4px rgba(16, 59, 112, 0.12)",
        drawer: "-4px 0 24px rgba(8, 40, 79, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
