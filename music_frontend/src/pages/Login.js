import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import toast from 'react-hot-toast';
import { FiMail, FiLock } from 'react-icons/fi';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
      </div>

      <div className="glass-card fade-in" style={{ 
        maxWidth: '420px', 
        width: '90%', 
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            fontSize: '32px', 
            marginBottom: '12px',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>🎵</div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>MusicLib</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Sign in to your account</p>
        </div>

        <form autoComplete="on" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', marginLeft: '4px' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <input
                autoComplete="email"
                type="email" 
                placeholder="Enter your email"
                className="glass-input"
                style={{ width: '100%' }}
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', marginLeft: '4px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                autoComplete="current-password"
                type="password" 
                placeholder="Enter your password"
                className="glass-input"
                style={{ width: '100%' }}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
            {loading ? 'Please wait...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent-light)', fontWeight: '700', textDecoration: 'none' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
