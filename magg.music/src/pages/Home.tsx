// Home.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Track, Playlist } from '../types';
import { TrackCard } from '../components/TrackCard';
import { PlaylistCard } from '../components/PlaylistCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Music, ListMusic } from 'lucide-react';

export const Home = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [tracksRes, playlistsRes] = await Promise.all([
      supabase
        .from('tracks')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)
    ]);
    if (tracksRes.data) setTracks(tracksRes.data);
    if (playlistsRes.data) setPlaylists(playlistsRes.data);
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9F9F9]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Секция треков */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#7443FF]/10 p-3 rounded-2xl">
              <Music className="h-6 w-6 text-[#7443FF]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#7443FF] to-[#5a32cc] bg-clip-text text-transparent">
              Новые треки
            </h2>
          </div>
          {tracks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#D9D9D9]/30 p-12 text-center shadow-sm">
              <Music className="h-12 w-12 text-[#D9D9D9] mx-auto mb-4" />
              <p className="text-[#000000]/60">Пока нет треков. Загрузите первый трек!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tracks.map(track => (
                <TrackCard key={track.id} track={track} onLikeToggle={fetchData} />
              ))}
            </div>
          )}
        </div>

        {/* Секция плейлистов */}
        {playlists.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#7443FF]/10 p-3 rounded-2xl">
                <ListMusic className="h-6 w-6 text-[#7443FF]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#7443FF] to-[#5a32cc] bg-clip-text text-transparent">
                Популярные плейлисты
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {playlists.map(playlist => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};