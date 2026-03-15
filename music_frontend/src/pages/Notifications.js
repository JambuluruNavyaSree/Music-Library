import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead } from '../services/api.js';
import { FiBell, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissing, setDismissing] = useState(null);

  useEffect(() => {
    fetchNotifs();
  }, []);

  const fetchNotifs = async () => {
    try {
      const res = await getNotifications();
      setNotifs(res.data || []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (id) => {
    setDismissing(id);
    try {
      await markNotificationRead(id);
    } catch {
      // even if API fails, remove from UI
    } finally {
      // always remove from list regardless of API result
      setNotifs(prev => prev.filter(n => n._id !== id));
      setDismissing(null);
      toast.success('Notification read');
    }
  };

  const handleMarkAll = async () => {
    const unread = notifs.filter(n => !n.isRead);
    await Promise.all(unread.map(n => markNotificationRead(n._id).catch(() => {})));
    setNotifs([]);
    toast.success('All notifications cleared');
  };

  const unreadCount = notifs.filter(n => !n.isRead).length;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', marginBottom: '8px' }}>Notifications</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={handleMarkAll}>
            <FiX size={14} /> Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <div className="spinner" />
        </div>
      ) : notifs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--text-muted)' }}>
          <FiBell size={48} style={{ opacity: 0.3, marginBottom: '20px', display: 'block', margin: '0 auto 20px' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>All caught up!</h3>
          <p style={{ fontSize: '14px' }}>New song alerts will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '800px' }}>
          {notifs.map(n => (
            <div
              key={n._id}
              className="card"
              style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                borderLeft: !n.isRead ? '3px solid var(--accent)' : '1px solid var(--border)',
                background: !n.isRead ? 'linear-gradient(90deg, var(--accent-glow), var(--bg-card))' : undefined,
                opacity: dismissing === n._id ? 0.4 : 1,
                transition: 'opacity 0.2s ease',
                pointerEvents: dismissing === n._id ? 'none' : 'auto',
              }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                background: !n.isRead ? 'var(--accent-glow)' : 'var(--bg-hover)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: !n.isRead ? 'var(--accent)' : 'var(--text-muted)'
              }}>
                {n.isRead ? <FiCheckCircle size={18} /> : <FiInfo size={18} />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                  {n.message}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {new Date(n.createdAt).toLocaleDateString()} at{' '}
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {!n.isRead && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleRead(n._id)}
                  disabled={dismissing === n._id}
                >
                  {dismissing === n._id ? '…' : 'Mark as read'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;