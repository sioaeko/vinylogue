import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface FavoriteTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
}

interface FavoriteAlbum {
  id: string;
  name: string;
  artist: string;
  imageUrl: string;
}

interface FavoriteArtist {
  id: string;
  name: string;
  imageUrl: string;
}

interface FavoritesState {
  tracks: FavoriteTrack[];
  albums: FavoriteAlbum[];
  artists: FavoriteArtist[];
  addTrack: (track: FavoriteTrack) => void;
  removeTrack: (trackId: string) => void;
  addAlbum: (album: FavoriteAlbum) => void;
  removeAlbum: (albumId: string) => void;
  addArtist: (artist: FavoriteArtist) => void;
  removeArtist: (artistId: string) => void;
  isTrackFavorite: (trackId: string) => boolean;
  isAlbumFavorite: (albumId: string) => boolean;
  isArtistFavorite: (artistId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  devtools(
    persist(
      (set, get) => ({
        tracks: [],
        albums: [],
        artists: [],

        addTrack: (track) => 
          set((state) => ({
            tracks: [...state.tracks, track]
          })),

        removeTrack: (trackId) =>
          set((state) => ({
            tracks: state.tracks.filter((t) => t.id !== trackId)
          })),

        addAlbum: (album) =>
          set((state) => ({
            albums: [...state.albums, album]
          })),

        removeAlbum: (albumId) =>
          set((state) => ({
            albums: state.albums.filter((a) => a.id !== albumId)
          })),

        addArtist: (artist) =>
          set((state) => ({
            artists: [...state.artists, artist]
          })),

        removeArtist: (artistId) =>
          set((state) => ({
            artists: state.artists.filter((a) => a.id !== artistId)
          })),

        isTrackFavorite: (trackId) =>
          get().tracks.some((t) => t.id === trackId),

        isAlbumFavorite: (albumId) =>
          get().albums.some((a) => a.id === albumId),

        isArtistFavorite: (artistId) =>
          get().artists.some((a) => a.id === artistId),
      }),
      {
        name: 'favorites-storage',
        version: 1,
      }
    )
  )
);