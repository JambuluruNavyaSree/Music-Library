import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login        = (data) => API.post('/auth/login', data);
export const register     = (data) => API.post('/auth/register', data);
export const updateProfilePicture = (data) => API.post('/auth/profile-picture', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getProfile   = () => API.get('/auth/profile');

// Songs
export const getSongs             = (params) => API.get('/songs', { params });
export const getSongById          = (id)     => API.get(`/songs/${id}`);
export const createSong           = (data)   => API.post('/songs', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateSong           = (id, data) => API.put(`/songs/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteSong           = (id)     => API.delete(`/songs/${id}`);
export const toggleSongVisibility = (id)     => API.patch(`/songs/${id}/visibility`);
export const recordPlay           = (id)     => API.post(`/songs/${id}/play`);
export const getPlayHistory       = ()       => API.get('/users/play-history');
export const getUsers             = ()       => API.get('/users/admin/all');
export const toggleUserRole       = (id)     => API.patch(`/users/admin/toggle-role/${id}`);

// Albums
export const getAlbums    = ()           => API.get('/albums');
export const createAlbum  = (data)       => API.post('/albums', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateAlbum  = (id, data)   => API.put(`/albums/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteAlbum  = (id)         => API.delete(`/albums/${id}`);

// Artists
export const getArtists    = ()          => API.get('/artists');
export const createArtist  = (data)      => API.post('/artists', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateArtist  = (id, data)  => API.put(`/artists/${id}`, data);
export const updateArtistPhoto = (id, data) => API.patch(`/artists/${id}/photo`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteArtist  = (id)        => API.delete(`/artists/${id}`);

// Directors
export const getDirectors    = ()        => API.get('/directors');
export const createDirector  = (data)    => API.post('/directors', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateDirector  = (id, data)=> API.put(`/directors/${id}`, data);
export const updateDirectorPhoto = (id, data) => API.patch(`/directors/${id}/photo`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteDirector  = (id)      => API.delete(`/directors/${id}`);

// Playlists
export const getPlaylists           = ()              => API.get('/playlists');
export const getPlaylistById        = (id)            => API.get(`/playlists/${id}`);
export const createPlaylist         = (data)          => API.post('/playlists', data);
export const updatePlaylist         = (id, data)      => API.put(`/playlists/${id}`, data);
export const deletePlaylist         = (id)            => API.delete(`/playlists/${id}`);
export const addSongToPlaylist      = (pid, sid)      => API.post(`/playlists/${pid}/songs`, { songId: sid });
export const removeSongFromPlaylist = (pid, sid)      => API.delete(`/playlists/${pid}/songs/${sid}`);

// Notifications
export const getNotifications          = ()   => API.get('/notifications');
export const markNotificationRead      = (id) => API.patch(`/notifications/${id}/read`);
export const markAllNotificationsAsRead= ()   => API.put('/notifications/read-all');
export const deleteNotification        = (id) => API.delete(`/notifications/${id}`);

export default API;
