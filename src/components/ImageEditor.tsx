import { useState, useEffect, useRef } from 'react';
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical, RotateCcw as Reset, Save, X } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

interface ImageEditorProps {
  imageUrl: string;
  frameUrl: string;
  onSave: (editedBlob: Blob) => void;
  onCancel: () => void;
}

interface Point {
  x: number;
  y: number;
}

function ImageEditor({ imageUrl, frameUrl, onSave, onCancel }: ImageEditorProps) {
  // Frame transformations
  const [frameRotation, setFrameRotation] = useState(0);
  const [frameFlipH, setFrameFlipH] = useState(false);
  const [frameFlipV, setFrameFlipV] = useState(false);
  
  // Image positioning
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState<Point>({ x: 0, y: 0 });
  
  // Pinch/pan gesture state
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialZoom, setInitialZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [dragStartPosition, setDragStartPosition] = useState<Point>({ x: 0, y: 0 });
  
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    generatePreview();
  }, [frameRotation, frameFlipH, frameFlipV, imageZoom, imagePosition, imageUrl, frameUrl]);

  const generatePreview = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const userImage = await loadImage(imageUrl);
      const frameImage = await loadImage(frameUrl);

      canvas.width = userImage.width;
      canvas.height = userImage.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw user image with zoom and pan (static orientation)
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.translate(imagePosition.x, imagePosition.y);
      ctx.scale(imageZoom, imageZoom);
      ctx.drawImage(
        userImage,
        -userImage.width / 2,
        -userImage.height / 2,
        userImage.width,
        userImage.height
      );
      ctx.restore();

      // Draw frame on top WITH transformations
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((frameRotation * Math.PI) / 180);
      
      const scaleX = frameFlipH ? -1 : 1;
      const scaleY = frameFlipV ? -1 : 1;
      ctx.scale(scaleX, scaleY);
      
      ctx.drawImage(
        frameImage,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height
      );
      ctx.restore();

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

  const handleRotateLeft = () => {
    setFrameRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleRotateRight = () => {
    setFrameRotation((prev) => (prev + 90) % 360);
  };

  const handleFlipHorizontal = () => {
    setFrameFlipH((prev) => !prev);
  };

  const handleFlipVertical = () => {
    setFrameFlipV((prev) => !prev);
  };

  const handleReset = () => {
    setFrameRotation(0);
    setFrameFlipH(false);
    setFrameFlipV(false);
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

  // Touch gesture handlers
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setInitialPinchDistance(distance);
      setInitialZoom(imageZoom);
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setDragStartPosition({ ...imagePosition });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance !== null) {
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialPinchDistance;
      const newZoom = Math.min(3, Math.max(0.5, initialZoom * scale));
      setImageZoom(newZoom);
    } else if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStart.x;
      const dy = e.touches[0].clientY - dragStart.y;
      setImagePosition({
        x: dragStartPosition.x + dx,
        y: dragStartPosition.y + dy
      });
    }
  };

  const handleTouchEnd = () => {
    setInitialPinchDistance(null);
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragStartPosition({ ...imagePosition });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setImagePosition({
        x: dragStartPosition.x + dx,
        y: dragStartPosition.y + dy
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setImageZoom((prev) => Math.min(3, Math.max(0.5, prev * delta)));
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSaving(true);

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/png',
          0.95
        );
      });

      onSave(blob);
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save changes. Please try again.');
      setSaving(false);
    }
  };

  useKeyboardNavigation({
    onEscape: onCancel,
    onEnter: handleSave,
    onArrowLeft: handleRotateLeft,
    onArrowRight: handleRotateRight,
    enabled: !saving
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={onCancel}
            disabled={saving}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 font-body"
          >
            <X className="w-5 h-5" />
            <span>Cancel</span>
          </button>
          <span className="text-sm text-gray-500 font-body">Adjust Frame</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 font-body font-semibold"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </header>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Preview Area */}
      <div 
        className="flex-1 flex items-center justify-center p-4 bg-gray-50"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {previewUrl ? (
          <div className="max-w-4xl w-full">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-auto rounded-lg shadow-lg pointer-events-none"
            />
            <p className="text-center text-sm text-gray-600 font-body mt-4">
              Drag to reposition • Pinch or scroll to zoom
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={`w-12 h-12 border-4 border-primary border-t-transparent rounded-full ${!prefersReducedMotion && 'animate-spin'}`}></div>
            <p className="text-gray-600 font-body">Loading preview...</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="border-t border-gray-200 bg-white">
        {/* Zoom Slider */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <label htmlFor="zoom-slider" className="text-sm text-gray-700 font-body font-medium whitespace-nowrap">
              Image Zoom
            </label>
            <input
              id="zoom-slider"
              type="range"
              min={0.5}
              max={3}
              step={0.1}
              value={imageZoom}
              onChange={(e) => setImageZoom(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="text-sm text-gray-700 font-body font-medium w-12 text-right">
              {Math.round(imageZoom * 100)}%
            </span>
          </div>
        </div>

        {/* Frame Controls */}
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-xs text-gray-600 font-body mb-3 text-center">Frame Adjustments</p>
            <div className="grid grid-cols-5 gap-2">
              <button
                onClick={handleRotateLeft}
                disabled={saving}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-white transition-colors disabled:opacity-50 bg-white"
              >
                <RotateCcw className="w-5 h-5 text-gray-700" />
                <span className="text-xs text-gray-700 font-body">Rotate Left</span>
              </button>

              <button
                onClick={handleRotateRight}
                disabled={saving}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-white transition-colors disabled:opacity-50 bg-white"
              >
                <RotateCw className="w-5 h-5 text-gray-700" />
                <span className="text-xs text-gray-700 font-body">Rotate Right</span>
              </button>

              <button
                onClick={handleFlipHorizontal}
                disabled={saving}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors disabled:opacity-50 ${
                  frameFlipH ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-white bg-white'
                }`}
              >
                <FlipHorizontal className={`w-5 h-5 ${frameFlipH ? 'text-primary' : 'text-gray-700'}`} />
                <span className={`text-xs font-body ${frameFlipH ? 'text-primary font-semibold' : 'text-gray-700'}`}>Flip H</span>
              </button>

              <button
                onClick={handleFlipVertical}
                disabled={saving}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors disabled:opacity-50 ${
                  frameFlipV ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-white bg-white'
                }`}
              >
                <FlipVertical className={`w-5 h-5 ${frameFlipV ? 'text-primary' : 'text-gray-700'}`} />
                <span className={`text-xs font-body ${frameFlipV ? 'text-primary font-semibold' : 'text-gray-700'}`}>Flip V</span>
              </button>

              <button
                onClick={handleReset}
                disabled={saving || (frameRotation === 0 && !frameFlipH && !frameFlipV && imageZoom === 1 && imagePosition.x === 0 && imagePosition.y === 0)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-white transition-colors disabled:opacity-50 bg-white"
              >
                <Reset className="w-5 h-5 text-gray-700" />
                <span className="text-xs text-gray-700 font-body">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageEditor;
