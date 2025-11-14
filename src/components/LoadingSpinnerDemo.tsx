import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingSpinnerDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">LoadingSpinner Component</h1>
        
        {/* Size Variants */}
        <section className="mb-12 bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Size Variants</h2>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-600">Small (sm)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner size="md" />
              <span className="text-sm text-gray-600">Medium (md)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner size="lg" />
              <span className="text-sm text-gray-600">Large (lg)</span>
            </div>
          </div>
        </section>

        {/* Color Variants */}
        <section className="mb-12 bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Color Variants</h2>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner color="primary" />
              <span className="text-sm text-gray-600">Primary</span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-gray-900 p-4 rounded-lg">
              <LoadingSpinner color="white" />
              <span className="text-sm text-white">White</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner color="gray" />
              <span className="text-sm text-gray-600">Gray</span>
            </div>
          </div>
        </section>

        {/* Combined Variants */}
        <section className="mb-12 bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Combined Variants</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg">
              <LoadingSpinner size="sm" color="primary" />
              <span className="text-xs text-gray-600">sm + primary</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg">
              <LoadingSpinner size="md" color="gray" />
              <span className="text-xs text-gray-600">md + gray</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-gray-900 rounded-lg">
              <LoadingSpinner size="lg" color="white" />
              <span className="text-xs text-white">lg + white</span>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Usage Examples</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <div className="text-center text-white">
                <LoadingSpinner color="white" size="lg" />
                <p className="mt-4">Loading campaign...</p>
              </div>
            </div>
            <div className="p-4 bg-gray-100 rounded-xl flex items-center gap-3">
              <LoadingSpinner size="sm" color="primary" />
              <span className="text-gray-700">Processing your image...</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoadingSpinnerDemo;
