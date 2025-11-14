import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Download, Edit, RotateCcw, X, AlertCircle } from 'lucide-react';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

interface LocationState {
  generatedImageUrl: string;
  croppedImageUrl?: string;
  campaignName: string;
  slug: string;
  selectedFrame: {
    id: number;
    name: string;
    frame_url: string;
  };
  selectedSize: string;
  isPreviewMode?: boolean;
}

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [downloading, setDownloading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!state || !state.generatedImageUrl) {
    navigate('/');
    return null;
  }

  const { generatedImageUrl, croppedImageUrl, campaignName, slug, selectedFrame, selectedSize, isPreviewMode } = state;

  const handleClose = () => {
    navigate(`/${slug}`);
  };

  const handleEdit = () => {
    navigate(`/${slug}/edit`, {
      state: {
        imageUrl: croppedImageUrl || generatedImageUrl,
        frameUrl: selectedFrame.frame_url,
        campaignName,
        slug,
        selectedFrame,
        selectedSize,
        originalGeneratedUrl: generatedImageUrl
      }
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${campaignName.replace(/\s+/g, '-').toLowerCase()}-framed.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCreateAnother = () => {
    navigate(`/${slug}`);
  };

  useKeyboardNavigation({
    onEscape: handleClose,
    enabled: true
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview Mode Warning */}
      {isPreviewMode && (
        <div className="bg-warning/10 border-b border-warning/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-2 text-warning">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-body">
                Preview Mode - Connect backend to generate image with frame overlay
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-body"
          >
            <X className="w-5 h-5" />
            <span>Close</span>
          </button>
          <span className="text-sm text-gray-500 font-body">Your Result</span>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Display */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <img
            src={generatedImageUrl}
            alt={`${campaignName} with ${selectedFrame.name}`}
            className="w-full h-auto rounded-lg"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleEdit}
            className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Edit className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-body font-semibold text-gray-900">Edit</p>
              <p className="text-sm text-gray-600 font-body">Adjust frame position</p>
            </div>
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-primary hover:shadow-md transition-all disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <Download className="w-6 h-6 text-success" />
            </div>
            <div className="text-center">
              <p className="font-body font-semibold text-gray-900">
                {downloading ? 'Downloading...' : 'Download'}
              </p>
              <p className="text-sm text-gray-600 font-body">Save to device</p>
            </div>
          </button>

          <button
            onClick={handleCreateAnother}
            className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-secondary" />
            </div>
            <div className="text-center">
              <p className="font-body font-semibold text-gray-900">Create Another</p>
              <p className="text-sm text-gray-600 font-body">Start over</p>
            </div>
          </button>
        </div>
      </main>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-lg shadow-lg border border-gray-200 z-50 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
              <Download className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-body font-semibold text-gray-900">Downloaded successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultPage;
