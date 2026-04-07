import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Track } from '../types';
import { TrackCard } from '../components/TrackCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Home = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    const { data, error } = await supabase
      .from('tracks')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false });
    if (!error && data) setTracks(data);
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Новые треки</h1>
      <div className="space-y-3">
        {tracks.map(track => (
          <TrackCard key={track.id} track={track} onLikeToggle={fetchTracks} />
        ))}
        {tracks.length === 0 && <p className="text-gray-500 text-center">Пока нет треков. Загрузите первый!</p>}
      </div>
    </div>
  );
};