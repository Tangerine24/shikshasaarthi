import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'muted';
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', className, ...props }) => {
  const base = 'inline-flex items-center px-2 py-0.5 rounded-badge text-xs font-medium';
  const variants = {
    success: 'bg-green-100 text-success',
    warning: 'bg-yellow-100 text-warning',
    danger: 'bg-red-100 text-danger',
    info: 'bg-blue-100 text-info',
    neutral: 'bg-gray-100 text-text-primary',
    muted: 'bg-gray-100 text-text-muted',
  };
  
  return (
    <span className={twMerge(clsx(base, variants[variant], className))} {...props} />
  );
};
