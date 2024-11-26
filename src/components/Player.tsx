import React, { useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../store/usePlayerStore';

export const Player: React.FC = () => {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const volume = usePlayerStore((state) => state.volume);
  const { play, pause, setVolume, skipToNext, skipToPrevious } = usePlayerStore();

  const progressRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = React.useState(0);
  const [isMuted, setIsMuted] = React.useState(false);
  const previousVolume = useRef(volume);

  useEffect(() => {
    if (!currentTrack) return;

    const audioElement = usePlayerStore.getState().audioElement;
    if (!audioElement) return;

    const updateProgress = () => {
      setProgress((audioElement.currentTime / audioElement.duration) * 100);
    };

    audioElement.addEventListener('timeupdate', updateProgress);
    return () => audioElement.removeEventListener('timeupdate', updateProgress);
  }, [currentTrack]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !currentTrack) return;

    const audioElement = usePlayerStore.getState().audioElement;
    if (!audioElement) return;

    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioElement.currentTime = percent * audioElement.duration;
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume.current);
    } else {
      previousVolume.current = volume;
      setVolume(0);
    }
    setIsMuted(!isMuted);
  };

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-lg border-t border-white/10 p-4"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{currentTrack.name}</p>
              <p className="text-sm text-zinc-400 truncate">
                {currentTrack.artist} • {currentTrack.album}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={skipToPrevious}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={isPlaying ? pause : play}
                className="p-3 bg-green-500 rounded-full text-white hover:bg-green-400 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={skipToNext}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 w-32">
              <button
                onClick={toggleMute}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="absolute top-0 left-0 right-0 h-1 bg-zinc-800 cursor-pointer"
          >
            <div
              className="h-full bg-green-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};