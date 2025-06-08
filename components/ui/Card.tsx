'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'rounded-lg bg-white transition-shadow',
  {
    variants: {
      variant: {
        default: 'border border-secondary-200 shadow-custom-sm hover:shadow-custom-md',
        elevated: 'shadow-custom-md hover:shadow-custom-lg',
        ghost: 'border border-secondary-200 hover:border-secondary-300',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer transform transition-transform hover:-translate-y-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  as?: 'div' | 'article' | 'section';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, as = 'div', children, ...props }, ref) => {
    const Component = motion[as];

    return (
      <Component
        ref={ref}
        className={cardVariants({ variant, padding, interactive, className })}
        initial={interactive ? { scale: 1 } : undefined}
        whileHover={interactive ? { scale: 1.02 } : undefined}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

export { Card, cardVariants }; 