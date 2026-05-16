import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * HostPro logotype — Professional logo with HOST + PRO design
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
  sm: { width: 120, height: 45 },
  md: { width: 160, height: 60 },
  lg: { width: 200, height: 75 },
  xl: { width: 240, height: 90 },
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
          "select-none inline-block",
          className
        )}
        style={{ width: s.width, height: s.height }}
      >
        <img
          src="/hostpro-logo.svg"
          alt="HOST PRO"
          width={s.width}
          height={s.height}
          style={{ width: "100%", height: "auto" }}
          loading="eager"
        />
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
