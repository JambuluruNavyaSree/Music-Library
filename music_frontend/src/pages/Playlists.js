import React, { useState, useEffect } from 'react';
import { getPlaylists, createPlaylist, deletePlaylist, updatePlaylist } from '../services/api.js';
import { Link } from 'react-router-dom';
import { FiPlus, FiList, FiTrash2, FiDisc, FiX, FiEdit2, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);   // which playlist is being renamed
  const [editName, setEditName] = useState('');

  useEffect(() => { fetchPlaylists(); }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await getPlaylists();
      setPlaylists(res.data || []);
    } catch {
      toast.error('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createPlaylist({ playlistName: newName.trim() });
      toast.success('Playlist created!');
      setNewName('');
      setShowModal(false);
      fetchPlaylists();
    } catch {
      toast.error('Failed to create playlist');
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this playlist?')) return;
    try {
      await deletePlaylist(id);
      toast.success('Playlist deleted');
      fetchPlaylists();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleRename = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editName.trim()) return;
    try {
      await updatePlaylist(id, { playlistName: editName.trim() });
      toast.success('Renamed!');
      setEditId(null);
      fetchPlaylists();
    } catch {
      toast.error('Failed to rename');
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 42px)', marginBottom: '8px' }}>My Library</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>All your playlists in one place</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ height: '48px', padding: '0 28px' }}>
          <FiPlus /> Create Playlist
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="spinner" /></div>
      ) : playlists.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--text-muted)' }}>
          <FiList size={48} style={{ opacity: 0.4, marginBottom: '20px' }} />
          <h3 style={{ color: 'white', marginBottom: '8px' }}>No playlists yet</h3>
          <p style={{ marginBottom: '24px' }}>Create your first playlist to start organizing your music</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Create Playlist</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {playlists.map(pl => (
            <Link
              to={`/playlists/${pl._id}`}
              key={pl._id}
              className="glass-card"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block', position: 'relative', transition: 'transform 0.2s' }}
            >
              {/* Playlist Art – collage of first 4 song covers */}
              <div style={{
                width: '100%', aspectRatio: '1', borderRadius: '16px', marginBottom: '16px',
                overflow: 'hidden', position: 'relative',
                background: pl.playlistName === 'Liked Songs'
                  ? 'linear-gradient(135deg, rgba(244,63,142,0.3), rgba(139,92,246,0.3))'
                  : 'linear-gradient(135deg, rgba(108,61,211,0.2), rgba(14,165,233,0.2))',
              }}>
                {(() => {
                  const covers = (pl.songs || [])
                    .map(s => (typeof s === 'object' ? s.coverImage : null))
                    .filter(Boolean)
                    .slice(0, 4);

                  if (covers.length === 0) {
                    return (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '64px' }}>{pl.playlistName === 'Liked Songs' ? '❤️' : '🎧'}</span>
                      </div>
                    );
                  }

                  if (covers.length === 1) {
                    return <img src={covers[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
                  }

                  // 2×2 grid collage
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', height: '100%' }}>
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} style={{ overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                          {covers[i] && <img src={covers[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Name */}
              {editId === pl._id ? (
                <form onSubmit={(e) => handleRename(pl._id, e)} onClick={e => e.preventDefault()} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    autoFocus
                    className="glass-input"
                    style={{ flex: 1, fontSize: '14px' }}
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Escape' && setEditId(null)}
                  />
                  <button type="submit" style={{ background: 'var(--accent)', border: 'none', color: 'white', padding: '0 12px', borderRadius: '10px', cursor: 'pointer' }}><FiCheck /></button>
                </form>
              ) : (
                <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{pl.playlistName}</h3>
              )}
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{pl.songs?.length || 0} songs</p>

              {/* Action Buttons */}
              {pl.playlistName !== 'Liked Songs' && (
                <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }} onClick={e => e.preventDefault()}>
                  <button
                    title="Rename"
                    onClick={e => { e.stopPropagation(); setEditId(pl._id); setEditName(pl.playlistName); }}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <FiEdit2 size={14} />
                  </button>
                  <button
                    title="Delete"
                    onClick={(e) => handleDelete(pl._id, e)}
                    style={{ background: 'rgba(244,63,142,0.1)', border: 'none', color: 'var(--danger)', padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ margin: 0 }}>New Playlist</h2>
              <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '22px' }} onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreate}>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>Playlist Name</label>
              <input
                type="text" className="glass-input" style={{ width: '100%', marginBottom: '28px' }}
                value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Midnight Melodies" autoFocus required
              />
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0 28px' }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlists;
