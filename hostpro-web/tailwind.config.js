/** @type {import('tailwindcss').Config} */
const {
  colors,
  spacing,
  shadows,
  radius,
  typography,
  zIndex,
  breakpoints,
} = require("./lib/design-system.ts");

module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: spacing.lg,
      screens: { "2xl": "1400px" },
    },
    extend: {
      // Design system colors
      colors: {
        // Brand colors
        primary: {
          DEFAULT: colors.primary.main,
          hover: colors.primary.hover,
          light: colors.primary.light,
          dark: colors.primary.dark,
          50: "#FFF8F8",
          100: "#FFE8E9",
          200: "#FFD1D3",
          300: "#FFAAAE",
          400: "#FF8388",
          500: colors.primary.main,
          600: "#E84C52",
          700: "#D13D42",
          800: "#B93238",
          900: "#8B2F35",
        },
        secondary: {
          DEFAULT: colors.secondary.main,
          light: colors.secondary.light,
          dark: colors.secondary.dark,
        },
        // Neutral colors
        neutral: {
          0: colors.neutral.white,
          50: "#FAFAFA",
          100: colors.neutral.light,
          200: colors.neutral.lighter,
          300: colors.neutral.medium,
          400: "#CCCCCC",
          500: colors.neutral.dark,
          600: "#5C5C5C",
          700: "#3D3D3D",
          800: colors.neutral.darker,
          900: "#000000",
        },
        // Status colors
        success: colors.status.success,
        warning: colors.status.warning,
        danger: colors.status.danger,
        info: colors.status.info,

        // Fallback to HSL variables (for backward compatibility)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      // Spacing
      spacing,

      // Shadows
      boxShadow: {
        ...shadows,
        sm: shadows.sm,
        md: shadows.md,
        lg: shadows.lg,
        xl: shadows.xl,
        xxl: shadows.xxl,
      },

      // Border radius
      borderRadius: {
        sm: radius.sm,
        md: radius.md,
        lg: radius.lg,
        xl: radius.xl,
        full: radius.full,
        // Backward compatibility
        DEFAULT: radius.md,
      },

      // Typography
      fontSize: {
        display: [typography.display.size, { lineHeight: typography.display.lineHeight, fontWeight: typography.display.weight }],
        h1: [typography.h1.size, { lineHeight: typography.h1.lineHeight, fontWeight: typography.h1.weight }],
        h2: [typography.h2.size, { lineHeight: typography.h2.lineHeight, fontWeight: typography.h2.weight }],
        h3: [typography.h3.size, { lineHeight: typography.h3.lineHeight, fontWeight: typography.h3.weight }],
        h4: [typography.h4.size, { lineHeight: typography.h4.lineHeight, fontWeight: typography.h4.weight }],
        body: [typography.body.size, { lineHeight: typography.body.lineHeight, fontWeight: typography.body.weight }],
        "body-small": [typography.bodySmall.size, { lineHeight: typography.bodySmall.lineHeight, fontWeight: typography.bodySmall.weight }],
        label: [typography.label.size, { lineHeight: typography.label.lineHeight, fontWeight: typography.label.weight }],
        "label-small": [typography.labelSmall.size, { lineHeight: typography.labelSmall.lineHeight, fontWeight: typography.labelSmall.weight }],
      },

      // Font weights
      fontWeight: {
        thin: 100,
        extralight: 200,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
      },

      // Z-index
      zIndex,

      // Animations
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: {
            transform: "translateY(12px)",
            opacity: "0",
          },
          to: {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        slideDown: {
          from: {
            transform: "translateY(-12px)",
            opacity: "0",
          },
          to: {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        scaleIn: {
          from: {
            transform: "scale(0.95)",
            opacity: "0",
          },
          to: {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        pulse: {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.5",
          },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn 250ms ease-out",
        "slide-up": "slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-down": "slideDown 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "scale-in": "scaleIn 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },

      // Transitions
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "350ms",
        slower: "500ms",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
