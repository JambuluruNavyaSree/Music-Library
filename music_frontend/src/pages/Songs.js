import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getSongs, getAlbums, getArtists, getDirectors, addSongToPlaylist } from '../services/api.js';
import { usePlayer } from '../context/PlayerContext.js';
import { useLiked } from '../context/LikedContext.js';
import { useAuth } from '../context/AuthContext.js'; // NEW: Import useAuth
import { FiSearch, FiMusic, FiFilter, FiHeart, FiPlus, FiMoreVertical, FiPlay } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Songs = () => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayer();
  const { isLiked, toggleLike, playlists } = useLiked();
  const { isAdmin } = useAuth(); // NEW: Get isAdmin auth status
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState('');
  const [selectedArtist, setSelectedArtist] = useState('');
  const [selectedDirector, setSelectedDirector] = useState('');

  const location = useLocation();

  // Sync filters from URL params (set by navbar or direct navigation)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search')   || '';
    const artist = params.get('artist')   || '';
    const director = params.get('director') || '';
    const album = params.get('album') || '';
    if (search)   setSearchQuery(search);
    if (artist)   setSelectedArtist(artist);
    if (director) setSelectedDirector(director);
    if (album)    setSelectedAlbum(album);
  }, [location.search]);

  // Dropdown Options
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [directors, setDirectors] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLike = (e, song) => {
    e.stopPropagation();
    toggleLike(song);
  };

  const handleAddToPlaylist = async (e, playlistId, songId) => {
    e.stopPropagation();
    try {
      await addSongToPlaylist(playlistId, songId);
      toast.success('Added to playlist!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    }
    setActiveMenuId(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [songsRes, albRes, artRes, dirRes] = await Promise.all([
          getSongs({ limit: 500 }),
          getAlbums(),
          getArtists(),
          getDirectors()
        ]);
        
        const allSongs = songsRes.data?.songs || songsRes.data || [];
        setSongs(allSongs);
        setFilteredSongs(allSongs);

        setAlbums(albRes.data || []);
        setArtists(artRes.data || []);
        setDirectors(dirRes.data || []);

        // if there's a search param in URL from home page, apply it
        const params = new URLSearchParams(window.location.search);
        const q = params.get('search');
        if (q) setSearchQuery(q);

      } catch {
        toast.error('Failed to load library');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Client-side filtering logic
  useEffect(() => {
    let result = [...songs];

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.songName?.toLowerCase().includes(q) ||
        s.albumId?.albumName?.toLowerCase().includes(q) ||
        s.artistId?.some(a => a.artistName?.toLowerCase().includes(q)) ||
        s.directorId?.directorName?.toLowerCase().includes(q)
      );
    }

    // Dropdown filters
    if (selectedAlbum) {
      result = result.filter(s => s.albumId?._id === selectedAlbum);
    }
    if (selectedArtist) {
      result = result.filter(s => s.artistId?.some(a => a._id === selectedArtist));
    }
    if (selectedDirector) {
      result = result.filter(s => s.directorId?._id === selectedDirector);
    }

    setFilteredSongs(result);
  }, [songs, searchQuery, selectedAlbum, selectedArtist, selectedDirector]);

  return (
    <div className="fade-in" style={{ paddingBottom: '80px' }}>
      
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 42px)', marginBottom: '8px' }}>All Songs</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Browse and filter all available songs</p>
        </div>
      </div>



      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <div className="spinner" />
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
          <FiFilter size={48} style={{ opacity: 0.3, marginBottom: '20px' }} />
          <h3 style={{ color: 'white', marginBottom: '8px' }}>No matches found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      ) : (
        <div className="songs-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
          gap: '24px' 
        }}>
          {filteredSongs.map((song, i) => (
            <div 
              key={song._id} 
              className="glass-card" 
              style={{ padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
              onClick={() => playSong(filteredSongs, i)}
            >
              <div style={{ 
                width: '100%', aspectRatio: '1', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px',
                background: 'rgba(255, 255, 255, 0.05)', position: 'relative'
              }}>
                {song.coverImage ? (
                  <img src={song.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <FiMusic size={40} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.3 }} />
                )}
                
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(139,92,246,0.5)' }}>
                    <FiPlay color="white" size={24} style={{ marginLeft: 4 }} />
                  </div>
                </div>

                {/* ── Overlay Buttons (Like & Add to Playlist) ── */}
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8, zIndex: 10 }}>
                  {!isAdmin && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); toggleLike(song); }} style={{
                        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', border: 'none',
                        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: isLiked(song._id) ? '#f43f8e' : 'white', transition: 'all 0.2s'
                      }}>
                        <FiHeart fill={isLiked(song._id) ? '#f43f8e' : 'none'} size={18} />
                      </button>

                      <div style={{ position: 'relative' }}>
                        <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === song._id ? null : song._id); }} style={{
                          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', border: 'none',
                          width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: 'white', transition: 'all 0.2s'
                        }}>
                          <FiPlus size={18} />
                        </button>
                        {activeMenuId === song._id && (
                          <div ref={menuRef} style={{
                            position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 200,
                            background: 'rgba(12, 8, 32, 0.95)', backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                            padding: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 100
                          }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, padding: '0 8px' }}>
                              Add to Playlist
                            </div>
                            {playlists.map(pl => (
                              <div key={pl._id} onClick={(e) => handleAddToPlaylist(e, pl._id, song._id)} style={{
                                padding: '8px', fontSize: 13, borderRadius: 8, cursor: 'pointer',
                                transition: 'background 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                              }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                                {pl.playlistName}
                              </div>
                            ))}
                            {playlists.length === 0 && <div style={{ fontSize: 12, padding: 8, color: 'var(--text-muted)' }}>No playlists found</div>}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <h3 style={{ fontSize: '16px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.songName}</h3>
              <div style={{ fontSize: '13px', color: 'var(--accent-light)', fontWeight: '600', marginBottom: '8px' }}>
                {song.albumId?.albumName || 'Single'}
              </div>
              
              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ marginBottom: 4 }}>🎤 {song.artistId?.map(a => a.artistName).join(', ') || 'Unknown Artist'}</div>
                {song.directorId && <div>🎧 {song.directorId.directorName}</div>}
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Songs;
