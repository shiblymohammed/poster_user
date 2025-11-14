import { useState, useEffect, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

// Type definitions for react-easy-crop
interface Point {
  x: number;
  y: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Frame {
  id: number;
  name: string;
  frame_url: string;
}

interface SizeOption {
  id: string;
  name: string;
  ratio: string;
  width: number;
  height: number;
  icon: string;
  aspectRatio: number;
}

interface SizeTabsPreviewProps {
  uploadedImage: File;
  selectedFrame: Frame;
  onNext: (size: string, croppedBlob: Blob) => Promise<void>;
  onBack: () => void;
}

const SIZE_OPTIONS: SizeOption[] = [
  {
    id: 'instagram_post',
    name: 'Instagram Post',
    ratio: '1:1',
    width: 1080,
    height: 1080,
    icon: '📷',
    aspectRatio: 1 / 1
  },
  {
    id: 'instagram_story',
    name: 'Instagram Story',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    icon: '📲',
    aspectRatio: 9 / 16
  },
  {
    id: 'whatsapp_dp',
    name: 'WhatsApp DP',
    ratio: '1:1',
    width: 500,
    height: 500,
    icon: '💬',
    aspectRatio: 1 / 1
  }
];

function SizeTabsPreview({ uploadedImage, selectedFrame, onNext, onBack }: SizeTabsPreviewProps) {
  const [selectedSize, setSelectedSize] = useState<SizeOption>(SIZE_OPTIONS[0]);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  // Pinch-to-zoom gesture state
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialZoom, setInitialZoom] = useState<number>(1);
  
  // Drag gesture state for visual feedback
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Create object URL for uploaded image
    const url = URL.createObjectURL(uploadedImage);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [uploadedImage]);

  useEffect(() => {
    if (imageUrl && croppedAreaPixels) {
      generatePreview();
    }
  }, [imageUrl, selectedSize, selectedFrame, croppedAreaPixels]);

  const onCropChange = useCallback((location: Point) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const generatePreview = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !croppedAreaPixels) return;

    try {
      const userImage = await loadImage(imageUrl);

      const { width, height } = selectedSize;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw ONLY the cropped user image (no frame during cropping)
      ctx.drawImage(
        userImage,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        width,
        height
      );

      // Convert to preview URL
      const dataUrl = canvas.toDataURL('image/png', 0.95);
      setPreviewUrl(dataUrl);
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Calculate distance between two touch points
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle pinch-to-zoom and drag gestures with conflict resolution
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture started - prioritize over drag
      e.preventDefault(); // Prevent default browser behavior
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setInitialPinchDistance(distance);
      setInitialZoom(zoom);
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      // Single touch - potential drag (handled by react-easy-crop)
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance !== null) {
      // Pinch gesture in progress - prevent all default behaviors
      e.preventDefault(); // Prevent default browser zoom and scroll
      e.stopPropagation(); // Stop event from bubbling
      
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialPinchDistance;
      
      // Calculate new zoom level (between 1 and 3)
      const newZoom = Math.min(3, Math.max(1, initialZoom * scale));
      setZoom(newZoom);
      setIsDragging(false);
    }
    // Single touch drag is handled by react-easy-crop internally
    // Don't preventDefault for single touch to allow react-easy-crop to work
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      // Pinch gesture ended
      setInitialPinchDistance(null);
    }
    if (e.touches.length === 0) {
      // All touches ended
      setIsDragging(false);
    }
  };

  const handleNext = async () => {
    if (!croppedAreaPixels) {
      console.error('No crop area defined');
      return;
    }

    setIsGenerating(true);

    try {
      // Create a new canvas for the final cropped image
      const canvas = document.createElement('canvas');
      const { width, height } = selectedSize;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Load the user image
      const userImage = await loadImage(imageUrl);

      // Draw the cropped portion of the user image
      ctx.drawImage(
        userImage,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        width,
        height
      );

      // Convert canvas to blob
      canvas.toBlob(
        async (blob) => {
          if (blob) {
            try {
              await onNext(selectedSize.id, blob);
            } catch (error) {
              console.error('Error in onNext:', error);
              setIsGenerating(false);
            }
          } else {
            console.error('Failed to create blob from canvas');
            setIsGenerating(false);
          }
        },
        'image/png',
        0.95
      );
    } catch (error) {
      console.error('Error generating cropped image:', error);
      setIsGenerating(false);
    }
  };

  // Keyboard navigation support
  useKeyboardNavigation({
    onEscape: onBack,
    onEnter: handleNext,
    onArrowLeft: () => {
      const currentIdx = SIZE_OPTIONS.findIndex(s => s.id === selectedSize.id);
      if (currentIdx > 0) {
        setSelectedSize(SIZE_OPTIONS[currentIdx - 1]);
      }
    },
    onArrowRight: () => {
      const currentIdx = SIZE_OPTIONS.findIndex(s => s.id === selectedSize.id);
      if (currentIdx < SIZE_OPTIONS.length - 1) {
        setSelectedSize(SIZE_OPTIONS[currentIdx + 1]);
      }
    },
    enabled: !isGenerating
  });

  return (
    <div className="min-h-screen-mobile bg-black flex flex-col page-transition">
      {/* Generation Loading Modal */}
      {isGenerating && (
        <div className={`fixed inset-0 bg-gradient-to-br from-primary to-secondary flex items-center justify-center z-modal ${!prefersReducedMotion && 'animate-backdrop-fade'}`} role="dialog" aria-modal="true" aria-labelledby="generating-title">
          <div className={`text-center text-white ${!prefersReducedMotion && 'animate-slide-up'}`}>
            <div className="relative mb-6" role="status" aria-label="Generating image">
              <div className="w-32 h-32 border-4 border-white/20 rounded-full"></div>
              {!prefersReducedMotion ? (
                <>
                  <div className="absolute inset-0 w-32 h-32 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-4 w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-5xl animate-pulse" aria-hidden="true">✨</span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-4 w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-5xl" aria-hidden="true">✨</span>
                </div>
              )}
            </div>
            <h3 id="generating-title" className="font-display text-2xl mb-2">Creating Magic <span aria-hidden="true">✨</span></h3>
            <p className="text-white/80">Applying your frame...</p>
          </div>
        </div>
      )}

      {/* Top Bar with Cancel and Done buttons */}
      <div className="bg-black/50 backdrop-blur-lg px-4 py-3 flex justify-between items-center">
        <button
          onClick={onBack}
          className="text-white text-base font-medium touch-feedback dark-focus"
          aria-label="Cancel and go back to upload"
        >
          Cancel
        </button>
        <button
          onClick={handleNext}
          className="text-yellow-400 text-base font-semibold touch-feedback dark-focus"
          aria-label="Done and generate image"
        >
          Done
        </button>
      </div>

      {/* Preview Canvas (hidden) */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Full-Screen Image Cropper */}
      <div 
        className="flex-1 relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-label="Image cropper - pinch to zoom, drag to reposition"
      >
        {imageUrl && (
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={selectedSize.aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: {
                backgroundColor: '#000',
                borderRadius: '1rem',
                cursor: isDragging ? 'grabbing' : 'grab'
              }
            }}
          />
        )}
        
        {/* Visual feedback for drag gesture */}
        {isDragging && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-lg px-4 py-2 rounded-full text-white text-sm pointer-events-none">
            Drag to reposition
          </div>
        )}
      </div>

      {/* Mini Preview - Cropped Image Only (Frame applied by backend) */}
      {previewUrl && (
        <div className="px-4 py-3" role="region" aria-label="Preview of cropped image">
          <div className="w-24 h-24 mx-auto rounded-xl shadow-lg overflow-hidden">
            <img
              src={previewUrl}
              alt={`Preview of cropped ${selectedSize.name}`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Icon-Based Size Selector */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide scroll-smooth-mobile" role="group" aria-label="Size options">
        {SIZE_OPTIONS.map((size) => (
          <button
            key={size.id}
            onClick={() => setSelectedSize(size)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedSize(size);
              }
            }}
            tabIndex={selectedSize.id === size.id ? 0 : -1}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all touch-feedback dark-focus ${
              selectedSize.id === size.id
                ? 'bg-yellow-400 text-black'
                : 'bg-white/20 text-white'
            }`}
            aria-label={`Select ${size.name} size (${size.ratio})${selectedSize.id === size.id ? ' (current)' : ''}`}
            aria-pressed={selectedSize.id === size.id}
          >
            <span className="mr-1" aria-hidden="true">{size.icon}</span>
            {size.name.split(' ')[1] || size.name}
          </button>
        ))}
      </div>

      {/* Zoom Slider Control */}
      <div className="px-4 py-3 pb-safe">
        <div className="flex items-center gap-3">
          <label htmlFor="zoom-slider" className="text-white text-sm flex-shrink-0">Zoom</label>
          <input
            id="zoom-slider"
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #facc15 0%, #facc15 ${((zoom - 1) / 2) * 100}%, rgba(255,255,255,0.2) ${((zoom - 1) / 2) * 100}%, rgba(255,255,255,0.2) 100%)`
            }}
            aria-label="Adjust zoom level from 100% to 300%"
            aria-valuemin={100}
            aria-valuemax={300}
            aria-valuenow={Math.round(zoom * 100)}
          />
          <span className="text-white text-sm flex-shrink-0" aria-live="polite">{Math.round(zoom * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

export default SizeTabsPreview;
