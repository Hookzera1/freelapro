'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const selectVariants = cva(
  'w-full rounded-lg border bg-white pr-10 transition-colors appearance-none focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-slate-200 focus:border-blue-500 focus:ring-blue-500',
        error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
      },
      size: {
        sm: 'h-8 pl-3 text-sm',
        md: 'h-10 pl-3',
        lg: 'h-12 pl-4 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  error?: boolean;
  helperText?: string;
  options?: Array<{ value: string; label: string }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, size, error, helperText, options = [], children, ...props }, ref) => {
    const selectVariant = error ? 'error' : variant;

    return (
      <div className="w-full space-y-1">
        <div className="relative">
          <select
            ref={ref}
            className={cn(selectVariants({ variant: selectVariant, size }), className)}
            {...props}
          >
            {children || options.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
        </div>
        {helperText && (
          <p
            className={cn(
              "text-sm",
              error ? "text-red-500" : "text-slate-500"
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select, selectVariants }; 