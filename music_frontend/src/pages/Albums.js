import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlbums } from '../services/api.js';
import { FiDisc } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Albums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAlbums()
      .then(r => setAlbums(r.data || []))
      .catch(() => toast.error('Failed to load albums'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? albums.filter(a => a.albumName?.toLowerCase().includes(search.toLowerCase()))
    : albums;

  return (
    <div className="fade-in" style={{ paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 42px)', marginBottom: '8px' }}>Albums</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          {albums.length} collections · click to browse songs
        </p>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: '32px', maxWidth: '400px', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search albums…"
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
          <FiDisc size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <p>No albums found</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '24px',
        }}>
          {filtered.map(album => (
            <div
              key={album._id}
              className="glass-card"
              onClick={() => navigate(`/songs?album=${album._id}`)}
              style={{ padding: '24px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Disc circle or Cover Image */}
              <div style={{
                width: '120px', height: '120px', borderRadius: '50%',
                background: album.coverImage ? 'none' : 'var(--accent-gradient)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '40px', fontWeight: '800', color: 'white',
                boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                position: 'relative',
                overflow: 'hidden',
                border: '4px solid rgba(255,255,255,0.05)'
              }}>
                {album.coverImage ? (
                  <img src={album.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <FiDisc />
                    {/* Vinyl record effect */}
                    <div style={{
                      position: 'absolute', inset: '15%', border: '4px solid rgba(255,255,255,0.1)',
                      borderRadius: '50%', pointerEvents: 'none'
                    }} />
                  </>
                )}
              </div>
              <div style={{ fontWeight: '700', fontSize: '17px', marginBottom: '6px', wordBreak: 'break-word', color: 'white' }}>
                {album.albumName}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {album.directorId?.directorName ? `🎬 ${album.directorId.directorName}` : 'Various Artists'}
              </div>
              {album.releaseDate && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {new Date(album.releaseDate).getFullYear()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Albums;
