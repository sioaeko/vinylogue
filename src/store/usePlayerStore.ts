import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: string;
  preview_url: string | null;
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  history: Track[];
  audioElement: HTMLAudioElement | null;
  setTrack: (track: Track) => void;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  skipToNext: () => void;
  skipToPrevious: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  devtools(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      volume: 1,
      queue: [],
      history: [],
      audioElement: null,

      setTrack: (track) => {
        const { audioElement } = get();
        if (audioElement) {
          audioElement.pause();
        }

        const newAudio = track.preview_url ? new Audio(track.preview_url) : null;
        if (newAudio) {
          newAudio.volume = get().volume;
          newAudio.addEventListener('ended', () => {
            const { queue } = get();
            if (queue.length > 0) {
              get().skipToNext();
            } else {
              set({ isPlaying: false });
            }
          });
        }

        set({
          currentTrack: track,
          audioElement: newAudio,
          isPlaying: false
        });
      },

      play: () => {
        const { audioElement } = get();
        if (audioElement) {
          audioElement.play();
          set({ isPlaying: true });
        }
      },

      pause: () => {
        const { audioElement } = get();
        if (audioElement) {
          audioElement.pause();
          set({ isPlaying: false });
        }
      },

      setVolume: (volume) => {
        const { audioElement } = get();
        if (audioElement) {
          audioElement.volume = volume;
        }
        set({ volume });
      },

      addToQueue: (track) => {
        set((state) => ({
          queue: [...state.queue, track]
        }));
      },

      removeFromQueue: (trackId) => {
        set((state) => ({
          queue: state.queue.filter((track) => track.id !== trackId)
        }));
      },

      skipToNext: () => {
        const { currentTrack, queue, history } = get();
        if (queue.length === 0) return;

        if (currentTrack) {
          set((state) => ({
            history: [...state.history, currentTrack]
          }));
        }

        const nextTrack = queue[0];
        const newQueue = queue.slice(1);
        get().setTrack(nextTrack);
        get().play();
        set({ queue: newQueue });
      },

      skipToPrevious: () => {
        const { currentTrack, history } = get();
        if (history.length === 0) return;

        const previousTrack = history[history.length - 1];
        const newHistory = history.slice(0, -1);

        if (currentTrack) {
          set((state) => ({
            queue: [currentTrack, ...state.queue]
          }));
        }

        get().setTrack(previousTrack);
        get().play();
        set({ history: newHistory });
      }
    }),
    { name: 'player-store' }
  )
);