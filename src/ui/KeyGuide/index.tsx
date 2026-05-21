interface Props {
  visible: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: '← →', action: 'Prev / Next preset' },
  { key: 'R', action: 'Random preset' },
  { key: 'Space', action: 'Random preset' },
  { key: 'L', action: 'Favorite preset' },
  { key: 'F', action: 'Fullscreen' },
  { key: 'M', action: 'Mute / Unmute' },
  { key: 'H', action: 'Hold auto-advance' },
  { key: 'A', action: 'Cycle auto-advance' },
  { key: '1 – 4', action: 'Quality level' },
  { key: 'P', action: 'Open / close menu' },
  { key: '?', action: 'Toggle this guide' },
  { key: 'Esc', action: 'Close menu / guide' },
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
