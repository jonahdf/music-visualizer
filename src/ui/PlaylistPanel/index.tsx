import type { PresetEntry } from '../../presets/usePresets';

interface Props {
  activePresetName: string;
  activePresetId: string;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  playlistMode: 'all' | 'favorites';
  onPlaylistModeChange: (mode: 'all' | 'favorites') => void;
  favoritePresets: PresetEntry[];
  totalCount: number;
  excludedCount: number;
  interval: number;
  onIntervalChange: (ms: number) => void;
  isHeld: boolean;
  onToggleHold: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRandom: () => void;
  onSelectPreset: (preset: PresetEntry) => void;
}

const INTERVALS = [
  { label: 'Off', ms: 0 },
  { label: '15s', ms: 15_000 },
  { label: '30s', ms: 30_000 },
  { label: '1m', ms: 60_000 },
  { label: '5m', ms: 300_000 },
];

export default function PlaylistPanel({
  activePresetName,
  activePresetId,
  isFavorite,
  onToggleFavorite,
  playlistMode,
  onPlaylistModeChange,
  favoritePresets,
  totalCount,
  excludedCount,
  interval,
  onIntervalChange,
  isHeld,
  onToggleHold,
  onPrev,
  onNext,
  onRandom,
  onSelectPreset,
}: Props) {
  const favCount = favoritePresets.length;
  const poolCount = playlistMode === 'favorites' ? Math.max(0, favCount) : Math.max(0, totalCount - excludedCount);
  const noFavorites = playlistMode === 'favorites' && favCount === 0;
  const favorited = activePresetId ? isFavorite(activePresetId) : false;

  return (
    <div className="playlist-panel">
      {activePresetName && (
        <div className="now-playing-section">
          <h3 className="section-title">Now Playing</h3>
          <div className="now-playing-row">
            <span className="now-playing-name" title={activePresetName}>{activePresetName}</span>
            <button
              className={`favorite-btn${favorited ? ' active' : ''}`}
              onClick={() => activePresetId && onToggleFavorite(activePresetId)}
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              {favorited ? '♥' : '♡'}
            </button>
          </div>
        </div>
      )}

      <div className="playlist-section">
        <h3 className="section-title">Playlist</h3>
        <div className="playlist-mode-toggle">
          <button
            className={`mode-btn ${playlistMode === 'all' ? 'active' : ''}`}
            onClick={() => onPlaylistModeChange('all')}
          >
            All Presets
            <span className="mode-count">{totalCount - excludedCount}</span>
          </button>
          <button
            className={`mode-btn ${playlistMode === 'favorites' ? 'active' : ''}`}
            onClick={() => onPlaylistModeChange('favorites')}
          >
            Favorites
            <span className="mode-count">{favCount}</span>
          </button>
        </div>
        {excludedCount > 0 && (
          <p className="playlist-pool-info excluded-note">
            {excludedCount} preset{excludedCount !== 1 ? 's' : ''} excluded — open Presets tab to manage
          </p>
        )}
        {noFavorites ? (
          <p className="playlist-hint">
            No favorites yet — click ♥ on any preset in the Presets tab or the Now Playing row above.
          </p>
        ) : (
          <p className="playlist-pool-info">{poolCount} preset{poolCount !== 1 ? 's' : ''} in pool</p>
        )}
      </div>

      {favCount > 0 && (
        <div className="playlist-section">
          <h3 className="section-title">Favorites <span className="section-count">{favCount}</span></h3>
          <div className="favorites-list">
            {favoritePresets.map(preset => (
              <div
                key={preset.id}
                className={`fav-item ${preset.id === activePresetId ? 'active' : ''}`}
                onClick={() => onSelectPreset(preset)}
              >
                <span className="fav-item-name" title={preset.name}>{preset.name}</span>
                <button
                  className="favorite-btn active"
                  onClick={e => { e.stopPropagation(); onToggleFavorite(preset.id); }}
                  title="Remove from favorites"
                >
                  ♥
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="playlist-section">
        <h3 className="section-title">Navigation</h3>
        <div className="playlist-controls">
          <button className="ctrl-btn" onClick={onPrev} title="Previous (←)">← Prev</button>
          <button className="ctrl-btn ctrl-btn-random" onClick={onRandom} title="Random (R)">⟳ Random</button>
          <button className="ctrl-btn" onClick={onNext} title="Next (→)">Next →</button>
        </div>
      </div>

      <div className="playlist-section">
        <h3 className="section-title">Auto-Advance</h3>
        <div className="interval-buttons">
          {INTERVALS.map(({ label, ms }) => (
            <button
              key={ms}
              className={`interval-btn ${interval === ms ? 'active' : ''}`}
              onClick={() => onIntervalChange(ms)}
            >
              {label}
            </button>
          ))}
        </div>
        {interval > 0 && (
          <button
            className={`hold-btn ${isHeld ? 'active' : ''}`}
            onClick={onToggleHold}
            title="Hold (H)"
          >
            {isHeld ? '⏸ Held' : '▶ Running'}
          </button>
        )}
      </div>

      <div className="playlist-section playlist-shortcuts">
        <h3 className="section-title">Keyboard Shortcuts</h3>
        <div className="shortcut-list">
          <div className="shortcut-row"><kbd>←</kbd><span>Previous preset</span></div>
          <div className="shortcut-row"><kbd>→</kbd><span>Next preset</span></div>
          <div className="shortcut-row"><kbd>R</kbd><span>Random preset</span></div>
          <div className="shortcut-row"><kbd>H</kbd><span>Hold / resume timer</span></div>
          <div className="shortcut-row"><kbd>Space</kbd><span>Toggle menu</span></div>
        </div>
      </div>
    </div>
  );
}
