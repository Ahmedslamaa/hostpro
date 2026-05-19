import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * HostPro logotype — Professional logo system
 * Mark: Circular chevron H-monogram with gold rim and rose enamel
 * Wordmark: "Host" + "Pro" (Pro in gold)
 * Colors: Rose (#E02060) + Gold (#E0C080) + Ink (#1A0E12)
 */
interface LogoMarkProps {
  variant?: "color" | "mono-dark" | "mono-light" | "wordmark" | "light" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  as?: "div" | "a" | "link";
  href?: string;
  onClick?: () => void;
}

const SIZES = {
  sm: 80,
  md: 120,
  lg: 160,
  xl: 200,
};

// Host Pro professional color palette
const COLOR_TOKENS = {
  rose: "#E02060",
  roseDeep: "#C00040",
  roseMid: "#E04060",
  gold: "#E0C080",
  goldDeep: "#C0A060",
  goldLight: "#E0E0A0",
  ink: "#1A0E12",
  inkSoft: "#6B5A60",
  paper: "#F4F2F0",
};

// HPMark — Circular logo with H-monogram and chevron roof
const HPMark = ({ size = 120, variant = "color" }) => {
  const id = React.useId();
  const goldGrad = `gold-${id}`;
  const roseGrad = `rose-${id}`;
  const innerShadow = `iso-${id}`;

  const isMono = variant === "mono-dark" || variant === "mono-light";
  const monoColor = variant === "mono-light" ? COLOR_TOKENS.paper : COLOR_TOKENS.ink;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{ display: "block" }}
      aria-label="Host Pro"
    >
      <defs>
        <linearGradient id={goldGrad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F4E4B0" />
          <stop offset="50%" stopColor={COLOR_TOKENS.gold} />
          <stop offset="100%" stopColor={COLOR_TOKENS.goldDeep} />
        </linearGradient>
        <linearGradient id={roseGrad} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={COLOR_TOKENS.roseMid} />
          <stop offset="55%" stopColor={COLOR_TOKENS.rose} />
          <stop offset="100%" stopColor={COLOR_TOKENS.roseDeep} />
        </linearGradient>
        <radialGradient id={innerShadow} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
        </radialGradient>
      </defs>

      {/* Outer gold ring */}
      <circle
        cx="100"
        cy="100"
        r="94"
        fill={isMono ? "none" : `url(#${goldGrad})`}
        stroke={isMono ? monoColor : "none"}
        strokeWidth={isMono ? 4 : 0}
      />

      {/* Rose enamel disc */}
      <circle
        cx="100"
        cy="100"
        r="84"
        fill={isMono ? "none" : `url(#${roseGrad})`}
        stroke={isMono ? monoColor : "none"}
        strokeWidth={isMono ? 3 : 0}
      />

      {/* Inner gold rim */}
      {!isMono && (
        <circle
          cx="100"
          cy="100"
          r="84"
          fill="none"
          stroke={`url(#${goldGrad})`}
          strokeWidth="2"
          opacity="0.9"
        />
      )}

      {/* Soft enamel highlight */}
      {!isMono && (
        <circle cx="100" cy="100" r="84" fill={`url(#${innerShadow})`} />
      )}

      {/* H monogram with chevron roof */}
      <g
        fill="none"
        stroke={isMono ? monoColor : `url(#${goldGrad})`}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Roof chevron */}
        <path d="M 56 86 L 100 50 L 144 86" />
        {/* Left pillar */}
        <path d="M 66 90 L 66 148" />
        {/* Right pillar */}
        <path d="M 134 90 L 134 148" />
        {/* H crossbar — door top */}
        <path d="M 66 118 L 134 118" />
        {/* Key loop at apex */}
        <circle
          cx="100"
          cy="68"
          r="8"
          fill={isMono ? "none" : `url(#${roseGrad})`}
          stroke={isMono ? monoColor : "none"}
          strokeWidth={isMono ? 2 : 0}
        />
      </g>
    </svg>
  );
};

// HPWordmark — "Host" + "Pro" with Pro in gold
const HPWordmark = ({ size = 36, className = "" }) => {
  return (
    <div
      className={cn("inline-flex items-baseline gap-1", className)}
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      <span
        style={{
          fontSize: size,
          fontWeight: 800,
          letterSpacing: "-0.035em",
          color: COLOR_TOKENS.ink,
          lineHeight: 1,
        }}
      >
        Host
      </span>
      <span
        style={{
          fontSize: size,
          fontWeight: 800,
          letterSpacing: "-0.035em",
          color: COLOR_TOKENS.goldDeep,
          lineHeight: 1,
        }}
      >
        Pro
      </span>
    </div>
  );
};

const LogoMark = React.forwardRef<HTMLDivElement | HTMLAnchorElement, LogoMarkProps>(
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
    const sizeValue = SIZES[size];

    // Map legacy variants to new variants
    const normalizedVariant = variant === "light" ? "color" : variant === "dark" ? "mono-dark" : variant || "color";

    // Show wordmark or mark depending on variant
    const logoContent =
      normalizedVariant === "wordmark" ? (
        <HPWordmark size={sizeValue / 3.5} className={className} />
      ) : (
        <HPMark size={sizeValue} variant={normalizedVariant as "color" | "mono-dark" | "mono-light"} />
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
