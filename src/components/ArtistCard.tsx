import React, { useState, useEffect } from 'react';
import { User, Users, Music2, ExternalLink, Globe, Play, Pause } from 'lucide-react';
import { getSpotifyArtistInfo } from '../utils/spotifyUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface ArtistCardProps {
  name: string;
}

interface ArtistInfo {
  id: string;
  name: string;
  imageUrl: string | null;
  listeners: number;
  playcount: number;
  spotifyUrl: string;
  topTracks: {
    name: string;
    duration: string;
    album: string;
    preview_url: string | null;
  }[];
  topAlbums: {
    name: string;
    imageUrl: string;
    releaseDate: string;
    totalTracks: number;
  }[];
  relatedArtists: {
    name: string;
    imageUrl: string | null;
    listeners: number;
  }[];
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ name }) => {
  const [artistInfo, setArtistInfo] = useState<ArtistInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchArtistInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        const info = await getSpotifyArtistInfo(name);
        if (!info) {
          throw new Error('Artist not found');
        }

        setArtistInfo(info);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch artist info');
      } finally {
        setLoading(false);
      }
    };

    if (name) {
      fetchArtistInfo();
    }

    // Cleanup audio on unmount
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [name]);

  const handlePlayPreview = (previewUrl: string | null, trackName: string) => {
    if (!previewUrl) return;

    if (playingTrack === trackName) {
      audioElement?.pause();
      setPlayingTrack(null);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    const audio = new Audio(previewUrl);
    audio.addEventListener('ended', () => setPlayingTrack(null));
    audio.play();
    setAudioElement(audio);
    setPlayingTrack(trackName);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">
          <Music2 className="w-8 h-8 text-green-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50/10 text-red-400 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (!artistInfo) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-xl overflow-hidden shadow-xl">
      <div className="p-6">
        {/* Artist Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-48 flex-shrink-0">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800">
              <AnimatePresence mode="wait">
                {imageLoading && (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-zinc-800 animate-pulse"
                  />
                )}
              </AnimatePresence>
              <img
                src={artistInfo.imageUrl || 'https://via.placeholder.com/400?text=No+Image'}
                alt={artistInfo.name}
                className="w-full h-full object-cover"
                onLoad={() => setImageLoading(false)}
                style={{ opacity: imageLoading ? 0 : 1 }}
              />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold">{artistInfo.name}</h2>
              {artistInfo.spotifyUrl && (
                <a
                  href={artistInfo.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  <span className="hidden sm:inline">Open in Spotify</span>
                </a>
              )}
            </div>

            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-zinc-400" />
                <span className="text-zinc-300">{formatNumber(artistInfo.listeners)} listeners</span>
              </div>
              <div className="flex items-center gap-2">
                <Music2 className="w-5 h-5 text-zinc-400" />
                <span className="text-zinc-300">{formatNumber(artistInfo.playcount)} plays</span>
              </div>
            </div>

            {/* Top Tracks */}
            {artistInfo.topTracks.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Popular Tracks</h3>
                <div className="space-y-2">
                  {artistInfo.topTracks.map((track, index) => (
                    <div
                      key={track.name}
                      className="flex items-center py-2 px-3 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <span className="w-8 text-zinc-500">{index + 1}</span>
                      <span className="flex-1">{track.name}</span>
                      <span className="text-zinc-400 text-sm mr-4">{track.album}</span>
                      {track.preview_url && (
                        <button
                          onClick={() => handlePlayPreview(track.preview_url, track.name)}
                          className="p-2 text-zinc-400 hover:text-green-500 transition-colors"
                        >
                          {playingTrack === track.name ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </button>
                      )}
                      <span className="text-zinc-500 w-16 text-right">{track.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Albums */}
        {artistInfo.topAlbums?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Popular Albums</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {artistInfo.topAlbums.map(album => (
                <div key={album.name} className="group">
                  <div className="aspect-square mb-2 overflow-hidden rounded-lg bg-zinc-800">
                    <img
                      src={album.imageUrl}
                      alt={album.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="font-medium text-sm truncate">{album.name}</h4>
                  <p className="text-xs text-zinc-400">
                    {new Date(album.releaseDate).getFullYear()} • {album.totalTracks} tracks
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Artists */}
        {artistInfo.relatedArtists?.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Similar Artists</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {artistInfo.relatedArtists.map(artist => (
                <div key={artist.name} className="group">
                  <div className="aspect-square mb-2 overflow-hidden rounded-lg bg-zinc-800">
                    <img
                      src={artist.imageUrl || 'https://via.placeholder.com/400?text=No+Image'}
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="font-medium text-sm truncate">{artist.name}</h4>
                  <p className="text-xs text-zinc-400">{formatNumber(artist.listeners)} listeners</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};