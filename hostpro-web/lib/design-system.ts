/**
 * Design System for HOST PRO
 * Centralized tokens for colors, typography, spacing, shadows, and animations
 * Inspired by Airbnb and Apple design principles
 */

/**
 * Color Palette
 * Semantic color naming for consistency and scalability
 */
export const colors = {
  // Primary actions and accents
  primary: {
    main: '#FF5A5F',        // Coral/Red - CTAs, active states
    hover: '#E00B41',       // Darker red - hover state
    light: '#FFF0F0',       // Light background
    dark: '#8B2F35',        // Dark text for contrast
  },
  // Secondary actions
  secondary: {
    main: '#1A73E8',        // Blue - secondary actions
    light: '#E8F1FF',       // Light bg
    dark: '#0D47A1',        // Dark text
  },
  // Neutral colors
  neutral: {
    white: '#FFFFFF',       // Pure white
    light: '#F7F7F7',       // Very light gray (backgrounds)
    lighter: '#F5F5F5',     // Lighter gray
    medium: '#E8E8E8',      // Medium gray (borders)
    dark: '#717171',        // Dark gray (secondary text)
    darker: '#222222',      // Very dark gray/black (primary text)
  },
  // Status colors
  status: {
    success: '#34A853',     // Green
    warning: '#FBBC04',     // Amber/Yellow
    danger: '#EA4335',      // Red
    info: '#4285F4',        // Blue
  },
  // Additional
  overlay: 'rgba(0, 0, 0, 0.5)',  // Modal overlay
};

/**
 * Typography Scale
 * Predefined font sizes, weights, and line heights
 * Follow Apple-like clarity and hierarchy
 */
export const typography = {
  display: {
    size: '3.5rem',
    weight: 800,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  h1: {
    size: '2.5rem',
    weight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  h2: {
    size: '2rem',
    weight: 600,
    lineHeight: 1.3,
  },
  h3: {
    size: '1.5rem',
    weight: 600,
    lineHeight: 1.3,
  },
  h4: {
    size: '1.25rem',
    weight: 600,
    lineHeight: 1.4,
  },
  body: {
    size: '1rem',
    weight: 400,
    lineHeight: 1.5,
  },
  bodySmall: {
    size: '0.875rem',
    weight: 400,
    lineHeight: 1.5,
  },
  bodySmallBold: {
    size: '0.875rem',
    weight: 600,
    lineHeight: 1.5,
  },
  label: {
    size: '0.875rem',
    weight: 500,
    lineHeight: 1.4,
  },
  labelSmall: {
    size: '0.75rem',
    weight: 600,
    lineHeight: 1.3,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
};

/**
 * Spacing Scale
 * 8px base unit (consistent with Tailwind)
 * Used for padding, margin, gaps
 */
export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '1rem',      // 16px
  md: '1.5rem',    // 24px
  lg: '2rem',      // 32px
  xl: '3rem',      // 48px
  xxl: '4rem',     // 64px
};

/**
 * Shadow/Elevation System
 * Following Material Design principles
 */
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.07)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.12)',
  xxl: '0 25px 50px rgba(0, 0, 0, 0.15)',
};

/**
 * Animation/Transition Timing
 * Cubic-bezier easing for natural motion
 */
export const animation = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
  slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  slowest: '700ms cubic-bezier(0.4, 0, 0.2, 1)',
};

/**
 * Border Radius
 * Consistent radius for cards, buttons, etc.
 */
export const radius = {
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  full: '9999px',   // Pill shape
};

/**
 * Breakpoints
 * Tailwind-compatible breakpoints
 */
export const breakpoints = {
  xs: '0px',        // Mobile
  sm: '640px',      // Small devices
  md: '768px',      // Tablet
  lg: '1024px',     // Large screens
  xl: '1280px',     // Extra large
  '2xl': '1536px',  // Ultra-wide
};

/**
 * Z-Index Scale
 * Consistent layering
 */
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  offcanvas: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

/**
 * Button Sizes
 * Used by Button component
 */
export const buttonSizes = {
  sm: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    height: '2rem',
  },
  md: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    height: '2.5rem',
  },
  lg: {
    padding: '1rem 2rem',
    fontSize: '1rem',
    height: '3rem',
  },
};

/**
 * Grid System
 * Container and column configuration
 */
export const grid = {
  container: '1400px',
  gutter: '2rem',
  columns: 12,
};

/**
 * Blur Values
 * For backdrop filters
 */
export const blur = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '20px',
};

/**
 * Helper function to get responsive breakpoint
 */
export const getBreakpoint = (breakpoint: keyof typeof breakpoints): string => {
  return breakpoints[breakpoint];
};

/**
 * Helper function to create rgba color
 */
export const rgba = (color: string, alpha: number): string => {
  return color.replace(')', `, ${alpha})`);
};
