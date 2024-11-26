import React from 'react';
import { Music2, Disc2, User } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { searchSpotify } from '../utils/spotifyUtils';

interface SearchResultsProps {
  query: string;
  onSelect: (artist: string, album: string) => void;
  onArtistSelect: (artist: string) => void;
}

interface SearchResult {
  type: 'album' | 'artist';
  id: string;
  name: string;
  artist?: string;
  imageUrl: string | null;
  listeners: number;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ query, onSelect, onArtistSelect }) => {
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) return;

      try {
        setLoading(true);
        setError(null);

        const searchResults = await searchSpotify(query);
        setResults(searchResults);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to fetch search results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const formatNumber = (num: number) => {
    if (!num || isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num);
  };

  if (loading && results.length === 0) {
    return <LoadingSpinner message="Searching..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (results.length === 0) {
    return (
      <div className="text-center text-zinc-400 py-8">
        No results found for "{query}"
      </div>
    );
  }

  // Group results by type
  const albums = results.filter(r => r.type === 'album');
  const artists = results.filter(r => r.type === 'artist');

  return (
    <div className="space-y-8">
      {/* Albums Section */}
      {albums.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Disc2 className="w-5 h-5" />
            Albums
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {albums.map((result) => (
              <button
                key={result.id}
                onClick={() => result.artist && onSelect(result.artist, result.name)}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors text-left group w-full"
              >
                <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-zinc-800">
                  {result.imageUrl ? (
                    <img
                      src={result.imageUrl}
                      alt={result.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Disc2 className="w-8 h-8 text-zinc-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate group-hover:text-green-400 transition-colors">
                    {result.name}
                  </h4>
                  <p className="text-sm text-zinc-400 truncate">{result.artist}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {formatNumber(result.listeners)} listeners
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Artists Section */}
      {artists.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Artists
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {artists.map((result) => (
              <button
                key={result.id}
                onClick={() => onArtistSelect(result.name)}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors text-left group w-full"
              >
                <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-zinc-800">
                  {result.imageUrl ? (
                    <img
                      src={result.imageUrl}
                      alt={result.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-zinc-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate group-hover:text-green-400 transition-colors">
                    {result.name}
                  </h4>
                  <p className="text-sm text-zinc-400">
                    {formatNumber(result.listeners)} listeners
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};