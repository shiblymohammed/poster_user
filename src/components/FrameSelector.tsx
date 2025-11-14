import { useState, useEffect } from 'react';

interface Frame {
  id: number;
  name: string;
  frame_url: string;
  is_default: boolean;
}

interface FrameSelectorProps {
  slug: string;
  onFrameSelect: (frameId: number) => void;
  selectedFrameId?: number;
}

function FrameSelector({ slug, onFrameSelect, selectedFrameId }: FrameSelectorProps) {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFrames();
  }, [slug]);

  const fetchFrames = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/campaign/slug/${slug}/frames/`);
      
      if (!response.ok) {
        throw new Error('Failed to load frames');
      }
      
      const data = await response.json();
      setFrames(data.frames || []);
      
      // Auto-select first frame if no selection
      if (!selectedFrameId && data.frames.length > 0) {
        onFrameSelect(data.frames[0].id);
      }
    } catch (err) {
      setError('Failed to load frames');
      console.error('Error fetching frames:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="frame-selector">
        <h3>Choose Your Frame</h3>
        <div className="loading-frames">Loading frames...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="frame-selector">
        <p style={{color: 'red'}}>Error loading frames: {error}</p>
      </div>
    );
  }

  if (frames.length === 0) {
    return (
      <div className="frame-selector">
        <p style={{color: 'orange'}}>No frames available for this campaign</p>
      </div>
    );
  }

  // Auto-select first frame if none selected
  if (!selectedFrameId && frames.length > 0) {
    onFrameSelect(frames[0].id);
  }

  return (
    <div className="frame-selector">
      <h3>Choose Your Frame ({frames.length} available)</h3>
      <p className="frame-selector-subtitle">Select a frame style for your photo</p>
      
      <div className="frames-list">
        {frames.map((frame) => (
          <div
            key={frame.id}
            className={`frame-option ${selectedFrameId === frame.id ? 'selected' : ''}`}
            onClick={() => onFrameSelect(frame.id)}
          >
            <div className="frame-preview">
              <img src={frame.frame_url} alt={frame.name} />
            </div>
            <div className="frame-name">{frame.name}</div>
            {selectedFrameId === frame.id && <div className="selected-check">✓</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FrameSelector;
