/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface-container-high": "var(--surface-container-high, #262a2d)",
        "tertiary-fixed": "#ebddfa",
        "on-secondary-container": "#f8a47b",
        "error": "#ffb4ab",
        "on-error": "#690005",
        "surface-variant": "var(--surface-variant, #313538)",
        "secondary-fixed": "#ffdbcb",
        "on-tertiary-container": "#f9efff",
        "on-secondary-fixed": "#341000",
        "on-surface-variant": "var(--on-surface-variant, #bdc9c7)",
        "primary-fixed-dim": "#7dd6cd",
        "surface": "var(--surface, #101417)",
        "tertiary-fixed-dim": "#cfc1de",
        "surface-container": "var(--surface-container, #1c2023)",
        "surface-tint": "#7dd6cd",
        "on-primary-container": "#c2fff8",
        "primary-fixed": "#9af2e9",
        "primary-container": "#147c75",
        "on-secondary": "#552102",
        "background": "var(--background, #101417)",
        "inverse-primary": "#006a64",
        "surface-dim": "#101417",
        "secondary-container": "#743818",
        "on-primary-fixed": "#00201e",
        "inverse-surface": "#e0e3e6",
        "error-container": "#93000a",
        "on-background": "var(--on-background, #e0e3e6)",
        "outline": "#889391",
        "tertiary": "#cfc1de",
        "surface-container-highest": "var(--surface-container-highest, #313538)",
        "outline-variant": "var(--outline-variant, #3e4947)",
        "surface-container-lowest": "#0b0f11",
        "surface-bright": "#363a3d",
        "secondary-fixed-dim": "#ffb693",
        "primary": "#7dd6cd",
        "on-tertiary": "#352c42",
        "on-tertiary-fixed-variant": "#4c425a",
        "secondary": "#ffb693",
        "surface-container-low": "#181c1f",
        "on-primary-fixed-variant": "#00504b",
        "on-surface": "var(--on-surface, #e0e3e6)",
        "on-secondary-fixed-variant": "#713616",
        "inverse-on-surface": "#2d3134",
        "on-primary": "#003734",
        "on-tertiary-fixed": "#20182c",
        "on-error-container": "#ffdad6",
        "tertiary-container": "#756a83"
      },
      borderRadius: {
        "DEFAULT": "0px",
        "sm": "0px",
        "md": "0px",
        "lg": "0px",
        "xl": "0px",
        "full": "9999px"
      },
      spacing: {
        "container-padding": "24px",
        "element-gap": "12px",
        "unit": "4px",
        "table-cell-padding": "8px 12px",
        "header-height": "56px",
        "sidebar-width": "240px"
      },
      fontFamily: {
        "display": ["IBM Plex Sans", "sans-serif"],
        "data-lg": ["IBM Plex Mono", "monospace"],
        "body-lg": ["IBM Plex Sans", "sans-serif"],
        "headline": ["IBM Plex Sans", "sans-serif"],
        "data-sm": ["IBM Plex Mono", "monospace"],
        "label": ["IBM Plex Sans", "sans-serif"],
        "body-sm": ["IBM Plex Sans", "sans-serif"]
      }
    }
  }
}
