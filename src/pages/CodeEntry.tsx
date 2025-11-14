import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

function CodeEntry() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateCodeFormat = (value: string): boolean => {
    // Validate 6 alphanumeric characters
    const codeRegex = /^[A-Z0-9]{6}$/;
    return codeRegex.test(value);
  };

  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCode(value);
    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!code) {
      setError('Please enter a campaign code');
      return;
    }

    if (!validateCodeFormat(code)) {
      setError('Code must be exactly 6 alphanumeric characters');
      return;
    }

    setLoading(true);

    try {
      // Call API to validate code
      const response = await axiosInstance.get(`/api/campaign/${code}/`);
      
      if (response.data && response.data.is_active) {
        // Navigate to upload page with code in state
        navigate('/upload', { state: { code, frameUrl: response.data.frame_url } });
      } else {
        setError('This campaign is not active');
      }
    } catch (err: any) {
      // Handle error
      if (err.response?.status === 404) {
        setError('Invalid campaign code. Please check and try again.');
      } else {
        setError(err.userMessage || 'Failed to validate code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-entry-container">
      <div className="code-entry-card">
        <h1>FrameGen</h1>
        <p className="subtitle">Enter your campaign code to get started</p>
        
        <form onSubmit={handleSubmit} className="code-entry-form" aria-label="Campaign code entry form">
          <div className="input-group">
            <label htmlFor="campaign-code" className="sr-only">Campaign code</label>
            <input
              id="campaign-code"
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className={`code-input ${error ? 'error' : ''}`}
              disabled={loading}
              autoFocus
              aria-invalid={!!error}
              aria-describedby={error ? "code-error" : undefined}
              aria-label="Enter 6-digit campaign code"
            />
            {error && <p id="code-error" className="error-message" role="alert">{error}</p>}
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading || !code}
            aria-label={loading ? 'Validating campaign code' : 'Continue to campaign'}
          >
            {loading ? 'Validating...' : 'Continue'}
          </button>
        </form>
        
        <p className="help-text">
          Don't have a code? Contact your campaign administrator.
        </p>
      </div>
    </div>
  );
}

export default CodeEntry;
