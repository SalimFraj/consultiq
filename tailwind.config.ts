import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#080a0d",
          900: "#111418",
          850: "#171b21",
          800: "#20262e",
          700: "#303945"
        }
      },
      boxShadow: {
        panel: "0 18px 55px rgba(0, 0, 0, 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
