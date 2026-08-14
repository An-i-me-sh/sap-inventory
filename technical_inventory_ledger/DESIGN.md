---
name: Technical Inventory Ledger
colors:
  surface: '#101417'
  surface-dim: '#101417'
  surface-bright: '#363a3d'
  surface-container-lowest: '#0b0f11'
  surface-container-low: '#181c1f'
  surface-container: '#1c2023'
  surface-container-high: '#262a2d'
  surface-container-highest: '#313538'
  on-surface: '#e0e3e6'
  on-surface-variant: '#bdc9c7'
  inverse-surface: '#e0e3e6'
  inverse-on-surface: '#2d3134'
  outline: '#889391'
  outline-variant: '#3e4947'
  surface-tint: '#7dd6cd'
  primary: '#7dd6cd'
  on-primary: '#003734'
  primary-container: '#147c75'
  on-primary-container: '#c2fff8'
  inverse-primary: '#006a64'
  secondary: '#ffb693'
  on-secondary: '#552102'
  secondary-container: '#743818'
  on-secondary-container: '#f8a47b'
  tertiary: '#cfc1de'
  on-tertiary: '#352c42'
  tertiary-container: '#756a83'
  on-tertiary-container: '#f9efff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#9af2e9'
  primary-fixed-dim: '#7dd6cd'
  on-primary-fixed: '#00201e'
  on-primary-fixed-variant: '#00504b'
  secondary-fixed: '#ffdbcb'
  secondary-fixed-dim: '#ffb693'
  on-secondary-fixed: '#341000'
  on-secondary-fixed-variant: '#713616'
  tertiary-fixed: '#ebddfa'
  tertiary-fixed-dim: '#cfc1de'
  on-tertiary-fixed: '#20182c'
  on-tertiary-fixed-variant: '#4c425a'
  background: '#101417'
  on-background: '#e0e3e6'
  surface-variant: '#313538'
typography:
  display:
    fontFamily: IBM Plex Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  data-lg:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  data-sm:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label:
    fontFamily: IBM Plex Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
spacing:
  unit: 4px
  container-padding: 24px
  element-gap: 12px
  table-cell-padding: 8px 12px
  sidebar-width: 240px
  header-height: 56px
---

## Brand & Style
The design system is a utilitarian, data-centric framework designed for high-density enterprise resource planning. It prioritizes information hierarchy and technical legibility over aesthetic trends. The visual language is inspired by archival ledgers and technical documentation, favoring structure and precision.

The style is defined by:
- **Utilitarian Minimalism:** Whitespace is used for grouping data rather than aesthetic "breathing room."
- **Editorial Precision:** High-contrast typography and clear dividers replace typical UI shadows.
- **Industrial Sophistication:** A palette of oxidized metals and muted earth tones suggests durability and professional reliability.
- **Data-First Architecture:** Visual weight is concentrated on the values and inventory metrics rather than the interface chrome.

## Colors
The palette is divided into functional tiers to manage complex inventory states.

- **Primary Accent (Oxidized Teal):** Used for primary actions, active navigation states, and key interactive focal points.
- **Secondary Accent (Muted Copper):** Reserved for secondary data points and highlighting specific inventory batches.
- **Tertiary Accent (Muted Plum):** Exclusively utilized for AI-driven forecasting, trend lines, and predictive inventory modules.
- **Borders:** Hierarchy is established through #292D30 (Dark) and #D7D2C8 (Light) 1px solid borders. No drop shadows are permitted.
- **Surfaces:** UI layers are distinguished by subtle shifts in background hex values rather than elevation.

## Typography
The system employs a dual-font strategy to separate interface narrative from technical data.

- **IBM Plex Sans:** The primary typeface for navigation, headers, and instructional text. It provides a professional, contemporary feel.
- **IBM Plex Mono:** The technical typeface used for all variable data, including Serial Numbers, Purchase Orders, Quantities, and SKUs. This ensures tabular alignment and a "ledger" aesthetic.

**Scale:** Typography remains restrained. Avoid sizes above 24px. Use weight and casing (Uppercase Labels) to create hierarchy rather than excessive size differentials.

## Layout & Spacing
The layout is a high-density "Compact Grid" model. Spacing follows a 4px baseline, but defaults to tight groupings to maximize the visibility of data rows.

- **Table Logic:** Tables should span the full width of their containers. Use 1px borders as dividers.
- **Metric Blocks:** Instead of card-based layouts, use vertical or horizontal dividers (Rule Lines) to separate high-level metrics.
- **Sidebar:** A fixed 240px left-hand sidebar contains the primary navigation. It should be visually darker (Dark Mode) or more saturated (Light Mode) than the main content area to provide a structural anchor.
- **Density:** Favor `body-sm` and `data-sm` for internal tools to minimize scrolling during inventory audits.

## Elevation & Depth
Depth is strictly flat. Visual layers are communicated through:
- **Tonal Stepping:** Using the `surface` color against the `background` color to define the workspace.
- **Boundary Rules:** 1px solid borders are the only method for defining element edges.
- **Active States:** Subtle background shifts (e.g., a 4% lighter or darker hex value) indicate hover or selection.
- **Zero Shadows:** Do not use `box-shadow` or `drop-shadow` on any component, including modals or dropdowns. Modals should use a heavy 2px border and a dim background overlay.

## Shapes
The shape language is "Sharp." 
- All UI elements—including buttons, input fields, and tags—must have 0px corner radii. 
- This reinforces the technical, industrial nature of the platform and ensures perfect alignment with the 1px grid system.

## Components
### Buttons
- **Primary:** Solid `#147C75` with white or `#E7E5E0` text. Sharp corners.
- **Secondary:** Transparent background with a 1px border of the theme's border color.
- **Ghost:** No border or background until hover. Used for table actions.

### Tables
- **Header:** Uppercase `label` style with a subtle background fill.
- **Rows:** 1px bottom border only. Use `data-sm` for all cell content.
- **Alignment:** Numbers (quantities/prices) are right-aligned; IDs and text are left-aligned.

### Input Fields
- **Default:** 1px border, sharp corners. Use `IBM Plex Mono` for the input text to match data entry standards.
- **Focus:** Border color changes to Primary Teal. No outer glow.

### Metric Blocks
- Structured as a horizontal row of values.
- Each value is separated by a 1px vertical line.
- Title uses the `label` style; the value uses `display` in `IBM Plex Mono`.

### Sidebar & Navigation
- Icons should be 18px, single-weight strokes.
- Product mark should be a small, geometric glyph located at the top-left, followed by the platform name in `headline` style.

### Charts
- Single-color line or bar charts using the Primary or Tertiary (AI) accents. 
- Remove all unnecessary grid lines; keep only the baseline and the highest data point label.