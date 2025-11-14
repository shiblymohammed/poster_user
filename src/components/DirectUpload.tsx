import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import ProgressBar from './ProgressBar';
import ErrorToast from './ErrorToast';
import SuccessAnimation from './SuccessAnimation';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

interface Frame {
  id: number;
  name: string;
  frame_url: string;
}

interface DirectUploadProps {
  selectedFrame: Frame;
  onUpload: (file: File) => void;
  onBack: () => void;
}

function DirectUpload({ selectedFrame, onUpload, onBack }: DirectUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please upload an image file';
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFile = async (file: File) => {
    setError('');
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Set selected file and create preview
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Simulate upload progress
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    // Complete upload
    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsUploading(false);
      setShowSuccess(true);
      
      // Call onUpload after success animation
      setTimeout(() => {
        onUpload(file);
      }, 1000);
    }, 1200);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    if (!selectedFile) {
      fileInputRef.current?.click();
    }
  };

  const handleChangeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowSuccess(false);
    fileInputRef.current?.click();
  };

  const handleDismissError = () => {
    setError('');
  };

  // Keyboard navigation support
  useKeyboardNavigation({
    onEscape: onBack,
    enabled: true
  });

  return (
    <div className="min-h-screen-mobile bg-gray-50 page-transition">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-sticky">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 touch-feedback"
            aria-label="Go back to frame selection"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Upload Photo</h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Selected Frame Preview */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm animate-fade-in">
          <p className="text-sm font-medium text-gray-600 mb-3">Selected Frame:</p>
          <div className="flex items-center gap-3">
            <img
              src={selectedFrame.frame_url}
              alt={selectedFrame.name}
              className="w-16 h-16 object-contain rounded-lg border border-gray-200"
            />
            <span className="font-medium text-gray-900">{selectedFrame.name}</span>
          </div>
        </div>

        {/* Upload Area or Preview */}
        {!selectedFile ? (
          <>
            {/* Upload Zone */}
            <div
              className={`border-2 border-dashed rounded-2xl p-12 bg-white transition-all duration-200 cursor-pointer ${
                isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick();
                }
              }}
              role="button"
              aria-label="Upload photo by clicking or dragging and dropping"
              tabIndex={0}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />

              <div className="flex flex-col items-center text-center">
                {/* Camera Icon */}
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>

                {/* Text */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isDragging ? 'Drop here' : 'Tap to Upload or Drag & Drop'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Supports JPEG, PNG, WEBP (Max 10MB)
                </p>
              </div>
            </div>

            {/* Choose from Gallery Button */}
            <button
              onClick={handleClick}
              className="w-full mt-4 bg-primary text-white py-4 rounded-xl font-semibold touch-feedback hover:bg-primary-dark transition-colors"
              aria-label="Choose photo from gallery"
            >
              <span aria-hidden="true">📁</span> Choose from Gallery
            </button>
          </>
        ) : (
          /* Image Preview */
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            {isUploading || showSuccess ? (
              <div className="py-8">
                {isUploading && (
                  <div>
                    <div className="mb-4 text-center">
                      <div className="inline-block w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-8 h-8 text-primary animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Uploading...</h3>
                    </div>
                    <ProgressBar progress={uploadProgress} />
                  </div>
                )}
                {showSuccess && (
                  <SuccessAnimation message="Upload Complete!" />
                )}
              </div>
            ) : (
              <>
                {/* Thumbnail Preview */}
                <div className="mb-4">
                  <img
                    src={previewUrl || ''}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </div>

                {/* File Info */}
                <div className="mb-4">
                  <p className="font-medium text-gray-900 mb-1 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>

                {/* Change Button */}
                <button
                  onClick={handleChangeFile}
                  className="w-full bg-white text-gray-900 py-3 rounded-xl font-medium touch-feedback hover:bg-gray-50 transition-colors border-2 border-gray-300"
                  aria-label="Change selected photo"
                >
                  Change Photo
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error Toast */}
      {error && (
        <ErrorToast
          message={error}
          onDismiss={handleDismissError}
        />
      )}
    </div>
  );
}

export default DirectUpload;
