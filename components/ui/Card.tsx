import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-transparent dark:border-gray-700/50 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};