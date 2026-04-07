import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Playlist, Track } from '../types';
import { TrackCard } from '../components/TrackCard';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const PlaylistDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState('');

  useEffect(() => {
    if (!id) return;
    supabase.from('playlists').select('*').eq('id', id).single().then(({ data }) => setPlaylist(data));
    supabase
        .from('playlist_tracks')
        .select('track_id, tracks(*)')
        .eq('playlist_id', id)
        .then(({ data }) => {
            if (data) {
            const typedData = data as { tracks: Track }[];
            setTracks(typedData.map(item => item.tracks));
            }
        });
    supabase.from('tracks').select('*').then(({ data }) => setAllTracks(data || []));
  }, [id]);

  const addTrack = async () => {
    if (!selectedTrackId) return;
    const { error } = await supabase.from('playlist_tracks').insert({ playlist_id: id, track_id: selectedTrackId });
    if (error) toast.error(error.message);
    else {
      toast.success('Трек добавлен');
      const newTrack = allTracks.find(t => t.id === selectedTrackId);
      if (newTrack) setTracks([...tracks, newTrack]);
      setSelectedTrackId('');
    }
  };

  const removeTrack = async (trackId: string) => {
    await supabase.from('playlist_tracks').delete().eq('playlist_id', id).eq('track_id', trackId);
    setTracks(tracks.filter(t => t.id !== trackId));
    toast.success('Трек удалён из плейлиста');
  };

  if (!playlist) return <div className="p-4">Загрузка...</div>;

  const isOwner = user?.id === playlist.user_id;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/playlists')} className="text-purple-600 mb-2">← Назад</button>
        <h1 className="text-3xl font-bold">{playlist.title}</h1>
      </div>
      {isOwner && (
        <div className="flex gap-2 mb-6">
          <select value={selectedTrackId} onChange={e => setSelectedTrackId(e.target.value)} className="flex-1 p-2 border rounded dark:bg-gray-800">
            <option value="">Добавить трек...</option>
            {allTracks.filter(t => !tracks.some(tr => tr.id === t.id)).map(t => (
              <option key={t.id} value={t.id}>{t.title} - {t.artist}</option>
            ))}
          </select>
          <button onClick={addTrack} className="bg-purple-600 text-white px-4 py-2 rounded-lg">Добавить</button>
        </div>
      )}
      <div className="space-y-3">
        {tracks.map(track => (
          <div key={track.id} className="relative">
            <TrackCard track={track} />
            {isOwner && (
              <button onClick={() => removeTrack(track.id)} className="absolute right-2 top-2 text-red-500 text-sm">Удалить</button>
            )}
          </div>
        ))}
        {tracks.length === 0 && <p className="text-gray-500">В плейлисте пока нет треков.</p>}
      </div>
    </div>
  );
};