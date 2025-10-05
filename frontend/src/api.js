import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add better error handling
API.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      error.message = 'Cannot connect to backend server. Make sure it is running on http://localhost:5000';
    } else if (error.response) {
      // Server responded with error status
      error.message = error.response.data?.error || error.response.statusText;
    } else if (error.request) {
      // Request made but no response received
      error.message = 'No response from server. Check your network connection.';
    }
    
    return Promise.reject(error);
  }
);

export default API;