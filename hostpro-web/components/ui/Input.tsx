import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = true,
      size = 'md',
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'h-8 px-2.5 text-sm',
      md: 'h-10 px-3 text-base',
      lg: 'h-12 px-4 text-base',
    };

    const inputClasses = cn(
      'w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 focus:border-transparent',
      'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:border-neutral-200',
      error && 'border-danger focus:ring-danger',
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      sizeStyles[size],
      className
    );

    return (
      <div className={cn('flex flex-col gap-2', fullWidth && 'w-full')}>
        {label && (
          <label className="text-sm font-medium text-neutral-700">
            {label}
            {props.required && <span className="ml-1 text-danger">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center text-neutral-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            className={inputClasses}
            disabled={disabled}
            ref={ref}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 flex items-center text-neutral-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <span className="text-xs font-medium text-danger">{error}</span>
        )}

        {hint && !error && (
          <span className="text-xs text-neutral-500">{hint}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
