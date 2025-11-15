import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';

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

function ProfileUploadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);

  if (!state?.selectedPoster || !state?.selectedFrame) {
    navigate('/');
    return null;
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    if (profileFile && profilePreview) {
      navigate(`/${state.slug}/edit`, {
        state: {
          ...state,
          profileData: profilePreview,
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
          {!profilePreview ? (
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
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-gray-200">
                  <img
                    src={profilePreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 font-body">
                Preview: Your photo will appear as a circle
              </p>
              <button
                onClick={() => {
                  setProfilePreview(null);
                  setProfileFile(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-body"
              >
                Choose Different Photo
              </button>
            </div>
          )}
        </div>

        {/* Continue Button */}
        {profilePreview && (
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
