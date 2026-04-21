// Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, LogOut, LogIn } from 'lucide-react';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-[#D9D9D9]/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="rounded-xl">
                <img src="/maggmusic.jpg" className='w-8 h-8 rounded-2xl'  alt="" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-[#7443FF] to-[#5a32cc] bg-clip-text text-transparent">
                MAGG.music
              </span>
            </Link>
            <div className="hidden md:flex space-x-1">
              {[
                { to: '/', label: 'Главная', icon: null },
                { to: '/upload', label: 'Загрузить', icon: null },
                { to: '/playlists', label: 'Плейлисты', icon: null },
                { to: '/favorites', label: 'Любимое', icon: null },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-[#000000]/70 hover:text-[#7443FF] px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:bg-[#7443FF]/5"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-[#000000]/70 hover:text-[#7443FF] px-3 py-1.5 rounded-full hover:bg-[#7443FF]/5 transition-all duration-200"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm font-medium">Профиль</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-[#000000]/70 hover:text-red-500 px-3 py-1.5 rounded-full hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 bg-[#7443FF] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#5a32cc] transition-all duration-200 shadow-lg shadow-[#7443FF]/20"
              >
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