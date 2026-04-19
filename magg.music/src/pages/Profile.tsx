// Profile.tsx
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Track } from '../types';
import { TrackCard } from '../components/TrackCard';
import { 
  User, Calendar, Music, Edit2, Heart, ExternalLink, 
  Image as ImageIcon, X, Upload, Trash2, Play 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [userTracks, setUserTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPlays, setTotalPlays] = useState(0);
  
  // Редактирование профиля
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [donationUrl, setDonationUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    // Получаем треки пользователя
    const { data: tracksData, error: tracksError } = await supabase
      .from('tracks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (tracksError) {
      toast.error('Ошибка загрузки треков');
    } else {
      setUserTracks(tracksData || []);
      // Суммируем прослушивания
      const total = (tracksData || []).reduce((sum, track) => sum + (track.play_count || 0), 0);
      setTotalPlays(total);
    }
    setLoading(false);
  };

  // При открытии редактирования заполняем текущие значения
  useEffect(() => {
    if (isEditing && profile) {
      setBio(profile.bio || '');
      setDonationUrl(profile.donation_url || '');
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  }, [isEditing, profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setAvatarPreview(null);
    }
  };

  const clearAvatar = () => {
    setAvatarFile(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);
    
    try {
      let avatarUrl = profile?.avatar_url;
      
      // Загружаем новый аватар если выбран
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });
          
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        avatarUrl = urlData.publicUrl;
      }
      
      // Обновляем профиль
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          bio,
          donation_url: donationUrl,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      toast.success('Профиль обновлён');
      setIsEditing(false);
      
      // Обновляем данные профиля в контексте (если нужно)
      // Можно перезагрузить страницу или вызвать fetchProfile из контекста
      window.location.reload(); // простой способ обновить контекст
      
    } catch (error: any) {
      toast.error('Ошибка: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!confirm('Удалить трек навсегда? Это действие необратимо.')) return;
    
    try {
      // Удаляем файлы из storage (опционально, можно оставить)
      const track = userTracks.find(t => t.id === trackId);
      if (track) {
        // Удаляем аудио
        if (track.audio_url) {
          const audioPath = track.audio_url.split('/').pop();
          if (audioPath) {
            await supabase.storage.from('music').remove([`${user!.id}/${audioPath}`]);
          }
        }
        // Удаляем обложку
        if (track.cover_url) {
          const coverPath = track.cover_url.split('/').pop();
          if (coverPath) {
            await supabase.storage.from('covers').remove([`${user!.id}/${coverPath}`]);
          }
        }
      }
      
      // Удаляем из базы
      const { error } = await supabase.from('tracks').delete().eq('id', trackId);
      if (error) throw error;
      
      setUserTracks(prev => prev.filter(t => t.id !== trackId));
      toast.success('Трек удалён');
    } catch (error: any) {
      toast.error('Ошибка удаления: ' + error.message);
    }
  };

  const handleDonationClick = () => {
    if (profile?.donation_url) {
      window.open(profile.donation_url, '_blank');
    }
  };

  if (authLoading || loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#7443FF] border-t-transparent"></div>
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <User className="h-16 w-16 text-[#D9D9D9] mb-4" />
      <h2 className="text-2xl font-semibold text-[#000000] mb-2">Войдите, чтобы увидеть профиль</h2>
    </div>
  );

  const isOwnProfile = true; // в контексте текущего пользователя всегда свой профиль

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9F9F9]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Профиль */}
        <div className="bg-white rounded-2xl border border-[#D9D9D9]/30 p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Аватар */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.username} 
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#7443FF]/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#7443FF]/10 flex items-center justify-center">
                    <User className="h-12 w-12 text-[#7443FF]" />
                  </div>
                )}
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-[#D9D9D9] hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="h-4 w-4 text-[#7443FF]" />
                  </button>
                )}
              </div>
            </div>

            {/* Информация */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-[#000000]">
                    {profile?.username || user.email?.split('@')[0]}
                  </h1>
                  <p className="text-[#000000]/60 mt-1">{user.email}</p>
                  {profile?.bio && (
                    <p className="text-[#000000]/80 mt-3 text-sm max-w-xl">{profile.bio}</p>
                  )}
                </div>
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-[#7443FF] hover:text-[#5a32cc] p-2 rounded-full hover:bg-[#7443FF]/5 transition-colors"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Статистика */}
              <div className="flex flex-wrap gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#000000]/40" />
                  <span className="text-sm text-[#000000]/60">
                    Регистрация: {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-[#000000]/40" />
                  <span className="text-sm text-[#000000]/60">
                    {userTracks.length} {userTracks.length === 1 ? 'трек' : 'треков'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-[#000000]/40" />
                  <span className="text-sm text-[#000000]/60">
                    {totalPlays} {totalPlays === 1 ? 'прослушивание' : 'прослушиваний'}
                  </span>
                </div>
              </div>

              {/* Кнопка "Поддержать" */}
              {profile?.donation_url && (
                <button
                  onClick={handleDonationClick}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#7443FF] to-[#5a32cc] text-white rounded-full text-sm font-medium hover:shadow-lg transition-all"
                >
                  <Heart className="h-4 w-4" />
                  Поддержать
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Список треков */}
        <h2 className="text-2xl font-semibold text-[#000000] mb-5 flex items-center gap-2">
          <Music className="h-5 w-5 text-[#7443FF]" />
          Мои треки
        </h2>

        {userTracks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#D9D9D9]/30 p-12 text-center shadow-sm">
            <Music className="h-12 w-12 text-[#D9D9D9] mx-auto mb-4" />
            <p className="text-[#000000]/60">Вы ещё не загрузили ни одного трека.</p>
            <a href="/upload" className="inline-block mt-4 text-[#7443FF] hover:underline">
              Загрузить первый трек
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {userTracks.map(track => (
              <div key={track.id} className="relative group">
                <TrackCard track={track} />
                {isOwnProfile && (
                  <button
                    onClick={() => handleDeleteTrack(track.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 z-10"
                    title="Удалить трек"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно редактирования профиля */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Редактировать профиль</h3>
              <button 
                onClick={() => setIsEditing(false)} 
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Аватар */}
              <div>
                <label className="block text-sm font-medium mb-2">Аватар</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-[#D9D9D9] rounded-xl cursor-pointer hover:bg-gray-50 transition-colors text-sm"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Выбрать изображение
                    </label>
                    {(avatarPreview || profile?.avatar_url) && (
                      <button
                        onClick={clearAvatar}
                        className="ml-2 text-red-500 text-sm hover:underline"
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Биография */}
              <div>
                <label className="block text-sm font-medium mb-1">Биография</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Расскажите о себе..."
                  rows={3}
                  className="w-full px-4 py-2 border border-[#D9D9D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7443FF] resize-none"
                />
              </div>

              {/* Ссылка для доната */}
              <div>
                <label className="block text-sm font-medium mb-1">Ссылка для поддержки (донат)</label>
                <input
                  type="url"
                  value={donationUrl}
                  onChange={(e) => setDonationUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-[#D9D9D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7443FF]"
                />
                <p className="text-xs text-[#000000]/40 mt-1">
                  Например, ссылка на Boosty, Patreon или другую платформу
                </p>
              </div>

              <button
                onClick={handleUpdateProfile}
                disabled={updating}
                className="w-full bg-[#7443FF] text-white py-2.5 rounded-xl font-medium hover:bg-[#5a32cc] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Сохранить изменения
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};