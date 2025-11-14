import React from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary' 
}) => {
  const prefersReducedMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  const colorClasses = {
    primary: 'border-primary border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent'
  };

  // For reduced motion, show a static pulsing circle instead of spinning
  if (prefersReducedMotion) {
    const staticColorClasses = {
      primary: 'border-primary',
      white: 'border-white',
      gray: 'border-gray-400'
    };

    return (
      <div 
        className={`${sizeClasses[size]} ${staticColorClasses[color]} rounded-full border-solid opacity-60`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div 
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
