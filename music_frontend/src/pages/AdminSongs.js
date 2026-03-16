import React, { useState, useEffect } from 'react';
import {
  getSongs, createSong, updateSong, deleteSong, toggleSongVisibility,
  getAlbums, getArtists, getDirectors
} from '../services/api.js';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiSearch, FiX, FiMusic, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Modal from '../components/Modal.js';

const emptyForm = { 
  songName: '', 
  albumId: '', 
  artistId: [], 
  artistName: '', 
  directorId: '', 
  duration: '', 
  releaseDate: '',
  file: null, 
  coverFile: null,
  directorPhotoFile: null,
  artistPhotos: [] 
};

const AdminSongs = () => {
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    try {
      const [sRes, aRes, arRes, dRes] = await Promise.all([getSongs({ all: true }), getAlbums(), getArtists(), getDirectors()]);
      setSongs(sRes.data?.songs || sRes.data || []);
      setAlbums(aRes.data || []);
      setArtists(arRes.data || []);
      setDirectors(dRes.data || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (song) => {
    setEditTarget(song);
    setForm({
      songName: song.songName,
      albumId: song.albumId?.albumName || '',
      artistId: song.artistId?.map(a => a._id) || [],
      artistName: song.artistId?.map(a => a.artistName).join(', ') || '',
      directorId: song.directorId?.directorName || '',
      duration: song.duration || '',
      releaseDate: song.albumId?.releaseDate ? song.albumId.releaseDate.slice(0, 10) : '',
      file: null,
      coverFile: null,
      directorPhotoFile: null,
      artistPhotos: []
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.songName.trim() || !form.albumId || !form.directorId) {
      toast.error('Song name, album and director are required'); return;
    }
    if (!editTarget && !form.file) { toast.error('Audio file is required for new songs'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('songName', form.songName);
      fd.append('albumId', form.albumId);
      fd.append('directorId', form.directorId);
      if (form.artistName) fd.append('artistName', form.artistName);
      if (form.duration) fd.append('duration', form.duration);
      if (form.releaseDate) fd.append('releaseDate', form.releaseDate);
      
      form.artistId.forEach(id => fd.append('artistId', id));
      if (form.file) fd.append('songFile', form.file);
      if (form.coverFile) fd.append('coverImage', form.coverFile);
      if (form.directorPhotoFile) fd.append('directorPhoto', form.directorPhotoFile);
      
      form.artistPhotos.forEach(p => fd.append('artistPhotos', p));

      if (editTarget) {
        await updateSong(editTarget._id, fd);
        toast.success('Song updated');
      } else {
        await createSong(fd);
        toast.success('Song added!');
      }
      setShowModal(false);
      await fetchAll(); // Re-fetch to get fully populated data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save song');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this song permanently?')) return;
    try {
      await deleteSong(id);
      toast.success('Song deleted');
      await fetchAll(); // Re-fetch to update list immediately
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggleVisibility = async (id) => {
    try {
      const { data } = await toggleSongVisibility(id);
      setSongs(s => s.map(x => x._id === id ? { ...x, isVisible: data.song.isVisible } : x));
      toast.success(data.message);
    } catch { toast.error('Failed to toggle visibility'); }
  };

  const toggleArtist = (id) => {
    setForm(f => ({
      ...f,
      artistId: f.artistId.includes(id)
        ? f.artistId.filter(x => x !== id)
        : [...f.artistId, id]
    }));
  };

  const filtered = Array.isArray(songs) ? songs.filter(s =>
    !search.trim() || s.songName.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 42px)', marginBottom: '8px' }}>Manage Library</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Master control for all musical assets</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{ height: '52px', padding: '0 32px' }}><FiPlus /> Add New Song</button>
      </div>

      <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '32px' }}>
        <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" placeholder="Search library…" 
          className="glass-input" style={{ width: '100%', paddingLeft: '44px' }}
          value={search} onChange={e => setSearch(e.target.value)} 
        />
      </div>

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="spinner" /></div> : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
                <tr>
                  <th style={{ padding: '20px 24px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Song</th>
                  <th style={{ padding: '20px 24px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Artist</th>
                  <th style={{ padding: '20px 24px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Music Director</th>
                  <th style={{ padding: '20px 24px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '20px 24px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>No records found</td></tr>
                ) : filtered.map(song => (
                  <tr key={song._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: '700', fontSize: '15px' }}>{song.songName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600' }}>{song.albumId?.albumName || '—'}</div>
                    </td>
                    <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{song.artistId?.map(a => a.artistName).join(', ') || '—'}</td>
                    <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{song.directorId?.directorName || '—'}</td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '11px', 
                        fontWeight: '700',
                        background: song.isVisible ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 142, 0.1)',
                        color: song.isVisible ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {song.isVisible ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-icon" onClick={() => handleToggleVisibility(song._id)} title="Toggle Visibility">
                          {song.isVisible ? <FiEye /> : <FiEyeOff />}
                        </button>
                        <button className="btn btn-icon" onClick={() => openEdit(song)} title="Edit"><FiEdit2 /></button>
                        <button className="btn btn-icon" onClick={() => handleDelete(song._id)} style={{ color: 'var(--danger)' }} title="Delete"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <Modal title={editTarget ? 'Modify Track' : 'Add Track'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', marginLeft: '4px' }}>Song Name *</label>
              <input type="text" className="glass-input" style={{ width: '100%' }} placeholder="Enter song name" value={form.songName}
                onChange={e => setForm({ ...form, songName: e.target.value })} autoFocus />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', marginLeft: '4px' }}>Album Name *</label>
                <input 
                  type="text" className="glass-input" style={{ width: '100%' }} 
                  placeholder="Enter album name" value={form.albumId}
                  onChange={e => setForm({ ...form, albumId: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', marginLeft: '4px' }}>Music Director *</label>
                <input 
                  type="text" className="glass-input" style={{ width: '100%' }} 
                  placeholder="Enter director name" value={form.directorId}
                  onChange={e => setForm({ ...form, directorId: e.target.value })} 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', marginLeft: '4px' }}>Artist Name</label>
                <input
                  type="text" className="glass-input" style={{ width: '100%' }}
                  placeholder="Enter artist name"
                  value={form.artistName}
                  onChange={e => setForm({ ...form, artistName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', marginLeft: '4px' }}>Release Date</label>
                <input
                  type="date" className="glass-input" style={{ width: '100%' }}
                  value={form.releaseDate}
                  onChange={e => setForm({ ...form, releaseDate: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', marginLeft: '4px' }}>Audio file</label>
                <div className="glass-input" style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <FiMusic style={{ marginRight: '12px', opacity: 0.5, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: form.file ? 'white' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {form.file ? form.file.name : 'Select music file...'}
                  </span>
                  <input type="file" accept="audio/*" 
                    onChange={e => setForm({ ...form, file: e.target.files[0] })}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', marginLeft: '4px' }}>Album Cover</label>
                <div className="glass-input" style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <FiImage style={{ marginRight: '12px', opacity: 0.5, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: form.coverFile ? 'white' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {form.coverFile ? form.coverFile.name : 'Select cover image...'}
                  </span>
                  <input type="file" accept="image/*" 
                    onChange={e => setForm({ ...form, coverFile: e.target.files[0] })}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', marginLeft: '4px' }}>Director profile</label>
                <div className="glass-input" style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <FiImage style={{ marginRight: '12px', opacity: 0.5, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: form.directorPhotoFile ? 'white' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {form.directorPhotoFile ? form.directorPhotoFile.name : 'Upload director photo...'}
                  </span>
                  <input type="file" accept="image/*" 
                    onChange={e => setForm({ ...form, directorPhotoFile: e.target.files[0] })}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', marginLeft: '4px' }}>Artist photos</label>
                <div className="glass-input" style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <FiImage style={{ marginRight: '12px', opacity: 0.5, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: form.artistPhotos.length > 0 ? 'white' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {form.artistPhotos.length > 0 ? `${form.artistPhotos.length} files selected` : 'Upload artist photos...'}
                  </span>
                  <input type="file" accept="image/*" multiple
                    onChange={e => setForm({ ...form, artistPhotos: Array.from(e.target.files) })}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
                  />
                </div>
              </div>
            </div>
            {form.artistPhotos.length > 0 && (
              <p style={{ fontSize: '12px', color: 'var(--accent-light)', marginTop: '-12px', marginLeft: '4px' }}>
                ✨ Smart Match: Photos named after the artist (e.g., "hesham.jpg") will be matched automatically!
              </p>
            )}

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '14px 36px' }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '14px 40px' }}>
                {saving ? 'Processing…' : editTarget ? 'Save Changes' : 'Upload Song'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminSongs;
