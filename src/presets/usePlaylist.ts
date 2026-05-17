import { useState, useCallback } from 'react';
import type { PresetEntry } from './usePresets';
import {
  getFavoriteIds, setFavoriteIds,
  getExcludedIds, setExcludedIds,
  getPlaylistInterval, setPlaylistInterval,
  getPlaylistMode, setPlaylistMode,
} from './PlaylistStore';

export function usePlaylist() {
  const [favorites, setFavorites] = useState<string[]>(() => getFavoriteIds());
  const [excluded, setExcluded] = useState<string[]>(() => getExcludedIds());
  const [playlistMode, setPlaylistModeState] = useState<'all' | 'favorites'>(() => getPlaylistMode());
  const [interval, setIntervalState] = useState<number>(() => getPlaylistInterval());
  const [isHeld, setIsHeld] = useState(false);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);
  const isExcluded = useCallback((id: string) => excluded.includes(id), [excluded]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      setFavoriteIds(next);
      return next;
    });
    // favoriting clears exclude
    setExcluded(prev => {
      if (!prev.includes(id)) return prev;
      const next = prev.filter(e => e !== id);
      setExcludedIds(next);
      return next;
    });
  }, []);

  const toggleExclude = useCallback((id: string) => {
    setExcluded(prev => {
      const next = prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id];
      setExcludedIds(next);
      return next;
    });
    // excluding clears favorite
    setFavorites(prev => {
      if (!prev.includes(id)) return prev;
      const next = prev.filter(f => f !== id);
      setFavoriteIds(next);
      return next;
    });
  }, []);

  const getPool = useCallback((presets: PresetEntry[]): PresetEntry[] => {
    let pool =
      playlistMode === 'favorites'
        ? presets.filter(p => favorites.includes(p.id))
        : presets;
    pool = pool.filter(p => !excluded.includes(p.id));
    // fallback: if everything is excluded, use all non-excluded presets
    return pool.length > 0 ? pool : presets.filter(p => !excluded.includes(p.id));
  }, [playlistMode, favorites, excluded]);

  const changeInterval = useCallback((ms: number) => {
    setIntervalState(ms);
    setPlaylistInterval(ms);
  }, []);

  const changePlaylistMode = useCallback((mode: 'all' | 'favorites') => {
    setPlaylistModeState(mode);
    setPlaylistMode(mode);
  }, []);

  const toggleHold = useCallback(() => setIsHeld(h => !h), []);

  return {
    favorites,
    excluded,
    isFavorite,
    isExcluded,
    toggleFavorite,
    toggleExclude,
    getPool,
    playlistMode,
    setPlaylistMode: changePlaylistMode,
    interval,
    setInterval: changeInterval,
    isHeld,
    toggleHold,
  };
}
