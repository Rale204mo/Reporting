import React, { useState } from 'react';

export default function ConnectionTest() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      console.log('Testing connection to backend...');
      
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      
      setResult(`✅ SUCCESS: Backend is running!\n\nResponse: ${JSON.stringify(data, null, 2)}`);
      console.log('Backend connection successful:', data);
      
    } catch (error) {
      setResult(`❌ FAILED: ${error.message}\n\nPlease check:\n1. Backend is running on port 5000\n2. Run: node server.js in backend folder\n3. No firewall blocking connection`);
      console.error('Backend connection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h5>Backend Connection Test</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <p><strong>Frontend URL:</strong> {window.location.origin}</p>
            <p><strong>Backend URL:</strong> http://localhost:5000</p>
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={testConnection}
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Test Backend Connection'}
          </button>
          
          {result && (
            <div className={`mt-3 p-3 rounded ${result.includes('✅') ? 'bg-success text-white' : 'bg-danger text-white'}`}>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}