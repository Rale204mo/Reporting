import axios from 'axios';


import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ConnectionTest from './components/ConnectionTest';

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/dashboard' element={<Dashboard/>} />
        <Route path='/connection-test' element={<ConnectionTest/>} />
      </Routes>
    </BrowserRouter>
  );
}






// Get the current port from the window location
const getCurrentPort = () => {
  return window.location.port || '3000';
};

const getBackendUrl = () => {
  const currentPort = getCurrentPort();
  console.log('Frontend running on port:', currentPort);
  
  // If React is on 3002, backend should still be on 5000
  return 'http://localhost:5000';
};

const API = axios.create({
  baseURL: getBackendUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced request interceptor
API.interceptors.request.use(
  (config) => {
    console.log(`🔄 Making API request to: ${config.baseURL}${config.url}`);
    console.log(`📍 Frontend: ${window.location.origin}`);
    return config;
  },
  (error) => {
    console.error('❌ Request setup error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
API.interceptors.response.use(
  (response) => {
    console.log('✅ Request successful');
    return response;
  },
  (error) => {
    console.error('❌ API Error Details:', {
      message: error.message,
      code: error.code,
      response: error.response,
      request: error.request
    });
    
    if (error.code === 'ECONNREFUSED') {
      error.message = `Cannot connect to backend server at ${getBackendUrl()}. Please ensure:\n\n1. Backend is running on port 5000\n2. Run: node server.js in backend folder\n3. No firewall is blocking the connection`;
    } else if (error.message === 'Network Error') {
      error.message = `Network error - cannot reach backend server at ${getBackendUrl()}`;
    } else if (!error.response) {
      error.message = 'No response from server. The backend might not be running.';
    }
    
    return Promise.reject(error);
  }
);
