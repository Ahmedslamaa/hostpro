"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * HostPro Wordmark — "Host" (ink) + "Pro" (gold)
 * Design system: Plus Jakarta Sans, Rose/Gold palette
 * No circular mark — wordmark only per new design spec.
 */
interface LogoMarkProps {
  variant?: "color" | "mono-dark" | "mono-light" | "wordmark" | "light" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  as?: "div" | "a" | "link";
  href?: string;
  onClick?: () => void;
}

const FONT_SIZES: Record<string, number> = {
  sm: 18,
  md: 24,
  lg: 32,
  xl: 42,
};

export const LogoMark = React.forwardRef<
  HTMLDivElement | HTMLAnchorElement,
  LogoMarkProps
>(
  (
    {
      variant = "color",
      size = "md",
      className,
      as = "div",
      href = "/",
      onClick,
    },
    ref
  ) => {
    const fs = FONT_SIZES[size] ?? 24;

    // Colour mapping — "light" maps to color, "dark" to mono-light (white text)
    const isDark =
      variant === "mono-light" || variant === "dark";

    const inkColor   = isDark ? "#F4F2F0" : "#1A0E12";
    const goldColor  = isDark ? "#E0C080" : "#C0A060";

    const wordmark = (
      <span
        className={cn("select-none inline-flex items-baseline", className)}
        style={{
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          fontSize: fs,
          lineHeight: 1,
          letterSpacing: "-0.035em",
          fontWeight: 800,
          gap: "0.08em",
        }}
      >
        <span style={{ color: inkColor }}>Host</span>
        <span style={{ color: goldColor }}>Pro</span>
      </span>
    );

    if (as === "link") {
      return (
        <Link
          href={href}
          className="inline-flex hover:opacity-80 transition-opacity duration-200"
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
        >
          {wordmark}
        </Link>
      );
    }

    if (as === "a") {
      return (
        <a
          href={href}
          onClick={onClick}
          className="inline-flex cursor-pointer hover:opacity-80 transition-opacity duration-200"
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
        >
          {wordmark}
        </a>
      );
    }

    return (
      <div
        ref={ref as React.ForwardedRef<HTMLDivElement>}
        onClick={onClick}
        className={cn(
          "inline-flex",
          onClick &&
            "cursor-pointer hover:opacity-80 transition-opacity duration-200"
        )}
      >
        {wordmark}
      </div>
    );
  }
);

LogoMark.displayName = "LogoMark";
