import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFavoritesStore } from '../store/useFavoritesStore';
import toast from 'react-hot-toast';

interface FavoriteButtonProps {
  type: 'track' | 'album' | 'artist';
  item: {
    id: string;
    name: string;
    artist?: string;
    album?: string;
    imageUrl?: string;
  };
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ type, item }) => {
  const {
    isTrackFavorite,
    isAlbumFavorite,
    isArtistFavorite,
    addTrack,
    removeTrack,
    addAlbum,
    removeAlbum,
    addArtist,
    removeArtist
  } = useFavoritesStore();

  const isFavorite = () => {
    switch (type) {
      case 'track':
        return isTrackFavorite(item.id);
      case 'album':
        return isAlbumFavorite(item.id);
      case 'artist':
        return isArtistFavorite(item.id);
    }
  };

  const toggleFavorite = () => {
    switch (type) {
      case 'track':
        if (isTrackFavorite(item.id)) {
          removeTrack(item.id);
          toast.success(`Removed ${item.name} from favorites`);
        } else {
          addTrack({
            id: item.id,
            name: item.name,
            artist: item.artist!,
            album: item.album!
          });
          toast.success(`Added ${item.name} to favorites`);
        }
        break;

      case 'album':
        if (isAlbumFavorite(item.id)) {
          removeAlbum(item.id);
          toast.success(`Removed ${item.name} from favorites`);
        } else {
          addAlbum({
            id: item.id,
            name: item.name,
            artist: item.artist!,
            imageUrl: item.imageUrl!
          });
          toast.success(`Added ${item.name} to favorites`);
        }
        break;

      case 'artist':
        if (isArtistFavorite(item.id)) {
          removeArtist(item.id);
          toast.success(`Removed ${item.name} from favorites`);
        } else {
          addArtist({
            id: item.id,
            name: item.name,
            imageUrl: item.imageUrl!
          });
          toast.success(`Added ${item.name} to favorites`);
        }
        break;
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleFavorite}
      className={`p-2 rounded-full transition-colors ${
        isFavorite()
          ? 'text-red-500 hover:text-red-400'
          : 'text-zinc-400 hover:text-red-500'
      }`}
    >
      <Heart
        className={`w-5 h-5 ${isFavorite() ? 'fill-current' : ''}`}
      />
    </motion.button>
  );
};