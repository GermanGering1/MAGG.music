import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Track } from '../types';
import { TrackCard } from '../components/TrackCard';

export const Favorites = () => {
  const { user } = useAuth();
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);

  useEffect(() => {
    if (user) {
      supabase
        .from('likes')
        .select('track_id, tracks(*)')
        .eq('user_id', user.id)
        .then(({ data }) => {
          if (data) {
            // Явно указываем тип для item
            const typedData = data as { tracks: Track }[];
            setLikedTracks(typedData.map(item => item.tracks));
          }
        });
    }
  }, [user]);

  if (!user) return <div className="p-4">Войдите, чтобы видеть любимые треки</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Любимые треки</h1>
      <div className="space-y-3">
        {likedTracks.map(track => (
          <TrackCard key={track.id} track={track} onLikeToggle={() => {
            setLikedTracks(prev => prev.filter(t => t.id !== track.id));
          }} />
        ))}
        {likedTracks.length === 0 && <p>Нет любимых треков. Поставьте лайк!</p>}
      </div>
    </div>
  );
};