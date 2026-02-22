/**
 * Brand Design Constants
 *
 * Centralized color definitions for consistent theming across the application.
 * These values align with the CSS variables defined in globals.css.
 *
 * For CSS styles, prefer using CSS variables (hsl(var(--primary)), etc.)
 * These constants are primarily for JavaScript/TypeScript code where
 * CSS variables cannot be used directly (e.g., SVG gradients, inline styles).
 */

/**
 * Orange brand colors (hex values)
 * Aligned with Tailwind config and CSS variables
 */
export const BRAND_COLORS = {
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },
} as const;

/**
 * Primary brand colors for charts and visualizations
 */
export const CHART_COLORS = {
  /** Rank 1 - Best option */
  rank1: {
    fill: 'url(#gradient-rank1)',
    stroke: BRAND_COLORS.orange[600],
    glow: 'rgba(234, 88, 12, 0.3)',
    gradientStart: BRAND_COLORS.orange[600],
    gradientEnd: BRAND_COLORS.orange[500],
  },
  /** Rank 2 - Second best */
  rank2: {
    fill: 'url(#gradient-rank2)',
    stroke: BRAND_COLORS.orange[500],
    glow: 'rgba(249, 115, 22, 0.2)',
    gradientStart: BRAND_COLORS.orange[500],
    gradientEnd: BRAND_COLORS.orange[400],
  },
  /** Rank 3 - Third best */
  rank3: {
    fill: 'url(#gradient-rank3)',
    stroke: BRAND_COLORS.orange[400],
    glow: 'rgba(251, 146, 60, 0.15)',
    gradientStart: BRAND_COLORS.orange[400],
    gradientEnd: BRAND_COLORS.orange[300],
  },
  /** Other plans - neutral gray */
  other: {
    fill: '#94a3b8',
    stroke: '#64748b',
    glow: 'rgba(100, 116, 139, 0.1)',
  },
  /** Least highlighted - lighter gray */
  dim: {
    fill: '#cbd5e1',
    stroke: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.1)',
  },
} as const;

/**
 * Neutral colors for text and borders
 */
export const NEUTRAL_COLORS = {
  50: '#fafafa',
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
  950: '#09090b',
} as const;

/**
 * Success colors
 */
export const SUCCESS_COLORS = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
} as const;

/**
 * Common color aliases for semantic use
 */
export const SEMANTIC_COLORS = {
  primary: BRAND_COLORS.orange[500],
  primaryDark: BRAND_COLORS.orange[600],
  success: SUCCESS_COLORS[600],
  border: NEUTRAL_COLORS[200],
  textMuted: NEUTRAL_COLORS[500],
  textDefault: NEUTRAL_COLORS[700],
} as const;
