/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        header: "#8CCFD4",
        purple: "#7A63C7",
        green: "#93B34B",
        orange: "#E08B23",
        pink: "#E7A0B8",
        shellbg: "#F4F6F8"
      }
    }
  },
  plugins: []
};