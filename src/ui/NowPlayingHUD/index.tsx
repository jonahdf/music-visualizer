import type { SampleTrack } from '../../types';

interface Props {
  track: SampleTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  loading: boolean;
  visible: boolean;
  onPlay: () => void;
  onPause: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

export default function NowPlayingHUD({
  track,
  isPlaying,
  currentTime,
  duration,
  loading,
  visible,
  onPlay,
  onPause,
  onPrev,
  onNext,
}: Props) {
  if (!track) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`now-playing-hud${!visible ? ' hud-hidden' : ''}`}>
      <div className="hud-track-info">
        <span className="hud-note">♪</span>
        <div className="hud-text">
          <span className="hud-title">{track.title}</span>
          <span className="hud-artist">{track.artist}</span>
        </div>
      </div>

      <div className="hud-controls">
        <button className="hud-btn" onClick={onPrev} title="Previous track">⏮</button>
        <button
          className="hud-btn hud-playpause"
          onClick={isPlaying ? onPause : onPlay}
          title={isPlaying ? 'Pause' : 'Play'}
          disabled={loading}
        >
          {loading ? '…' : isPlaying ? '⏸' : '▶'}
        </button>
        <button className="hud-btn" onClick={onNext} title="Next track">⏭</button>
      </div>

      <div className="hud-progress">
        <span className="hud-time">{fmtTime(currentTime)}</span>
        <div className="hud-progress-bar">
          <div className="hud-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="hud-time">{duration > 0 ? fmtTime(duration) : '--:--'}</span>
      </div>
    </div>
  );
}
