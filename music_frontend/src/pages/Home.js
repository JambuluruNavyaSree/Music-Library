import React, { useState, useEffect } from 'react';
import { getSongs, getPlayHistory } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { usePlayer } from '../context/PlayerContext.js';
import { FiMusic, FiPlay, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Home.css';

const Home = () => {
  const { user, isAdmin } = useAuth();
  const { playSong } = usePlayer();

  const [historySongs, setHistorySongs] = useState([]);
  const [newSongs, setNewSongs]         = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isAdmin) {
          const [histRes, newRes] = await Promise.all([
            getPlayHistory(),
            getSongs({ limit: 10 })
          ]);
          setHistorySongs(histRes.data || []);
          setNewSongs(newRes.data?.songs || newRes.data || []);
        } else {
          const res = await getSongs({ limit: 10 });
          setNewSongs(res.data?.songs || res.data || []);
        }
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  const safeHistorySongs = Array.isArray(historySongs) ? historySongs : [];
  const safeNewSongs     = Array.isArray(newSongs) ? newSongs : [];

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="home-page">

      {/* ── Hero / Greeting ── */}
      <div className="home-hero" style={{ marginBottom: '40px' }}>
        <div className="home-hero-text">
          <p className="home-greeting">{greeting},</p>
          <p className="home-tagline">{!isAdmin ? 'Welcome to your Personal Library' : 'Welcome back'}</p>
        </div>
      </div>

      {/* ── Recently Played (Users Only) ── */}
      {!isAdmin && (
        <section className="home-section" style={{ marginBottom: '48px' }}>
          <div className="section-header">
            <h2><FiClock size={20} style={{ verticalAlign: 'text-bottom', marginRight: 8 }} />Recently Played</h2>
          </div>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : safeHistorySongs.length === 0 ? (
            <div className="empty-state"><h3>No recently played songs</h3></div>
          ) : (
            <div style={{
              display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '16px',
              scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch'
            }}>
              {safeHistorySongs.map((song, i) => (
                <div
                  key={song._id}
                  className="glass-card"
                  style={{ minWidth: '200px', maxWidth: '200px', flexShrink: 0, padding: '16px', scrollSnapAlign: 'start', cursor: 'pointer' }}
                  onClick={() => playSong(safeHistorySongs, i)}
                >
                  <div style={{ width: '100%', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px', position: 'relative', background: 'rgba(255,255,255,0.05)' }}>
                    {song.coverImage
                      ? <img src={song.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <FiMusic size={36} style={{ opacity: 0.3, position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
                    }
                    <div style={{
                      position: 'absolute', bottom: '8px', right: '8px',
                      width: '36px', height: '36px', background: 'var(--accent)', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'opacity 0.3s'
                    }} className="song-card-play">
                      <FiPlay color="white" style={{ marginLeft: '3px' }} />
                    </div>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.songName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {song.artistId?.map(a => a.artistName).join(', ') || 'Unknown Artist'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Recently Added (All users) ── */}
      <section className="home-section" style={{ marginBottom: '48px' }}>
        <div className="section-header">
          <h2><FiMusic size={20} style={{ verticalAlign: 'text-bottom', marginRight: 8 }} />Recently Added</h2>
        </div>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : safeNewSongs.length === 0 ? (
          <div className="empty-state"><h3>No new songs</h3></div>
        ) : (
          <div style={{
            display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '16px',
            scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch'
          }}>
            {safeNewSongs.map((song, i) => (
              <div
                key={song._id}
                className="glass-card"
                style={{ minWidth: '200px', maxWidth: '200px', flexShrink: 0, padding: '16px', scrollSnapAlign: 'start', cursor: 'pointer' }}
                onClick={() => playSong(safeNewSongs, i)}
              >
                <div style={{ width: '100%', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px', position: 'relative', background: 'rgba(255,255,255,0.05)' }}>
                  {song.coverImage
                    ? <img src={song.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <FiMusic size={36} style={{ opacity: 0.3, position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
                  }
                  <div style={{
                    position: 'absolute', bottom: '8px', right: '8px',
                    width: '36px', height: '36px', background: 'var(--accent)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.3s'
                  }} className="song-card-play">
                    <FiPlay color="white" style={{ marginLeft: '3px' }} />
                  </div>
                </div>
                <div style={{ fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.songName}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {song.artistId?.map(a => a.artistName).join(', ') || 'Unknown Artist'}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
