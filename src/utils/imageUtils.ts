import { getSpotifyArtistInfo } from './spotifyUtils';

// Image sources configuration
const LASTFM_DEFAULT_IMAGE = '2a96cbd8b46e442fc41c2b86b821562f';

// Curated high-quality fallback images
const FALLBACK_IMAGES = {
  artist: [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
    'https://images.unsplash.com/photo-1501612780327-45045538702b'
  ],
  album: [
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae',
    'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1',
    'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa'
  ]
};

Object.keys(FALLBACK_IMAGES).forEach(key => {
  FALLBACK_IMAGES[key] = FALLBACK_IMAGES[key].map(url => 
    `${url}?w=400&h=400&fit=crop&q=80`
  );
});

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
const imageCache = new Map<string, {
  url: string;
  timestamp: number;
}>();

function getRandomFallbackImage(type: 'artist' | 'album' = 'artist'): string {
  const images = FALLBACK_IMAGES[type];
  return images[Math.floor(Math.random() * images.length)];
}

async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && contentType?.startsWith('image/');
  } catch {
    return false;
  }
}

export async function getEnhancedArtistImage(artistName: string, lastfmImage: string | null): Promise<string> {
  try {
    const cacheKey = `artist:${artistName}`;
    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.url;
    }

    // Try Spotify first
    const artistInfo = await getSpotifyArtistInfo(artistName);
    if (artistInfo?.imageUrl) {
      imageCache.set(cacheKey, {
        url: artistInfo.imageUrl,
        timestamp: Date.now()
      });
      return artistInfo.imageUrl;
    }

    // Then try Last.fm image if it's valid
    if (lastfmImage && 
        !lastfmImage.includes(LASTFM_DEFAULT_IMAGE) && 
        !lastfmImage.includes('2a96cbd8b46e442fc41c2b86b821562f.png')) {
      const isValid = await isValidImageUrl(lastfmImage);
      if (isValid) {
        imageCache.set(cacheKey, {
          url: lastfmImage,
          timestamp: Date.now()
        });
        return lastfmImage;
      }
    }

    // If both fail, use fallback
    const fallbackImage = getRandomFallbackImage('artist');
    imageCache.set(cacheKey, {
      url: fallbackImage,
      timestamp: Date.now()
    });
    return fallbackImage;

  } catch (error) {
    console.error('Error fetching enhanced artist image:', error);
    return getRandomFallbackImage('artist');
  }
}

export async function getEnhancedAlbumImage(albumName: string, artistName: string, lastfmImage: string | null): Promise<string> {
  try {
    const cacheKey = `album:${artistName}:${albumName}`;
    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.url;
    }

    // First try Last.fm image if available
    if (lastfmImage && !lastfmImage.includes(LASTFM_DEFAULT_IMAGE)) {
      const isValid = await isValidImageUrl(lastfmImage);
      if (isValid) {
        imageCache.set(cacheKey, {
          url: lastfmImage,
          timestamp: Date.now()
        });
        return lastfmImage;
      }
    }

    // Use fallback if no valid image found
    const fallbackImage = getRandomFallbackImage('album');
    imageCache.set(cacheKey, {
      url: fallbackImage,
      timestamp: Date.now()
    });
    return fallbackImage;

  } catch (error) {
    console.error('Error fetching enhanced album image:', error);
    return getRandomFallbackImage('album');
  }
}