import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import axiosInstance from '../api/axios';

interface Campaign {
  id: number;
  name: string;
  code: string;
  description: string;
  frames: Frame[];
}

interface Frame {
  id: number;
  name: string;
  frame_url: string;
}

function Home() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      console.log('Fetching campaigns from:', '/api/campaigns/');
      const response = await axiosInstance.get('/api/campaigns/');
      console.log('Campaigns data received:', response.data);
      setCampaigns(response.data);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      console.error('Error response:', error.response?.data);
      
      // Only use mock data if backend is not running
      if (error.code === 'ERR_NETWORK') {
        console.log('Backend not running, using mock data');
      const mockCampaigns: Campaign[] = [
        {
          id: 1,
          name: 'Election 2024',
          code: 'election-2024',
          description: 'Create stunning campaign posters for the 2024 elections',
          frames: [
            {
              id: 1,
              name: 'Victory Frame',
              frame_url: 'https://via.placeholder.com/400x400/3b82f6/ffffff?text=Victory'
            },
            {
              id: 2,
              name: 'Unity Frame',
              frame_url: 'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Unity'
            },
            {
              id: 3,
              name: 'Progress Frame',
              frame_url: 'https://via.placeholder.com/400x400/06b6d4/ffffff?text=Progress'
            },
            {
              id: 4,
              name: 'Hope Frame',
              frame_url: 'https://via.placeholder.com/400x400/10b981/ffffff?text=Hope'
            }
          ]
        }
      ];
      setCampaigns(mockCampaigns);
      } else {
        // Backend returned error, show empty state
        console.error('Backend error, not using mock data');
        setCampaigns([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignClick = (code: string) => {
    navigate(`/${code}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="text-xl font-display text-gray-900">LapoAitools</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-gray-900 mb-6">
              Create Campaign Posters in Seconds
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 font-body mb-8">
              Upload your photo, choose a frame, and generate professional election posters instantly.
            </p>
            <a 
              href="#campaigns"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-body text-lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section id="campaigns" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display text-gray-900 mb-4">
              Choose Your Campaign
            </h2>
            <p className="text-lg text-gray-600 font-body">
              Select a campaign to start creating your poster
            </p>
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && campaigns.length > 0 && (
            <div className="space-y-16">
              {campaigns.map((campaign) => (
                <div key={campaign.id}>
                  <div className="mb-8">
                    <h3 className="text-2xl font-display text-gray-900 mb-2">
                      {campaign.name}
                    </h3>
                    {campaign.description && (
                      <p className="text-gray-600 font-body">{campaign.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {campaign.frames.map((frame) => (
                      <button
                        key={frame.id}
                        onClick={() => handleCampaignClick(campaign.code)}
                        className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary hover:shadow-lg transition-all bg-white"
                      >
                        <img
                          src={frame.frame_url}
                          alt={frame.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                          <div className="w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                            <p className="text-white font-body font-semibold">{frame.name}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && campaigns.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-body">No campaigns available</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600 font-body">
            © 2024 LapoAitools. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
