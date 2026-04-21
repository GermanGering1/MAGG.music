import { create } from 'zustand';
import type { Track } from '../types';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  setCurrentTrack: (track: Track | null) => void;
  play: () => void;
  pause: () => void;
  setVolume: (vol: number) => void;
}

export const usePlayer = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.7,
  setCurrentTrack: (track) => set({ currentTrack: track, isPlaying: false }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  setVolume: (vol) => set({ volume: vol })
}));