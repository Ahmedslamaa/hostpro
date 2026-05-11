import { cn } from "@/lib/utils";

/**
 * HostPro logotype — "HOST" + "PRO" in coral rectangle.
 * variant="light"  → HOST (#222) + PRO (coral bg, white text)   [on white/grey backgrounds]
 * variant="dark"   → HOST (white) + PRO (white bg, coral text)  [on dark/coral backgrounds]
 */
type LogoMarkProps = {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZES = {
  sm: { wrap: "text-base",  pro: "text-[12px] px-[6px]  py-[2px]  rounded-[4px]" },
  md: { wrap: "text-xl",    pro: "text-[15px] px-2      py-[3px]  rounded-[6px]" },
  lg: { wrap: "text-3xl",   pro: "text-[22px] px-[10px] py-[4px]  rounded-[6px]" },
  xl: { wrap: "text-4xl",   pro: "text-[30px] px-3      py-[5px]  rounded-[8px]" },
};

export function LogoMark({ variant = "light", size = "md", className }: LogoMarkProps) {
  const s = SIZES[size];
  return (
    <div
      className={cn(
        "font-black tracking-[-0.02em] flex items-center gap-2 leading-none select-none",
        s.wrap,
        className,
      )}
    >
      <span className={variant === "light" ? "text-[#222222]" : "text-white"}>
        HOST
      </span>
      <span
        className={cn(
          "tracking-[0.02em] leading-none",
          s.pro,
          variant === "light"
            ? "bg-[#FF5A5F] text-white"
            : "bg-white text-[#FF5A5F]",
        )}
      >
        PRO
      </span>
    </div>
  );
}
