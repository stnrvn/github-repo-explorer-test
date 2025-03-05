import { HTMLAttributes } from 'react';
import clsx from 'clsx';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
      data-testid="skeleton"
      {...props}
    />
  );
}; 