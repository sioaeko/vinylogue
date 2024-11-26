import { spotifyAuth } from './spotifyAuth';

interface SpotifyImage {
  url: string;
  width: number;
  height: number;
}

interface SpotifyTrack {
  name: string;
  duration_ms: number;
  track_number: number;
  preview_url: string | null;
  album: {
    name: string;
    images: SpotifyImage[];
  };
}

interface SpotifyAlbum {
  id: string;
  name: string;
  artists: { name: string }[];
  release_date: string;
  images: SpotifyImage[];
  total_tracks: number;
  external_urls: { spotify: string };
  tracks: { items: SpotifyTrack[] };
}

interface SpotifyArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
  external_urls: { spotify: string };
}

interface SearchResult {
  type: 'album' | 'artist';
  id: string;
  name: string;
  artist?: string;
  imageUrl: string | null;
  listeners: number;
}

const handleSpotifyError = async (response: Response, retryFn: () => Promise<any>) => {
  if (response.status === 401) {
    await spotifyAuth.refreshToken();
    return retryFn();
  }
  const errorData = await response.json().catch(() => ({}));
  throw new Error(`Spotify API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
};

function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function searchSpotify(query: string): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  const fetchResults = async () => {
    try {
      const token = await spotifyAuth.getToken();
      const sanitizedQuery = sanitizeSearchQuery(query);
      
      if (!sanitizedQuery) {
        return [];
      }

      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(sanitizedQuery)}&type=album,artist&limit=8`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        return handleSpotifyError(response, fetchResults);
      }

      const data = await response.json();
      
      const albums = (data.albums?.items || []).map((album: SpotifyAlbum) => ({
        type: 'album' as const,
        id: album.id,
        name: album.name,
        artist: album.artists[0]?.name,
        imageUrl: album.images[0]?.url || null,
        listeners: 0 // We don't have this info from Spotify API
      }));

      const artists = (data.artists?.items || []).map((artist: SpotifyArtist) => ({
        type: 'artist' as const,
        id: artist.id,
        name: artist.name,
        imageUrl: artist.images[0]?.url || null,
        listeners: 0 // We don't have this info from Spotify API
      }));

      return [...albums, ...artists];

    } catch (error) {
      console.error('Spotify search error:', error);
      throw error instanceof Error ? error : new Error('Failed to search Spotify');
    }
  };

  return fetchResults();
}

export async function getSpotifyAlbumInfo(artistName: string, albumName: string) {
  if (!artistName || !albumName) {
    throw new Error('Artist and album names are required');
  }

  const fetchAlbumInfo = async () => {
    try {
      const token = await spotifyAuth.getToken();
      const sanitizedQuery = `${sanitizeSearchQuery(albumName)} artist:${sanitizeSearchQuery(artistName)}`;
      
      if (!sanitizedQuery) {
        throw new Error('Invalid search query');
      }

      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(sanitizedQuery)}&type=album&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!searchResponse.ok) {
        return handleSpotifyError(searchResponse, fetchAlbumInfo);
      }

      const data = await searchResponse.json();
      const album = data.albums?.items[0];

      if (!album) {
        throw new Error(`Album not found: ${albumName} by ${artistName}`);
      }

      const albumResponse = await fetch(
        `https://api.spotify.com/v1/albums/${album.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!albumResponse.ok) {
        return handleSpotifyError(albumResponse, fetchAlbumInfo);
      }

      const albumData = await albumResponse.json();

      return {
        id: albumData.id,
        name: albumData.name,
        artists: albumData.artists.map((artist: any) => artist.name),
        imageUrl: albumData.images[0]?.url || null,
        releaseDate: albumData.release_date,
        spotifyUrl: albumData.external_urls.spotify,
        tracks: albumData.tracks.items.map((track: any) => ({
          name: track.name,
          duration: msToMinutesAndSeconds(track.duration_ms),
          trackNumber: track.track_number,
          preview_url: track.preview_url
        }))
      };

    } catch (error) {
      console.error('Spotify album info error:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch album info');
    }
  };

  return fetchAlbumInfo();
}

export async function getSpotifyArtistInfo(artistName: string) {
  if (!artistName) {
    throw new Error('Artist name is required');
  }

  const fetchArtistInfo = async () => {
    try {
      const token = await spotifyAuth.getToken();
      const sanitizedName = sanitizeSearchQuery(artistName);
      
      if (!sanitizedName) {
        throw new Error('Invalid artist name');
      }

      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(sanitizedName)}&type=artist&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!searchResponse.ok) {
        return handleSpotifyError(searchResponse, fetchArtistInfo);
      }

      const data = await searchResponse.json();
      const artist = data.artists?.items[0];

      if (!artist) {
        throw new Error(`Artist not found: ${artistName}`);
      }

      // Fetch additional artist data in parallel
      const [topTracksRes, albumsRes, relatedArtistsRes] = await Promise.all([
        fetch(`https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=US`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=album,single&limit=4&market=US`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`https://api.spotify.com/v1/artists/${artist.id}/related-artists`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [topTracks, albums, relatedArtists] = await Promise.all([
        topTracksRes.ok ? topTracksRes.json() : { tracks: [] },
        albumsRes.ok ? albumsRes.json() : { items: [] },
        relatedArtistsRes.ok ? relatedArtistsRes.json() : { artists: [] }
      ]);

      return {
        id: artist.id,
        name: artist.name,
        imageUrl: artist.images[0]?.url || null,
        spotifyUrl: artist.external_urls.spotify,
        topTracks: topTracks.tracks?.slice(0, 5).map((track: SpotifyTrack) => ({
          name: track.name,
          duration: msToMinutesAndSeconds(track.duration_ms),
          album: track.album.name,
          preview_url: track.preview_url
        })),
        topAlbums: albums.items?.slice(0, 4).map((album: SpotifyAlbum) => ({
          name: album.name,
          imageUrl: album.images[0]?.url,
          releaseDate: album.release_date,
          totalTracks: album.total_tracks
        })),
        relatedArtists: relatedArtists.artists?.slice(0, 4).map((artist: SpotifyArtist) => ({
          name: artist.name,
          imageUrl: artist.images[0]?.url,
          listeners: 0 // We don't have this info from Spotify API
        }))
      };

    } catch (error) {
      console.error('Spotify artist info error:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch artist info');
    }
  };

  return fetchArtistInfo();
}

function msToMinutesAndSeconds(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}