// Profile.tsx
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Track } from '../types';
import { TrackCard } from '../components/TrackCard';
import { User, Calendar, Music } from 'lucide-react';

export const Profile = () => {
  const { user, profile } = useAuth();
  const [userTracks, setUserTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      supabase.from('tracks').select('*').eq('user_id', user.id).then(({ data }) => {
        setUserTracks(data || []);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[#7443FF] border-t-transparent"></div></div>;
  if (!user) return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <User className="h-16 w-16 text-[#D9D9D9] mb-4" />
      <h2 className="text-2xl font-semibold text-[#000000] mb-2">Войдите, чтобы увидеть профиль</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9F9F9]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-[#D9D9D9]/30 p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="bg-[#7443FF]/10 p-4 rounded-2xl">
              <User className="h-10 w-10 text-[#7443FF]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#000000]">{profile?.username || user.email?.split('@')[0]}</h1>
              <p className="text-[#000000]/60 mt-1">{user.email}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-[#000000]/50">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Music className="h-3.5 w-3.5" />
                  {userTracks.length} {userTracks.length === 1 ? 'трек' : 'треков'} загружено
                </span>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-[#000000] mb-5 flex items-center gap-2">
          <Music className="h-5 w-5 text-[#7443FF]" />
          Мои треки
        </h2>

        {userTracks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#D9D9D9]/30 p-12 text-center shadow-sm">
            <Music className="h-12 w-12 text-[#D9D9D9] mx-auto mb-4" />
            <p className="text-[#000000]/60">Вы ещё не загрузили ни одного трека.</p>
            <a href="/upload" className="inline-block mt-4 text-[#7443FF] hover:underline">Загрузить первый трек</a>
          </div>
        ) : (
          <div className="space-y-3">
            {userTracks.map(track => <TrackCard key={track.id} track={track} />)}
          </div>
        )}
      </div>
    </div>
  );
};