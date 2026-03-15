import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPlaylistById, updatePlaylist, getSongs } from '../services/api.js';
import { usePlayer } from '../context/PlayerContext.js';
import {
  FiPlus, FiTrash2, FiPlay, FiMusic, FiX, FiEdit2, FiCheck,
  FiShuffle, FiRepeat, FiSearch, FiInfo, FiPause
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const PlaylistDetail = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null); // for detail modal

  // Search & rename states
  const [searchIn, setSearchIn] = useState('');       // search within playlist
  const [addSearch, setAddSearch] = useState('');     // search in "Add songs" modal
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const {
    playSong, currentSong, isPlaying, togglePlay,
    isRepeat, isShuffle, toggleRepeat, toggleShuffle
  } = usePlayer();

  useEffect(() => {
    fetchPlaylist();
    fetchAllSongs();
  }, [id]);

  const fetchPlaylist = async () => {
    try {
      const res = await getPlaylistById(id);
      setPlaylist(res.data);
      setNewName(res.data.playlistName);
    } catch {
      toast.error('Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSongs = async () => {
    try {
      const res = await getSongs({ limit: 500 });
      setAllSongs(res.data?.songs || res.data || []);
    } catch {}
  };

  /* ── CRUD: songs ── */
  const addSong = async (songId) => {
    try {
      const songIds = (playlist.songs || []).map(s => s._id);
      if (songIds.includes(songId)) { toast.error('Song already in playlist'); return; }
      await updatePlaylist(id, { songs: [...songIds, songId] });
      toast.success('Song added!');
      fetchPlaylist();
    } catch {
      toast.error('Failed to add song');
    }
  };

  const removeSong = async (songId) => {
    try {
      const newSongs = playlist.songs.filter(s => s._id !== songId).map(s => s._id);
      await updatePlaylist(id, { songs: newSongs });
      toast.success('Song removed');
      fetchPlaylist();
    } catch {
      toast.error('Failed to remove song');
    }
  };

  /* ── CRUD: rename playlist ── */
  const handleRename = async () => {
    if (!newName.trim()) return;
    try {
      await updatePlaylist(id, { playlistName: newName.trim() });
      toast.success('Playlist renamed!');
      setEditingName(false);
      fetchPlaylist();
    } catch {
      toast.error('Failed to rename playlist');
    }
  };

  /* ── Player helpers ── */
  const playAll = () => {
    if (playlist?.songs?.length) playSong(playlist.songs, 0);
  };

  const playAllShuffled = () => {
    if (!playlist?.songs?.length) return;
    if (!isShuffle) toggleShuffle();
    const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
    playSong(shuffled, 0);
  };

  /* ── Filter songs inside playlist ── */
  const filteredPlaylistSongs = (playlist?.songs || []).filter(s => {
    const q = searchIn.toLowerCase();
    return !q ||
      s.songName?.toLowerCase().includes(q) ||
      s.artistId?.some(a => a.artistName?.toLowerCase().includes(q)) ||
      s.albumId?.albumName?.toLowerCase().includes(q) ||
      s.directorId?.directorName?.toLowerCase().includes(q);
  });

  /* ── Filter songs in Add modal ── */
  const filteredAddSongs = allSongs.filter(s => {
    const q = addSearch.toLowerCase();
    return !q ||
      s.songName?.toLowerCase().includes(q) ||
      s.artistId?.some(a => a.artistName?.toLowerCase().includes(q)) ||
      s.albumId?.albumName?.toLowerCase().includes(q);
  });

  const isCurrentlyPlaying = (song) =>
    currentSong?._id === song._id && isPlaying;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="spinner" /></div>;
  if (!playlist) return <div className="fade-in">Playlist not found</div>;

  return (
    <div className="fade-in">

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          {editingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <input
                autoFocus
                className="glass-input"
                style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: '800', width: '100%', maxWidth: '400px' }}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingName(false); }}
              />
              <button className="btn btn-primary" style={{ padding: '0 20px', height: '46px' }} onClick={handleRename}><FiCheck /> Save</button>
              <button className="btn btn-secondary" style={{ padding: '0 16px', height: '46px' }} onClick={() => setEditingName(false)}><FiX /></button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', margin: 0 }}>{playlist.playlistName}</h1>
              <button
                onClick={() => setEditingName(true)}
                style={{ background: 'rgba(255,255,255,0.07)', border: 'none', color: 'var(--text-muted)', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}
                title="Rename playlist"
              >
                <FiEdit2 size={16} />
              </button>
            </div>
          )}
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>{playlist.songs?.length || 0} tracks</p>
        </div>

        <button className="btn btn-secondary" onClick={() => setShowAdd(!showAdd)} style={{ height: '48px', padding: '0 24px' }}>
          {showAdd ? <><FiX /> Close</> : <><FiPlus /> Add Songs</>}
        </button>
      </div>

      {/* ── Player Controls Bar ── */}
      {(playlist.songs?.length || 0) > 0 && (
        <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ gap: '8px' }} onClick={playAll}>
            <FiPlay /> Play All
          </button>
          {currentSong && (
            <button
              onClick={togglePlay}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '10px 20px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', marginLeft: 'auto' }}
            >
              {isPlaying ? <><FiPause /> Pause</> : <><FiPlay /> Resume</>}
            </button>
          )}
        </div>
      )}

      {/* ── Search within Playlist ── */}
      <div style={{ position: 'relative', maxWidth: '440px', marginBottom: '32px' }}>
        <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search songs in this playlist..."
          className="glass-input"
          style={{ width: '100%', paddingLeft: '44px' }}
          value={searchIn}
          onChange={e => setSearchIn(e.target.value)}
        />
      </div>

      {/* ── Song List ── */}
      {filteredPlaylistSongs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
          <FiMusic size={48} style={{ opacity: 0.3, marginBottom: '20px' }} />
          <h3 style={{ color: 'white', marginBottom: '8px' }}>{searchIn ? 'No matches' : 'No songs yet'}</h3>
          <p>{searchIn ? 'Try a different search term' : 'Click "Add Songs" to build your playlist'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredPlaylistSongs.map((song, i) => (
            <div
              key={song._id}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '14px 20px', borderRadius: '16px',
                background: isCurrentlyPlaying(song) ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isCurrentlyPlaying(song) ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.2s', cursor: 'pointer'
              }}
              onClick={() => playSong(filteredPlaylistSongs, i)}
            >
              {/* Track number / playing indicator */}
              <div style={{ width: '32px', textAlign: 'center', fontSize: '13px', color: isCurrentlyPlaying(song) ? 'var(--accent-light)' : 'var(--text-muted)', flexShrink: 0 }}>
                {isCurrentlyPlaying(song) ? <FiPlay size={16} /> : i + 1}
              </div>

              {/* Thumb */}
              <div style={{ width: '52px', height: '52px', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }}>
                {song.coverImage
                  ? <img src={song.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <FiMusic size={20} style={{ opacity: 0.3, position: 'relative', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '700', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isCurrentlyPlaying(song) ? 'var(--accent-light)' : 'white' }}>
                  {song.songName}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {song.artistId?.map(a => a.artistName).join(', ') || 'Unknown Artist'}
                  {song.albumId?.albumName ? ` · ${song.albumId.albumName}` : ''}
                  {song.directorId?.directorName ? ` · 🎬 ${song.directorId.directorName}` : ''}
                </div>
                {song.releaseDate && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Released: {new Date(song.releaseDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                <button
                  title="Song details"
                  onClick={() => setSelectedSong(song)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <FiInfo size={18} />
                </button>
                <button
                  title="Remove from playlist"
                  onClick={() => removeSong(song._id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Song Detail Modal ── */}
      {selectedSong && (
        <div className="modal-overlay" onClick={() => setSelectedSong(null)}>
          <div className="modal glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0 }}>Song Details</h2>
              <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '22px' }} onClick={() => setSelectedSong(null)}><FiX /></button>
            </div>
            {selectedSong.coverImage && (
              <img src={selectedSong.coverImage} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '16px', marginBottom: '24px' }} />
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              {[
                ['Song Name', selectedSong.songName],
                ['Album', selectedSong.albumId?.albumName || '—'],
                ['Artists', selectedSong.artistId?.map(a => a.artistName).join(', ') || 'Unknown'],
                ['Music Director', selectedSong.directorId?.directorName || '—'],
                ['Release Date', selectedSong.releaseDate ? new Date(selectedSong.releaseDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'],
              ].map(([label, val]) => (
                <tr key={label} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '12px 0', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', width: '140px' }}>{label}</td>
                  <td style={{ padding: '12px 0', fontSize: '14px', color: 'white' }}>{val}</td>
                </tr>
              ))}
            </table>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }} onClick={() => { playSong([selectedSong], 0); setSelectedSong(null); }}>
              <FiPlay /> Play Now
            </button>
          </div>
        </div>
      )}

      {/* ── Add Songs Modal ── */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Add Songs</h2>
              <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '22px' }} onClick={() => setShowAdd(false)}><FiX /></button>
            </div>

            {/* Search within add modal */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search songs to add..."
                className="glass-input"
                style={{ width: '100%', paddingLeft: '44px' }}
                value={addSearch}
                onChange={e => setAddSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredAddSongs.map(song => {
                  const isInPlaylist = playlist.songs?.some(s => s._id === song._id);
                  return (
                    <div key={song._id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 16px', borderRadius: '14px',
                      background: isInPlaylist ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isInPlaylist ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }}>
                          {song.coverImage ? <img src={song.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700' }}>{song.songName}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {song.artistId?.[0]?.artistName || 'Unknown'} {song.albumId?.albumName ? `· ${song.albumId.albumName}` : ''}
                          </div>
                        </div>
                      </div>
                      <button
                        className={`btn ${isInPlaylist ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ padding: '6px 18px', fontSize: '12px', opacity: isInPlaylist ? 0.6 : 1 }}
                        onClick={() => !isInPlaylist && addSong(song._id)}
                        disabled={isInPlaylist}
                      >
                        {isInPlaylist ? '✓ Added' : '+ Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetail;
