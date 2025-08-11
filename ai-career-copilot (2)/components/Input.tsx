import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, name, ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1.5">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className="block w-full px-4 py-2.5 border border-border rounded-xl shadow-sm placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent sm:text-sm bg-card/50 backdrop-blur-sm transition-colors"
        {...props}
      />
    </div>
  );
};