import React, { useEffect, useState } from 'react';

interface ErrorToastProps {
  message: string;
  onDismiss: () => void;
  autoHideDuration?: number; // milliseconds
}

const ErrorToast: React.FC<ErrorToastProps> = ({ 
  message, 
  onDismiss,
  autoHideDuration = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-down animation
    setIsVisible(true);

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      handleDismiss();
    }, autoHideDuration);

    return () => clearTimeout(timer);
  }, [autoHideDuration]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Wait for animation to complete
  };

  return (
    <div 
      className={`fixed top-4 left-4 right-4 bg-error text-white px-4 py-3 rounded-xl shadow-lg z-tooltip transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
      role="alert"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl" aria-hidden="true">⚠️</span>
        <p className="flex-1 font-medium">{message}</p>
        <button 
          onClick={handleDismiss}
          className="text-white/80 hover:text-white transition-colors touch-feedback"
          aria-label="Dismiss error"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ErrorToast;
