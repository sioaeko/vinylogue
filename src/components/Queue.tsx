import React from 'react';
import { List, Grip, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../store/usePlayerStore';

export const Queue: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { queue, removeFromQueue, currentTrack } = usePlayerStore();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-zinc-400 hover:text-white transition-colors relative"
      >
        <List className="w-5 h-5" />
        {queue.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-xs flex items-center justify-center">
            {queue.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-zinc-900 border-l border-white/10 p-4 z-50"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Queue</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {currentTrack && (
                <div className="mb-6">
                  <p className="text-sm text-zinc-400 mb-2">Now Playing</p>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{currentTrack.name}</p>
                      <p className="text-sm text-zinc-400 truncate">
                        {currentTrack.artist} • {currentTrack.album}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-zinc-400 mb-2">Next Up</p>
                {queue.length === 0 ? (
                  <p className="text-zinc-500 text-center py-4">Queue is empty</p>
                ) : (
                  queue.map((track, index) => (
                    <div
                      key={`${track.id}-${index}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 group"
                    >
                      <Grip className="w-4 h-4 text-zinc-600" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{track.name}</p>
                        <p className="text-sm text-zinc-400 truncate">
                          {track.artist} • {track.album}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromQueue(track.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};