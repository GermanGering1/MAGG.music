import { Heart, Play } from 'lucide-react';
import type { Track } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { usePlayer } from '../hooks/usePlayer';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
  track: Track;
  onLikeToggle?: () => void;
}

export const TrackCard = ({ track, onLikeToggle }: Props) => {
  const { user } = useAuth();
  const { setCurrentTrack, play, currentTrack, isPlaying } = usePlayer();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from('likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('track_id', track.id)
        .maybeSingle()
        .then(({ data }) => setLiked(!!data));
    }
  }, [user, track.id]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Войдите, чтобы ставить лайки');
      return;
    }
    if (liked) {
      await supabase.from('likes').delete().eq('user_id', user.id).eq('track_id', track.id);
      setLiked(false);
    } else {
      await supabase.from('likes').insert({ user_id: user.id, track_id: track.id });
      setLiked(true);
    }
    onLikeToggle?.();
  };

  const handlePlay = () => {
    if (currentTrack?.id === track.id && isPlaying) {
      usePlayer.getState().pause();
    } else {
      setCurrentTrack(track);
      play();
    }
  };

  const isCurrent = currentTrack?.id === track.id;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4 flex-1">
        <img
          src={track.cover_url || 'https://placehold.co/400?text=No+Cover'}
          alt={track.title}
          className="w-12 h-12 rounded object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{track.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{track.artist}</p>
          <p className="text-xs text-purple-500">{track.license_type}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={handlePlay} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Play className={`h-5 w-5 ${isCurrent && isPlaying ? 'text-purple-600' : 'text-gray-600 dark:text-gray-300'}`} />
        </button>
        <button onClick={handleLike} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`} />
        </button>
      </div>
    </div>
  );
};