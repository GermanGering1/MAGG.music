import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Player } from './components/Player';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Upload } from './pages/Upload';
import { Profile } from './pages/Profile';
import { Playlists } from './pages/Playlists';
import { PlaylistDetail } from './pages/PlaylistDetail';
import { Favorites } from './pages/Favorites';
import { PrivateRoute } from './components/PrivateRoute';
import './App.css';

function App() {
  return (

      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow pb-24">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/playlists" element={<PrivateRoute><Playlists /></PrivateRoute>} />
              <Route path="/playlist/:id" element={<PrivateRoute><PlaylistDetail /></PrivateRoute>} />
              <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
            </Routes>
          </main>
          <Player />
          <Toaster position="bottom-right" />
        </div>
      </AuthProvider>

  );
}

export default App;