import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [license, setLicense] = useState('CC BY-SA 4.0');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Необходимо войти');
    if (!audioFile) return toast.error('Выберите аудиофайл');
    setUploading(true);

    try {
      // Загрузка аудио
      const audioExt = audioFile.name.split('.').pop();
      const audioPath = `${user.id}/${Date.now()}.${audioExt}`;
      const { error: audioError } = await supabase.storage.from('music').upload(audioPath, audioFile);
      if (audioError) throw audioError;
      const { data: audioPublic } = supabase.storage.from('music').getPublicUrl(audioPath);

      let coverUrl = null;
      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop();
        const coverPath = `${user.id}/${Date.now()}.${coverExt}`;
        await supabase.storage.from('covers').upload(coverPath, coverFile);
        const { data: coverPublic } = supabase.storage.from('covers').getPublicUrl(coverPath);
        coverUrl = coverPublic.publicUrl;
      }

      // Сохранение в БД
      const { error: dbError } = await supabase.from('tracks').insert({
        title,
        artist,
        license_type: license,
        audio_url: audioPublic.publicUrl,
        cover_url: coverUrl,
        user_id: user.id
      });
      if (dbError) throw dbError;

      toast.success('Трек загружен!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Загрузить трек</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Название трека" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-800" required />
        <input type="text" placeholder="Исполнитель" value={artist} onChange={e => setArtist(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-800" required />
        <select value={license} onChange={e => setLicense(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-800">
          <option value="CC BY-SA 4.0">CC BY-SA 4.0 (Свободная, с указанием автора)</option>
          <option value="CC BY 4.0">CC BY 4.0 (Только указание автора)</option>
          <option value="CC0 1.0">CC0 (Общественное достояние)</option>
        </select>
        <div>
          <label className="block mb-1">Аудиофайл (MP3, WAV, OGG)</label>
          <input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files?.[0] || null)} required />
        </div>
        <div>
          <label className="block mb-1">Обложка (необязательно)</label>
          <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} />
        </div>
        <button type="submit" disabled={uploading} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50">
          {uploading ? 'Загрузка...' : 'Опубликовать'}
        </button>
      </form>
    </div>
  );
};