import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'frame' | 'image' | 'text';
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = 'image',
  className = ''
}) => {
  const variants = {
    frame: (
      <div className={`animate-pulse ${className}`}>
        <div className="h-96 bg-gray-300 rounded-3xl"></div>
        <div className="mt-4 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    ),
    image: (
      <div className={`animate-pulse ${className}`}>
        <div className="aspect-square bg-gray-300 rounded-2xl"></div>
      </div>
    ),
    text: (
      <div className={`animate-pulse space-y-2 ${className}`}>
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        <div className="h-4 bg-gray-300 rounded w-4/6"></div>
      </div>
    )
  };

  return variants[variant];
};

export default SkeletonLoader;
