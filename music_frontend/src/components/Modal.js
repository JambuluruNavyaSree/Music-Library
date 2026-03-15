import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ title, children, onClose }) => {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button className="btn btn-icon" onClick={onClose} style={{ flexShrink: 0 }}>
            <FiX size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
