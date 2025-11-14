import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

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

interface ImageCropperProps {
  imageSrc: string;
  aspectRatio: number;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

/**
 * Utility function to create a cropped image using Canvas API
 */
const getCroppedImage = async (
  imageSrc: string,
  croppedAreaPixels: Area
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Set canvas size to cropped area
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      
      // Draw cropped portion
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        0.95
      );
    };
    
    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
};

/**
 * Utility function to convert blob to base64
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

function ImageCropper({ imageSrc, aspectRatio, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const onCropChange = useCallback((location: Point) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleGenerate = async () => {
    if (!croppedAreaPixels) {
      return;
    }

    setIsGenerating(true);

    try {
      const croppedImage = await getCroppedImage(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="image-cropper-container">
      <h3 className="cropper-title">Adjust Your Photo</h3>
      
      <div className="cropper-wrapper">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteCallback}
        />
      </div>

      <div className="cropper-controls">
        <p className="cropper-instructions">
          💡 Drag to reposition, zoom to adjust size
        </p>

        <div className="zoom-control">
          <label htmlFor="zoom-slider" className="zoom-label">
            Zoom: {Math.round(zoom * 100)}%
          </label>
          <input
            id="zoom-slider"
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="zoom-slider"
            disabled={isGenerating}
          />
        </div>

        <div className="cropper-buttons">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-cancel"
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            className="btn-generate"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              'Generate with Frame'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropper;
