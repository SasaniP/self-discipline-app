/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'Courier Prime'", "monospace"],
        display: ["'Bebas Neue'", "cursive"],
        body: ["'Courier Prime'", "monospace"],
      },
      colors: {
        void: "#080B0F",
        surface: "#0E1318",
        panel: "#141B22",
        border: "#1E2A34",
        accent: "#FF2D2D",
        warn: "#FF8C00",
        ok: "#00E676",
        muted: "#3D5060",
        text: "#C8D8E4",
        dim: "#6B8699",
      },
      animation: {
        "pulse-red": "pulseRed 1.5s ease-in-out infinite",
        "shake": "shake 0.4s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "flash": "flash 0.8s ease-in-out infinite",
      },
      keyframes: {
        pulseRed: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,45,45,0)" },
          "50%": { boxShadow: "0 0 20px 4px rgba(255,45,45,0.5)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        slideIn: {
          from: { transform: "translateY(-10px)", opacity: 0 },
          to: { transform: "translateY(0)", opacity: 1 },
        },
        flash: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.3 },
        },
      },
    },
  },
  plugins: [],
};
