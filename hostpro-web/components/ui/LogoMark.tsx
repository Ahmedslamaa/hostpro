import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * HostPro logotype — "HOST" + "PRO" in coral rectangle.
 * variant="light"  → HOST (dark) + PRO (coral bg, white text)   [on white/grey backgrounds]
 * variant="dark"   → HOST (white) + PRO (white bg, coral text)  [on dark/coral backgrounds]
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
  sm: { wrap: "text-base", pro: "text-xs px-1.5 py-0.5 rounded-md" },
  md: { wrap: "text-xl", pro: "text-sm px-2.5 py-1 rounded-lg" },
  lg: { wrap: "text-3xl", pro: "text-lg px-3 py-1.5 rounded-lg" },
  xl: { wrap: "text-4xl", pro: "text-2xl px-4 py-2 rounded-xl" },
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

    const logoContent = (
      <div
        className={cn(
          "font-black tracking-tighter flex items-center gap-2 leading-none select-none",
          s.wrap,
          className
        )}
      >
        <span
          className={cn(
            "transition-colors duration-200",
            variant === "light" ? "text-neutral-900" : "text-white"
          )}
        >
          HOST
        </span>
        <span
          className={cn(
            "tracking-wider leading-none font-black transition-all duration-200",
            s.pro,
            variant === "light"
              ? "bg-primary-500 text-white hover:bg-primary-600"
              : "bg-white text-primary-500 hover:bg-neutral-50"
          )}
        >
          PRO
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
