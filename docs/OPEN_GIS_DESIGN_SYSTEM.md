# OpenGIS Design System Reference

This document records the visual styling tokens and component architecture adapted from [OpenGIS](https://opengis.info/).

## Typography Hierarchy
- **Font Family:** `Mulish, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Headings Modular Scale:**
  - `H1`: 2.98598rem (48px – 60px)
  - `H2`: 2.48832rem
  - `H3`: 2.0736rem
  - `H4`: 1.728rem
  - `H5`: 1.44rem
  - `H6`: 1.2rem
  - `Base`: 16px (line-height 1.625)

## Color Palette Tokens
| Token | Light Theme | Dark Theme | Purpose |
|---|---|---|---|
| `--color-primary` | `#ef4444` | `#ef4444` | Brand highlights, active tabs, buttons |
| `--color-primary-dark` | `#d63c3c` | `#d63c3c` | Button hover & active focus |
| `--color-body` | `#ffffff` | `#1e2939` | App content container background |
| `--color-body-dark` | `#020617` | `#020617` | Deep dark mode canvas |
| `--color-border` | `#eaeaea` | `#3e3e3e` | Card borders, dividers, inputs |
| `--color-text` | `#444444` | `#d1d5dc` | Body typography |
| `--color-text-dark` | `#040404` | `#ffffff` | Headings & high-contrast titles |

## Core UI Components
- `.btn`, `.btn-sm`, `.btn-primary`, `.btn-outline-primary`: Standard button system with smooth transitions.
- `.card`: Crisp border with subtle elevated shadow.
- `.header`: Sticky navigation bar with frosted backdrop.
