import React, { useState, useEffect } from 'react';
import { Music2, ExternalLink, Clock3, Copy, Check, Play, Pause } from 'lucide-react';
import { getSpotifyAlbumInfo } from '../utils/spotifyUtils';
import toast from 'react-hot-toast';

interface AlbumCardProps {
  artist: string;
  album: string;
}

interface Track {
  name: string;
  duration: string;
  trackNumber: number;
  preview_url?: string | null;
}

interface AlbumInfo {
  name: string;
  artist: string;
  imageUrl: string | null;
  url: string;
  tracks: Track[];
  spotifyInfo?: {
    releaseDate: string;
    spotifyUrl: string;
    artists: string[];
  };
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ artist, album }) => {
  const [albumInfo, setAlbumInfo] = useState<AlbumInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchAlbumInfo = async () => {
      if (!artist || !album) {
        setError('Artist and album names are required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const spotifyData = await getSpotifyAlbumInfo(artist, album);
        
        setAlbumInfo({
          name: spotifyData.name,
          artist: artist,
          imageUrl: spotifyData.imageUrl,
          url: spotifyData.spotifyUrl,
          tracks: spotifyData.tracks,
          spotifyInfo: {
            releaseDate: spotifyData.releaseDate,
            spotifyUrl: spotifyData.spotifyUrl,
            artists: spotifyData.artists
          }
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch album info';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumInfo();

    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [artist, album]);

  const handlePlayPreview = (previewUrl: string | null, trackName: string) => {
    if (!previewUrl) {
      toast.error('No preview available for this track');
      return;
    }

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
    audio.addEventListener('error', () => {
      toast.error('Failed to play preview');
      setPlayingTrack(null);
    });

    audio.play().catch(() => {
      toast.error('Failed to play preview');
      setPlayingTrack(null);
    });

    setAudioElement(audio);
    setPlayingTrack(trackName);
  };

  const generateMarkdownLink = () => {
    const encodedArtist = encodeURIComponent(artist);
    const encodedAlbum = encodeURIComponent(album);
    return `![${artist} - ${album}](https://vinylogue-render.onrender.com/album-card?artist=${encodedArtist}&album=${encodedAlbum})`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateMarkdownLink());
      setCopiedMarkdown(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedMarkdown(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    }
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
      <div className="bg-red-500/10 text-red-400 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!albumInfo) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-xl overflow-hidden shadow-xl">
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-48 flex-shrink-0">
            <img
              src={albumInfo.imageUrl || 'https://via.placeholder.com/300'}
              alt={`${albumInfo.name} album cover`}
              className="w-full aspect-square object-cover rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold mb-4 break-words">{albumInfo.name}</h2>
            <p className="text-zinc-400 mb-6 truncate">{albumInfo.artist}</p>
            
            <div className="flex items-center gap-4 mb-6">
              {albumInfo.spotifyInfo?.releaseDate && (
                <span className="text-zinc-400">
                  {new Date(albumInfo.spotifyInfo.releaseDate).getFullYear()}
                </span>
              )}
              <div className="flex gap-2">
                {albumInfo.spotifyInfo?.spotifyUrl && (
                  <a
                    href={albumInfo.spotifyInfo.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors"
                  >
                    <span>Open in Spotify</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-1 mb-6 max-h-[240px] overflow-y-auto">
              {albumInfo.tracks.map((track, index) => (
                <div
                  key={`${track.name}-${index}`}
                  className="flex items-center py-2 px-3 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <span className="w-8 text-zinc-500">{track.trackNumber}</span>
                  <span className="flex-1 min-w-0 truncate">{track.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {track.preview_url && (
                      <button
                        onClick={() => handlePlayPreview(track.preview_url, track.name)}
                        className="p-2 text-zinc-400 hover:text-green-500 transition-colors"
                        title={playingTrack === track.name ? "Pause preview" : "Play preview"}
                      >
                        {playingTrack === track.name ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <span className="text-zinc-500 flex items-center gap-1 w-16">
                      <Clock3 className="w-4 h-4" />
                      {track.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-700/50">
              <p className="text-sm text-zinc-400 mb-2">Add this album to your README:</p>
              <div className="relative group">
                <pre className="bg-zinc-800/50 p-3 rounded-lg text-sm overflow-x-auto">
                  <code className="break-all whitespace-pre-wrap">{generateMarkdownLink()}</code>
                </pre>
                <button
                  onClick={copyToClipboard}
                  className="absolute right-2 top-2 p-2 text-zinc-400 hover:text-green-500 transition-colors opacity-0 group-hover:opacity-100"
                  title="Copy markdown"
                >
                  {copiedMarkdown ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};