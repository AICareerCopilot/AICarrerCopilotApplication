import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, icon }) => {
  return (
    <div className="bg-card/60 backdrop-blur-2xl shadow-xl shadow-black/25 rounded-2xl border border-border transition-all duration-300 hover:border-accent/30">
      {title && (
        <div className="px-4 py-4 sm:px-6 border-b border-border">
          <div className="flex items-center space-x-3">
            {icon}
            <h3 className="text-base leading-6 font-semibold text-text-primary">
              {title}
            </h3>
          </div>
        </div>
      )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};