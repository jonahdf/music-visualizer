const FAVORITES_KEY = 'mv_favorites';
const EXCLUDED_KEY = 'mv_excluded';
const INTERVAL_KEY = 'mv_playlist_interval';
const MODE_KEY = 'mv_playlist_mode';

function readList(key: string): string[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]'); } catch { return []; }
}

export function getFavoriteIds(): string[] { return readList(FAVORITES_KEY); }
export function setFavoriteIds(ids: string[]): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export function getExcludedIds(): string[] { return readList(EXCLUDED_KEY); }
export function setExcludedIds(ids: string[]): void {
  localStorage.setItem(EXCLUDED_KEY, JSON.stringify(ids));
}

export function getPlaylistInterval(): number {
  return parseInt(localStorage.getItem(INTERVAL_KEY) ?? '0', 10);
}
export function setPlaylistInterval(ms: number): void {
  localStorage.setItem(INTERVAL_KEY, String(ms));
}

export function getPlaylistMode(): 'all' | 'favorites' {
  return localStorage.getItem(MODE_KEY) === 'favorites' ? 'favorites' : 'all';
}
export function setPlaylistMode(mode: 'all' | 'favorites'): void {
  localStorage.setItem(MODE_KEY, mode);
}
