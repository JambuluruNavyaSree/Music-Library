import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPlaylists, createPlaylist, addSongToPlaylist, removeSongFromPlaylist } from '../services/api.js';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext.js';

const LikedContext = createContext(null);

export const LikedProvider = ({ children }) => {
  const { user } = useAuth();
  const [likedPlaylistId, setLikedPlaylistId] = useState(null);
  const [likedSongIds, setLikedSongIds]       = useState([]);
  const [playlists, setPlaylists]             = useState([]);

  // Load playlists & identify "Liked Songs" on login
  const loadPlaylists = useCallback(async () => {
    if (!user) { setPlaylists([]); setLikedSongIds([]); setLikedPlaylistId(null); return; }
    try {
      const res = await getPlaylists();
      const all = res.data || [];
      setPlaylists(all);
      const likedPL = all.find(p => p.playlistName === 'Liked Songs');
      if (likedPL) {
        setLikedPlaylistId(likedPL._id);
        // songs may be populated objects or bare IDs
        const ids = (likedPL.songs || []).map(s => (typeof s === 'object' ? s._id : s));
        setLikedSongIds(ids.map(String));
      } else {
        setLikedPlaylistId(null);
        setLikedSongIds([]);
      }
    } catch {
      // silently ignore
    }
  }, [user]);

  useEffect(() => { loadPlaylists(); }, [loadPlaylists]);

  const isLiked = useCallback((songId) => likedSongIds.includes(String(songId)), [likedSongIds]);

  const toggleLike = useCallback(async (song) => {
    const id = song._id;
    let targetPlaylistId = likedPlaylistId;

    try {
      if (!targetPlaylistId) {
        const res = await createPlaylist({ playlistName: 'Liked Songs' });
        targetPlaylistId = res.data._id;
        setLikedPlaylistId(targetPlaylistId);
        setPlaylists(prev => [...prev, res.data]);
      }

      if (isLiked(id)) {
        await removeSongFromPlaylist(targetPlaylistId, id);
        setLikedSongIds(prev => prev.filter(x => x !== String(id)));
        toast('Removed from Liked Songs', { icon: '💔' });
      } else {
        await addSongToPlaylist(targetPlaylistId, id);
        setLikedSongIds(prev => [...prev, String(id)]);
        toast.success('Added to Liked Songs ❤️');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update Liked Songs');
    }
  }, [likedPlaylistId, isLiked]);

  return (
    <LikedContext.Provider value={{ likedSongIds, likedPlaylistId, playlists, isLiked, toggleLike, loadPlaylists }}>
      {children}
    </LikedContext.Provider>
  );
};

export const useLiked = () => useContext(LikedContext);
