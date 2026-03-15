import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { usePlayer } from '../context/PlayerContext.js';
import toast from 'react-hot-toast';
import {
  FiMusic, FiDisc, FiList, FiHome, FiUsers,
  FiLogOut, FiUser, FiSettings, FiChevronRight
} from 'react-icons/fi';
import './Sidebar.css';

const NavItem = ({ to, icon, label, end }) => (
  <NavLink to={to} end={end} className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
    <span className="nav-icon">{icon}</span>
    <span className="nav-label">{label}</span>
    <FiChevronRight className="nav-arrow" size={14} />
  </NavLink>
);

const Sidebar = () => {
  const { user, logoutUser, isAdmin } = useAuth();
  const { stop } = usePlayer();
  const navigate = useNavigate();

  const handleLogout = () => {
    stop();
    logoutUser();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">♪</div>
        <div>
          <div className="sidebar-brand-name">Melodia</div>
          <div className="sidebar-brand-tag">Music Library</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Browse</div>
        <NavItem to="/" end icon={<FiHome />} label="Home" />
        <NavItem to="/songs" icon={<FiMusic />} label="Songs" />
        <NavItem to="/playlists" icon={<FiList />} label="My Playlists" />
        <NavItem to="/profile" icon={<FiUser />} label="Profile" />

        {isAdmin && (
          <>
            <div className="nav-section-label" style={{ marginTop: 16 }}>Admin</div>
            <NavItem to="/admin/songs" icon={<FiMusic />} label="Manage Songs" />
            <NavItem to="/admin/albums" icon={<FiDisc />} label="Manage Albums" />
            <NavItem to="/admin/artists" icon={<FiUsers />} label="Manage Artists" />
            <NavItem to="/admin/directors" icon={<FiSettings />} label="Directors" />
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">
              <span className={`badge ${isAdmin ? 'badge-gold' : 'badge-purple'}`}>
                {isAdmin ? 'Admin' : 'User'}
              </span>
            </div>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={handleLogout} title="Logout">
          <FiLogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
