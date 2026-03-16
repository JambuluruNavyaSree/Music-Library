import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDirectors } from '../services/api.js';
import { FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Directors = () => {
  const [directors, setDirectors] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getDirectors()
      .then(r => setDirectors(r.data || []))
      .catch(() => toast.error('Failed to load directors'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? directors.filter(d => d.directorName?.toLowerCase().includes(search.toLowerCase()))
    : directors;

  return (
    <div className="fade-in" style={{ paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 42px)', marginBottom: '8px' }}>Directors</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          {directors.length} directors · click to browse their songs
        </p>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: '32px', maxWidth: '400px', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search directors…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="glass-input"
          style={{ width: '100%', paddingLeft: '16px' }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <FiUsers size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <p>No directors found</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '24px',
        }}>
          {filtered.map(director => (
            <div
              key={director._id}
              className="glass-card"
              onClick={() => navigate(`/songs?director=${director._id}`)}
              style={{ padding: '28px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Avatar circle */}
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%',
                background: director.directorPhoto ? 'none' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '36px', fontWeight: '800', color: 'white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                overflow: 'hidden',
                border: '3px solid rgba(255,255,255,0.1)'
              }}>
                {director.directorPhoto ? (
                  <img src={director.directorPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  director.directorName?.[0]?.toUpperCase() || <FiUsers />
                )}
              </div>
              <div style={{ fontWeight: '700', fontSize: '15px', wordBreak: 'break-word' }}>
                {director.directorName}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Directors;
