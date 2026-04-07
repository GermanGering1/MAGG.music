import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Playlist } from '../types';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export const Playlists = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchPlaylists = async () => {
      const { data } = await supabase.from('playlists').select('*').eq('user_id', user.id);
      setPlaylists(data || []);
    };
    fetchPlaylists();
  }, [user]);

  const createPlaylist = async () => {
    if (!newTitle.trim()) return;
    if (!user) return;
    const { error } = await supabase.from('playlists').insert({ title: newTitle, user_id: user.id });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Плейлист создан');
      setNewTitle('');
      // обновляем список
      const { data } = await supabase.from('playlists').select('*').eq('user_id', user.id);
      setPlaylists(data || []);
    }
  };

  if (!user) return <div className="p-4">Войдите, чтобы создавать плейлисты</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Мои плейлисты</h1>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Название нового плейлиста"
          className="flex-1 p-2 border rounded dark:bg-gray-800"
        />
        <button onClick={createPlaylist} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-1">
          <Plus size={18} /> Создать
        </button>
      </div>
      <div className="grid gap-3">
        {playlists.map(pl => (
          <Link key={pl.id} to={`/playlist/${pl.id}`} className="block bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-md">
            <h3 className="font-semibold">{pl.title}</h3>
            <p className="text-sm text-gray-500">Создан: {new Date(pl.created_at).toLocaleDateString()}</p>
          </Link>
        ))}
        {playlists.length === 0 && <p className="text-gray-500">У вас пока нет плейлистов.</p>}
      </div>
    </div>
  );
};