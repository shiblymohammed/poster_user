import { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axios';
import FrameSelector from '../components/FrameSelector';
import SizeSelector from '../components/SizeSelector';
import ImageCropper, { blobToBase64 } from '../components/ImageCropper';
import FrameAdjuster, { type FrameAdjustments } from '../components/FrameAdjuster';
import { getDefaultSize, type SizeOption } from '../constants/sizeOptions';

interface CampaignData {
  name: string;
  code: string;
  slug: string;
  frame_url: string;
  is_active: boolean;
}

interface Frame {
  id: number;
  name: string;
  frame_url: string;
  is_default: boolean;
}

type UploadState = 'select' | 'crop' | 'adjust' | 'generating';

function Upload() {
  const [, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>('');
  const [, setPreviewUrl] = useState<string>('');
  const [uploadState, setUploadState] = useState<UploadState>('select');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [selectedFrameId, setSelectedFrameId] = useState<number | undefined>();
  const [selectedSize, setSelectedSize] = useState<SizeOption>(getDefaultSize());
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    // Fetch campaign data and frames by slug
    const fetchCampaign = async () => {
      if (!slug) {
        navigate('/');
        return;
      }

      try {
        setCampaignLoading(true);
        const response = await axiosInstance.get(`/api/campaign/slug/${slug}/`);
        setCampaign(response.data);

        // Fetch frames
        const framesResponse = await axiosInstance.get(`/api/campaign/slug/${slug}/frames/`);
        setFrames(framesResponse.data.frames || []);
      } catch (err: any) {
        setError('Campaign not found. Please check your link.');
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setCampaignLoading(false);
      }
    };

    fetchCampaign();
  }, [slug, navigate]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl);
      }
      if (croppedImageUrl) {
        URL.revokeObjectURL(croppedImageUrl);
      }
    };
  }, [uploadedImageUrl, croppedImageUrl]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError('');

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl('');
      setUploadedImageUrl('');
      setUploadState('select');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file format. Please upload JPEG, PNG, or WEBP');
      setSelectedFile(null);
      setPreviewUrl('');
      setUploadedImageUrl('');
      setUploadState('select');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 10MB');
      setSelectedFile(null);
      setPreviewUrl('');
      setUploadedImageUrl('');
      setUploadState('select');
      return;
    }

    setSelectedFile(file);

    // Create object URL for cropper
    const imageUrl = URL.createObjectURL(file);
    setUploadedImageUrl(imageUrl);

    // Create preview URL for display
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Transition to crop state
    setUploadState('crop');
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    // Create object URL for the cropped image
    const croppedUrl = URL.createObjectURL(croppedBlob);
    setCroppedImageUrl(croppedUrl);
    
    // Move to adjust state
    setUploadState('adjust');
  };

  const handleAdjustBack = () => {
    // Clean up cropped image URL
    if (croppedImageUrl) {
      URL.revokeObjectURL(croppedImageUrl);
      setCroppedImageUrl('');
    }
    
    // Go back to crop state
    setUploadState('crop');
  };

  const handleAdjustConfirm = async (adjustedBlob: Blob, _adjustments: FrameAdjustments) => {
    if (!campaign) {
      setError('Campaign data is missing');
      return;
    }

    setUploadState('generating');
    setLoading(true);
    setError('');

    try {
      // Convert adjusted blob to base64
      const base64Image = await blobToBase64(adjustedBlob);

      // Prepare request data
      const requestData = {
        code: campaign.code,
        photo_data: base64Image,
        size: selectedSize.id,
        ...(selectedFrameId && { frame_id: selectedFrameId })
      };

      // Call API to generate framed image
      const response = await axiosInstance.post('/api/generate/', requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data && response.data.generated_image_url) {
        // Clean up object URLs
        if (uploadedImageUrl) {
          URL.revokeObjectURL(uploadedImageUrl);
        }
        if (croppedImageUrl) {
          URL.revokeObjectURL(croppedImageUrl);
        }

        // Navigate to result page with generated image URL
        navigate(`/${slug}/result`, { 
          state: { 
            generatedImageUrl: response.data.generated_image_url,
            campaignName: campaign.name,
            slug
          } 
        });
      } else {
        setError('Generation failed. Please try again');
        setUploadState('adjust');
      }
    } catch (err: any) {
      // Handle error
      if (err.response?.status === 404) {
        setError('Campaign not found');
      } else if (err.response?.status === 400) {
        setError(err.response.data?.error || 'Invalid image data. Please try again');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Connection error. Please check your internet');
      } else {
        setError('Generation failed. Please try again');
      }
      setUploadState('adjust');
    } finally {
      setLoading(false);
    }
  };

  const handleCropCancel = () => {
    // Clean up object URLs
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }
    if (croppedImageUrl) {
      URL.revokeObjectURL(croppedImageUrl);
    }
    
    // Reset state
    setUploadedImageUrl('');
    setCroppedImageUrl('');
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadState('select');
    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Form submission is now handled by the crop flow
    // This is kept for backward compatibility if needed
  };

  if (campaignLoading) {
    return (
      <div className="upload-container">
        <div className="upload-card">
          <div className="loading-state">
            <span className="spinner"></span>
            <p>Loading campaign...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h1>{campaign.name}</h1>
        <p className="subtitle">Customize and upload your photo</p>
        
        {/* Show selectors only in 'select' state */}
        {uploadState === 'select' && (
          <>
            {/* Frame Selector */}
            {slug && (
              <FrameSelector
                slug={slug}
                onFrameSelect={setSelectedFrameId}
                selectedFrameId={selectedFrameId}
              />
            )}
            
            {/* Size Selector */}
            <SizeSelector
              selectedSize={selectedSize}
              onSizeSelect={setSelectedSize}
            />
            
            <form onSubmit={handleSubmit} className="upload-form">
              <h3 className="section-title">Upload Your Photo</h3>
              
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="file-input"
                  disabled={loading}
                />
                <label htmlFor="photo-upload" className="file-input-label">
                  Choose Photo
                </label>
              </div>

              {error && <p className="error-message">{error}</p>}
            </form>

            <button 
              onClick={() => navigate('/')}
              className="back-button"
              disabled={loading}
            >
              ← Back to Home
            </button>
          </>
        )}

        {/* Show cropper in 'crop' state */}
        {uploadState === 'crop' && uploadedImageUrl && (
          <ImageCropper
            imageSrc={uploadedImageUrl}
            aspectRatio={selectedSize.aspectRatio}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        )}

        {/* Show frame adjuster in 'adjust' state */}
        {uploadState === 'adjust' && croppedImageUrl && selectedFrameId && (
          <FrameAdjuster
            croppedImageSrc={croppedImageUrl}
            frameUrl={frames.find(f => f.id === selectedFrameId)?.frame_url || ''}
            onConfirm={handleAdjustConfirm}
            onBack={handleAdjustBack}
          />
        )}

        {/* Show loading state during generation */}
        {uploadState === 'generating' && (
          <div className="loading-state">
            <span className="spinner"></span>
            <p>Generating your framed image...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Upload;
