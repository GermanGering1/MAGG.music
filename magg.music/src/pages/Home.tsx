// Home.tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Track, Playlist } from '../types';
import { TrackCard } from '../components/TrackCard';
import { PlaylistCard } from '../components/PlaylistCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Music, ListMusic, ChevronDown, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { debounce } from 'lodash'; // или напишите свою debounce функцию

export const Home = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Поиск и фильтры
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLicense, setSelectedLicense] = useState('');
  const [genres, setGenres] = useState<string[]>([]);

  const LIMIT = 10;

  // Получение уникальных жанров (при загрузке)
  useEffect(() => {
    const fetchGenres = async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('genre')
        .not('genre', 'is', null);
      if (!error && data) {
        const uniqueGenres = Array.from(new Set(data.map((t: any) => t.genre).filter(Boolean))) as string[];
        setGenres(uniqueGenres.sort());
      }
    };
    fetchGenres();
  }, []);

  // Функция загрузки треков с фильтрацией
  const fetchTracks = useCallback(async (reset = false, currentOffset = 0) => {
    try {
      let query = supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + LIMIT - 1);

      // Поиск по названию и артисту
      if (searchQuery.trim()) {
        const term = `%${searchQuery.trim()}%`;
        query = query.or(`title.ilike.${term},artist.ilike.${term}`);
      }

      // Фильтр по жанру
      if (selectedGenre) {
        query = query.eq('genre', selectedGenre);
      }

      // Фильтр по лицензии
      if (selectedLicense) {
        query = query.eq('license_type', selectedLicense);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (reset) {
        setTracks(data || []);
        setHasMore((data?.length || 0) === LIMIT);
        setOffset(LIMIT);
      } else {
        setTracks(prev => [...prev, ...(data || [])]);
        setHasMore((data?.length || 0) === LIMIT);
        setOffset(currentOffset + (data?.length || 0));
      }
    } catch (error: any) {
      toast.error('Ошибка загрузки треков: ' + error.message);
    }
  }, [searchQuery, selectedGenre, selectedLicense]);

  // Debounced search
  const debouncedFetch = useMemo(
    () => debounce(() => {
      setLoading(true);
      fetchTracks(true, 0).finally(() => setLoading(false));
    }, 500),
    [fetchTracks]
  );

  // Загрузка начальных данных
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      await fetchTracks(true, 0);

      // Загружаем плейлисты
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (playlistsError) toast.error('Ошибка загрузки плейлистов');
      else setPlaylists(playlistsData || []);

      setLoading(false);
    };
    loadInitial();
  }, []);

  // Срабатывает при изменении фильтров (кроме поиска — для него debounce)
  useEffect(() => {
    if (loading) return; // предотвращаем повторную загрузку при инициализации
    setLoading(true);
    fetchTracks(true, 0).finally(() => setLoading(false));
  }, [selectedGenre, selectedLicense]);

  // При изменении поискового запроса вызываем debounced
  useEffect(() => {
    if (searchQuery !== undefined) {
      setLoading(true);
      debouncedFetch();
      return () => {
        debouncedFetch.cancel();
      };
    }
  }, [searchQuery, debouncedFetch]);

  const loadMoreTracks = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchTracks(false, offset);
    setLoadingMore(false);
  };

  if (loading && tracks.length === 0) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9F9F9]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Поиск и фильтры */}
        <div className="bg-white rounded-2xl border border-[#D9D9D9]/30 p-4 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Поиск */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#000000]/40" />
              <input
                type="text"
                placeholder="Поиск по названию или исполнителю..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-[#D9D9D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7443FF] bg-white"
              />
            </div>

            {/* Фильтр по жанру */}
            <div className="w-full md:w-48">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7443FF] bg-white"
              >
                <option value="">Все жанры</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Фильтр по лицензии */}
            <div className="w-full md:w-56">
              <select
                value={selectedLicense}
                onChange={(e) => setSelectedLicense(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7443FF] bg-white"
              >
                <option value="">Все лицензии</option>
                <option value="CC BY-SA 4.0">CC BY-SA (разрешены ремиксы)</option>
                <option value="CC BY 4.0">CC BY (только указание авторства)</option>
                <option value="CC0 1.0">CC0 (общественное достояние)</option>
              </select>
            </div>
          </div>
        </div>

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
              <p className="text-[#000000]/60">
                {searchQuery || selectedGenre || selectedLicense
                  ? 'Ничего не найдено по вашему запросу'
                  : 'Пока нет треков. Загрузите первый трек!'}
              </p>
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

        {/* Секция плейлистов (без изменений) */}
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