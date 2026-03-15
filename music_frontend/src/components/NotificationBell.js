import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiX, FiCheck, FiTrash2 } from 'react-icons/fi';
import { getNotifications, markAllNotificationsAsRead, deleteNotification } from '../services/api.js';
import toast from 'react-hot-toast';

const NotificationBell = () => {
  const [open, setOpen]               = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]         = useState(false);
  const popupRef                      = useRef(null);

  const unreadCount = (notifications || []).filter(n => !n?.isRead).length;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data || []);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch { toast.error('Failed to delete notification'); }
  };

  const handleMarkAllReadAndClear = async () => {
    try {
      await markAllNotificationsAsRead();
      // For simplicity, we just clear them visually. In a real app we might want a bulk delete endpoint.
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch { toast.error('Failed to clear notifications'); }
  };

  const fmt = (date) => {
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div ref={popupRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(v => !v); if (!open) fetchNotifications(); }}
        title="Notifications"
        style={{
          position: 'relative',
          background: open ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.07)',
          border: '1px solid ' + (open ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.12)'),
          color: 'white', width: '38px', height: '38px',
          borderRadius: '12px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', transition: 'all 0.2s'
        }}
      >
        <FiBell />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-6px', right: '-6px',
            background: 'linear-gradient(135deg, #f43f8e, #8b5cf6)',
            color: 'white', fontSize: '10px', fontWeight: '800',
            width: '18px', height: '18px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg-primary)'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popup */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 12px)', right: 0,
          width: '360px', maxHeight: '480px',
          background: 'rgba(12, 8, 32, 0.97)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(139,92,246,0.3)', borderRadius: '20px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)', zIndex: 3000,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div>
              <div style={{ fontWeight: '800', fontSize: '16px' }}>Notifications</div>
              {unreadCount > 0 && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
                  {unreadCount} unread
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllReadAndClear}
                  style={{
                    background: 'rgba(244,63,142,0.15)', border: '1px solid rgba(244,63,142,0.3)',
                    color: 'var(--danger)', padding: '5px 12px', borderRadius: '10px',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  Clear all
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                <FiX size={18} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <div className="spinner" />
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <FiBell size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                <div>No notifications yet</div>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  style={{
                    display: 'flex', gap: '12px', padding: '14px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: n.isRead ? 'transparent' : 'rgba(139,92,246,0.06)',
                    transition: 'background 0.2s'
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                    background: n.isRead ? 'rgba(255,255,255,0.06)' : 'rgba(139,92,246,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                  }}>
                    {n.type === 'new_song' ? '🎵' : '🔔'}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '13px', fontWeight: n.isRead ? '400' : '600',
                      color: n.isRead ? 'var(--text-secondary)' : 'white',
                      lineHeight: 1.4
                    }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>
                      {fmt(n.createdAt)}
                    </div>
                  </div>
                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(n._id)}
                    title="Delete notification"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', flexShrink: 0, padding: 4
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
