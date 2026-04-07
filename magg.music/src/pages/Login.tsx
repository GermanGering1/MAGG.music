// Login.tsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';

export const Login = () => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('Добро пожаловать!');
        navigate('/');
      } else {
        await signUp(email, password, username);
        toast.success('Регистрация успешна! Теперь войдите.');
        setIsLogin(true);
        setUsername('');
        setEmail('');
        setPassword('');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-[#F5F5F5] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-[#7443FF]/10 p-3 rounded-2xl mb-4">
            {isLogin ? <LogIn className="h-8 w-8 text-[#7443FF]" /> : <UserPlus className="h-8 w-8 text-[#7443FF]" />}
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#7443FF] to-[#5a32cc] bg-clip-text text-transparent">
            {isLogin ? 'Вход' : 'Регистрация'}
          </h2>
          <p className="text-[#000000]/60 mt-2">
            {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-[#D9D9D9]/30 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#000000]/40" />
                <input
                  type="text"
                  placeholder="Имя пользователя"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-[#D9D9D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7443FF] focus:border-transparent transition-all"
                  required
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#000000]/40" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-[#D9D9D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7443FF] focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#000000]/40" />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-[#D9D9D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7443FF] focus:border-transparent transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7443FF] text-white py-2.5 rounded-xl font-medium hover:bg-[#5a32cc] transition-all duration-200 shadow-md shadow-[#7443FF]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Загрузка...</span>
                </div>
              ) : (
                isLogin ? 'Войти' : 'Зарегистрироваться'
              )}
            </button>
          </form>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="mt-6 text-sm text-[#7443FF] hover:text-[#5a32cc] w-full text-center transition-colors"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
          </button>
        </div>
      </div>
    </div>
  );
};