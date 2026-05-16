import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-lg transition-all duration-250',
  {
    variants: {
      elevation: {
        none: 'shadow-none border border-neutral-200',
        sm: 'shadow-sm border border-neutral-100',
        md: 'shadow-md border border-neutral-100',
        lg: 'shadow-lg border border-neutral-100',
        xl: 'shadow-xl border border-neutral-100',
      },
      interactive: {
        true: 'hover:shadow-lg hover:border-neutral-200 cursor-pointer',
        false: '',
      },
      background: {
        white: 'bg-white',
        light: 'bg-neutral-50',
        transparent: 'bg-transparent',
      },
    },
    defaultVariants: {
      elevation: 'md',
      interactive: false,
      background: 'white',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevation, interactive, background, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ elevation, interactive, background }), className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-start justify-between gap-4 border-b border-neutral-100 px-6 py-4', className)}
      {...props}
    >
      <div className="flex flex-col gap-1 flex-1">
        {title && (
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        )}
        {subtitle && (
          <p className="text-sm text-neutral-500">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex items-center">{action}</div>}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padded = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(padded && 'px-6 py-4', className)}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'space-between';
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, action, align = 'right', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-3 border-t border-neutral-100 px-6 py-4',
        align === 'left' && 'justify-start',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end',
        align === 'space-between' && 'justify-between',
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };
