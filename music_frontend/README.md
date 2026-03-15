# Melodia — Music Library Frontend

A complete React frontend for the Music Library MERN Capstone project.

---

## ✅ Features Implemented

### User Features
- Register / Login / Logout with JWT
- Browse song library with cover art
- Search songs by name, artist, album, music director
- Filter songs by artist, album, director
- Create, rename, delete playlists (CRUD)
- Add / remove songs in playlists (CRUD)
- Music player with Play, Stop, Repeat, Shuffle, Next, Prev
- View multiple playlists
- Notification center with mark-as-read

### Admin Features
- Admin login (role-based access)
- Full CRUD on Songs (with file upload)
- Toggle song visibility (restrict from users)
- Full CRUD on Albums
- Full CRUD on Artists
- Full CRUD on Music Directors

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v16+
- Backend running on `http://localhost:5000`
- MongoDB running with the backend connected

### 1. Install dependencies
```bash
cd music_frontend
npm install
```

### 2. Start the development server
```bash
npm start
```
The app will open at `http://localhost:3000`. API requests are proxied to `http://localhost:5000`.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Modal.js            # Reusable modal dialog
│   ├── MusicPlayer.js      # Persistent bottom audio player
│   ├── ProtectedRoute.js   # Auth guards for routes
│   ├── Sidebar.js          # Left navigation sidebar
│   └── *.css               # Component styles
│
├── context/
│   ├── AuthContext.js      # Auth state + JWT management
│   └── PlayerContext.js    # Global audio playback state
│
├── pages/
│   ├── Login.js            # Login page
│   ├── Register.js         # Registration with validation
│   ├── Home.js             # Dashboard
│   ├── Songs.js            # Song library with search & filters
│   ├── Playlists.js        # Playlist list (CRUD)
│   ├── PlaylistDetail.js   # Playlist view with player controls
│   ├── Notifications.js    # Notification center
│   ├── AdminSongs.js       # Admin: manage songs
│   ├── AdminAlbums.js      # Admin: manage albums
│   ├── AdminArtists.js     # Admin: manage artists
│   └── AdminDirectors.js   # Admin: manage directors
│
├── services/
│   └── api.js              # Axios instance + all API calls
│
├── App.js                  # Router + layout
├── index.js                # Entry point
└── index.css               # Global styles / design tokens
```

---

## 🔌 Backend API Routes Expected

The frontend expects these routes on the backend at `/api/`:

| Method | Route | Description |
|--------|-------|-------------|
| POST | /auth/register | Register user |
| POST | /auth/login | Login |
| GET | /songs | Get all visible songs |
| POST | /songs | Admin: add song (multipart) |
| PUT | /songs/:id | Admin: update song |
| DELETE | /songs/:id | Admin: delete song |
| PATCH | /songs/:id/visibility | Admin: toggle visibility |
| GET | /albums | Get all albums |
| POST | /albums | Admin: create album |
| PUT | /albums/:id | Admin: update album |
| DELETE | /albums/:id | Admin: delete album |
| GET | /artists | Get all artists |
| POST | /artists | Admin: create artist |
| PUT | /artists/:id | Admin: update artist |
| DELETE | /artists/:id | Admin: delete artist |
| GET | /directors | Get all music directors |
| POST | /directors | Admin: create director |
| PUT | /directors/:id | Admin: update director |
| DELETE | /directors/:id | Admin: delete director |
| GET | /playlists | Get user playlists |
| POST | /playlists | Create playlist |
| GET | /playlists/:id | Get playlist with songs |
| PUT | /playlists/:id | Update playlist |
| DELETE | /playlists/:id | Delete playlist |
| POST | /playlists/:id/songs | Add song to playlist |
| DELETE | /playlists/:id/songs/:songId | Remove song from playlist |
| GET | /notifications | Get user notifications |
| PATCH | /notifications/:id/read | Mark notification as read |

---

## 🎨 Design Decisions
- **Theme**: Dark luxury (deep blacks + gold accent)
- **Fonts**: Playfair Display (headings) + DM Sans (body)
- **Responsive**: Works on mobile and desktop
- **SPA**: React Router v6 with client-side navigation
- **State**: React Context API (no Redux needed)
- **Auth**: JWT stored in localStorage, auto-attached via Axios interceptor
- **Validation**: Client-side form validation on all forms

---

## 📝 Notes
- Audio files are served from backend `/uploads/` directory
- The proxy in package.json routes `/api` → `http://localhost:5000`
- Admin role is detected from JWT payload (`role: 'admin'`)
