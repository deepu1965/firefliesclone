import type { RefObject } from "react";
import { create } from "zustand";

interface PlayerStore {
  currentTimeMs: number;
  isPlaying: boolean;
  duration: number;
  activeSegmentId: number | null;
  setCurrentTime: (ms: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setDuration: (ms: number) => void;
  setActiveSegmentId: (id: number | null) => void;
  seekTo: (ms: number) => void;
  /** Ref to the underlying HTMLAudioElement — set by MediaPlayer on mount */
  audioRef: RefObject<HTMLAudioElement> | null;
  setAudioRef: (ref: RefObject<HTMLAudioElement>) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTimeMs: 0,
  isPlaying: false,
  duration: 0,
  activeSegmentId: null,
  audioRef: null as RefObject<HTMLAudioElement> | null,

  setCurrentTime: (ms) => set({ currentTimeMs: ms }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setDuration: (ms) => set({ duration: ms }),
  setActiveSegmentId: (id) => set({ activeSegmentId: id }),
  setAudioRef: (ref) => set({ audioRef: ref }),

  seekTo: (ms) => {
    const { audioRef } = get();
    if (audioRef?.current) {
      audioRef.current.currentTime = ms / 1000;
    }
    set({ currentTimeMs: ms });
  },
}));
