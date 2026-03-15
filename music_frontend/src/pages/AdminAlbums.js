import React, { useState, useEffect } from 'react';
import { getAlbums, createAlbum, updateAlbum, deleteAlbum, getDirectors } from '../services/api.js';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiCalendar, FiActivity, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Modal from '../components/Modal.js';

const emptyForm = { albumName: '', releaseDate: '', directorId: '' };

const AdminAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    try {
      const [aRes, dRes] = await Promise.all([getAlbums(), getDirectors()]);
      setAlbums(aRes.data || []);
      setDirectors(dRes.data || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (album) => {
    setEditTarget(album);
    setForm({
      albumName: album.albumName,
      releaseDate: album.releaseDate ? album.releaseDate.slice(0, 10) : '',
      directorId: album.directorId?.directorName || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.albumName.trim()) { toast.error('Album name is required'); return; }
    setSaving(true);
    try {
      if (editTarget) {
        const { data } = await updateAlbum(editTarget._id, form);
        setAlbums(a => a.map(x => x._id === editTarget._id ? data : x));
        toast.success('Album updated');
      } else {
        const { data } = await createAlbum(form);
        setAlbums(a => [...a, data]);
        toast.success('Album created');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this album?')) return;
    try {
      await deleteAlbum(id);
      setAlbums(a => a.filter(x => x._id !== id));
      toast.success('Album deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = albums.filter(a => 
    !search.trim() || a.albumName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 42px)', marginBottom: '8px' }}>Manage Albums</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Organizing musical collections</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{ height: '52px', padding: '0 32px' }}><FiPlus /> Add New Album</button>
      </div>

      <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '32px' }}>
        <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" placeholder="Search albums…" 
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
                  <th style={{ padding: '20px 24px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Album Title</th>
                  <th style={{ padding: '20px 24px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Music Director</th>
                  <th style={{ padding: '20px 24px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Release Date</th>
                  <th style={{ padding: '20px 24px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>No albums found</td></tr>
                ) : filtered.map(album => (
                  <tr key={album._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: '700', fontSize: '15px' }}>{album.albumName}</div>
                    </td>
                    <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{album.directorId?.directorName || '—'}</td>
                    <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>
                      {album.releaseDate ? new Date(album.releaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-icon" onClick={() => openEdit(album)} title="Edit"><FiEdit2 /></button>
                        <button className="btn btn-icon" onClick={() => handleDelete(album._id)} style={{ color: 'var(--danger)' }} title="Delete"><FiTrash2 /></button>
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
        <Modal title={editTarget ? 'Modify Album' : 'Create Album'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', marginLeft: '4px' }}>Album Title *</label>
              <input 
                type="text" className="glass-input" style={{ width: '100%' }} 
                placeholder="Enter album title" value={form.albumName}
                onChange={e => setForm({ ...form, albumName: e.target.value })} autoFocus 
              />
            </div>
            
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', marginLeft: '4px' }}>Music Director Name</label>
              <div style={{ position: 'relative' }}>
                <FiActivity style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type="text" className="glass-input" style={{ width: '100%', paddingLeft: '44px' }} 
                  placeholder="Enter music director"
                  value={form.directorId} onChange={e => setForm({ ...form, directorId: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', marginLeft: '4px' }}>Release Date</label>
              <div style={{ position: 'relative' }}>
                <FiCalendar style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, pointerEvents: 'none' }} />
                <input 
                  type="date" className="glass-input" style={{ width: '100%', paddingLeft: '44px' }}
                  value={form.releaseDate} onChange={e => setForm({ ...form, releaseDate: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '0 24px' }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0 32px' }}>
                {saving ? 'Processing…' : editTarget ? 'Save Changes' : 'Create Album'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminAlbums;
