import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import Cropper from 'react-easy-crop';

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
}

// Utility function to create a cropped image
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
      
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      
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

function ProfileUploadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  
  // Cropper state
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  if (!state?.selectedPoster || !state?.selectedFrame) {
    navigate('/');
    return null;
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setShowCropper(true);
        setCroppedPreview(null);
      };
      reader.readAsDataURL(file);
    }
  };

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

  const handleCropConfirm = async () => {
    if (!uploadedImage || !croppedAreaPixels) return;

    setIsCropping(true);
    try {
      const croppedBlob = await getCroppedImage(uploadedImage, croppedAreaPixels);
      
      // Convert blob to base64 for preview and passing to next page
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCroppedPreview(base64);
        setShowCropper(false);
        setIsCropping(false);
      };
      reader.readAsDataURL(croppedBlob);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
      setIsCropping(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setUploadedImage(null);
    setCroppedPreview(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleContinue = () => {
    if (croppedPreview) {
      navigate(`/${state.slug}/edit`, {
        state: {
          ...state,
          profileData: croppedPreview,
        }
      });
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
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <span className="text-sm text-gray-500 font-body">Step 3 of 4</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-display text-gray-900 mb-3">
            Upload Profile Photo
          </h1>
          <p className="text-lg text-gray-600 font-body">
            This will be displayed as a circle on your poster
          </p>
        </div>

        {/* Selected Poster & Frame Preview */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 font-body mb-3">Your selections:</p>
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Poster:</p>
              <div className="flex items-center gap-2">
                <img
                  src={state.selectedPoster.poster_url}
                  alt={state.selectedPoster.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <span className="text-sm font-body font-semibold">{state.selectedPoster.name}</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Frame:</p>
              <div className="flex items-center gap-2">
                <img
                  src={state.selectedFrame.frame_url}
                  alt={state.selectedFrame.name}
                  className="w-12 h-12 object-cover rounded bg-gray-100"
                />
                <span className="text-sm font-body font-semibold">{state.selectedFrame.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="mb-8">
          {!uploadedImage && !croppedPreview ? (
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-lg font-body text-gray-700 mb-2">
                  Click to upload profile photo
                </p>
                <p className="text-sm text-gray-500 font-body">
                  JPG, PNG up to 10MB
                </p>
              </div>
            </label>
          ) : showCropper && uploadedImage ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold font-body text-gray-900 mb-4 text-center">
                  Crop Your Photo
                </h3>
                
                {/* Cropper */}
                <div className="relative w-full h-96 bg-black rounded-lg overflow-hidden">
                  <Cropper
                    image={uploadedImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={onCropChange}
                    onZoomChange={onZoomChange}
                    onCropComplete={onCropComplete}
                  />
                </div>

                {/* Zoom Control */}
                <div className="mt-4">
                  <label className="block text-sm font-body font-semibold text-gray-700 mb-2">
                    Zoom: {Math.round(zoom * 100)}%
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full"
                    disabled={isCropping}
                  />
                </div>

                {/* Instructions */}
                <p className="text-sm text-gray-600 font-body text-center mt-4">
                  💡 Drag to reposition, use slider to zoom
                </p>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCropCancel}
                    disabled={isCropping}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-body disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCropConfirm}
                    disabled={isCropping}
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-body disabled:opacity-50"
                  >
                    {isCropping ? 'Cropping...' : 'Crop Photo'}
                  </button>
                </div>
              </div>
            </div>
          ) : croppedPreview ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-gray-200">
                  <img
                    src={croppedPreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 font-body">
                ✅ Preview: Your photo will appear as a circle
              </p>
              <button
                onClick={() => {
                  setUploadedImage(null);
                  setCroppedPreview(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-body"
              >
                Choose Different Photo
              </button>
            </div>
          ) : null}
        </div>

        {/* Continue Button */}
        {croppedPreview && (
          <button
            onClick={handleContinue}
            className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-body text-lg font-semibold"
          >
            Continue to Position
          </button>
        )}
      </main>
    </div>
  );
}

export default ProfileUploadPage;
