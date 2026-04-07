// Home.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Track, Playlist } from '../types';
import { TrackCard } from '../components/TrackCard';
import { PlaylistCard } from '../components/PlaylistCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Music, ListMusic, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export const Home = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Загружаем первые LIMIT треков (без profiles, если нет связи)
      const { data: tracksData, error: tracksError } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false })
        .range(0, LIMIT - 1);

      if (tracksError) throw tracksError;

      // Загружаем плейлисты
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (playlistsError) throw playlistsError;

      setTracks(tracksData || []);
      setPlaylists(playlistsData || []);
      setHasMore((tracksData?.length || 0) === LIMIT);
      setOffset(LIMIT);
    } catch (error: any) {
      toast.error('Ошибка загрузки данных: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreTracks = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + LIMIT - 1);

      if (error) throw error;

      if (data && data.length > 0) {
        setTracks(prev => [...prev, ...data]);
        setHasMore(data.length === LIMIT);
        setOffset(offset + data.length);
      } else {
        setHasMore(false);
      }
    } catch (error: any) {
      toast.error('Ошибка загрузки треков: ' + error.message);
    } finally {
      setLoadingMore(false);
    }
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
            <>
              <div className="space-y-3">
                {tracks.map(track => (
                  <TrackCard key={track.id} track={track} />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMoreTracks}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#D9D9D9] rounded-xl text-[#7443FF] font-medium hover:bg-[#7443FF]/5 transition-all duration-200 disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#7443FF] border-t-transparent" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    {loadingMore ? 'Загрузка...' : 'Показать ещё'}
                  </button>
                </div>
              )}
            </>
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