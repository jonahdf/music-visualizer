import type { PresetEntry } from '../../presets/usePresets';
import type { AudioSourceType, QualityLevel, GraphicsSettings } from '../../types';
import PresetBrowser from '../PresetBrowser';
import AudioSourcePicker from '../AudioSourcePicker';
import GraphicsPanel from '../GraphicsPanel';
import PresetConfigurator from '../PresetConfigurator';

export type DrawerTab = 'presets' | 'audio' | 'settings' | 'create';

const INTERVAL_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '15s', value: 15000 },
  { label: '30s', value: 30000 },
  { label: '1m', value: 60000 },
  { label: '5m', value: 300000 },
];

interface Props {
  open: boolean;
  tab: DrawerTab;
  onTabChange: (tab: DrawerTab) => void;
  onClose: () => void;
  presets: PresetEntry[];
  loadingPresets: boolean;
  activePresetId: string;
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
  onSelectPreset: (preset: PresetEntry) => void;
  onUploadPreset: (file: File) => void;
  onRemovePreset: (id: string) => void;
  onSelectSource: (type: AudioSourceType) => void;
  onSelectFile: (file: File) => void;
  onQualityChange: (q: QualityLevel) => void;
  onSettingsChange: (s: Partial<GraphicsSettings>) => void;
  onBlendTimeChange: (t: number) => void;
  activePresetData: object | null;
  onLivePreviewChange: (data: object) => void;
  onSaveCustomPreset: (name: string, data: object) => Promise<void>;
}

export default function Drawer({
  open,
  tab,
  onTabChange,
  onClose,
  presets,
  loadingPresets,
  activePresetId,
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
  onSelectPreset,
  onUploadPreset,
  onRemovePreset,
  onSelectSource,
  onSelectFile,
  onQualityChange,
  onSettingsChange,
  onBlendTimeChange,
  activePresetData,
  onLivePreviewChange,
  onSaveCustomPreset,
}: Props) {
  return (
    <div className={`drawer${open ? ' drawer-open' : ''}`}>
      <div className="drawer-header">
        <div className="drawer-tabs">
          <button
            className={`drawer-tab${tab === 'presets' ? ' active' : ''}`}
            onClick={() => onTabChange('presets')}
          >
            Presets
          </button>
          <button
            className={`drawer-tab${tab === 'audio' ? ' active' : ''}`}
            onClick={() => onTabChange('audio')}
          >
            Audio
          </button>
          <button
            className={`drawer-tab${tab === 'settings' ? ' active' : ''}`}
            onClick={() => onTabChange('settings')}
          >
            Settings
          </button>
          <button
            className={`drawer-tab${tab === 'create' ? ' active' : ''}`}
            onClick={() => onTabChange('create')}
          >
            Create
          </button>
        </div>
        <button className="drawer-close" onClick={onClose}>✕</button>
      </div>

      <div className={`drawer-body${tab === 'create' ? ' drawer-body-fill' : ''}`}>
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

        {tab === 'audio' && (
          <AudioSourcePicker
            activeSource={activeSource}
            onSelectSource={onSelectSource}
            onSelectFile={onSelectFile}
          />
        )}

        {tab === 'settings' && (
          <div className="drawer-settings">
            <div className="drawer-section">
              <div className="section-title">Auto-Advance</div>
              <div className="playlist-mode-toggle">
                <button
                  className={`mode-btn${playlistMode === 'all' ? ' active' : ''}`}
                  onClick={() => onPlaylistModeChange('all')}
                >
                  All Presets
                  <span className="mode-count">{presets.length - excludedCount}</span>
                </button>
                <button
                  className={`mode-btn${playlistMode === 'favorites' ? ' active' : ''}`}
                  onClick={() => onPlaylistModeChange('favorites')}
                >
                  Favorites
                  <span className="mode-count">{favoritePresets.length}</span>
                </button>
              </div>
              <div className="interval-buttons">
                {INTERVAL_OPTIONS.map(({ label, value }) => (
                  <button
                    key={value}
                    className={`interval-btn${interval === value ? ' active' : ''}`}
                    onClick={() => onIntervalChange(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {interval > 0 && (
                <button
                  className={`hold-btn${isHeld ? ' active' : ''}`}
                  onClick={onToggleHold}
                >
                  {isHeld ? '⏸ Held — click to resume' : '⏵ Running — click to hold'}
                </button>
              )}
            </div>

            <div className="drawer-divider" />

            <GraphicsPanel
              quality={quality}
              settings={graphicsSettings}
              fps={fps}
              blendTime={blendTime}
              onQualityChange={onQualityChange}
              onSettingsChange={onSettingsChange}
              onBlendTimeChange={onBlendTimeChange}
            />
          </div>
        )}

        {tab === 'create' && (
          <PresetConfigurator
            activePresetData={activePresetData}
            onLivePreviewChange={onLivePreviewChange}
            onSaveCustomPreset={onSaveCustomPreset}
          />
        )}
      </div>
    </div>
  );
}
