'use client';

import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const skeletonVariants = cva(
  'animate-pulse rounded bg-secondary-200',
  {
    variants: {
      variant: {
        default: '',
        card: 'w-full h-[200px]',
        avatar: 'rounded-full',
        text: 'h-4 w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant,
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={skeletonVariants({ variant, className })}
      style={{
        width: width,
        height: height,
        ...style,
      }}
      {...props}
    />
  );
}

export function JobCardSkeleton() {
  return (
    <div className="space-y-4 p-6 border border-secondary-200 rounded-lg">
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
      </div>
      <div className="flex gap-2">
        <Skeleton width={60} height={24} className="rounded-full" />
        <Skeleton width={80} height={24} className="rounded-full" />
        <Skeleton width={70} height={24} className="rounded-full" />
      </div>
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="space-y-4 p-6 border border-secondary-200 rounded-lg">
      <div className="flex items-center gap-4">
        <Skeleton variant="avatar" width={64} height={64} />
        <div className="space-y-2">
          <Skeleton variant="text" width={120} />
          <Skeleton variant="text" width={160} />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="90%" />
      </div>
    </div>
  );
} 