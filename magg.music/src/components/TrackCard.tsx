// TrackCard.tsx
import { Heart, Play, Pause } from 'lucide-react';
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
  const { setCurrentTrack, play, pause, currentTrack, isPlaying } = usePlayer();
  const [liked, setLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
      toast.success('Удалено из любимых');
    } else {
      await supabase.from('likes').insert({ user_id: user.id, track_id: track.id });
      setLiked(true);
      toast.success('Добавлено в любимые');
    }
    onLikeToggle?.();
  };

  const handlePlay = () => {
    if (currentTrack?.id === track.id && isPlaying) {
      pause();
    } else {
      setCurrentTrack(track);
      play();
    }
  };

  const isCurrent = currentTrack?.id === track.id;

  return (
    <div
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#D9D9D9]/30 hover:border-[#7443FF]/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative">
            <img
              src={track.cover_url || 'https://placehold.co/56?text=🎵'}
              alt={track.title}
              className="w-14 h-14 rounded-xl object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
            />
            {isHovered && (
              <button
                onClick={handlePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl transition-all duration-200"
              >
                {isCurrent && isPlaying ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 text-white ml-0.5" />
                )}
              </button>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#000000] group-hover:text-[#7443FF] transition-colors duration-200">
              {track.title}
            </h3>
            <p className="text-sm text-[#000000]/60">{track.artist}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 bg-[#7443FF]/10 text-[#7443FF] rounded-full font-medium">
                {track.license_type === 'free' ? 'Free' : track.license_type === 'royalty-free' ? 'Royalty Free' : 'Premium'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePlay}
            className="p-2 rounded-full hover:bg-[#7443FF]/10 transition-all duration-200 text-[#000000]/70 hover:text-[#7443FF]"
          >
            {isCurrent && isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </button>
          <button
            onClick={handleLike}
            className="p-2 rounded-full hover:bg-[#7443FF]/10 transition-all duration-200 transform hover:scale-110"
          >
            <Heart
              className={`h-5 w-5 transition-all duration-200 ${
                liked
                  ? 'fill-[#7443FF] text-[#7443FF]'
                  : 'text-[#000000]/40 group-hover:text-[#000000]/70'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};