interface Props {
  visible: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: '← →', action: 'Prev / Next' },
  { key: 'R', action: 'Random' },
  { key: 'Space', action: 'Random' },
  { key: 'L', action: 'Favorite' },
  { key: 'F', action: 'Fullscreen' },
  { key: 'M', action: 'Mute' },
  { key: 'H', action: 'Hold timer' },
  { key: 'A', action: 'Cycle timer' },
  { key: '1–4', action: 'Quality' },
  { key: 'P', action: 'Menu' },
  { key: '?', action: 'This guide' },
  { key: 'Esc', action: 'Close' },
] as const;

export default function KeyGuide({ visible, onClose }: Props) {
  return (
    <div className={`key-guide${!visible ? ' key-guide-hidden' : ''}`}>
      <div className="key-guide-header">
        <span className="key-guide-title">Keyboard Shortcuts</span>
        <button className="key-guide-close" onClick={onClose}>✕</button>
      </div>
      <div className="key-guide-grid">
        {SHORTCUTS.map(({ key, action }) => (
          <div key={key} className="key-guide-row">
            <kbd>{key}</kbd>
            <span>{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
