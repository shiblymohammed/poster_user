import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  showPercentage?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  showPercentage = true,
  className = ''
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={className}>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showPercentage && (
        <p className="text-center text-sm text-gray-600 mt-2">
          {Math.round(clampedProgress)}%
        </p>
      )}
    </div>
  );
};

export default ProgressBar;
