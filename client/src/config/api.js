// API Configuration
// This will use environment variables in production (Vercel)
// and fallback to localhost in development

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Debug: Log the API URL in development
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_URL);
  console.log('📝 VITE_API_URL env var:', import.meta.env.VITE_API_URL);
}

export { API_URL };

export default API_URL;
