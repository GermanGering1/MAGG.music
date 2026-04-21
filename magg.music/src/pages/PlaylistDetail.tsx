// PlaylistDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Playlist, Track } from '../types';
import { TrackCard } from '../components/TrackCard';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, ListMusic, Edit2, Image, X } from 'lucide-react';

export const PlaylistDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingCover, setEditingCover] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [updatingCover, setUpdatingCover] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const [playlistRes, tracksRes, allTracksRes] = await Promise.all([
      supabase.from('playlists').select('*').eq('id', id).single(),
      supabase
        .from('playlist_tracks')
        .select('track_id, tracks(*)')
        .eq('playlist_id', id),
      supabase.from('tracks').select('*')
    ]);
    if (playlistRes.data) setPlaylist(playlistRes.data);
    if (tracksRes.data) {
      const typedData = tracksRes.data as unknown as { tracks: Track | Track[] }[];
      setTracks(typedData.map((item) => Array.isArray(item.tracks) ? item.tracks[0] : item.tracks).filter(Boolean) as Track[]);
    }
    if (allTracksRes.data) setAllTracks(allTracksRes.data);
    setLoading(false);
  };

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

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverFile(file);
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const updateCover = async () => {
    if (!coverFile || !playlist || !user) return;
    setUpdatingCover(true);
    try {
      const ext = coverFile.name.split('.').pop();
      const path = `${user.id}/${playlist.id}_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('playlist_covers')
        .upload(path, coverFile);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from('playlist_covers')
        .getPublicUrl(path);
      const newCoverUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('playlists')
        .update({ cover_url: newCoverUrl })
        .eq('id', playlist.id);
      if (updateError) throw updateError;

      setPlaylist({ ...playlist, cover_url: newCoverUrl });
      toast.success('Обложка обновлена');
      setEditingCover(false);
      setCoverFile(null);
      setCoverPreview(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUpdatingCover(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[#7443FF] border-t-transparent"></div></div>;
  if (!playlist) return <div className="text-center py-12">Плейлист не найден</div>;

  const isOwner = user?.id === playlist.user_id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9F9F9]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/playlists')}
          className="flex items-center gap-2 text-[#7443FF] hover:text-[#5a32cc] mb-6 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Назад к плейлистам</span>
        </button>

        <div className="bg-white rounded-2xl border border-[#D9D9D9]/30 p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="relative group/cover">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#7443FF]/10 flex items-center justify-center">
                {playlist.cover_url ? (
                  <img src={playlist.cover_url} alt={playlist.title} className="w-full h-full object-cover" />
                ) : (
                  <ListMusic className="h-8 w-8 text-[#7443FF]" />
                )}
              </div>
              {isOwner && (
                <button
                  onClick={() => setEditingCover(true)}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-[#7443FF] rounded-full text-white shadow-md hover:bg-[#5a32cc] transition-colors"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#000000]">{playlist.title}</h1>
              <p className="text-[#000000]/60 mt-1">
                {tracks.length} {tracks.length === 1 ? 'трек' : 'треков'} • {isOwner ? 'Ваш плейлист' : 'Публичный плейлист'}
              </p>
            </div>
          </div>
        </div>

        {/* Модальное окно для смены обложки */}
        {editingCover && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Изменить обложку</h3>
                <button onClick={() => setEditingCover(false)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <label className="block w-full border-2 border-dashed border-[#D9D9D9] rounded-xl p-4 text-center cursor-pointer hover:border-[#7443FF] transition-colors">
                  {coverPreview ? (
                    <img src={coverPreview} className="h-32 w-32 object-cover mx-auto rounded-lg" alt="preview" />
                  ) : (
                    <>
                      <Image className="h-8 w-8 mx-auto text-[#D9D9D9] mb-2" />
                      <span className="text-sm text-[#000000]/60">Нажмите для выбора изображения</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </label>
                <button
                  onClick={updateCover}
                  disabled={!coverFile || updatingCover}
                  className="w-full bg-[#7443FF] text-white py-2 rounded-xl font-medium hover:bg-[#5a32cc] transition-all disabled:opacity-50"
                >
                  {updatingCover ? 'Обновление...' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isOwner && (
          <div className="bg-white rounded-2xl border border-[#D9D9D9]/30 p-4 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedTrackId}
                onChange={e => setSelectedTrackId(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-[#D9D9D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7443FF] bg-white"
              >
                <option value="">Добавить трек...</option>
                {allTracks.filter(t => !tracks.some(tr => tr.id === t.id)).map(t => (
                  <option key={t.id} value={t.id}>{t.title} — {t.artist}</option>
                ))}
              </select>
              <button
                onClick={addTrack}
                className="bg-[#7443FF] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#5a32cc] transition-all duration-200 shadow-md shadow-[#7443FF]/20 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Добавить
              </button>
            </div>
          </div>
        )}

        {tracks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#D9D9D9]/30 p-12 text-center shadow-sm">
            <ListMusic className="h-12 w-12 text-[#D9D9D9] mx-auto mb-4" />
            <p className="text-[#000000]/60">В плейлисте пока нет треков.</p>
            {isOwner && <p className="text-sm text-[#7443FF] mt-2">Добавьте треки, используя выпадающий список выше</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {tracks.map(track => (
              <div key={track.id} className="relative group">
                <TrackCard track={track} />
                {isOwner && (
                  <button
                    onClick={() => removeTrack(track.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};