import React, { useState, useEffect } from 'react';
import { Music2, ExternalLink, Clock3 } from 'lucide-react';

interface SpotifyAlbumProps {
  searchQuery: string;
}

interface AlbumInfo {
  name: string;
  artists: string[];
  releaseDate: string;
  imageUrl: string;
  totalTracks: number;
  spotifyUrl: string;
  tracks: {
    name: string;
    duration: string;
    trackNumber: number;
  }[];
}

// Mock data for demonstration
const mockAlbumInfo: AlbumInfo = {
  name: "OK Computer",
  artists: ["Radiohead"],
  releaseDate: "1997-05-21",
  imageUrl: "https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=400&h=400&fit=crop",
  totalTracks: 12,
  spotifyUrl: "https://open.spotify.com/album/6dVIqQ8qmQ5GBnJ9shOYGE",
  tracks: [
    { name: "Airbag", duration: "4:44", trackNumber: 1 },
    { name: "Paranoid Android", duration: "6:23", trackNumber: 2 },
    { name: "Subterranean Homesick Alien", duration: "4:27", trackNumber: 3 },
    { name: "Exit Music (For a Film)", duration: "4:24", trackNumber: 4 },
    { name: "Let Down", duration: "4:59", trackNumber: 5 },
    { name: "Karma Police", duration: "4:21", trackNumber: 6 }
  ]
};

export const SpotifyAlbum: React.FC<SpotifyAlbumProps> = ({ searchQuery }) => {
  const [albumInfo, setAlbumInfo] = useState<AlbumInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with mock data
    const fetchAlbumInfo = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAlbumInfo(mockAlbumInfo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch album info');
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) {
      fetchAlbumInfo();
    }
  }, [searchQuery]);

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
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (!albumInfo) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-xl overflow-hidden shadow-xl">
      <div className="p-6 flex flex-col md:flex-row gap-6">
        {/* Album Cover */}
        <div className="w-full md:w-48 flex-shrink-0">
          <img
            src={albumInfo.imageUrl}
            alt={`${albumInfo.name} album cover`}
            className="w-full aspect-square object-cover rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300"
          />
        </div>

        {/* Album Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">{albumInfo.name}</h2>
          <p className="text-zinc-400 mb-4">{albumInfo.artists.join(', ')}</p>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm text-zinc-400">{albumInfo.releaseDate}</span>
            <span className="text-sm text-zinc-400">•</span>
            <span className="text-sm text-zinc-400">{albumInfo.totalTracks} tracks</span>
            <a
              href={albumInfo.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors"
            >
              <span>Open in Spotify</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Track List */}
          <div className="space-y-2">
            {albumInfo.tracks.map((track) => (
              <div
                key={track.trackNumber}
                className="flex items-center py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className="w-8 text-zinc-500">{track.trackNumber}</span>
                <span className="flex-1">{track.name}</span>
                <span className="text-zinc-500 flex items-center gap-2">
                  <Clock3 className="w-4 h-4" />
                  {track.duration}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};