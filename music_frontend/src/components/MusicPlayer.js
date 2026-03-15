import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext.js';
import { useLiked }  from '../context/LikedContext.js';
import { useAuth } from '../context/AuthContext.js'; // NEW: Import useAuth
import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiVolume2, FiMusic, FiRepeat, FiShuffle,
  FiHeart, FiList, FiPlus, FiChevronDown, FiChevronUp, // NEW: Import FiPlus
} from 'react-icons/fi';
import { addSongToPlaylist } from '../services/api.js';
import toast from 'react-hot-toast';

/* ── helpers ── */
const fmt = (s) => {
  if (!s || isNaN(s)) return '0:00';
  const m   = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
};

const MusicPlayer = () => {
  /* ── context ── */
  const {
    currentSong, isPlaying, togglePlay,
    playNext, playPrev,
    progress, seek, duration,
    volume, setVolume,
    isRepeat, isShuffle,
    toggleRepeat, toggleShuffle,
    queue, currentIndex, playSong,
  } = usePlayer();

  const { isLiked: _isLiked, toggleLike, playlists } = useLiked();
  const { isAdmin } = useAuth(); // NEW: Get isAdmin auth status

  /* ── local state ── */
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [isFullScreen,  setIsFullScreen]  = useState(false);

  /* ── derived ── */
  const isLiked = currentSong ? _isLiked(currentSong._id) : false;
  const pct     = duration ? (progress / duration) * 100 : 0;
  const upNext  = (queue || []).slice(currentIndex + 1, currentIndex + 11);

  /* ── handlers ── */
  const handleLike = async () => {
    if (!currentSong) return;
    await toggleLike(currentSong);
  };

  const handleAddToPlaylist = async (pid) => {
    if (!currentSong) return;
    try {
      await addSongToPlaylist(pid, currentSong._id);
      toast.success('Added to playlist!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add');
    }
    setShowPlaylists(false);
  };

  /* ── style helpers ── */
  const iconBtn = (active = false, color = 'var(--text-secondary)') => ({
    background:  active ? 'rgba(139,92,246,0.18)' : 'transparent',
    border: 'none', cursor: 'pointer', borderRadius: '10px',
    width: '36px', height: '36px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px',
    color: active ? 'var(--accent-light)' : color,
    boxShadow: active ? '0 0 10px rgba(139,92,246,0.4)' : 'none',
    transition: 'all 0.2s',
  });

  const skipBtn = {
    background: 'linear-gradient(135deg,rgba(139,92,246,0.25),rgba(59,130,246,0.25))',
    border: '1px solid rgba(139,92,246,0.3)',
    cursor: 'pointer', borderRadius: '12px',
    width: '44px', height: '44px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', color: '#c4b5fd', transition: 'all 0.2s',
  };

  const playPauseBtn = {
    width: '50px', height: '50px', padding: 0,
    borderRadius: '20px', fontSize: '28px',
    background: 'var(--accent-gradient)', border: 'none', cursor: 'pointer', color: 'white',
    boxShadow: '0 0 24px rgba(139,92,246,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'transform 0.15s',
  };

  /* ────────────────────────────────────────────────────────
     FULL-SCREEN PLAYER  (only when a song is loaded)
  ──────────────────────────────────────────────────────── */
  if (isFullScreen && currentSong) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10, 6, 28, 0.95)',
        backdropFilter: 'blur(40px)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        color: 'white', overflow: 'hidden',
      }}>

        {/* blurred album art background */}
        {currentSong.coverImage && (
          <div style={{
            position: 'absolute', inset: -50, zIndex: 0,
            backgroundImage: `url(${currentSong.coverImage})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'blur(80px) brightness(0.4)', opacity: 0.6,
          }} />
        )}

        {/* dismiss */}
        <button
          onClick={() => setIsFullScreen(false)}
          style={{ position: 'absolute', top: 32, left: 32, zIndex: 10, ...iconBtn() }}
        >
          <FiChevronDown size={32} color="white" />
        </button>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', width: '100%', height: '100%' }}>

          {/* LEFT — art + controls */}
          <div style={{ flex: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>

            {/* Album art */}
            <div style={{
              width: 'min(480px, 80vh)', height: 'min(480px, 80vh)',
              borderRadius: '24px', overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)', marginBottom: '48px',
              background: 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {currentSong.coverImage
                ? <img src={currentSong.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <FiMusic size={80} style={{ opacity: 0.2 }} />}
            </div>

            {/* Title / artist / like */}
            <div style={{ width: 'min(500px, 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px', lineHeight: 1.1 }}>{currentSong.songName}</h1>
                <p style={{ fontSize: '18px', color: 'var(--accent-light)' }}>
                  {currentSong.artistId?.[0]?.artistName || 'Unknown Artist'}
                  {currentSong.albumId?.albumName ? ` • ${currentSong.albumId.albumName}` : ''}
                </p>
              </div>
              {!isAdmin && ( // Conditional rendering for non-admin
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '2px' }}>
                  <button style={iconBtn(false)} onClick={() => setShowPlaylists(v => !v)} title="Add to Playlist">
                    <FiPlus size={20} />
                  </button>
                  <button style={iconBtn(isLiked, isLiked ? '#f43f8e' : 'rgba(255,255,255,0.5)')} onClick={handleLike}>
                    <FiHeart size={28} style={{ fill: isLiked ? 'currentColor' : 'none' }} />
                  </button>
                  {showPlaylists && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: 'rgba(18,12,32,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '16px', minWidth: '200px', padding: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 2000 }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', padding: '6px 12px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Add to Playlist</div>
                      {(playlists || []).filter(p => p.playlistName !== 'Liked Songs').length === 0 ? (
                        <div style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>No other playlists found</div>
                      ) : (playlists || []).filter(p => p.playlistName !== 'Liked Songs').map(pl => (
                        <button
                          key={pl._id}
                          onClick={() => handleAddToPlaylist(pl._id)}
                          style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', color: 'white', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.15)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          🎵 {pl.playlistName || pl.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Progress */}
            <div style={{ width: 'min(500px, 100%)', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontVariantNumeric: 'tabular-nums' }}>
                <span>{fmt(progress)}</span>
                <span>{fmt(duration)}</span>
              </div>
              <div
                onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seek((e.clientX - r.left) / r.width * duration); }}
                style={{ height: '6px', background: 'rgba(255,255,255,0.15)', cursor: 'pointer', borderRadius: '3px' }}
              >
                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '3px', position: 'relative', boxShadow: '0 0 16px var(--accent-light)' }}>
                  <div style={{ position: 'absolute', right: -6, top: -4, width: 14, height: 14, background: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }} />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ width: 'min(500px, 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button style={iconBtn(isShuffle)} onClick={toggleShuffle}><FiShuffle size={20} /></button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <button style={{ ...skipBtn, width: '56px', height: '56px' }} onClick={playPrev}><FiSkipBack size={24} /></button>
                <button style={{ ...playPauseBtn, width: '80px', height: '80px', fontSize: '32px' }} onClick={togglePlay}>
                  {isPlaying ? <FiPause /> : <FiPlay style={{ marginLeft: '4px' }} />}
                </button>
                <button style={{ ...skipBtn, width: '56px', height: '56px' }} onClick={playNext}><FiSkipForward size={24} /></button>
              </div>
              <button style={iconBtn(isRepeat)} onClick={toggleRepeat}><FiRepeat size={20} /></button>
            </div>
          </div>

          {/* RIGHT — Up Next */}
          <div style={{ flex: 4, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '40px 32px 24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Up Next</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>From current queue</p>
            </div>
            <div style={{ flex: 1, padding: '0 32px 40px', overflowY: 'auto' }}>
              {upNext.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', paddingTop: 20 }}>No upcoming songs.</div>
              ) : upNext.map((song, i) => (
                <div
                  key={song._id || i}
                  onClick={() => playSong(queue, currentIndex + 1 + i)}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }}>
                    {song.coverImage && <img src={song.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{song.songName}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{song.artistId?.[0]?.artistName || 'Unknown Artist'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────
     No song loaded → hide player entirely
  ──────────────────────────────────────────────────────── */
  if (!currentSong) return null;

  /* ────────────────────────────────────────────────────────
     MINI PLAYER (bottom bar)
  ──────────────────────────────────────────────────────── */
  return (
    <div className="glass" style={{
      position: 'fixed', bottom: '24px', left: '24px', right: '24px',
      height: 'var(--player-height)', borderRadius: '24px',
      display: 'flex', alignItems: 'center', padding: '0 28px',
      zIndex: 1000, gap: '24px', transition: 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>

      {/* Song info */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px', cursor: 'pointer', transition: 'transform 0.2s' }}
        onClick={() => setIsFullScreen(true)}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="Click for full screen player"
      >
        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
          {currentSong.coverImage
            ? <img src={currentSong.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <FiMusic size={22} style={{ opacity: 0.3 }} />}
          <div className="expand-hint" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
            <FiChevronUp color="white" size={24} />
          </div>
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '15px', color: 'white', marginBottom: '2px' }}>{currentSong.songName}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{currentSong.artistId?.[0]?.artistName || 'Unknown Artist'}</div>
        </div>
      </div>

      {/* Centre controls */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '2px' }}>
          <button style={iconBtn(isShuffle)} onClick={toggleShuffle} title="Shuffle"><FiShuffle /></button>
          <button style={skipBtn} onClick={playPrev} title="Previous"><FiSkipBack /></button>
          <button style={playPauseBtn} onClick={togglePlay}>
            {isPlaying ? <FiPause /> : <FiPlay style={{ marginLeft: '4px' }} />}
          </button>
          <button style={skipBtn} onClick={playNext} title="Next"><FiSkipForward /></button>
          <button style={iconBtn(isRepeat)} onClick={toggleRepeat} title="Repeat"><FiRepeat /></button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '460px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', minWidth: '32px', textAlign: 'right' }}>{fmt(progress)}</span>
          <div
            onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); seek((e.clientX - rect.left) / rect.width * duration); }}
            style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', cursor: 'pointer', borderRadius: '2px' }}
          >
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '2px', boxShadow: '0 0 12px var(--accent-light)' }} />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', minWidth: '32px' }}>{fmt(duration)}</span>
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px', justifyContent: 'flex-end' }}>
        {!isAdmin && (
          <>
            <button
              style={{ ...iconBtn(isLiked, isLiked ? '#f43f8e' : 'var(--text-secondary)'), transition: 'transform 0.2s', transform: isLiked ? 'scale(1.1)' : 'scale(1)' }}
              onClick={handleLike}
              title={isLiked ? 'Remove from liked' : 'Add to liked songs'}
            >
              <FiHeart style={{ fill: isLiked ? 'currentColor' : 'none' }} />
            </button>

            <div style={{ position: 'relative' }}>
              <button style={iconBtn(showPlaylists)} onClick={() => setShowPlaylists(v => !v)} title="Add to playlist">
                <FiList />
              </button>

              {showPlaylists && (
                <div style={{ position: 'absolute', bottom: '48px', right: 0, background: 'rgba(18,12,32,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '16px', minWidth: '200px', padding: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 2000 }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', padding: '6px 12px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Add to Playlist</div>
                  {(playlists || []).filter(p => p.playlistName !== 'Liked Songs').length === 0 ? (
                    <div style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>No other playlists found</div>
                  ) : (playlists || []).filter(p => p.playlistName !== 'Liked Songs').map(pl => (
                    <button
                      key={pl._id}
                      onClick={() => handleAddToPlaylist(pl._id)}
                      style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', color: 'white', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.15)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      🎵 {pl.playlistName || pl.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <FiVolume2 style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
        <input
          type="range" min="0" max="1" step="0.01" value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          style={{ accentColor: 'var(--accent-light)', width: '90px', height: '4px' }}
        />

        <button style={iconBtn()} onClick={() => setIsFullScreen(true)} title="Full Screen">
          <FiChevronUp size={24} />
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer;
