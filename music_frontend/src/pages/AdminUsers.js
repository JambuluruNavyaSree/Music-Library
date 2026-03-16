import React, { useState, useEffect } from 'react';
import { getUsers, toggleUserRole } from '../services/api.js';
import { FiUsers, FiUserCheck, FiShield, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState(null);

  const fetchUsers = async () => {
    try {
      const { data } = await getUsers();
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (user) => {
    if (toggling) return;
    setToggling(user._id);
    try {
      const { data } = await toggleUserRole(user._id);
      toast.success(data.message);
      setUsers(prev => prev.map(u => u._id === user._id ? data.user : u));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setToggling(null);
    }
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 42px)', marginBottom: '8px' }}>Manage Users</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review community members and assign roles</p>
      </div>

      <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '32px' }}>
        <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" placeholder="Search by name or email…" 
          className="glass-input" style={{ width: '100%', paddingLeft: '44px' }}
          value={search} onChange={e => setSearch(e.target.value)} 
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
                <tr>
                  <th style={{ padding: '20px 24px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>User</th>
                  <th style={{ padding: '20px 24px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Contact</th>
                  <th style={{ padding: '20px 24px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Role</th>
                  <th style={{ padding: '20px 24px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  filtered.map(user => (
                    <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '40px', height: '40px', borderRadius: '50%', 
                            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', fontSize: '14px'
                          }}>
                            {user.name[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '15px' }}>{user.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        <div>{user.email}</div>
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>{user.phone}</div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <span style={{ 
                          padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                          background: user.roleId?.roleName === 'admin' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                          color: user.roleId?.roleName === 'admin' ? '#eab308' : '#a78bfa',
                          display: 'inline-flex', alignItems: 'center', gap: '6px'
                        }}>
                          {user.roleId?.roleName === 'admin' ? <FiShield size={12} /> : <FiUserCheck size={12} />}
                          {user.roleId?.roleName === 'admin' ? 'Admin' : 'Customer'}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => handleToggleRole(user)}
                          disabled={toggling === user._id}
                          style={{ fontSize: '12px', padding: '8px 16px' }}
                        >
                          {toggling === user._id ? 'Updating…' : `Make ${user.roleId?.roleName === 'admin' ? 'Customer' : 'Admin'}`}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
