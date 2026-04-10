// Player.tsx
import { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../hooks/usePlayer';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { formatTime } from '../utils/formatTime';

export const Player = () => {
  const { currentTrack, isPlaying, play, pause, volume, setVolume } = usePlayer();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play();
      else audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [currentTrack]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const VolumeIcon = volume === 0 ? VolumeX : Volume2;

  if (!currentTrack) return null;

  return (
    <>
      <audio ref={audioRef} src={currentTrack.audio_url} onEnded={() => pause()} />
      <div
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl z-50 border border-gray-100"
        style={{
          width: '60vw',
          minWidth: '900px',
          height: '64px',
          padding: '0 20px',
        }}
      >
        <div className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-4 h-full">
          {/* Время трека */}
          <span className="text-xs font-inter text-black/70 tabular-nums" style={{ fontFamily: 'Inter, sans-serif' }}>
            {formatTime(currentTime)}
          </span>

          {/* Ползунок прогресса */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #7443FF 0%, #7443FF ${progress}%, #D9D9D9 ${progress}%, #D9D9D9 100%)`,
              accentColor: `#7443FF`
            }}
          />

          {/* Кнопка Play/Pause */}
          <button
            onClick={() => (isPlaying ? pause() : play())}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#7443FF] text-white hover:bg-[#5a32cc] transition-all duration-200 shadow-md"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>

          {/* Ползунок громкости */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #7443FF 0%, #7443FF ${volume * 100}%, #D9D9D9 ${volume * 100}%, #D9D9D9 100%)`,
              accentColor: `#7443FF`
            }}
          />

          {/* Иконка динамика (справа от ползунка громкости) */}
          <VolumeIcon className="h-4 w-4 text-black/60" />
        </div>
      </div>
    </>
  );
};