import { createCanvas, loadImage } from '@napi-rs/canvas';
import fetch from 'node-fetch';

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

// Canvas configuration
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 630;
const PADDING = 40;
const ALBUM_ART_SIZE = 250;

// Colors
const COLORS = {
  card: 'rgba(39, 39, 42, 0.95)',
  primary: '#22c55e',
  secondary: '#16a34a',
  text: '#ffffff',
  textSecondary: '#a1a1aa',
  textTertiary: '#71717a',
  accent: '#15803d'
};

async function getSpotifyToken() {
  const auth = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify token');
  }

  const data = await response.json();
  return data.access_token;
}

async function getSpotifyAlbumInfo(artist, album) {
  const token = await getSpotifyToken();
  const query = `${album} artist:${artist}`;
  
  const searchResponse = await fetch(
    `${SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=album&limit=1`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!searchResponse.ok) {
    throw new Error('Failed to search album');
  }

  const searchData = await searchResponse.json();
  const albumId = searchData.albums?.items[0]?.id;
  
  if (!albumId) {
    throw new Error('Album not found');
  }

  const albumResponse = await fetch(
    `${SPOTIFY_API_URL}/albums/${albumId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!albumResponse.ok) {
    throw new Error('Failed to get album details');
  }

  const albumData = await albumResponse.json();
  return {
    name: albumData.name,
    artists: albumData.artists.map(artist => artist.name),
    releaseDate: albumData.release_date,
    imageUrl: albumData.images[0]?.url,
    spotifyUrl: albumData.external_urls.spotify,
    tracks: albumData.tracks.items.map(track => ({
      name: track.name,
      duration: msToMinutesAndSeconds(track.duration_ms),
      trackNumber: track.track_number
    }))
  };
}

function msToMinutesAndSeconds(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function truncateText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  
  let truncated = text;
  while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '...';
}

function drawSpotifyLogo(ctx, x, y, size) {
  ctx.save();
  ctx.fillStyle = COLORS.primary;
  ctx.beginPath();
  ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#000';
  const scale = size / 24;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  // Simplified Spotify logo
  ctx.beginPath();
  ctx.arc(12, 12, 8, 0, Math.PI * 2);
  ctx.arc(12, 12, 6, 0, Math.PI * 2, true);
  ctx.arc(12, 12, 4, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

export async function generateAlbumCard(artist, album) {
  try {
    const albumInfo = await getSpotifyAlbumInfo(artist, album);
    
    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    // Create transparent background
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Card background with blur effect
    ctx.fillStyle = COLORS.card;
    roundRect(ctx, PADDING, PADDING, CANVAS_WIDTH - (PADDING * 2), CANVAS_HEIGHT - (PADDING * 2), 20);
    ctx.fill();

    // Album artwork with shadow
    if (albumInfo.imageUrl) {
      const albumArt = await loadImage(albumInfo.imageUrl);
      
      // Draw shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;
      
      // Clip the artwork to rounded corners
      roundRect(ctx, PADDING * 2, PADDING * 2, ALBUM_ART_SIZE, ALBUM_ART_SIZE, 12);
      ctx.clip();
      
      // Draw artwork
      ctx.drawImage(albumArt, PADDING * 2, PADDING * 2, ALBUM_ART_SIZE, ALBUM_ART_SIZE);
      ctx.restore();
    }

    // Content area
    const contentX = PADDING * 2 + ALBUM_ART_SIZE + PADDING * 2;
    let contentY = PADDING * 2;
    const contentWidth = CANVAS_WIDTH - contentX - PADDING * 3;

    // Album title
    ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = COLORS.text;
    const titleLines = wrapText(ctx, albumInfo.name, contentWidth);
    titleLines.forEach((line, index) => {
      ctx.fillText(line, contentX, contentY + 56 + (index * 56));
    });

    // Artist name (increased spacing)
    contentY += titleLines.length * 56 + 40; // Increased from 24 to 40
    ctx.font = '32px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = COLORS.primary;
    const artistText = truncateText(ctx, albumInfo.artists.join(', '), contentWidth);
    ctx.fillText(artistText, contentX, contentY);

    // Release info (adjusted spacing)
    contentY += 56; // Increased from 48 to 56
    ctx.font = '24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = COLORS.textSecondary;
    const releaseYear = new Date(albumInfo.releaseDate).getFullYear();
    ctx.fillText(`${releaseYear} • ${albumInfo.tracks.length} tracks`, contentX, contentY);

    // Track list (adjusted spacing)
    contentY += 56; // Increased from 48 to 56
    albumInfo.tracks.slice(0, 4).forEach((track, index) => {
      const trackY = contentY + (index * 44);
      
      // Track number
      ctx.fillStyle = COLORS.textSecondary;
      ctx.font = '20px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(track.trackNumber.toString().padStart(2, '0'), contentX, trackY + 24);
      
      // Track name
      ctx.fillStyle = COLORS.text;
      ctx.font = '24px -apple-system, BlinkMacSystemFont, sans-serif';
      const trackName = truncateText(ctx, track.name, contentWidth - 160);
      ctx.fillText(trackName, contentX + 48, trackY + 24);
      
      // Duration
      ctx.fillStyle = COLORS.textSecondary;
      ctx.font = '20px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(track.duration, contentX + contentWidth - 80, trackY + 24);
    });

    // Spotify branding
    const bottomY = CANVAS_HEIGHT - PADDING * 2;
    drawSpotifyLogo(ctx, contentX, bottomY - 32, 24);
    ctx.fillStyle = COLORS.primary;
    ctx.font = '20px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('Play on Spotify', contentX + 36, bottomY - 16);

    // Watermark
    ctx.fillStyle = COLORS.textTertiary;
    ctx.font = '18px -apple-system, BlinkMacSystemFont, sans-serif';
    const watermark = 'Generated by Vinylogue';
    const watermarkWidth = ctx.measureText(watermark).width;
    ctx.fillText(watermark, CANVAS_WIDTH - PADDING * 2 - watermarkWidth, bottomY - 16);

    return canvas.encode('png');
  } catch (error) {
    console.error('Error generating album card:', error);
    throw error;
  }
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}