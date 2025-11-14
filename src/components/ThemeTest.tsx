import React from 'react';

/**
 * ThemeTest Component
 * Tests the enhanced Tailwind theme configuration including:
 * - OKLCH colors
 * - Typography scale
 * - Spacing system
 * - Border radius
 * - Shadows
 * - Custom utilities (safe area, backdrop blur, text gradient, touch feedback)
 */
const ThemeTest: React.FC = () => {
  return (
    <div className="min-h-screen-mobile bg-gradient-to-br from-primary to-secondary p-6 pb-safe">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="backdrop-blur-glass rounded-2xl p-6 shadow-2xl">
          <h1 className="text-4xl font-display text-gradient mb-2">
            Theme Test Component
          </h1>
          <p className="text-gray-700 font-body">
            Testing enhanced Tailwind v4 theme configuration
          </p>
        </div>

        {/* Color Palette Test */}
        <div className="backdrop-blur-glass rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-display text-gray-900 mb-4">
            OKLCH Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-primary rounded-lg shadow-md"></div>
              <p className="text-sm text-gray-700">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-secondary rounded-lg shadow-md"></div>
              <p className="text-sm text-gray-700">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-accent rounded-lg shadow-md"></div>
              <p className="text-sm text-gray-700">Accent</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-success rounded-lg shadow-md"></div>
              <p className="text-sm text-gray-700">Success</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-error rounded-lg shadow-md"></div>
              <p className="text-sm text-gray-700">Error</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-warning rounded-lg shadow-md"></div>
              <p className="text-sm text-gray-700">Warning</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-info rounded-lg shadow-md"></div>
              <p className="text-sm text-gray-700">Info</p>
            </div>
          </div>
        </div>

        {/* Typography Scale Test */}
        <div className="backdrop-blur-glass rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-display text-gray-900 mb-4">
            Typography Scale
          </h2>
          <div className="space-y-2">
            <p className="text-xs text-gray-700">Extra Small (12px)</p>
            <p className="text-sm text-gray-700">Small (14px)</p>
            <p className="text-base text-gray-700">Base (16px)</p>
            <p className="text-lg text-gray-700">Large (18px)</p>
            <p className="text-xl text-gray-700">Extra Large (20px)</p>
            <p className="text-2xl text-gray-700">2XL (24px)</p>
            <p className="text-3xl text-gray-700">3XL (30px)</p>
          </div>
        </div>

        {/* Spacing System Test */}
        <div className="backdrop-blur-glass rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-display text-gray-900 mb-4">
            Spacing System
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-primary"></div>
              <span className="text-sm text-gray-700">4px</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-8 bg-primary"></div>
              <span className="text-sm text-gray-700">8px</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-4 h-8 bg-primary"></div>
              <span className="text-sm text-gray-700">16px</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-primary"></div>
              <span className="text-sm text-gray-700">32px</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-8 bg-primary"></div>
              <span className="text-sm text-gray-700">64px</span>
            </div>
          </div>
        </div>

        {/* Border Radius Test */}
        <div className="backdrop-blur-glass rounded-sm p-6 shadow-sm">
          <h2 className="text-2xl font-display text-gray-900 mb-4">
            Border Radius
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-primary h-20 rounded-sm flex items-center justify-center text-white text-sm">
              sm (8px)
            </div>
            <div className="bg-primary h-20 rounded-md flex items-center justify-center text-white text-sm">
              md (12px)
            </div>
            <div className="bg-primary h-20 rounded-lg flex items-center justify-center text-white text-sm">
              lg (16px)
            </div>
            <div className="bg-primary h-20 rounded-xl flex items-center justify-center text-white text-sm">
              xl (24px)
            </div>
            <div className="bg-primary h-20 rounded-2xl flex items-center justify-center text-white text-sm">
              2xl (32px)
            </div>
            <div className="bg-primary h-20 rounded-full flex items-center justify-center text-white text-sm">
              full
            </div>
          </div>
        </div>

        {/* Shadow Test */}
        <div className="backdrop-blur-glass rounded-2xl p-6">
          <h2 className="text-2xl font-display text-gray-900 mb-4">
            Shadow Levels
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white h-24 rounded-lg shadow-xs flex items-center justify-center text-gray-700">
              xs
            </div>
            <div className="bg-white h-24 rounded-lg shadow-sm flex items-center justify-center text-gray-700">
              sm
            </div>
            <div className="bg-white h-24 rounded-lg shadow-md flex items-center justify-center text-gray-700">
              md
            </div>
            <div className="bg-white h-24 rounded-lg shadow-lg flex items-center justify-center text-gray-700">
              lg
            </div>
            <div className="bg-white h-24 rounded-lg shadow-xl flex items-center justify-center text-gray-700">
              xl
            </div>
            <div className="bg-white h-24 rounded-lg shadow-2xl flex items-center justify-center text-gray-700">
              2xl
            </div>
          </div>
        </div>

        {/* Custom Utilities Test */}
        <div className="backdrop-blur-glass-dark rounded-2xl p-6 shadow-2xl">
          <h2 className="text-2xl font-display text-white mb-4">
            Custom Utilities
          </h2>
          <div className="space-y-4">
            {/* Touch Feedback */}
            <button className="w-full bg-primary text-white py-4 rounded-2xl font-semibold touch-feedback">
              Touch Feedback Button (tap me)
            </button>
            
            {/* Text Gradient */}
            <div className="text-3xl font-display text-gradient text-center">
              Gradient Text Effect
            </div>
            
            {/* Scrollbar Hide */}
            <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth-mobile">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-32 h-32 bg-accent rounded-xl flex items-center justify-center text-white font-bold"
                >
                  {i}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/80 text-center">
              Scroll horizontally (no scrollbar)
            </p>
          </div>
        </div>

        {/* Safe Area Test */}
        <div className="backdrop-blur-glass rounded-2xl p-6 pt-safe pb-safe shadow-xl">
          <h2 className="text-2xl font-display text-gray-900 mb-2">
            Safe Area Support
          </h2>
          <p className="text-gray-700">
            This container uses pt-safe and pb-safe utilities to respect device notches and home indicators.
          </p>
        </div>

        {/* Animation Test */}
        <div className="backdrop-blur-glass rounded-2xl p-6 shadow-xl animate-fade-in">
          <h2 className="text-2xl font-display text-gray-900 mb-2">
            Animation Test
          </h2>
          <p className="text-gray-700">
            This card fades in using the animate-fade-in class.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemeTest;
