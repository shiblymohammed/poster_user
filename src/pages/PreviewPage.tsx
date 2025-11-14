import { useNavigate, useLocation, useParams } from 'react-router-dom';
import SizeTabsPreview from '../components/SizeTabsPreview';
import axiosInstance from '../api/axios';

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
  uploadedImage: File;
}

// Helper function to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

function PreviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  if (!state || !state.uploadedImage) {
    // Redirect if no state
    navigate(`/${slug}`);
    return null;
  }

  const handleNext = async (selectedSize: string, croppedBlob: Blob) => {
    try {
      // Convert blob to base64
      const base64Image = await blobToBase64(croppedBlob);

      // Prepare request data
      const requestData = {
        code: state.campaign.code,
        photo_data: base64Image,
        size: selectedSize,
        frame_id: state.selectedFrame.id
      };

      // Call API to generate image
      const response = await axiosInstance.post('/api/generate/', requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data && response.data.generated_image_url) {
        // Create URL for the cropped image (without frame) for editing
        const croppedImageUrl = URL.createObjectURL(croppedBlob);
        
        // Navigate to result page
        navigate(`/${slug}/result`, {
          state: {
            generatedImageUrl: response.data.generated_image_url,
            croppedImageUrl, // Store original cropped image for editing
            campaignName: state.campaign.name,
            slug,
            selectedFrame: state.selectedFrame,
            selectedSize
          }
        });
      } else {
        alert('Failed to generate image. Please try again.');
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      
      // For development: Use mock/preview mode when API fails
      console.log('API failed, using preview mode with cropped image');
      
      // Create URL for the cropped image
      const croppedImageUrl = URL.createObjectURL(croppedBlob);
      
      // Navigate to result page with the cropped image as preview
      // In production, this would be the generated image with frame from backend
      navigate(`/${slug}/result`, {
        state: {
          generatedImageUrl: croppedImageUrl, // Use cropped image as preview
          croppedImageUrl, // Store for editing
          campaignName: state.campaign.name,
          slug,
          selectedFrame: state.selectedFrame,
          selectedSize,
          isPreviewMode: true // Flag to show this is preview mode
        }
      });
    }
  };

  const handleBack = () => {
    navigate(`/${slug}/upload`, { state });
  };

  return (
    <div className="preview-page-container">
      <SizeTabsPreview
        uploadedImage={state.uploadedImage}
        selectedFrame={state.selectedFrame}
        onNext={handleNext}
        onBack={handleBack}
      />
    </div>
  );
}

export default PreviewPage;
