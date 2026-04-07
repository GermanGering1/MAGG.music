// Upload.tsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UploadCloud, Music, Image, FileAudio, X } from 'lucide-react';

export const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [license, setLicense] = useState('CC BY-SA 4.0');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAudioFile(file);
    if (file) {
      setAudioPreview(URL.createObjectURL(file));
    } else {
      setAudioPreview(null);
    }
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

  const clearAudio = () => {
    setAudioFile(null);
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setAudioPreview(null);
  };

  const clearCover = () => {
    setCoverFile(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Необходимо войти');
    if (!audioFile) return toast.error('Выберите аудиофайл');
    setUploading(true);

    try {
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

  if (!user) return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <UploadCloud className="h-16 w-16 text-[#D9D9D9] mb-4" />
      <h2 className="text-2xl font-semibold text-[#000000] mb-2">Войдите, чтобы загружать треки</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9F9F9] py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-[#7443FF]/10 p-3 rounded-2xl mb-4">
            <UploadCloud className="h-8 w-8 text-[#7443FF]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#7443FF] to-[#5a32cc] bg-clip-text text-transparent">
            Загрузить трек
          </h1>
          <p className="text-[#000000]/60 mt-2">Поделитесь своей музыкой с миром</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#D9D9D9]/30 p-6 md:p-8 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#000000]/80 mb-1">Название трека</label>
            <input
              type="text"
              placeholder="Например: Sunset Dreams"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7443FF]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#000000]/80 mb-1">Исполнитель</label>
            <input
              type="text"
              placeholder="Имя артиста или группы"
              value={artist}
              onChange={e => setArtist(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7443FF]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#000000]/80 mb-1">Лицензия</label>
            <select
              value={license}
              onChange={e => setLicense(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7443FF] bg-white"
            >
              <option value="CC BY-SA 4.0">CC BY-SA 4.0 (Свободная, с указанием автора)</option>
              <option value="CC BY 4.0">CC BY 4.0 (Только указание автора)</option>
              <option value="CC0 1.0">CC0 (Общественное достояние)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#000000]/80 mb-2">Аудиофайл (MP3, WAV, OGG)</label>
            <div className="border-2 border-dashed border-[#D9D9D9] rounded-xl p-4 text-center hover:border-[#7443FF] transition-colors">
              {!audioFile ? (
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <FileAudio className="h-8 w-8 text-[#D9D9D9]" />
                  <span className="text-sm text-[#000000]/60">Нажмите или перетащите файл</span>
                  <input type="file" accept="audio/*" onChange={handleAudioChange} className="hidden" required={!audioFile} />
                </label>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-[#7443FF]" />
                    <span className="text-sm truncate">{audioFile.name}</span>
                  </div>
                  <button type="button" onClick={clearAudio} className="p-1 rounded-full hover:bg-gray-100">
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#000000]/80 mb-2">Обложка (необязательно)</label>
            <div className="border-2 border-dashed border-[#D9D9D9] rounded-xl p-4 text-center hover:border-[#7443FF] transition-colors">
              {!coverFile ? (
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <Image className="h-8 w-8 text-[#D9D9D9]" />
                  <span className="text-sm text-[#000000]/60">Нажмите или перетащите изображение</span>
                  <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </label>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {coverPreview && <img src={coverPreview} alt="preview" className="h-8 w-8 rounded object-cover" />}
                    <span className="text-sm truncate">{coverFile.name}</span>
                  </div>
                  <button type="button" onClick={clearCover} className="p-1 rounded-full hover:bg-gray-100">
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-[#7443FF] text-white py-3 rounded-xl font-medium hover:bg-[#5a32cc] transition-all duration-200 shadow-md shadow-[#7443FF]/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Загрузка...
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                Опубликовать
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};