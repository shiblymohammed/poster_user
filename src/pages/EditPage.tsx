import { useNavigate, useLocation } from 'react-router-dom';
import ImageEditor from '../components/ImageEditor';

interface LocationState {
  imageUrl: string; // Original cropped image without frame
  frameUrl: string;
  campaignName: string;
  slug: string;
  selectedFrame: {
    id: number;
    name: string;
    frame_url: string;
  };
  selectedSize: string;
  originalGeneratedUrl?: string; // The original generated image from backend (for fallback)
}

function EditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  if (!state || !state.imageUrl) {
    // Redirect if no state
    navigate('/');
    return null;
  }

  const { imageUrl, frameUrl, campaignName, slug, selectedFrame, selectedSize, originalGeneratedUrl } = state;

  const handleSave = async (editedBlob: Blob) => {
    // Convert blob to URL for display (this has frame baked in)
    const editedUrl = URL.createObjectURL(editedBlob);

    // Navigate back to result page with edited image
    navigate(`/${slug}/result`, {
      state: {
        generatedImageUrl: editedUrl, // Show the edited result
        croppedImageUrl: imageUrl, // Keep original cropped image for future edits
        campaignName,
        slug,
        selectedFrame,
        selectedSize
      },
      replace: true
    });
  };

  const handleCancel = () => {
    // Go back to result page without changes
    navigate(`/${slug}/result`, {
      state: {
        generatedImageUrl: originalGeneratedUrl || imageUrl, // Show original result
        croppedImageUrl: imageUrl, // Keep original cropped image
        campaignName,
        slug,
        selectedFrame,
        selectedSize
      }
    });
  };

  return (
    <div className="edit-page-container">
      <ImageEditor
        imageUrl={imageUrl}
        frameUrl={frameUrl}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default EditPage;
