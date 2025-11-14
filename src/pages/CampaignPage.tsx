import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import axiosInstance from '../api/axios';

interface Frame {
  id: number;
  name: string;
  frame_url: string;
}

interface Campaign {
  id: number;
  name: string;
  code: string;
  description: string;
  frames: Frame[];
}

function CampaignPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);

  useEffect(() => {
    fetchCampaign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchCampaign = async () => {
    try {
      console.log('Fetching campaign from:', `/api/campaigns/${slug}/`);
      const response = await axiosInstance.get(`/api/campaigns/${slug}/`);
      console.log('Campaign data received:', response.data);
      setCampaign(response.data);
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
        frames: [
          { id: 1, name: 'Victory Frame', frame_url: 'https://via.placeholder.com/400x400/3b82f6/ffffff?text=Victory' },
          { id: 2, name: 'Unity Frame', frame_url: 'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Unity' },
          { id: 3, name: 'Progress Frame', frame_url: 'https://via.placeholder.com/400x400/06b6d4/ffffff?text=Progress' },
          { id: 4, name: 'Hope Frame', frame_url: 'https://via.placeholder.com/400x400/10b981/ffffff?text=Hope' },
          { id: 5, name: 'Change Frame', frame_url: 'https://via.placeholder.com/400x400/ec4899/ffffff?text=Change' },
          { id: 6, name: 'Future Frame', frame_url: 'https://via.placeholder.com/400x400/f97316/ffffff?text=Future' }
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

  const handleContinue = () => {
    if (selectedFrame && campaign) {
      navigate(`/${slug}/upload`, {
        state: {
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

        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600 font-body">
            Select a frame to continue
          </p>
        </div>

        {/* Frames Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
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
                className="w-full h-full object-cover"
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

        {/* Continue Button */}
        {selectedFrame && (
          <div className="max-w-md mx-auto">
            <button
              onClick={handleContinue}
              className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-body text-lg font-semibold"
            >
              Continue with {selectedFrame.name}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default CampaignPage;
