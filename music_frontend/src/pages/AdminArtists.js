import React, { useState, useEffect } from 'react';
import { getArtists, createArtist, updateArtist, updateArtistPhoto, deleteArtist } from '../services/api.js';
import { FiPlus, FiEdit2, FiTrash2, FiCamera, FiX, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Modal from '../components/Modal.js';

const AdminArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getArtists()
      .then(r => setArtists(r.data || []))
      .catch(() => toast.error('Failed to load artists'))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditTarget(null); setName(''); setPhoto(null); setShowModal(true); };
  const openEdit = (a) => { setEditTarget(a); setName(a.artistName); setPhoto(null); setShowModal(true); };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Artist name is required'); return; }
    setSaving(true);
    try {
      if (editTarget) {
        // Update details
        const { data } = await updateArtist(editTarget._id, { artistName: name });
        
        // Update photo if selected
        if (photo) {
          const fd = new FormData();
          fd.append('artistPhoto', photo);
          const photoRes = await updateArtistPhoto(editTarget._id, fd);
          setArtists(a => a.map(x => x._id === editTarget._id ? photoRes.data.artist : x));
        } else {
          setArtists(a => a.map(x => x._id === editTarget._id ? data : x));
        }
        toast.success('Artist updated');
      } else {
        const fd = new FormData();
        fd.append('artistName', name);
        if (photo) fd.append('artistPhoto', photo);
        const { data } = await createArtist(fd);
        setArtists(a => [...a, data]);
        toast.success('Artist added');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this artist?')) return;
    try {
      await deleteArtist(id);
      setArtists(a => a.filter(x => x._id !== id));
      toast.success('Artist deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 42px)', marginBottom: '8px' }}>Music Artists</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Managing the voices of your library</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{ height: '52px', padding: '0 32px' }}><FiPlus /> Add Artist</button>
      </div>

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="spinner" /></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
          {artists.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
              <h3>No artists found</h3>
            </div>
          ) : artists.map(artist => (
            <div key={artist._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px' }}>
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%',
                overflow: 'hidden', marginBottom: '24px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {artist.artistPhoto ? (
                  <img src={artist.artistPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <FiUser size={40} style={{ opacity: 0.2 }} />
                )}
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>{artist.artistName}</h3>
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '10px' }} onClick={() => openEdit(artist)}><FiEdit2 size={15} /></button>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '10px', color: 'var(--danger)' }} onClick={() => handleDelete(artist._id)}><FiTrash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editTarget ? 'Edit Artist' : 'New Artist'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', marginLeft: '4px' }}>Artist Name *</label>
              <input type="text" className="glass-input" style={{ width: '100%' }} placeholder="e.g. The Weekend" value={name}
                onChange={e => setName(e.target.value)} autoFocus />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '13px', fontWeight: '600', marginLeft: '4px' }}>Artist Photo</label>
              <div className="glass-input" style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer', minHeight: '52px' }}>
                <FiCamera style={{ marginRight: '12px', opacity: 0.5 }} />
                <span style={{ fontSize: '13px', color: photo ? 'white' : 'var(--text-muted)' }}>{photo ? photo.name : 'Select image...'}</span>
                <input type="file" accept="image/*" 
                   onChange={e => setPhoto(e.target.files[0])}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '0 24px' }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0 32px' }}>
                {saving ? 'Saving…' : editTarget ? 'Update' : 'Add Artist'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminArtists;
