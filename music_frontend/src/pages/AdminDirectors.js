import React, { useState, useEffect } from 'react';
import { getDirectors, createDirector, updateDirector, updateDirectorPhoto, deleteDirector } from '../services/api.js';
import { FiPlus, FiEdit2, FiTrash2, FiCamera, FiX, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Modal from '../components/Modal.js';

const AdminDirectors = () => {
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDirectors()
      .then(r => setDirectors(r.data || []))
      .catch(() => toast.error('Failed to load directors'))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditTarget(null); setName(''); setPhoto(null); setShowModal(true); };
  const openEdit = (d) => { setEditTarget(d); setName(d.directorName); setPhoto(null); setShowModal(true); };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Director name is required'); return; }
    setSaving(true);
    try {
      if (editTarget) {
        const { data } = await updateDirector(editTarget._id, { directorName: name });
        if (photo) {
          const fd = new FormData();
          fd.append('directorPhoto', photo);
          const photoRes = await updateDirectorPhoto(editTarget._id, fd);
          setDirectors(d => d.map(x => x._id === editTarget._id ? photoRes.data.director : x));
        } else {
          setDirectors(d => d.map(x => x._id === editTarget._id ? data : x));
        }
        toast.success('Director updated');
      } else {
        const fd = new FormData();
        fd.append('directorName', name);
        if (photo) fd.append('directorPhoto', photo);
        const { data } = await createDirector(fd);
        setDirectors(d => [...d, data]);
        toast.success('Director added');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this director?')) return;
    try {
      await deleteDirector(id);
      setDirectors(d => d.filter(x => x._id !== id));
      toast.success('Director deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 42px)', marginBottom: '8px' }}>Music Directors</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Defining the sounds of your collection</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{ height: '52px', padding: '0 32px' }}><FiPlus /> Add Director</button>
      </div>

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="spinner" /></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
          {directors.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
              <h3>No directors found</h3>
            </div>
          ) : directors.map(director => (
            <div key={director._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px' }}>
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%',
                overflow: 'hidden', marginBottom: '24px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {director.directorPhoto ? (
                  <img src={director.directorPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <FiActivity size={40} style={{ opacity: 0.2 }} />
                )}
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>{director.directorName}</h3>
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '10px' }} onClick={() => openEdit(director)}><FiEdit2 size={15} /></button>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '10px', color: 'var(--danger)' }} onClick={() => handleDelete(director._id)}><FiTrash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editTarget ? 'Edit Director' : 'New Director'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', marginLeft: '4px' }}>Director Name *</label>
              <input type="text" className="glass-input" style={{ width: '100%' }} placeholder="e.g. Hans Zimmer" value={name}
                onChange={e => setName(e.target.value)} autoFocus />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '13px', fontWeight: '600', marginLeft: '4px' }}>Director Photo</label>
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
                {saving ? 'Saving…' : editTarget ? 'Update' : 'Add Director'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDirectors;
