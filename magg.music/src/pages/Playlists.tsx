// Playlists.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Playlist } from '../types';
import { Link } from 'react-router-dom';
import { Plus, ListMusic, Music2, Image, X, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Playlists = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchPlaylists();
  }, [user]);

  const fetchPlaylists = async () => {
    const { data } = await supabase.from('playlists').select('*').eq('user_id', user.id);
    setPlaylists(data || []);
    setLoading(false);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverFile(file);
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    } else {
      setCoverPreview(null);
    }
  };

  const createPlaylist = async () => {
    if (!newTitle.trim()) return;
    if (!user) return;
    setIsCreating(true);

    try {
      let coverUrl = null;
      if (coverFile) {
        const ext = coverFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('playlist_covers')
          .upload(path, coverFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from('playlist_covers')
          .getPublicUrl(path);
        coverUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('playlists').insert({
        title: newTitle,
        user_id: user.id,
        cover_url: coverUrl
      });
      if (error) throw error;

      toast.success('Плейлист создан');
      setNewTitle('');
      setCoverFile(null);
      setCoverPreview(null);
      await fetchPlaylists();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[#7443FF] border-t-transparent"></div></div>;
  if (!user) return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <Music2 className="h-16 w-16 text-[#D9D9D9] mb-4" />
      <h2 className="text-2xl font-semibold text-[#000000] mb-2">Войдите, чтобы создавать плейлисты</h2>
      <p className="text-[#000000]/60">Организуйте музыку по своему вкусу</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9F9F9]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#7443FF]/10 p-3 rounded-2xl">
            <ListMusic className="h-6 w-6 text-[#7443FF]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#7443FF] to-[#5a32cc] bg-clip-text text-transparent">
            Мои плейлисты
          </h1>
        </div>

        <div className="bg-white rounded-2xl border border-[#D9D9D9]/30 p-5 mb-8 shadow-sm">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Название нового плейлиста"
              className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7443FF]"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-[#D9D9D9] rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                {coverPreview ? (
                  <img src={coverPreview} className="h-8 w-8 rounded object-cover" alt="preview" />
                ) : (
                  <Image className="h-4 w-4 text-[#7443FF]" />
                )}
                <span className="text-sm">{coverPreview ? 'Обложка выбрана' : 'Выбрать обложку'}</span>
                <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
              </label>
              <button
                onClick={createPlaylist}
                disabled={isCreating}
                className="bg-[#7443FF] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#5a32cc] transition-all duration-200 shadow-md shadow-[#7443FF]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCreating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Создать
              </button>
            </div>
          </div>
        </div>

        {playlists.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#D9D9D9]/30 p-12 text-center shadow-sm">
            <ListMusic className="h-12 w-12 text-[#D9D9D9] mx-auto mb-4" />
            <p className="text-[#000000]/60">У вас пока нет плейлистов.</p>
            <p className="text-sm text-[#7443FF] mt-2">Создайте первый плейлист, чтобы начать</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {playlists.map(pl => (
              <Link
                key={pl.id}
                to={`/playlist/${pl.id}`}
                className="group bg-white rounded-2xl border border-[#D9D9D9]/30 p-4 hover:shadow-lg transition-all duration-200 hover:border-[#7443FF]/20 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#7443FF]/10 flex-shrink-0">
                  {pl.cover_url ? (
                    <img src={pl.cover_url} alt={pl.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ListMusic className="h-5 w-5 text-[#7443FF]" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#000000] group-hover:text-[#7443FF] transition-colors">{pl.title}</h3>
                  <p className="text-sm text-[#000000]/50">Создан: {new Date(pl.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-[#D9D9D9] group-hover:text-[#7443FF] transition-colors">→</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};