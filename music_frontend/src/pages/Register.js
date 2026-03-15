import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api.js';
import toast from 'react-hot-toast';
import { FiPhone } from 'react-icons/fi';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Sign up with your personal details</p>
        </div>

        <form autoComplete="off" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', marginLeft: '4px' }}>Full Name</label>
            <input
              autoComplete="off"
              type="text" 
              placeholder="Enter your name"
              className="glass-input"
              style={{ width: '100%' }}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', marginLeft: '4px' }}>Email</label>
            <input
              autoComplete="off"
              type="email" 
              placeholder="Enter your email"
              className="glass-input"
              style={{ width: '100%' }}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', marginLeft: '4px' }}>Phone Number</label>
            <div style={{ position: 'relative' }}>
              <FiPhone style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '16px', pointerEvents: 'none' }} />
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="glass-input"
                style={{ width: '100%', paddingLeft: '42px' }}
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                pattern="[0-9]{10,15}"
                required
              />
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', marginLeft: '4px' }}>Password</label>
            <input
              autoComplete="new-password"
              type="password" 
              placeholder="Create a password"
              className="glass-input"
              style={{ width: '100%' }}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-light)', fontWeight: '700', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
