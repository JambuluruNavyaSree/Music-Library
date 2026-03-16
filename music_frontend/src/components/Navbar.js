import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { FiMusic, FiHome, FiShield, FiSearch, FiX, FiUsers, FiList, FiMic, FiDisc } from 'react-icons/fi';
import NotificationBell from './NotificationBell.js';

const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery]           = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (showSearch && inputRef.current) inputRef.current.focus();
  }, [showSearch]);

  const submitSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/songs?search=${encodeURIComponent(query.trim())}`);
      setShowSearch(false);
      setQuery('');
    }
  };

  const closeSearch = () => { setShowSearch(false); setQuery(''); };

  return (
    <nav className="glass-nav" style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 'var(--nav-height)',
      display: 'flex', alignItems: 'center',
      padding: '0 32px',
      justifyContent: 'space-between', gap: '16px',
      zIndex: 1100,
    }}>

      {/* ── LOGO ── */}
      <Link to="/" style={{
        fontSize: '20px', fontWeight: '800',
        fontFamily: 'var(--font-display)',
        textDecoration: 'none', color: 'white',
        display: 'flex', alignItems: 'center', gap: '8px',
        flexShrink: 0,
      }}>
        <span className="text-gradient">◈</span> MusicLib
      </Link>

      {/* ── CENTER: Nav links OR Inline Search ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {showSearch ? (
          <form onSubmit={submitSearch} style={{ width: '100%', maxWidth: '500px', display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '16px' }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search songs, artists, albums…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Escape' && closeSearch()}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1.5px solid rgba(139,92,246,0.5)',
                  color: 'white', borderRadius: '14px',
                  padding: '9px 16px 9px 40px',
                  fontSize: '14px', outline: 'none',
                }}
              />
            </div>
            <button type="submit" style={{ padding: '0 20px', borderRadius: '14px', fontSize: '14px', fontWeight: '700', background: 'var(--accent-gradient)', border: 'none', color: 'white', cursor: 'pointer' }}>Go</button>
            <button type="button" onClick={closeSearch} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', width: '38px', height: '38px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX /></button>
          </form>
        ) : (
          <div style={{ display: 'flex', gap: '4px' }}>
            <NavButton to="/"         icon={<FiHome />}  label="Home"       end />
            <NavButton to="/songs"    icon={<FiMusic />} label="All Songs"  />
            {!isAdmin && <NavButton to="/artists"   icon={<FiMic />}   label="Artists"    />}
            {!isAdmin && <NavButton to="/albums"    icon={<FiDisc />}  label="Albums"     />}
            {!isAdmin && <NavButton to="/directors" icon={<FiUsers />} label="Directors"  />}
            {!isAdmin && <NavButton to="/playlists" icon={<FiList />}  label="Library"    />}
            {isAdmin  && <NavButton to="/admin/songs" icon={<FiShield />} label="Admin"  />}
          </div>
        )}
      </div>

      {/* ── RIGHT: Search + Bell + Avatar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>

        {/* Search toggle (non-admin) */}
        {!isAdmin && !showSearch && (
          <button
            onClick={() => setShowSearch(true)}
            title="Search"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', width: '38px', height: '38px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', transition: 'all 0.2s' }}
          >
            <FiSearch />
          </button>
        )}

        {/* Notification Bell (non-admin only) */}
        {!isAdmin && <NotificationBell />}

        {/* Avatar */}
        <Link to="/profile" style={{ textDecoration: 'none' }} title="My Profile">
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '800', fontSize: '16px', color: 'white',
            boxShadow: '0 4px 12px rgba(108, 61, 211, 0.3)',
            cursor: 'pointer', transition: 'transform 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </Link>

        {/* Role badge */}
        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {isAdmin ? 'Admin' : 'Member'}
        </div>
      </div>
    </nav>
  );
};

const NavButton = ({ to, icon, label, end }) => (
  <NavLink
    to={to} end={end}
    style={({ isActive }) => ({
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '8px 14px', borderRadius: '12px',
      fontSize: '14px', fontWeight: '600',
      textDecoration: 'none',
      color: isActive ? 'white' : 'var(--text-secondary)',
      background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
      transition: 'all 0.2s',
    })}
  >
    <span style={{ display: 'flex', fontSize: '16px' }}>{icon}</span>
    <span>{label}</span>
  </NavLink>
);

export default Navbar;