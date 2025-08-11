import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center px-5 py-2.5 rounded-xl shadow-sm text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'border-transparent text-white bg-gradient-to-r from-brand-violet to-brand-cyan hover:brightness-110 hover:shadow-lg hover:shadow-brand-violet/20 transform hover:-translate-y-0.5',
    secondary: 'border-transparent text-accent-light bg-accent/10 hover:bg-accent/20 focus:ring-accent',
    outline: 'border-border text-text-secondary bg-transparent hover:bg-white/5 focus:ring-accent',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};