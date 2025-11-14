import { useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

interface LocationState {
  generatedImageUrl: string;
  campaignName?: string;
  slug?: string;
}

function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  
  const state = location.state as LocationState;
  const generatedImageUrl = state?.generatedImageUrl;
  const campaignName = state?.campaignName || 'Campaign';

  useEffect(() => {
    // Redirect to home if no generated image URL is provided
    if (!generatedImageUrl) {
      navigate('/');
    }
  }, [generatedImageUrl, navigate]);

  const handleDownload = async () => {
    if (!generatedImageUrl) return;

    try {
      // Fetch the image as a blob
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      
      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `framed-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(generatedImageUrl, '_blank');
    }
  };

  const handleCreateAnother = () => {
    if (slug) {
      navigate(`/${slug}`);
    } else {
      navigate('/');
    }
  };

  if (!generatedImageUrl) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="result-container">
      <div className="result-card">
        <h1>{campaignName}</h1>
        <p className="subtitle">Your framed image is ready!</p>
        
        <div className="image-container">
          <img 
            src={generatedImageUrl} 
            alt="Generated framed image" 
            className="generated-image"
          />
        </div>

        <div className="button-group">
          <button 
            onClick={handleDownload}
            className="download-button"
          >
            <svg 
              className="button-icon" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
              />
            </svg>
            Download Image
          </button>

          <button 
            onClick={handleCreateAnother}
            className="create-another-button"
          >
            Create Another
          </button>
        </div>
      </div>
    </div>
  );
}

export default Result;
