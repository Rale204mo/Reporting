import React, {useState, useEffect} from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('unknown');
  const nav = useNavigate();

  // Test backend connection on component mount
  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection...');
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      setBackendStatus('connected');
      console.log('✅ Backend connection OK');
    } catch (error) {
      setBackendStatus('disconnected');
      console.error('❌ Backend connection failed:', error);
    }
  };

  async function submit(e){
    e.preventDefault();
    
    if (backendStatus === 'disconnected') {
      alert('❌ Backend server is not running!\n\nPlease ensure:\n1. Backend is running on port 5000\n2. Run: node server.js in backend folder\n3. Check the connection using the Test button below');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Attempting login...');
      console.log('Frontend:', window.location.origin);
      console.log('Backend: http://localhost:5000');
      
      const response = await API.post('/api/auth/login', { email, password });
      
      // Save token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      console.log('✅ Login successful!');
      nav('/dashboard');
      
    } catch (err){
      console.error('Login error:', err);
      
      let errorMessage = 'Login failed';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center" style={{height:'100vh', backgroundColor: '#f5f5f5'}}>
      <form onSubmit={submit} className="p-4 shadow" style={{width:360, background:'#041427', borderRadius:8}}>
        <h3 className="mb-3 text-white text-center">Sign in</h3>
        
        {/* Backend Status Indicator */}
        <div className={`mb-3 p-2 rounded text-center ${
          backendStatus === 'connected' ? 'bg-success' : 
          backendStatus === 'disconnected' ? 'bg-danger' : 'bg-warning'
        }`}>
          <small className="text-white">
            {backendStatus === 'connected' && '✅ Backend Connected'}
            {backendStatus === 'disconnected' && '❌ Backend Not Connected'}
            {backendStatus === 'unknown' && '🔄 Checking Backend...'}
          </small>
        </div>
        
        <div className="mb-2">
          <label className="form-label text-white">Email</label>
          <input 
            className="form-control" 
            value={email} 
            onChange={e=>setEmail(e.target.value)}
            type="email"
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label text-white">Password</label>
          <input 
            type="password" 
            className="form-control" 
            value={password} 
            onChange={e=>setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>
        
        <button 
          className="btn btn-primary w-100 py-2" 
          type="submit"
          disabled={loading || backendStatus === 'disconnected'}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>
        
        <div className="mt-3 text-center">
          <Link to="/register" className="text-white-50 text-decoration-none">
            Create account
          </Link>
        </div>

        {/* Connection Test Buttons */}
        <div className="mt-3 border-top pt-3">
          <div className="text-center">
            <button 
              type="button"
              className="btn btn-sm btn-outline-info me-2"
              onClick={testBackendConnection}
            >
              Test Backend
            </button>
            <Link to="/connection-test" className="btn btn-sm btn-outline-warning">
              Detailed Test
            </Link>
          </div>
          
          {/* Debug Info */}
          <div className="mt-2 p-2 bg-dark rounded">
            <small className="text-white-50">
              <strong>Debug:</strong><br/>
              Frontend: {window.location.origin}<br/>
              Backend: http://localhost:5000
            </small>
          </div>
        </div>
      </form>
    </div>
  );
}