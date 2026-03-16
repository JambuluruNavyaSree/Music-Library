import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSongs, getArtists, getAlbums } from '../services/api.js';
import { FiMusic, FiUsers, FiDisc, FiSettings, FiUserCheck, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, loading }) => (
  <div className="glass-card" style={{ textAlign: 'center', padding: '24px' }}>
    <div style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>
      {loading ? '...' : value}
    </div>
    <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: '600' }}>
      {label}
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, title, desc, to }) => {
  const navigate = useNavigate();
  return (
    <div 
      className="glass-card action-hover" 
      onClick={() => navigate(to)}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '20px 24px', 
        cursor: 'pointer',
        marginBottom: '12px',
        transition: 'all 0.2s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ 
          width: '48px', height: '48px', borderRadius: '12px', 
          background: 'rgba(255,255,255,0.03)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent)'
        }}>
          <Icon size={20} />
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '15px' }}>{title}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{desc}</div>
        </div>
      </div>
      <FiChevronRight size={18} style={{ opacity: 0.3 }} />
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ songs: 0, hidden: 0, artists: 0, albums: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sRes, arRes, alRes] = await Promise.all([
          getSongs({ all: true }),
          getArtists(),
          getAlbums()
        ]);
        
        const songs = sRes.data?.songs || sRes.data || [];
        setStats({
          songs: songs.length,
          hidden: songs.filter(s => !s.isVisible).length,
          artists: (arRes.data || []).length,
          albums: (alRes.data || []).length
        });
      } catch (err) {
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 42px)', marginBottom: '8px' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Library overview and administrative controls</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: '24px', 
        marginBottom: '64px' 
      }}>
        <StatCard label="Total Songs" value={stats.songs} loading={loading} />
        <StatCard label="Hidden Songs" value={stats.hidden} loading={loading} />
        <StatCard label="Artists" value={stats.artists} loading={loading} />
        <StatCard label="Albums" value={stats.albums} loading={loading} />
      </div>

      <div style={{ maxWidth: '800px' }}>
        <h2 style={{ fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', color: 'var(--text-muted)', fontWeight: '700' }}>
          Quick Actions
        </h2>
        
        <QuickAction 
          icon={FiMusic} title="Manage Songs" 
          desc="Add, edit, delete, or toggle visibility" to="/admin/songs" 
        />
        <QuickAction 
          icon={FiUsers} title="Manage Artists" 
          desc="Add and manage artist profiles" to="/admin/artists" 
        />
        <QuickAction 
          icon={FiSettings} title="Music Directors" 
          desc="Manage music director records" to="/admin/directors" 
        />
        <QuickAction 
          icon={FiDisc} title="Manage Albums" 
          desc="Add and edit album entries" to="/admin/albums" 
        />
        <QuickAction 
          icon={FiUserCheck} title="Manage Users" 
          desc="View users and manage roles" to="/admin/users" 
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
