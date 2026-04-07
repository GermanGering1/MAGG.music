import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Track } from '../types';
import { TrackCard } from '../components/TrackCard';

export const Profile = () => {
  const { user, profile } = useAuth();
  const [userTracks, setUserTracks] = useState<Track[]>([]);

  useEffect(() => {
    if (user) {
      supabase.from('tracks').select('*').eq('user_id', user.id).then(({ data }) => setUserTracks(data || []));
    }
  }, [user]);

  if (!user) return <div className="p-4 text-center">Войдите, чтобы увидеть профиль</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
        <h1 className="text-2xl font-bold">Профиль</h1>
        <p className="text-gray-600 dark:text-gray-400">Имя: {profile?.username || user.email}</p>
        <p className="text-sm text-gray-500">Зарегистрирован: {new Date(user.created_at).toLocaleDateString()}</p>
      </div>
      <h2 className="text-xl font-semibold mb-4">Мои треки</h2>
      <div className="space-y-3">
        {userTracks.map(track => <TrackCard key={track.id} track={track} />)}
        {userTracks.length === 0 && <p>Вы ещё не загрузили ни одного трека.</p>}
      </div>
    </div>
  );
};