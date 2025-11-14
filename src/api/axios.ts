import axios from 'axios';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 60000, // 60 seconds for Render free tier cold start
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.error || error.response.data?.message || 'An error occurred';
      
      console.error(`API Error (${status}):`, message);
      
      // You can add specific handling for different status codes
      switch (status) {
        case 400:
          error.userMessage = message;
          break;
        case 404:
          error.userMessage = 'Resource not found';
          break;
        case 500:
          error.userMessage = 'Server error. Please try again later.';
          break;
        default:
          error.userMessage = message;
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.message);
      error.userMessage = 'Connection error. Please check your internet connection.';
    } else {
      // Something else happened
      console.error('Error:', error.message);
      error.userMessage = 'An unexpected error occurred.';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
