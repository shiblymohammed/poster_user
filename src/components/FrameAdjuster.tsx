import { useState, useEffect, useRef } from 'react';

interface FrameAdjusterProps {
  croppedImageSrc: string;
  frameUrl: string;
  onConfirm: (adjustedImageBlob: Blob, adjustments: FrameAdjustments) => void;
  onBack: () => void;
}

export interface FrameAdjustments {
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  framePosition: 'front' | 'back';
}

function FrameAdjuster({ croppedImageSrc, frameUrl, onConfirm, onBack }: FrameAdjusterProps) {
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [framePosition, setFramePosition] = useState<'front' | 'back'>('front');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Generate preview whenever adjustments change
  useEffect(() => {
    generatePreview();
  }, [rotation, flipHorizontal, flipVertical, framePosition, croppedImageSrc, frameUrl]);

  const generatePreview = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      // Load images
      const userImage = await loadImage(croppedImageSrc);
      const frameImage = await loadImage(frameUrl);

      // Set canvas size to match user image
      canvas.width = userImage.width;
      canvas.height = userImage.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save context state
      ctx.save();

      // Draw based on frame position
      if (framePosition === 'back') {
        // Frame behind: draw frame first, then user image
        drawFrame(ctx, frameImage, canvas.width, canvas.height);
        drawUserImage(ctx, userImage, canvas.width, canvas.height);
      } else {
        // Frame in front: draw user image first, then frame
        drawUserImage(ctx, userImage, canvas.width, canvas.height);
        drawFrame(ctx, frameImage, canvas.width, canvas.height);
      }

      // Restore context state
      ctx.restore();

      // Convert canvas to preview URL
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

  const drawUserImage = (
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    width: number,
    height: number
  ) => {
    // Draw user image without transformations (keep it static)
    ctx.drawImage(image, 0, 0, width, height);
  };

  const drawFrame = (
    ctx: CanvasRenderingContext2D,
    frame: HTMLImageElement,
    width: number,
    height: number
  ) => {
    ctx.save();

    // Move to center for transformations
    ctx.translate(width / 2, height / 2);

    // Apply rotation to frame
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply flips to frame
    const scaleX = flipHorizontal ? -1 : 1;
    const scaleY = flipVertical ? -1 : 1;
    ctx.scale(scaleX, scaleY);

    // Draw frame centered with transformations
    ctx.drawImage(frame, -width / 2, -height / 2, width, height);

    ctx.restore();
  };

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFlipHorizontal = () => {
    setFlipHorizontal((prev) => !prev);
  };

  const handleFlipVertical = () => {
    setFlipVertical((prev) => !prev);
  };

  const handleTogglePosition = () => {
    setFramePosition((prev) => (prev === 'front' ? 'back' : 'front'));
  };

  const handleReset = () => {
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setFramePosition('front');
  };

  const handleConfirm = async () => {
    setIsGenerating(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas not available');
      }

      // Convert canvas to blob
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

      const adjustments: FrameAdjustments = {
        rotation,
        flipHorizontal,
        flipVertical,
        framePosition,
      };

      onConfirm(blob, adjustments);
    } catch (error) {
      console.error('Error generating final image:', error);
      alert('Failed to generate image. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="frame-adjuster-container">
      <h3 className="adjuster-title">Adjust Frame</h3>
      <p className="adjuster-subtitle">Rotate, flip, or reposition the frame</p>

      {/* Preview Canvas */}
      <div className="preview-section">
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        {previewUrl && (
          <div className="preview-container">
            <img src={previewUrl} alt="Preview" className="preview-image" />
          </div>
        )}
      </div>

      {/* Adjustment Controls */}
      <div className="adjustment-controls">
        {/* Rotation Controls */}
        <div className="control-group">
          <h4 className="control-title">Rotate Frame</h4>
          <div className="control-buttons">
            <button
              type="button"
              onClick={handleRotateLeft}
              className="control-btn"
              disabled={isGenerating}
              title="Rotate frame left 90°"
            >
              ↶ Left
            </button>
            <span className="rotation-display">{rotation}°</span>
            <button
              type="button"
              onClick={handleRotateRight}
              className="control-btn"
              disabled={isGenerating}
              title="Rotate frame right 90°"
            >
              ↷ Right
            </button>
          </div>
        </div>

        {/* Flip Controls */}
        <div className="control-group">
          <h4 className="control-title">Flip Frame</h4>
          <div className="control-buttons">
            <button
              type="button"
              onClick={handleFlipHorizontal}
              className={`control-btn ${flipHorizontal ? 'active' : ''}`}
              disabled={isGenerating}
              title="Flip frame horizontally"
            >
              ⇄ Horizontal
            </button>
            <button
              type="button"
              onClick={handleFlipVertical}
              className={`control-btn ${flipVertical ? 'active' : ''}`}
              disabled={isGenerating}
              title="Flip frame vertically"
            >
              ⇅ Vertical
            </button>
          </div>
        </div>

        {/* Frame Position Control */}
        <div className="control-group">
          <h4 className="control-title">Frame Position</h4>
          <div className="control-buttons">
            <button
              type="button"
              onClick={handleTogglePosition}
              className={`control-btn position-btn ${framePosition === 'front' ? 'active' : ''}`}
              disabled={isGenerating}
              title="Toggle frame position"
            >
              {framePosition === 'front' ? '🖼️ Frame in Front' : '🖼️ Frame Behind'}
            </button>
          </div>
          <p className="control-hint">
            {framePosition === 'front'
              ? 'Frame overlays your image (default)'
              : 'Frame appears behind your image'}
          </p>
        </div>

        {/* Reset Button */}
        <div className="control-group">
          <button
            type="button"
            onClick={handleReset}
            className="control-btn reset-btn"
            disabled={isGenerating}
          >
            🔄 Reset All
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="adjuster-buttons">
        <button
          type="button"
          onClick={onBack}
          className="btn-back"
          disabled={isGenerating}
        >
          ← Back to Crop
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="btn-confirm"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="spinner"></span>
              Generating...
            </>
          ) : (
            'Generate Image'
          )}
        </button>
      </div>
    </div>
  );
}

export default FrameAdjuster;
