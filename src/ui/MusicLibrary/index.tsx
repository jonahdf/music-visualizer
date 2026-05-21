import type { SampleTrack } from '../../types';

interface Props {
  tracks: SampleTrack[];
  currentTrackId: string | null;
  loadingTrackId: string | null;
  onSelectTrack: (track: SampleTrack) => void;
}

export default function MusicLibrary({ tracks, currentTrackId, loadingTrackId, onSelectTrack }: Props) {
  return (
    <div className="music-library">
      <div className="library-header">
        <span className="library-title">Sample Library</span>
        <span className="library-license">CC BY-SA · SoundHelix</span>
      </div>
      <div className="library-tracks">
        {tracks.map(track => {
          const isActive = currentTrackId === track.id;
          const isLoading = loadingTrackId === track.id;
          return (
            <button
              key={track.id}
              className={`library-track${isActive ? ' active' : ''}`}
              onClick={() => onSelectTrack(track)}
              disabled={isLoading}
            >
              <div className="track-icon">
                {isLoading ? '⏳' : isActive ? '▶' : '♪'}
              </div>
              <div className="track-info">
                <span className="track-title">{track.title}</span>
                <span className="track-artist">{track.artist}</span>
              </div>
              <span className="track-genre">{track.genre}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
