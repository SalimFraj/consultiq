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
          950: "#07111f",
          900: "#0b1628",
          850: "#101d31",
          800: "#142337",
          700: "#20324a"
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
