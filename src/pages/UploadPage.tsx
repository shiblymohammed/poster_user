import { useState, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Upload, ArrowLeft, X } from 'lucide-react';

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

function UploadPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  if (!state || !state.selectedFrame) {
    navigate(`/${slug}`);
    return null;
  }

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      alert('Please select a valid image file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContinue = () => {
    if (selectedFile) {
      navigate(`/${slug}/preview`, {
        state: {
          ...state,
          uploadedImage: selectedFile
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/${slug}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-body"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <span className="text-sm text-gray-500 font-body">Step 2 of 3</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-display text-gray-900 mb-3">
            Upload Your Photo
          </h1>
          <p className="text-lg text-gray-600 font-body">
            Choose a photo to add the <span className="text-primary font-semibold">{state.selectedFrame.name}</span>
          </p>
        </div>

        {!selectedFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-600" />
            </div>

            <h3 className="text-xl font-display text-gray-900 mb-2">
              {isDragging ? 'Drop your photo here' : 'Drag and drop your photo'}
            </h3>
            <p className="text-gray-600 font-body mb-6">
              or click the button below to browse
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-body font-semibold"
            >
              Choose File
            </button>

            <p className="text-sm text-gray-500 font-body mt-4">
              Supported: JPG, PNG, WEBP (Max 10MB)
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto max-h-96 object-contain bg-gray-50"
              />
              <button
                onClick={handleClearFile}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div>
                <p className="font-body font-semibold text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-600 font-body">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={handleClearFile}
                className="text-gray-600 hover:text-gray-900 font-body text-sm"
              >
                Change
              </button>
            </div>

            <button
              onClick={handleContinue}
              className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-body text-lg font-semibold"
            >
              Continue to Crop
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default UploadPage;
