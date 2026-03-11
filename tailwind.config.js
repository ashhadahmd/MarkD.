/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#147A5C", // Dribbble design green (approx) 
        secondary: "#F3F4F6", // Gray background
        background: "#FFFFFF",
      }
    },
  },
  plugins: [],
}
