import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Music, Upload, User, Heart, ListMusic, LogOut, LogIn } from 'lucide-react';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Music className="h-6 w-6 text-purple-600" />
              <span className="font-bold text-xl">MAGG.music</span>
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 px-3 py-2 rounded-md">Главная</Link>
              <Link to="/upload" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 px-3 py-2 rounded-md">Загрузить</Link>
              <Link to="/playlists" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 px-3 py-2 rounded-md">Плейлисты</Link>
              <Link to="/favorites" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 px-3 py-2 rounded-md">Любимое</Link>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Link to="/profile" className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-purple-600">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">Профиль</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-red-600">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center space-x-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                <LogIn className="h-4 w-4" />
                <span>Войти</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};