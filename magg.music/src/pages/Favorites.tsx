import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Track } from '../types';
import { TrackCard } from '../components/TrackCard';
import { Heart } from 'lucide-react';

export const Favorites = () => {
  const { user } = useAuth();
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      supabase
        .from('likes')
        .select('track_id, tracks(*)')
        .eq('user_id', user.id)
        .then(({ data }: { data: unknown }) => {
          if (data) {
            const typedData = data as unknown as { tracks: Track | Track[] }[];
            setLikedTracks(typedData.map((item) => Array.isArray(item.tracks) ? item.tracks[0] : item.tracks).filter(Boolean) as Track[]);
          }
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[#7443FF] border-t-transparent"></div></div>;
  if (!user) return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <Heart className="h-16 w-16 text-[#D9D9D9] mb-4" />
      <h2 className="text-2xl font-semibold text-[#000000] mb-2">Войдите, чтобы видеть любимые треки</h2>
      <p className="text-[#000000]/60">Сохраняйте понравившиеся композиции и создавайте свою коллекцию</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9F9F9]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#7443FF]/10 p-3 rounded-2xl">
            <Heart className="h-6 w-6 text-[#7443FF] fill-[#7443FF]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#7443FF] to-[#5a32cc] bg-clip-text text-transparent">
            Любимые треки
          </h1>
        </div>

        {likedTracks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#D9D9D9]/30 p-12 text-center shadow-sm">
            <Heart className="h-12 w-12 text-[#D9D9D9] mx-auto mb-4" />
            <p className="text-[#000000]/60">Нет любимых треков. Поставьте лайк любому треку, и он появится здесь.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {likedTracks.map(track => (
              <TrackCard 
                key={track.id} 
                track={track} 
                onLikeToggle={() => {
                  setLikedTracks(prev => prev.filter(t => t.id !== track.id));
                }} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
