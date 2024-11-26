import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateAlbumCard } from './generate.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/album-card', async (req, res) => {
  const { artist, album } = req.query;
  
  if (!artist || !album) {
    return res.status(400).json({ 
      error: 'Missing required parameters',
      message: 'Both artist and album parameters are required'
    });
  }

  try {
    const buffer = await generateAlbumCard(artist, album);
    
    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
      'ETag': `"${artist}-${album}"`,
    });
    
    res.send(buffer);
  } catch (error) {
    console.error('Error generating album card:', error);
    res.status(500).json({ 
      error: 'Failed to generate album card',
      message: error.message 
    });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(port, () => {
  console.log(`Album card API running on port ${port}`);
});