import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getArtists } from '../services/api.js';
import { FiMic } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Artists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getArtists()
      .then(r => setArtists(r.data || []))
      .catch(() => toast.error('Failed to load artists'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? artists.filter(a => a.artistName?.toLowerCase().includes(search.toLowerCase()))
    : artists;

  return (
    <div className="fade-in" style={{ paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 42px)', marginBottom: '8px' }}>Artists</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          {artists.length} artists · click to browse their songs
        </p>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: '32px', maxWidth: '400px', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search artists…"
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
          <FiMic size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <p>No artists found</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '24px',
        }}>
          {filtered.map(artist => (
            <div
              key={artist._id}
              className="glass-card"
              onClick={() => navigate(`/songs?artist=${artist._id}`)}
              style={{ padding: '28px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Avatar circle */}
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'var(--accent-gradient)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '28px', fontWeight: '800', color: 'white',
                boxShadow: '0 8px 24px rgba(139,92,246,0.4)',
              }}>
                {artist.artistName?.[0]?.toUpperCase() || <FiMic />}
              </div>
              <div style={{ fontWeight: '700', fontSize: '15px', wordBreak: 'break-word' }}>
                {artist.artistName}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Artists;
