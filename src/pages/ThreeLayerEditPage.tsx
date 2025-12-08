import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ZoomIn, ZoomOut, RotateCw, RefreshCw } from 'lucide-react';
import axiosInstance from '../api/axios';

interface LocationState {
  selectedPoster: {
    id: number;
    name: string;
    poster_url: string;
  };
  selectedFrame: {
    id: number;
    name: string;
    frame_url: string;
  };
  campaign: {
    name: string;
    code: string;
  };
  slug: string;
  profileData: string;
}

function ThreeLayerEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [profilePosition, setProfilePosition] = useState({
    x: 540, // Will be updated when poster loads
    y: 540, // Will be updated when poster loads
    scale: 1.0,
    rotation: 0
  });
  
  const [cropShape, setCropShape] = useState<'circle' | 'square' | 'rectangle'>('circle');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [posterImg, setPosterImg] = useState<HTMLImageElement | null>(null);
  const [profileImg, setProfileImg] = useState<HTMLImageElement | null>(null);
  const [frameImg, setFrameImg] = useState<HTMLImageElement | null>(null);

  if (!state?.selectedPoster || !state?.profileData) {
    navigate('/');
    return null;
  }

  // Load images
  useEffect(() => {
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    Promise.all([
      loadImage(state.selectedPoster.poster_url),
      loadImage(state.profileData),
      loadImage(state.selectedFrame.frame_url)
    ]).then(([poster, profile, frame]) => {
      setPosterImg(poster);
      setProfileImg(profile);
      setFrameImg(frame);
      
      // Center profile based on actual poster dimensions
      setProfilePosition(prev => ({
        ...prev,
        x: poster.width / 2,
        y: poster.height / 2
      }));
    }).catch(err => {
      console.error('Error loading images:', err);
    });
  }, [state]);

  // Draw canvas
  useEffect(() => {
    if (!canvasRef.current || !posterImg || !profileImg || !frameImg) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate canvas size based on poster aspect ratio
    const maxSize = 600; // Maximum canvas dimension
    const posterAspectRatio = posterImg.width / posterImg.height;
    
    let canvasWidth, canvasHeight;
    if (posterAspectRatio > 1) {
      // Landscape: width is larger
      canvasWidth = maxSize;
      canvasHeight = maxSize / posterAspectRatio;
    } else if (posterAspectRatio < 1) {
      // Portrait: height is larger
      canvasHeight = maxSize;
      canvasWidth = maxSize * posterAspectRatio;
    } else {
      // Square
      canvasWidth = maxSize;
      canvasHeight = maxSize;
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw poster background (maintains aspect ratio)
    ctx.drawImage(posterImg, 0, 0, canvasWidth, canvasHeight);

    // Draw profile photo with selected crop shape
    const baseSize = Math.min(canvasWidth, canvasHeight) * 0.3;
    const profileX = (profilePosition.x / posterImg.width) * canvasWidth;
    const profileY = (profilePosition.y / posterImg.height) * canvasHeight;

    ctx.save();
    ctx.translate(profileX, profileY);
    ctx.rotate((profilePosition.rotation * Math.PI) / 180);

    // Helper function to draw rounded rectangle
    const roundRect = (x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    // Helper function to draw image with cover fit (no stretching)
    const drawImageCover = (img: HTMLImageElement, targetWidth: number, targetHeight: number) => {
      const imgAspect = img.width / img.height;
      const targetAspect = targetWidth / targetHeight;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (imgAspect > targetAspect) {
        // Image is wider - fit to height and crop width
        drawHeight = targetHeight;
        drawWidth = img.width * (targetHeight / img.height);
        offsetX = -(drawWidth - targetWidth) / 2;
        offsetY = 0;
      } else {
        // Image is taller - fit to width and crop height
        drawWidth = targetWidth;
        drawHeight = img.height * (targetWidth / img.width);
        offsetX = 0;
        offsetY = -(drawHeight - targetHeight) / 2;
      }
      
      ctx.drawImage(
        img,
        -targetWidth / 2 + offsetX,
        -targetHeight / 2 + offsetY,
        drawWidth,
        drawHeight
      );
    };

    // Create clip path based on crop shape
    if (cropShape === 'circle') {
      const profileSize = baseSize * profilePosition.scale;
      ctx.beginPath();
      ctx.arc(0, 0, profileSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      
      // Draw profile image with cover fit
      drawImageCover(profileImg, profileSize, profileSize);
    } else if (cropShape === 'square') {
      const profileSize = baseSize * profilePosition.scale;
      const radius = profileSize * 0.1; // 10% rounded corners
      roundRect(-profileSize / 2, -profileSize / 2, profileSize, profileSize, radius);
      ctx.clip();
      
      // Draw profile image with cover fit
      drawImageCover(profileImg, profileSize, profileSize);
    } else if (cropShape === 'rectangle') {
      // Portrait rectangle (taller than wide) - reduced height
      const profileWidth = baseSize * profilePosition.scale;
      const profileHeight = baseSize * profilePosition.scale * 1.3;
      const radius = profileWidth * 0.1; // 10% rounded corners
      roundRect(-profileWidth / 2, -profileHeight / 2, profileWidth, profileHeight, radius);
      ctx.clip();
      
      // Draw profile image with cover fit
      drawImageCover(profileImg, profileWidth, profileHeight);
    }

    ctx.restore();

    // Draw outline for visibility
    ctx.save();
    ctx.translate(profileX, profileY);
    ctx.rotate((profilePosition.rotation * Math.PI) / 180);
    
    if (cropShape === 'circle') {
      const profileSize = baseSize * profilePosition.scale;
      ctx.beginPath();
      ctx.arc(0, 0, profileSize / 2, 0, Math.PI * 2);
    } else if (cropShape === 'square') {
      const profileSize = baseSize * profilePosition.scale;
      const radius = profileSize * 0.1;
      roundRect(-profileSize / 2, -profileSize / 2, profileSize, profileSize, radius);
    } else if (cropShape === 'rectangle') {
      const profileWidth = baseSize * profilePosition.scale;
      const profileHeight = baseSize * profilePosition.scale * 1.3;
      const radius = profileWidth * 0.1;
      roundRect(-profileWidth / 2, -profileHeight / 2, profileWidth, profileHeight, radius);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw frame overlay (matches backend: aspect-fit, bottom-aligned)
    const scaleX = canvasWidth / frameImg.width;
    const scaleY = canvasHeight / frameImg.height;
    const scale = Math.min(scaleX, scaleY);
    
    const newFrameWidth = frameImg.width * scale;
    const newFrameHeight = frameImg.height * scale;
    
    // Calculate position: horizontally centered, vertically bottom-aligned
    const frameX = (canvasWidth - newFrameWidth) / 2;
    const frameY = canvasHeight - newFrameHeight;

    ctx.drawImage(frameImg, frameX, frameY, newFrameWidth, newFrameHeight);

  }, [posterImg, profileImg, frameImg, profilePosition, cropShape]);

  // Mouse/Touch handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current || !posterImg) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    // Scale based on actual poster dimensions, not hardcoded 1080
    const scaleX = posterImg.width / canvas.width;
    const scaleY = posterImg.height / canvas.height;

    setProfilePosition(prev => ({
      ...prev,
      x: Math.max(0, Math.min(posterImg.width, prev.x + deltaX * scaleX)),
      y: Math.max(0, Math.min(posterImg.height, prev.y + deltaY * scaleY))
    }));

    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current || !posterImg) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    // Scale based on actual poster dimensions, not hardcoded 1080
    const scaleX = posterImg.width / canvas.width;
    const scaleY = posterImg.height / canvas.height;

    setProfilePosition(prev => ({
      ...prev,
      x: Math.max(0, Math.min(posterImg.width, prev.x + deltaX * scaleX)),
      y: Math.max(0, Math.min(posterImg.height, prev.y + deltaY * scaleY))
    }));

    setDragStart({ x, y });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Scale controls
  const handleScaleChange = (delta: number) => {
    setProfilePosition(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(2.0, prev.scale + delta))
    }));
  };

  // Rotation
  const handleRotate = () => {
    setProfilePosition(prev => ({
      ...prev,
      rotation: (prev.rotation + 45) % 360
    }));
  };

  // Reset
  const handleReset = () => {
    if (posterImg) {
      setProfilePosition({
        x: posterImg.width / 2,
        y: posterImg.height / 2,
        scale: 1.0,
        rotation: 0
      });
    }
  };

  // Generate poster
  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const response = await axiosInstance.post('/api/generate-poster/', {
        code: state.campaign.code,
        poster_id: state.selectedPoster.id,
        frame_id: state.selectedFrame.id,
        profile_data: state.profileData,
        profile_position: profilePosition,
        crop_shape: cropShape,
        output_size: 'square_1080'
      });

      navigate(`/${state.slug}/result`, {
        state: {
          generatedImageUrl: response.data.generated_image_url,
          campaignName: state.campaign.name,
          slug: state.slug,
          selectedFrame: state.selectedFrame,
          selectedSize: 'square_1080'
        }
      });
    } catch (error: any) {
      console.error('Error generating poster:', error);
      alert(error.response?.data?.error || 'Failed to generate poster. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-body"
            disabled={isGenerating}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <span className="text-sm text-gray-500 font-body">Step 4 of 4</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-display text-gray-900 mb-3">
            Position Your Profile
          </h1>
          <p className="text-lg text-gray-600 font-body">
            Drag, zoom, and rotate to fit your profile in the frame
          </p>
        </div>

        {/* Canvas */}
        <div className="mb-6" ref={containerRef}>
          <div className="relative mx-auto" style={{ maxWidth: '600px' }}>
            <canvas
              ref={canvasRef}
              className="w-full h-auto border-2 border-gray-200 rounded-lg cursor-move touch-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
            {isDragging && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                  Drag to position
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-6">
          {/* Crop Shape Selector */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-body font-semibold text-gray-700 mb-3">
              Crop Shape
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setCropShape('circle')}
                className={`p-3 rounded-lg border-2 transition-all font-body text-sm ${
                  cropShape === 'circle'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full border-2 border-current"></div>
                  <span>Circle</span>
                </div>
              </button>
              <button
                onClick={() => setCropShape('square')}
                className={`p-3 rounded-lg border-2 transition-all font-body text-sm ${
                  cropShape === 'square'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 border-2 border-current rounded"></div>
                  <span>Square</span>
                </div>
              </button>
              <button
                onClick={() => setCropShape('rectangle')}
                className={`p-3 rounded-lg border-2 transition-all font-body text-sm ${
                  cropShape === 'rectangle'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-10 border-2 border-current rounded"></div>
                  <span>Portrait</span>
                </div>
              </button>
            </div>
          </div>

          {/* Zoom Control */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-body font-semibold text-gray-700 mb-2">
              Size: {Math.round(profilePosition.scale * 100)}%
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleScaleChange(-0.1)}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={profilePosition.scale <= 0.5}
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={profilePosition.scale}
                onChange={(e) => setProfilePosition(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                className="flex-1"
              />
              <button
                onClick={() => handleScaleChange(0.1)}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={profilePosition.scale >= 2.0}
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleRotate}
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-body flex items-center justify-center gap-2"
            >
              <RotateCw className="w-5 h-5" />
              Rotate 45°
            </button>
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-body flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Reset
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-body text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating Poster... (may take 30-60s)</span>
            </div>
          ) : (
            'Generate Poster'
          )}
        </button>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900 font-body">
            <strong>Tips:</strong> Drag the circular profile to move it. Use the slider to zoom in/out. 
            Click rotate to change angle. Your profile will always appear as a circle on the final poster.
          </p>
        </div>
      </main>
    </div>
  );
}

export default ThreeLayerEditPage;
