import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-all duration-200',
  {
    variants: {
      variant: {
        // Solid variant - filled background
        solid: '',
        // Outline variant - border with light background
        outline: 'border border-current',
        // Ghost variant - no background, colored text
        ghost: 'bg-transparent',
      },
      color: {
        // Primary color
        primary: '',
        // Secondary color
        secondary: '',
        // Success color
        success: '',
        // Warning color
        warning: '',
        // Danger/Error color
        danger: '',
        // Info color
        info: '',
        // Gray/Neutral color
        gray: '',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
      },
    },
    compoundVariants: [
      // Primary - Solid
      {
        variant: 'solid',
        color: 'primary',
        className: 'bg-primary-500 text-white',
      },
      // Primary - Outline
      {
        variant: 'outline',
        color: 'primary',
        className: 'border-primary-500 text-primary-500 bg-primary-50',
      },
      // Primary - Ghost
      {
        variant: 'ghost',
        color: 'primary',
        className: 'text-primary-600',
      },

      // Secondary - Solid
      {
        variant: 'solid',
        color: 'secondary',
        className: 'bg-secondary-500 text-white',
      },
      // Secondary - Outline
      {
        variant: 'outline',
        color: 'secondary',
        className: 'border-secondary-500 text-secondary-500 bg-blue-50',
      },
      // Secondary - Ghost
      {
        variant: 'ghost',
        color: 'secondary',
        className: 'text-secondary-600',
      },

      // Success - Solid
      {
        variant: 'solid',
        color: 'success',
        className: 'bg-success text-white',
      },
      // Success - Outline
      {
        variant: 'outline',
        color: 'success',
        className: 'border-success text-success bg-green-50',
      },
      // Success - Ghost
      {
        variant: 'ghost',
        color: 'success',
        className: 'text-success',
      },

      // Warning - Solid
      {
        variant: 'solid',
        color: 'warning',
        className: 'bg-warning text-white',
      },
      // Warning - Outline
      {
        variant: 'outline',
        color: 'warning',
        className: 'border-warning text-warning bg-yellow-50',
      },
      // Warning - Ghost
      {
        variant: 'ghost',
        color: 'warning',
        className: 'text-warning',
      },

      // Danger - Solid
      {
        variant: 'solid',
        color: 'danger',
        className: 'bg-danger text-white',
      },
      // Danger - Outline
      {
        variant: 'outline',
        color: 'danger',
        className: 'border-danger text-danger bg-red-50',
      },
      // Danger - Ghost
      {
        variant: 'ghost',
        color: 'danger',
        className: 'text-danger',
      },

      // Info - Solid
      {
        variant: 'solid',
        color: 'info',
        className: 'bg-info text-white',
      },
      // Info - Outline
      {
        variant: 'outline',
        color: 'info',
        className: 'border-info text-info bg-blue-50',
      },
      // Info - Ghost
      {
        variant: 'ghost',
        color: 'info',
        className: 'text-info',
      },

      // Gray - Solid
      {
        variant: 'solid',
        color: 'gray',
        className: 'bg-neutral-200 text-neutral-700',
      },
      // Gray - Outline
      {
        variant: 'outline',
        color: 'gray',
        className: 'border-neutral-300 text-neutral-600 bg-neutral-50',
      },
      // Gray - Ghost
      {
        variant: 'ghost',
        color: 'gray',
        className: 'text-neutral-600',
      },
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'gray',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { className, variant, color, size, leftIcon, rightIcon, dot, children, ...props },
    ref
  ) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, color, size }), className)}
      {...props}
    >
      {dot && (
        <span className="inline-block h-2 w-2 rounded-full bg-current" />
      )}
      {leftIcon && <span className="flex items-center">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="flex items-center">{rightIcon}</span>}
    </span>
  )
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
