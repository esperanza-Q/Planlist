/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "body-base": "var(--body-base-font-family)",
        "single-line-body-base": "var(--single-line-body-base-font-family)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
