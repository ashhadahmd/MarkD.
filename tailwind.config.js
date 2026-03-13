/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#147A5C",
        secondary: "#F3F4F6",
        background: "#FFFFFF",
      }
    },
  },
  plugins: [],
}
