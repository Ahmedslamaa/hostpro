import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * HostPro logotype — Text-based logo with platform colors
 * Colors: Primary (#FF6B6B) + Secondary (#2C3E50)
 */
interface LogoMarkProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  as?: "div" | "a" | "link";
  href?: string;
  onClick?: () => void;
}

const SIZES = {
  sm: { fontSize: 16, fontWeight: 700, letterSpacing: 0.5 },
  md: { fontSize: 24, fontWeight: 700, letterSpacing: 0.8 },
  lg: { fontSize: 32, fontWeight: 700, letterSpacing: 1 },
  xl: { fontSize: 40, fontWeight: 700, letterSpacing: 1.2 },
};

const COLOR_SCHEME = {
  light: {
    primary: "#FF6B6B", // Coral red
    secondary: "#2C3E50", // Dark blue-gray
  },
  dark: {
    primary: "#FF8585", // Lighter coral for dark mode
    secondary: "#ECF0F1", // Light gray for dark mode
  },
};

const LogoMark = React.forwardRef<HTMLDivElement | HTMLAnchorElement, LogoMarkProps>(
  (
    {
      variant = "light",
      size = "md",
      className,
      as = "div",
      href = "/",
      onClick,
    },
    ref
  ) => {
    const s = SIZES[size];
    const colors = COLOR_SCHEME[variant];

    const logoContent = (
      <div
        className={cn(
          "select-none inline-block flex items-center gap-1",
          className
        )}
      >
        <span
          style={{
            fontSize: `${s.fontSize}px`,
            fontWeight: s.fontWeight,
            letterSpacing: `${s.letterSpacing}px`,
            color: colors.primary,
            fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
            lineHeight: 1,
          }}
        >
          Host
        </span>
        <span
          style={{
            fontSize: `${s.fontSize}px`,
            fontWeight: s.fontWeight,
            letterSpacing: `${s.letterSpacing}px`,
            color: colors.secondary,
            fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
            lineHeight: 1,
          }}
        >
          Pro
        </span>
      </div>
    );

    if (as === "link") {
      return (
        <Link href={href} ref={ref as React.ForwardedRef<HTMLAnchorElement>}>
          <div className="inline-block cursor-pointer">
            {logoContent}
          </div>
        </Link>
      );
    }

    if (as === "a") {
      return (
        <a
          href={href}
          onClick={onClick}
          className="inline-block cursor-pointer hover:opacity-80 transition-opacity duration-200"
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
        >
          {logoContent}
        </a>
      );
    }

    return (
      <div
        ref={ref as React.ForwardedRef<HTMLDivElement>}
        onClick={onClick}
        className={cn(
          "inline-block",
          onClick && "cursor-pointer hover:opacity-80 transition-opacity duration-200"
        )}
      >
        {logoContent}
      </div>
    );
  }
);

LogoMark.displayName = "LogoMark";

export { LogoMark };
