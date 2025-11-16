import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import axiosInstance from '../api/axios';

interface Poster {
  id: number;
  name: string;
  poster_url: string;
  is_default: boolean;
}

interface Frame {
  id: number;
  name: string;
  frame_url: string;
  is_default: boolean;
}

interface Campaign {
  id: number;
  name: string;
  code: string;
  description?: string;
  posters: Poster[];
  frames: Frame[];
}

function CampaignPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPoster, setSelectedPoster] = useState<Poster | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [customPoster, setCustomPoster] = useState<{ file: File; preview: string } | null>(null);

  useEffect(() => {
    fetchCampaign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchCampaign = async () => {
    try {
      console.log('Fetching campaign from:', `/api/campaigns/${slug}/`);
      const response = await axiosInstance.get(`/api/campaigns/${slug}/`);
      console.log('Campaign data received:', response.data);
      
      // Ensure posters and frames arrays exist
      const campaignData = {
        ...response.data,
        posters: response.data.posters || [],
        frames: response.data.frames || []
      };
      
      setCampaign(campaignData);
    } catch (error: any) {
      console.error('Error fetching campaign:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Only use mock data if backend is not running (network error)
      if (error.code === 'ERR_NETWORK') {
        console.log('Backend not running, using mock data');
        const campaignName = slug?.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') || 'Election 2024';
      
      const mockCampaign: Campaign = {
        id: 1,
        name: campaignName,
        code: slug || 'election-2024',
        description: `Create stunning campaign posters for ${campaignName}`,
        posters: [
          { id: 1, name: 'Poster 1', poster_url: 'https://via.placeholder.com/400x400/3b82f6/ffffff?text=Poster+1', is_default: true },
          { id: 2, name: 'Poster 2', poster_url: 'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Poster+2', is_default: false },
          { id: 3, name: 'Poster 3', poster_url: 'https://via.placeholder.com/400x400/06b6d4/ffffff?text=Poster+3', is_default: false }
        ],
        frames: [
          { id: 1, name: 'Victory Frame', frame_url: 'https://via.placeholder.com/400x400/3b82f6/ffffff?text=Victory', is_default: true },
          { id: 2, name: 'Unity Frame', frame_url: 'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Unity', is_default: false },
          { id: 3, name: 'Progress Frame', frame_url: 'https://via.placeholder.com/400x400/06b6d4/ffffff?text=Progress', is_default: false },
          { id: 4, name: 'Hope Frame', frame_url: 'https://via.placeholder.com/400x400/10b981/ffffff?text=Hope', is_default: false },
          { id: 5, name: 'Change Frame', frame_url: 'https://via.placeholder.com/400x400/ec4899/ffffff?text=Change', is_default: false },
          { id: 6, name: 'Future Frame', frame_url: 'https://via.placeholder.com/400x400/f97316/ffffff?text=Future', is_default: false }
        ]
      };
      setCampaign(mockCampaign);
      } else {
        // Backend returned an error, show error message
        console.error('Backend error, not using mock data');
        setCampaign(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPosterUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomPoster({
          file,
          preview: reader.result as string
        });
        // Create a custom poster object
        setSelectedPoster({
          id: -1, // Special ID for custom poster
          name: 'Your Custom Poster',
          poster_url: reader.result as string,
          is_default: false
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    if ((selectedPoster || customPoster) && selectedFrame && campaign) {
      navigate(`/${slug}/profile-upload`, {
        state: {
          selectedPoster: selectedPoster || {
            id: -1,
            name: 'Your Custom Poster',
            poster_url: customPoster!.preview,
            is_default: false
          },
          selectedFrame,
          campaign: { name: campaign.name, code: campaign.code },
          slug
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-900 mb-4 font-body">Campaign not found</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-body"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-body"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <span className="text-sm text-gray-500 font-body">Step 1 of 3</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-display text-gray-900 mb-3">
            {campaign.name}
          </h1>
          {campaign.description && (
            <p className="text-lg text-gray-600 font-body max-w-2xl mx-auto">
              {campaign.description}
            </p>
          )}
        </div>

        {/* Posters Section */}
        {campaign.posters && campaign.posters.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-display text-gray-900 mb-2">Select a Poster Background</h2>
              <p className="text-sm text-gray-600 font-body">
                Choose the background for your poster
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Custom Poster Upload Option */}
              <label className={`relative aspect-square rounded-lg overflow-hidden transition-all cursor-pointer ${
                customPoster
                  ? 'ring-4 ring-primary shadow-lg scale-105'
                  : 'border-2 border-dashed border-gray-300 hover:border-primary hover:bg-gray-50'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomPosterUpload}
                  className="hidden"
                />
                {customPoster ? (
                  <>
                    <img
                      src={customPoster.preview}
                      alt="Your custom poster"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <p className="text-white text-sm font-body font-semibold">Your Custom Poster</p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-12 h-12 mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-sm font-body font-semibold text-gray-700">Upload Your Own</p>
                    <p className="text-xs text-gray-500 mt-1">Click to choose</p>
                  </div>
                )}
              </label>

              {/* Admin-uploaded posters */}
              {campaign.posters.map((poster) => (
              <button
                key={poster.id}
                onClick={() => {
                  setSelectedPoster(poster);
                  setCustomPoster(null); // Clear custom poster when selecting admin poster
                }}
                className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                  selectedPoster?.id === poster.id && !customPoster
                    ? 'ring-4 ring-primary shadow-lg scale-105'
                    : 'border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <img
                  src={poster.poster_url}
                  alt={poster.name}
                  className="w-full h-full object-cover"
                />
                {selectedPoster?.id === poster.id && !customPoster && (
                  <div className="absolute top-2 right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-sm font-body font-semibold">{poster.name}</p>
                </div>
              </button>
              ))}
            </div>
          </div>
        )}

        {/* Frames Section */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-display text-gray-900 mb-2">Select a Frame</h2>
            <p className="text-sm text-gray-600 font-body">
              Choose the frame overlay for your poster
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {campaign.frames.map((frame) => (
              <button
                key={frame.id}
                onClick={() => setSelectedFrame(frame)}
                className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                  selectedFrame?.id === frame.id
                    ? 'ring-4 ring-primary shadow-lg scale-105'
                    : 'border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <img
                  src={frame.frame_url}
                  alt={frame.name}
                  className="w-full h-full object-cover bg-gray-100"
                />
                {selectedFrame?.id === frame.id && (
                  <div className="absolute top-2 right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-sm font-body font-semibold">{frame.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        {campaign.posters && campaign.posters.length > 0 ? (
          <>
            {(selectedPoster || customPoster) && selectedFrame && (
              <div className="max-w-md mx-auto">
                <button
                  onClick={handleContinue}
                  className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-body text-lg font-semibold"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Selection Status */}
            {((!selectedPoster && !customPoster) || !selectedFrame) && (
              <div className="max-w-md mx-auto text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900 font-body">
                  {!selectedPoster && !customPoster && !selectedFrame && 'Please select or upload a poster and select a frame to continue'}
                  {(selectedPoster || customPoster) && !selectedFrame && 'Great! Now select a frame'}
                  {!selectedPoster && !customPoster && selectedFrame && 'Great! Now select or upload a poster'}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="max-w-md mx-auto text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-900 font-body">
              This campaign doesn't have poster backgrounds yet. Please contact the administrator.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default CampaignPage;
