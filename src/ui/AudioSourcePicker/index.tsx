import { useRef } from 'react';
import type { AudioSourceType } from '../../types';
import { supportsTabAudioCapture } from '../../audio/browserSupport';

interface Props {
  activeSource: AudioSourceType | null;
  onSelectSource: (type: AudioSourceType) => void;
  onSelectFile: (file: File) => void;
}

const tabSupported = supportsTabAudioCapture();

const SOURCES: { type: AudioSourceType; label: string; icon: string; desc: string }[] = [
  {
    type: 'mic',
    label: 'Microphone',
    icon: '🎙️',
    desc: 'Visualize audio from your microphone. Works everywhere.',
  },
  {
    type: 'tab',
    label: 'Tab Audio',
    icon: '🌐',
    desc: tabSupported
      ? 'Capture audio from any browser tab or window (Spotify, YouTube, etc.). Open Spotify or YouTube in a separate tab first, select it from the browser picker, and check "Share tab audio". Then mute the source tab — audio will play here in sync with the visualization.'
      : 'Not supported in Firefox. Tab audio capture requires Chrome or Edge. Use Microphone or Audio File instead.',
  },
  {
    type: 'file',
    label: 'Audio File',
    icon: '📁',
    desc: 'Load a local audio file (MP3, WAV, FLAC, etc.).',
  },
];

export default function AudioSourcePicker({ activeSource, onSelectSource, onSelectFile }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSourceClick = (type: AudioSourceType) => {
    if (type === 'file') {
      fileInputRef.current?.click();
    } else {
      onSelectSource(type);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSelectFile(file);
    e.target.value = '';
  };

  return (
    <div className="source-picker">
      <p className="source-hint">
        Choose how audio is routed to the visualizer.
        {!tabSupported && ' Tab audio capture is not available in Firefox.'}
      </p>
      <div className="source-grid">
        {SOURCES.map(s => {
          const disabled = s.type === 'tab' && !tabSupported;
          return (
            <button
              key={s.type}
              className={`source-card ${activeSource === s.type ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={() => !disabled && handleSourceClick(s.type)}
              disabled={disabled}
            >
              <div className="source-card-header">
                <span className="source-icon">{s.icon}</span>
                <span className="source-label">{s.label}</span>
                {disabled && <span className="source-badge-unsupported">Firefox</span>}
              </div>
              <span className="source-desc">{s.desc}</span>
            </button>
          );
        })}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}
