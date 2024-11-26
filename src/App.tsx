import React, { useState } from 'react';
import { Search, Music, Disc3, Sparkles, Github, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlbumCard } from './components/AlbumCard';
import { ArtistCard } from './components/ArtistCard';
import { SearchResults } from './components/SearchResults';
import { Player } from './components/Player';
import { Queue } from './components/Queue';
import toast from 'react-hot-toast';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<{artist: string, album: string} | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(true);
      setSelectedAlbum(null);
      setSelectedArtist(null);
    }
  };

  const handleSelectAlbum = (artist: string, album: string) => {
    setSelectedAlbum({ artist, album });
    setSelectedArtist(null);
    setShowResults(false);
  };

  const handleSelectArtist = (artist: string) => {
    setSelectedArtist(artist);
    setSelectedAlbum(null);
    setShowResults(false);
  };

  const goHome = () => {
    setSearchQuery('');
    setShowResults(false);
    setSelectedAlbum(null);
    setSelectedArtist(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <motion.div 
            className="flex items-center justify-center gap-3 mb-6"
            animate={{ 
              scale: [1, 1.02, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <button
              onClick={goHome}
              className="flex items-center gap-3 hover:scale-105 transition-transform"
            >
              <Disc3 className="w-12 h-12 text-green-500" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-green-400 to-white bg-clip-text text-transparent">
                Vinylogue
              </h1>
            </button>
          </motion.div>
          <p className="text-xl text-zinc-400">
            Discover and explore your favorite music
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 p-6 glass-card hover-card max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Github className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Show off your music taste on GitHub</h2>
            </div>
            <p className="text-zinc-400 mb-4">
              Add beautiful album cards to your GitHub profile or project READMEs
            </p>
            <div className="relative bg-zinc-900/50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <code className="break-all whitespace-pre-wrap text-green-400">
                ![ROSÉ - APT.](https://vinylogue-render.onrender.com/album-card?artist=ROSÉ&album=APT.)
              </code>
            </div>
          </motion.div>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-2xl mx-auto"
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search for artists or albums..."
              className="w-full px-6 py-4 pl-14 pr-32 bg-zinc-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-white placeholder-zinc-400 text-lg backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 w-6 h-6" />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-500 hover:bg-green-400 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors duration-200 flex items-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>Search</span>
            </motion.button>
          </div>
        </motion.form>

        <AnimatePresence mode="wait">
          {showResults && searchQuery && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/5 overflow-hidden"
            >
              <SearchResults 
                query={searchQuery} 
                onSelect={handleSelectAlbum}
                onArtistSelect={handleSelectArtist}
              />
            </motion.div>
          )}

          {selectedAlbum && (
            <motion.div
              key="album"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={goHome}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span>Back to Home</span>
                </button>
                <Queue />
              </div>
              <AlbumCard artist={selectedAlbum.artist} album={selectedAlbum.album} />
            </motion.div>
          )}

          {selectedArtist && (
            <motion.div
              key="artist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={goHome}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span>Back to Home</span>
                </button>
                <Queue />
              </div>
              <ArtistCard name={selectedArtist} />
            </motion.div>
          )}
        </AnimatePresence>

        {!showResults && !selectedAlbum && !selectedArtist && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-zinc-500 mt-12"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 0.9, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
            </motion.div>
            <p>Start searching to explore music</p>
          </motion.div>
        )}

        <Player />
      </div>
    </div>
  );
}

export default App;