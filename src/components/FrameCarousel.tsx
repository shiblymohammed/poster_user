import { useState, useEffect, useRef } from 'react';
import SkeletonLoader from './SkeletonLoader';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

interface Frame {
  id: number;
  name: string;
  frame_url: string;
  is_default: boolean;
}

interface FrameCarouselProps {
  slug: string;
  onFrameSelect: (frame: Frame) => void;
}

function FrameCarousel({ slug, onFrameSelect }: FrameCarouselProps) {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageLoading, setImageLoading] = useState(true);
  
  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    fetchFrames();
  }, [slug]);

  useEffect(() => {
    // Reset image loading when frame changes
    setImageLoading(true);
  }, [currentIndex]);

  const fetchFrames = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/campaign/slug/${slug}/frames/`);
      
      if (!response.ok) {
        throw new Error('Failed to load frames');
      }
      
      const data = await response.json();
      setFrames(data.frames || []);
      
      // Set default frame as current
      const defaultIndex = data.frames.findIndex((f: Frame) => f.is_default);
      setCurrentIndex(defaultIndex >= 0 ? defaultIndex : 0);
    } catch (err) {
      setError('Failed to load frames');
      console.error('Error fetching frames:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? frames.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === frames.length - 1 ? 0 : prev + 1));
  };

  const handleChoose = () => {
    if (frames[currentIndex]) {
      onFrameSelect(frames[currentIndex]);
    }
  };

  const handleDotClick = (index: number) => {
    if (index !== currentIndex) {
      // Trigger a brief animation effect
      setImageLoading(true);
      setCurrentIndex(index);
    }
  };

  // Keyboard navigation support
  useKeyboardNavigation({
    onArrowLeft: handlePrevious,
    onArrowRight: handleNext,
    onEnter: handleChoose,
    enabled: !loading && frames.length > 0
  });

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Swipe gesture handlers with conflict resolution
  const minSwipeDistance = 50; // Minimum distance for a swipe
  const maxDragOffset = 100; // Maximum drag distance with resistance
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    touchStartY.current = e.targetTouches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null || touchStartY.current === null) return;
    
    const currentTouch = e.targetTouches[0].clientX;
    const currentTouchY = e.targetTouches[0].clientY;
    
    // Calculate horizontal and vertical movement
    const diffX = Math.abs(currentTouch - touchStart);
    const diffY = Math.abs(currentTouchY - touchStartY.current);
    
    // Gesture conflict resolution: prioritize horizontal swipe over vertical scroll
    if (diffX > diffY && diffX > 10) {
      // Horizontal swipe detected - prevent vertical scroll
      e.preventDefault();
      
      let diff = currentTouch - touchStart;
      
      // Add resistance at boundaries
      const isAtStart = currentIndex === 0 && diff > 0;
      const isAtEnd = currentIndex === frames.length - 1 && diff < 0;
      
      if (isAtStart || isAtEnd) {
        // Apply resistance: reduce movement by 70%
        diff = diff * 0.3;
      }
      
      // Limit maximum drag offset
      diff = Math.max(-maxDragOffset, Math.min(maxDragOffset, diff));
      
      setTouchEnd(currentTouch);
      setDragOffset(diff);
    } else if (diffY > diffX && diffY > 10) {
      // Vertical scroll detected - allow default scroll behavior
      setIsDragging(false);
      setDragOffset(0);
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      setDragOffset(0);
      touchStartY.current = null;
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < frames.length - 1) {
      handleNext();
    } else if (isRightSwipe && currentIndex > 0) {
      handlePrevious();
    }

    // Reset state with snap back animation
    setIsDragging(false);
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
    touchStartY.current = null;
  };

  if (loading) {
    return (
      <div className="px-4 py-8">
        <SkeletonLoader variant="frame" />
      </div>
    );
  }

  if (error || frames.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-180px)] px-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
          <p className="text-white text-lg">{error || 'No frames available'}</p>
        </div>
      </div>
    );
  }

  const currentFrame = frames[currentIndex];

  return (
    <div className="flex flex-col h-[calc(100vh-60px)]">
      {/* Full-Screen Frame Display Area */}
      <div 
        className="h-[calc(100vh-180px)] flex items-center justify-center px-4 relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-label="Frame carousel"
      >
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <SkeletonLoader variant="frame" />
          </div>
        )}
        <img
          src={currentFrame.frame_url}
          alt={`${currentFrame.name} - Frame ${currentIndex + 1} of ${frames.length}`}
          className={`max-h-full max-w-full object-contain rounded-2xl shadow-2xl transition-opacity duration-300 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            transform: `translateX(${dragOffset}px)`,
            transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onLoad={handleImageLoad}
        />
      </div>

      {/* Bottom Sheet with Frame Info and Action Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 pb-safe animate-slide-up">
        {/* Progress Dots */}
        {frames.length > 1 && (
          <div className="flex justify-center gap-2 mb-4" role="tablist" aria-label="Frame navigation">
            {frames.map((_, index) => (
              <button
                key={index}
                role="tab"
                aria-selected={index === currentIndex}
                aria-controls={`frame-${index}`}
                tabIndex={index === currentIndex ? 0 : -1}
                className={`h-2 rounded-full transition-all duration-300 touch-feedback ${
                  index === currentIndex
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => handleDotClick(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDotClick(index);
                  }
                }}
                aria-label={`Go to frame ${index + 1}${index === currentIndex ? ' (current)' : ''}`}
                style={{
                  minWidth: index === currentIndex ? '32px' : '8px',
                  minHeight: '8px'
                }}
              />
            ))}
          </div>
        )}

        {/* Frame Name and Counter */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {currentFrame.name}
          </h3>
          <p className="text-sm text-gray-500">
            Frame {currentIndex + 1} of {frames.length}
          </p>
        </div>

        {/* Choose This Frame Button */}
        <button
          className="w-full bg-primary text-white py-4 rounded-2xl font-semibold touch-feedback"
          onClick={handleChoose}
          aria-label={`Choose ${currentFrame.name}`}
        >
          Choose This Frame
        </button>
      </div>
    </div>
  );
}

export default FrameCarousel;
