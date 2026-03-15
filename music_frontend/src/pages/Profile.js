import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { usePlayer } from '../context/PlayerContext.js';
import { getProfile } from '../services/api.js';
import { FiUser, FiMail, FiPhone, FiShield, FiLogOut, FiCalendar, FiMusic } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logoutUser, isAdmin } = useAuth();
  const { stop } = usePlayer();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(res => setProfile(res.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    stop();
    logoutUser();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const displayUser = profile || user;
  const memberSince = displayUser?.createdAt
    ? new Date(displayUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className="fade-in" style={{ maxWidth: '700px', margin: '0 auto', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', marginBottom: '8px' }}>My Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Your account details and settings</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <div className="spinner" />
        </div>
      ) : (
        <>
          {/* Avatar and Name Card */}
          <div className="glass-card" style={{ padding: '40px', marginBottom: '24px', textAlign: 'center' }}>
            {/* Avatar */}
            <div style={{
              width: '96px', height: '96px', borderRadius: '28px',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '40px', fontWeight: '800', margin: '0 auto 20px',
              boxShadow: '0 8px 32px rgba(108,61,211,0.4)'
            }}>
              {displayUser?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>
              {displayUser?.name || '—'}
            </h2>
            <span style={{
              display: 'inline-block',
              padding: '4px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700',
              background: isAdmin ? 'rgba(251,191,36,0.15)' : 'rgba(139,92,246,0.15)',
              color: isAdmin ? '#fbbf24' : '#c4b5fd',
              border: `1px solid ${isAdmin ? 'rgba(251,191,36,0.3)' : 'rgba(139,92,246,0.3)'}`
            }}>
              {isAdmin ? '⚡ Admin' : '🎵 Member'}
            </span>
          </div>

          {/* Details Card */}
          <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '24px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Login Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '14px',
                  background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <FiMail color="#c4b5fd" size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</div>
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>{displayUser?.email || '—'}</div>
                </div>
              </div>

              {/* Phone */}
              {displayUser?.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '14px',
                    background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <FiPhone color="#93c5fd" size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phone</div>
                    <div style={{ fontSize: '15px', fontWeight: '600' }}>{displayUser.phone}</div>
                  </div>
                </div>
              )}

              {/* Member Since */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '14px',
                  background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <FiCalendar color="#6ee7b7" size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Member Since</div>
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>{memberSince}</div>
                </div>
              </div>

              {/* Role */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '14px',
                  background: 'rgba(244,63,142,0.1)', border: '1px solid rgba(244,63,142,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <FiShield color="#f9a8d4" size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Account Role</div>
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>{isAdmin ? 'Administrator' : 'Regular User'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="btn"
            style={{
              width: '100%', padding: '16px', borderRadius: '16px', fontSize: '15px', fontWeight: '700',
              background: 'rgba(244,63,142,0.12)', border: '1px solid rgba(244,63,142,0.3)',
              color: '#f9a8d4', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '10px', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,142,0.22)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,63,142,0.12)'; }}
          >
            <FiLogOut size={18} />
            Sign Out
          </button>
        </>
      )}
    </div>
  );
};

export default Profile;
