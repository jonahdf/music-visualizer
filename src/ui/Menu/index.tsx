import { useState } from 'react';
import type { PresetEntry } from '../../presets/usePresets';
import type { AudioSourceType, QualityLevel, GraphicsSettings } from '../../types';
import PresetBrowser from '../PresetBrowser';
import AudioSourcePicker from '../AudioSourcePicker';
import GraphicsPanel from '../GraphicsPanel';
import PlaylistPanel from '../PlaylistPanel';

type Tab = 'presets' | 'playlist' | 'source' | 'graphics';

interface MenuProps {
  presets: PresetEntry[];
  loadingPresets: boolean;
  activePresetId: string;
  activePresetName: string;
  activeSource: AudioSourceType | null;
  quality: QualityLevel;
  graphicsSettings: GraphicsSettings;
  fps: number;
  blendTime: number;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  isExcluded: (id: string) => boolean;
  onToggleExclude: (id: string) => void;
  favoritePresets: PresetEntry[];
  excludedCount: number;
  playlistMode: 'all' | 'favorites';
  onPlaylistModeChange: (mode: 'all' | 'favorites') => void;
  interval: number;
  onIntervalChange: (ms: number) => void;
  isHeld: boolean;
  onToggleHold: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRandom: () => void;
  onSelectPreset: (preset: PresetEntry) => void;
  onUploadPreset: (file: File) => void;
  onRemovePreset: (id: string) => void;
  onSelectSource: (type: AudioSourceType) => void;
  onSelectFile: (file: File) => void;
  onQualityChange: (q: QualityLevel) => void;
  onSettingsChange: (s: Partial<GraphicsSettings>) => void;
  onBlendTimeChange: (t: number) => void;
  onClose: () => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'presets', label: 'Presets' },
  { id: 'playlist', label: 'Playlist' },
  { id: 'source', label: 'Source' },
  { id: 'graphics', label: 'Graphics' },
];

export default function Menu({
  presets,
  loadingPresets,
  activePresetId,
  activePresetName,
  activeSource,
  quality,
  graphicsSettings,
  fps,
  blendTime,
  isFavorite,
  onToggleFavorite,
  isExcluded,
  onToggleExclude,
  favoritePresets,
  excludedCount,
  playlistMode,
  onPlaylistModeChange,
  interval,
  onIntervalChange,
  isHeld,
  onToggleHold,
  onPrev,
  onNext,
  onRandom,
  onSelectPreset,
  onUploadPreset,
  onRemovePreset,
  onSelectSource,
  onSelectFile,
  onQualityChange,
  onSettingsChange,
  onBlendTimeChange,
  onClose,
}: MenuProps) {
  const [tab, setTab] = useState<Tab>('presets');

  return (
    <div className="menu-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="menu-panel">
        <div className="menu-header">
          <div className="menu-tabs">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`menu-tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="menu-content">
          {tab === 'presets' && (
            <PresetBrowser
              presets={presets}
              loading={loadingPresets}
              activeId={activePresetId}
              onSelect={onSelectPreset}
              onUpload={onUploadPreset}
              onRemove={onRemovePreset}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
              isExcluded={isExcluded}
              onToggleExclude={onToggleExclude}
            />
          )}
          {tab === 'playlist' && (
            <PlaylistPanel
              activePresetName={activePresetName}
              activePresetId={activePresetId}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
              playlistMode={playlistMode}
              onPlaylistModeChange={onPlaylistModeChange}
              favoritePresets={favoritePresets}
              totalCount={presets.length}
              excludedCount={excludedCount}
              interval={interval}
              onIntervalChange={onIntervalChange}
              isHeld={isHeld}
              onToggleHold={onToggleHold}
              onPrev={onPrev}
              onNext={onNext}
              onRandom={onRandom}
              onSelectPreset={onSelectPreset}
            />
          )}
          {tab === 'source' && (
            <AudioSourcePicker
              activeSource={activeSource}
              onSelectSource={onSelectSource}
              onSelectFile={onSelectFile}
              tracks={[]}
              currentTrackId={null}
              loadingTrackId={null}
              onSelectTrack={() => {}}
            />
          )}
          {tab === 'graphics' && (
            <GraphicsPanel
              quality={quality}
              fps={fps}
              settings={graphicsSettings}
              blendTime={blendTime}
              onQualityChange={onQualityChange}
              onSettingsChange={onSettingsChange}
              onBlendTimeChange={onBlendTimeChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
