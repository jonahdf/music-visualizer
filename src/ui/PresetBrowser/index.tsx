import { useRef, useState } from 'react';
import type { PresetEntry } from '../../presets/usePresets';

interface Props {
  presets: PresetEntry[];
  loading: boolean;
  activeId: string;
  onSelect: (preset: PresetEntry) => void;
  onUpload: (file: File) => void;
  onRemove: (id: string) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  isExcluded: (id: string) => boolean;
  onToggleExclude: (id: string) => void;
}

export default function PresetBrowser({
  presets,
  loading,
  activeId,
  onSelect,
  onUpload,
  onRemove,
  isFavorite,
  onToggleFavorite,
  isExcluded,
  onToggleExclude,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');

  const filtered = presets.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(f => onUpload(f));
    }
    e.target.value = '';
  };

  return (
    <div className="preset-browser">
      <div className="preset-browser-toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Search presets…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          className="upload-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Upload .milk or .json preset"
        >
          + Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".milk,.json"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {loading ? (
        <div className="preset-loading">Loading presets…</div>
      ) : (
        <div className="preset-list">
          {filtered.map(preset => (
            <div
              key={preset.id}
              className={`preset-item ${preset.id === activeId ? 'active' : ''} ${isExcluded(preset.id) ? 'excluded' : ''}`}
              onClick={() => onSelect(preset)}
            >
              <span className="preset-name">{preset.name}</span>
              <div className="preset-badges">
                {preset.source !== 'builtin' && (
                  <span className="badge badge-user">{preset.source}</span>
                )}
                <button
                  className={`favorite-btn ${isFavorite(preset.id) ? 'active' : ''}`}
                  onClick={e => { e.stopPropagation(); onToggleFavorite(preset.id); }}
                  title={isFavorite(preset.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFavorite(preset.id) ? '♥' : '♡'}
                </button>
                <button
                  className={`exclude-btn ${isExcluded(preset.id) ? 'active' : ''}`}
                  onClick={e => { e.stopPropagation(); onToggleExclude(preset.id); }}
                  title={isExcluded(preset.id) ? 'Remove from excluded' : 'Exclude from auto-advance'}
                >
                  ⊘
                </button>
                {preset.source !== 'builtin' && (
                  <button
                    className="remove-btn"
                    onClick={e => { e.stopPropagation(); onRemove(preset.id); }}
                    title="Remove preset"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="preset-empty">No presets match "{search}"</div>
          )}
        </div>
      )}
    </div>
  );
}
