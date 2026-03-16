import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.js';
import { PlayerProvider } from './context/PlayerContext.js';
import { LikedProvider } from './context/LikedContext.js';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute.js';
import Navbar from './components/Navbar.js';
import MusicPlayer from './components/MusicPlayer.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Home from './pages/Home.js';
import Songs from './pages/Songs.js';
import Playlists from './pages/Playlists.js';
import PlaylistDetail from './pages/PlaylistDetail.js';
import Profile from './pages/Profile.js';
import AdminSongs from './pages/AdminSongs.js';
import AdminDashboard from './pages/AdminDashboard.js';
import AdminAlbums from './pages/AdminAlbums.js';
import AdminArtists from './pages/AdminArtists.js';
import AdminDirectors from './pages/AdminDirectors.js';
import Artists from './pages/Artists.js';
import Directors from './pages/Directors.js';
import Albums from './pages/Albums.js';
import AdminUsers from './pages/AdminUsers.js';
import { useAuth } from './context/AuthContext.js';

// Dynamic document title based on logged-in user
const TitleUpdater = () => {
  const { user } = useAuth();
  useEffect(() => {
    document.title = user ? `♪ Melodia | ${user.name}` : 'Melodia — Music Library';
  }, [user]);
  return null;
};

const AppLayout = ({ children }) => (
  <div className="app-layout">
    <div className="bg-orbs">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      <div className="orb orb-4"></div>
    </div>
    <Navbar />
    <main className="main-content">
      {children}
    </main>
    <MusicPlayer />
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login"    element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />

      <Route path="/"              element={<ProtectedRoute><AppLayout><Home /></AppLayout></ProtectedRoute>} />
      <Route path="/songs"         element={<ProtectedRoute><AppLayout><Songs /></AppLayout></ProtectedRoute>} />
      <Route path="/playlists"     element={<ProtectedRoute><AppLayout><Playlists /></AppLayout></ProtectedRoute>} />
      <Route path="/playlists/:id" element={<ProtectedRoute><AppLayout><PlaylistDetail /></AppLayout></ProtectedRoute>} />
      <Route path="/profile"       element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      <Route path="/artists"       element={<ProtectedRoute><AppLayout><Artists /></AppLayout></ProtectedRoute>} />
      <Route path="/directors"     element={<ProtectedRoute><AppLayout><Directors /></AppLayout></ProtectedRoute>} />
      <Route path="/albums"        element={<ProtectedRoute><AppLayout><Albums /></AppLayout></ProtectedRoute>} />

      <Route path="/admin"           element={<AdminRoute><AppLayout><AdminDashboard /></AppLayout></AdminRoute>} />
      <Route path="/admin/songs"     element={<AdminRoute><AppLayout><AdminSongs /></AppLayout></AdminRoute>} />
      <Route path="/admin/albums"    element={<AdminRoute><AppLayout><AdminAlbums /></AppLayout></AdminRoute>} />
      <Route path="/admin/artists"   element={<AdminRoute><AppLayout><AdminArtists /></AppLayout></AdminRoute>} />
      <Route path="/admin/directors" element={<AdminRoute><AppLayout><AdminDirectors /></AppLayout></AdminRoute>} />
      <Route path="/admin/users"     element={<AdminRoute><AppLayout><AdminUsers /></AppLayout></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <PlayerProvider>
        <LikedProvider>
          <TitleUpdater />
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(10, 6, 28, 0.9)',
                color: 'var(--text-primary)',
                border: '1px solid var(--glass-border)',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px'
              },
            }}
          />
        </LikedProvider>
      </PlayerProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
