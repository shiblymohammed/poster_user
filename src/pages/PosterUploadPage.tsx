import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';

interface LocationState {
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

function PosterUploadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);

  if (!state?.selectedFrame || !state?.campaign) {
    navigate('/');
    return null;
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    if (posterFile && posterPreview) {
      navigate(`/${state.slug}/profile-upload`, {
        state: {
          ...state,
          posterData: posterPreview,
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
          <span className="text-sm text-gray-500 font-body">Step 2 of 4</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-display text-gray-900 mb-3">
            Upload Poster Background
          </h1>
          <p className="text-lg text-gray-600 font-body">
            This will be the background layer of your poster
          </p>
        </div>

        {/* Selected Frame Preview */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 font-body mb-2">Selected Frame:</p>
          <div className="flex items-center gap-3">
            <img
              src={state.selectedFrame.frame_url}
              alt={state.selectedFrame.name}
              className="w-16 h-16 object-cover rounded"
            />
            <span className="font-body font-semibold">{state.selectedFrame.name}</span>
          </div>
        </div>

        {/* Upload Area */}
        <div className="mb-8">
          {!posterPreview ? (
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-body text-gray-700 mb-2">
                  Click to upload poster image
                </p>
                <p className="text-sm text-gray-500 font-body">
                  JPG, PNG up to 10MB
                </p>
              </div>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={posterPreview}
                  alt="Poster preview"
                  className="w-full h-auto"
                />
              </div>
              <button
                onClick={() => {
                  setPosterPreview(null);
                  setPosterFile(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-body"
              >
                Choose Different Image
              </button>
            </div>
          )}
        </div>

        {/* Continue Button */}
        {posterPreview && (
          <button
            onClick={handleContinue}
            className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-body text-lg font-semibold"
          >
            Continue
          </button>
        )}
      </main>
    </div>
  );
}

export default PosterUploadPage;
