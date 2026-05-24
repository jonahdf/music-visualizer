import type { AudioSourceType, QualityLevel } from '../../types';
import type { PresetEntry } from '../../presets/usePresets';

function fmtInterval(ms: number): string {
  if (ms < 60000) return `${ms / 1000}s`;
  return `${ms / 60000}m`;
}

interface Props {
  visible: boolean;
  initialized: boolean;
  activePreset: PresetEntry | null;
  activePresetId: string;
  activeSource: AudioSourceType | null;
  quality: QualityLevel;
  fps: number;
  isMuted: boolean;
  isHeld: boolean;
  isFullscreen: boolean;
  interval: number;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  isExcluded: (id: string) => boolean;
  onToggleExclude: (id: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onRandom: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onToggleHold: () => void;
  onOpenMenu: () => void;
  onToggleKeyGuide: () => void;
  onOpenChangelog: () => void;
}

export default function BottomBar({
  visible,
  initialized,
  activePreset,
  activePresetId,
  activeSource,
  quality,
  fps,
  isMuted,
  isHeld,
  isFullscreen,
  interval,
  isFavorite,
  onToggleFavorite,
  isExcluded,
  onToggleExclude,
  onPrev,
  onNext,
  onRandom,
  onToggleMute,
  onToggleFullscreen,
  onToggleHold,
  onOpenMenu,
  onToggleKeyGuide,
  onOpenChangelog,
}: Props) {
  return (
    <div className={`bottom-bar${!visible ? ' bar-hidden' : ''}`}>
      <div className="bar-left">
        <button className="bar-btn" onClick={onOpenMenu} title="Menu (P)">☰</button>
      </div>

      <div className="bar-center">
        {initialized ? (
          <>
            <button className="bar-btn" onClick={onPrev} title="Previous preset (←)">◀</button>
            <div className="bar-preset">
              <span className="bar-preset-name" title={activePreset?.name}>{activePreset?.name ?? '—'}</span>
              {activePreset && (
                <>
                  <button
                    className={`bar-fav${isFavorite(activePresetId) ? ' active' : ''}`}
                    onClick={() => onToggleFavorite(activePresetId)}
                    title="Favorite (L)"
                  >
                    {isFavorite(activePresetId) ? '♥' : '♡'}
                  </button>
                  <button
                    className={`bar-block${isExcluded(activePresetId) ? ' active' : ''}`}
                    onClick={() => onToggleExclude(activePresetId)}
                    title={isExcluded(activePresetId) ? 'Unblock preset' : 'Block preset from auto-advance'}
                  >
                    ⊘
                  </button>
                </>
              )}
            </div>
            <button className="bar-btn" onClick={onNext} title="Next preset (→)">▶</button>
            <button className="bar-btn bar-random" onClick={onRandom} title="Random preset (R / Space)">🎲</button>
            {interval > 0 && (
              <button
                className={`bar-auto${isHeld ? ' bar-auto-held' : ''}`}
                onClick={onToggleHold}
                title={isHeld ? 'Resume auto-advance (H)' : 'Pause auto-advance (H) — A to cycle interval'}
              >
                {isHeld ? `⏸ HELD` : `↻ ${fmtInterval(interval)}`}
              </button>
            )}
          </>
        ) : (
          <span className="bar-start">Click the canvas or ☰ to begin</span>
        )}
      </div>

      <div className="bar-right">
        {activeSource && <span className="bar-pill">{activeSource}</span>}
        <span className="bar-pill">{quality}</span>
        {initialized && <span className="bar-pill bar-fps">{fps} fps</span>}
        {initialized && activeSource && (
          <button
            className={`bar-btn${isMuted ? ' bar-active' : ''}`}
            onClick={onToggleMute}
            title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        )}
        <button
          className={`bar-btn${isFullscreen ? ' bar-active' : ''}`}
          onClick={onToggleFullscreen}
          title="Fullscreen (F)"
        >
          {isFullscreen ? '⤡' : '⛶'}
        </button>
        <button
          className="bar-btn"
          onClick={onToggleKeyGuide}
          title="Keyboard shortcuts (?)"
        >
          ?
        </button>
        <button
          className="bar-btn bar-changelog"
          onClick={onOpenChangelog}
          title="What's New"
        >
          ✦
        </button>
      </div>
    </div>
  );
}

