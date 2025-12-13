import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', fullWidth = true, ...props }, ref) => {
    
    // Standardized Input Styles
    const baseStyles = "appearance-none rounded-xl border bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-900 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-200 text-sm font-medium h-11";
    
    // Border & Error Logic
    const stateStyles = error 
      ? "border-red-300 dark:border-red-800 focus:border-red-500 focus:ring-red-500/10 bg-red-50/50 dark:bg-red-900/10" 
      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600";

    const widthClass = fullWidth ? 'w-full' : '';
    const iconPadding = icon ? (document.dir === 'rtl' ? 'pr-11 pl-4' : 'pl-11 pr-4') : 'px-4';

    return (
      <div className={`${widthClass} ${className}`}>
        {label && (
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pr-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors z-10">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`${baseStyles} ${stateStyles} ${widthClass} ${iconPadding} py-2.5`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500 font-medium animate-fadeIn flex items-center gap-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';