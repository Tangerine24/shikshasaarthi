import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', className, ...props }) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-md transition-colors disabled:opacity-50';
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-surface border border-border text-text-primary hover:bg-gray-50',
    ghost: 'bg-transparent text-text-primary hover:bg-gray-100',
    danger: 'bg-danger text-white hover:bg-red-800'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button className={twMerge(clsx(base, variants[variant], sizes[size], className))} {...props} />
  );
};
