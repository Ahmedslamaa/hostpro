import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-250 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
  {
    variants: {
      variant: {
        // Primary button - Main CTAs
        primary:
          'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-primary-300 shadow-md hover:shadow-lg',
        // Primary outline - Secondary importance
        outline:
          'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-300',
        // Ghost button - Tertiary actions
        ghost:
          'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-neutral-300',
        // Secondary button
        secondary:
          'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700 focus-visible:ring-secondary-300 shadow-md hover:shadow-lg',
        // Danger button - Destructive actions
        danger:
          'bg-danger text-white hover:bg-red-600 active:bg-red-700 focus-visible:ring-red-300 shadow-md hover:shadow-lg',
        // Success button
        success:
          'bg-success text-white hover:bg-green-600 active:bg-green-700 focus-visible:ring-green-300 shadow-md hover:shadow-lg',
        // Subtle button - Minimal emphasis
        subtle:
          'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:bg-neutral-300 focus-visible:ring-neutral-300',
        // Link button - Text-only
        link: 'text-primary-500 hover:underline active:text-primary-700 focus-visible:ring-primary-300',
      },
      size: {
        // Small - 32px height, compact spacing
        sm: 'h-8 px-3 text-sm',
        // Medium - 40px height (default)
        md: 'h-10 px-4 text-base',
        // Large - 48px height
        lg: 'h-12 px-6 text-base',
        // Extra large - 56px height
        xl: 'h-14 px-8 text-lg',
        // Icon-only buttons
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, fullWidth }),
          className
        )}
        disabled={isLoading || disabled}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </>
        ) : (
          <>
            {leftIcon && <span className="flex items-center">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex items-center">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
