import { useEffect, useRef, useState } from 'react';
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
  onSeek?: (time: number) => void;
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
  onSeek,
}: Props) {
  const progressRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

  const getFraction = (clientX: number) => {
    const bar = progressRef.current;
    if (!bar) return null;
    const rect = bar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const fraction = getFraction(e.clientX);
      if (fraction === null) return;
      setDragProgress(fraction * 100);
      if (onSeek && duration > 0) onSeek(fraction * duration);
    };
    const onUp = () => setDragging(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  // getFraction reads a stable ref, safe to omit
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, onSeek, duration]);

  if (!track) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayProgress = dragging ? dragProgress : progress;
  const seekable = !!onSeek && duration > 0;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!seekable) return;
    e.preventDefault();
    const fraction = getFraction(e.clientX);
    if (fraction === null) return;
    setDragging(true);
    setDragProgress(fraction * 100);
    onSeek!(fraction * duration);
  };

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
        <div
          className={`hud-progress-bar${seekable ? ' hud-progress-bar--seekable' : ''}${dragging ? ' dragging' : ''}`}
          ref={progressRef}
          onMouseDown={handleMouseDown}
        >
          <div className="hud-progress-track">
            <div
              className="hud-progress-fill"
              style={{ width: `${displayProgress}%`, transition: dragging ? 'none' : undefined }}
            />
          </div>
          {seekable && (
            <div className="hud-progress-thumb" style={{ left: `${displayProgress}%` }} />
          )}
        </div>
        <span className="hud-time">{duration > 0 ? fmtTime(duration) : '--:--'}</span>
      </div>
    </div>
  );
}
