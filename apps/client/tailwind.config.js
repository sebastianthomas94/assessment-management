import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-tertiary-fixed-variant": "#2f2ebe",
        "surface-container": "#e5eeff",
        "error": "#ba1a1a",
        "surface-variant": "#d3e4fe",
        "outline": "#757684",
        "background": "#f8f9ff",
        "on-error-container": "#93000a",
        "inverse-surface": "#213145",
        "on-primary": "#ffffff",
        "surface-bright": "#f8f9ff",
        "inverse-primary": "#b8c4ff",
        "surface-container-lowest": "#ffffff",
        "on-primary-fixed": "#001453",
        "on-error": "#ffffff",
        "on-primary-container": "#a8b8ff",
        "on-background": "#0b1c30",
        "error-container": "#ffdad6",
        "on-secondary-fixed": "#00201d",
        "tertiary-container": "#3433c3",
        "on-secondary": "#ffffff",
        "secondary-container": "#86f2e4",
        "on-surface-variant": "#444653",
        "primary": "#00288e",
        "on-secondary-fixed-variant": "#005049",
        "on-surface": "#0b1c30",
        "secondary-fixed-dim": "#6bd8cb",
        "surface-container-highest": "#d3e4fe",
        "on-tertiary-fixed": "#07006c",
        "primary-container": "#1e40af",
        "surface-tint": "#3755c3",
        "inverse-on-surface": "#eaf1ff",
        "tertiary": "#170cae",
        "surface-container-low": "#eff4ff",
        "on-tertiary-container": "#b3b5ff",
        "secondary-fixed": "#89f5e7",
        "on-tertiary": "#ffffff",
        "on-primary-fixed-variant": "#173bab",
        "primary-fixed-dim": "#b8c4ff",
        "outline-variant": "#c4c5d5",
        "on-secondary-container": "#006f66",
        "primary-fixed": "#dde1ff",
        "tertiary-fixed-dim": "#c0c1ff",
        "surface-container-high": "#dce9ff",
        "surface-dim": "#cbdbf5",
        "tertiary-fixed": "#e1e0ff",
        "secondary": "#006a61",
        "surface": "#f8f9ff"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      spacing: {
        "container-padding": "24px",
        "max-width-workspace": "1024px",
        unit: "4px",
        "section-margin": "32px",
        "element-gap": "16px",
        "sidebar-width": "280px"
      },
      fontFamily: {
        "headline-md": ["Inter", "sans-serif"],
        "headline-sm": ["Inter", "sans-serif"],
        "title-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "label-lg": ["Inter", "sans-serif"],
        "display-lg": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "title-md": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"]
      },
      fontSize: {
        "headline-md": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "title-lg": ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-lg": ["14px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "500" }],
        "display-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "title-md": ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "label-sm": ["11px", { lineHeight: "16px", fontWeight: "600" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "500" }]
      }
    }
  },
  plugins: [
    forms,
    containerQueries
  ]
};
