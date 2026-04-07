import { useEffect, useRef } from 'react';
import { usePlayer } from '../hooks/usePlayer';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';

export const Player = () => {
  const { currentTrack, isPlaying, play, pause, volume, setVolume } = usePlayer();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play();
      else audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  if (!currentTrack) return null;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3 shadow-lg z-50">
      <audio ref={audioRef} src={currentTrack.audio_url} onEnded={() => pause()} />
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <img src={currentTrack.cover_url || 'https://placehold.co/40'} className="w-10 h-10 rounded object-cover" />
          <div className="truncate">
            <p className="font-medium text-sm truncate">{currentTrack.title}</p>
            <p className="text-xs text-gray-500 truncate">{currentTrack.artist}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => (isPlaying ? pause() : play())} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <div className="flex items-center space-x-2">
            {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="w-20" />
          </div>
          <button onClick={() => usePlayer.getState().setCurrentTrack(null)} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};