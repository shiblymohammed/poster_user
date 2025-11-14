import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface SuccessAnimationProps {
  message?: string;
  onComplete?: () => void;
  duration?: number; // milliseconds
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ 
  message = 'Success!',
  onComplete,
  duration = 2000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Trigger animations
    setIsVisible(true);

    // Call onComplete after duration (shorter for reduced motion)
    if (onComplete) {
      const completeDuration = prefersReducedMotion ? 500 : duration;
      const timer = setTimeout(onComplete, completeDuration);
      return () => clearTimeout(timer);
    }
  }, [onComplete, duration, prefersReducedMotion]);

  // For reduced motion, show immediately without animations
  if (prefersReducedMotion) {
    return (
      <div className="flex flex-col items-center justify-center">
        {/* Checkmark Icon - Static */}
        <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mb-4">
          <svg 
            className="w-12 h-12 text-white"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={3} 
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        
        {/* Celebration Text - Static */}
        <p className="text-xl font-semibold text-success">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Checkmark Icon with Scale Animation */}
      <div 
        className={`w-20 h-20 bg-success rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
      >
        <svg 
          className="w-12 h-12 text-white"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={3} 
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      
      {/* Celebration Text with Fade-in */}
      <p 
        className={`text-xl font-semibold text-success transition-all duration-700 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {message}
      </p>
    </div>
  );
};

export default SuccessAnimation;
