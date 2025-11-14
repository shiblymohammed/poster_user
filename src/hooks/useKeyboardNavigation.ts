import { useEffect, useCallback } from 'react';

interface KeyboardNavigationOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onSpace?: () => void;
  enabled?: boolean;
}

/**
 * Custom hook for keyboard navigation support
 * Provides consistent keyboard interaction patterns across components
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
  const {
    onEnter,
    onEscape,
    onArrowLeft,
    onArrowRight,
    onArrowUp,
    onArrowDown,
    onSpace,
    enabled = true
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    switch (event.key) {
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight();
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown();
        }
        break;
      case ' ':
        if (onSpace) {
          event.preventDefault();
          onSpace();
        }
        break;
    }
  }, [enabled, onEnter, onEscape, onArrowLeft, onArrowRight, onArrowUp, onArrowDown, onSpace]);

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [enabled, handleKeyDown]);
}

/**
 * Helper function to create keyboard event handler for individual elements
 */
export function createKeyboardHandler(
  callback: () => void,
  keys: string[] = ['Enter', ' ']
) {
  return (event: React.KeyboardEvent) => {
    if (keys.includes(event.key)) {
      event.preventDefault();
      callback();
    }
  };
}
