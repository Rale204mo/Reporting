import React, {useState} from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function Register(){
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [role,setRole]=useState('student');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function submit(e){
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Attempting registration...');
      const response = await API.post('/api/auth/register', { 
        name, 
        email, 
        password, 
        role 
      });
      
      console.log('Registration successful:', response.data);
      alert('Registration successful! Please login.');
      nav('/');
      
    } catch (err){
      console.error('Registration error:', err);
      const errorMessage = err?.response?.data?.error || err?.message || 'Registration failed';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center" style={{height:'100vh'}}>
      <form onSubmit={submit} className="p-4" style={{width:420, background:'#041427', borderRadius:8}}>
        <h3 className="mb-3 text-white">Register</h3>
        
        <div className="mb-2">
          <label className="form-label text-white">Name</label>
          <input 
            className="form-control" 
            value={name} 
            onChange={e=>setName(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-2">
          <label className="form-label text-white">Email</label>
          <input 
            className="form-control" 
            type="email"
            value={email} 
            onChange={e=>setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-2">
          <label className="form-label text-white">Password</label>
          <input 
            type="password" 
            className="form-control" 
            value={password} 
            onChange={e=>setPassword(e.target.value)}
            minLength="6"
            required
          />
          <small className="text-white-50">Password must be at least 6 characters</small>
        </div>
        
        <div className="mb-3">
          <label className="form-label text-white">Role</label>
          <select className="form-select" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
            <option value="prl">PRL</option>
            <option value="pl">PL</option>
          </select>
        </div>
        
        <button 
          className="btn btn-primary w-100" 
          type="submit"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
        
        <div className="mt-3 text-center">
          <Link to="/" className="text-white">Already have an account? Login here</Link>
        </div>
      </form>
    </div>
  )
}