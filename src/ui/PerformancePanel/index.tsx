import { GRAPHICS_PRESETS } from '../../types';
import type { QualityLevel } from '../../types';

interface Props {
  quality: QualityLevel;
  fps: number;
  onQualityChange: (q: QualityLevel) => void;
}

const LEVELS: QualityLevel[] = ['low', 'medium', 'high', 'ultra'];

export default function PerformancePanel({ quality, fps, onQualityChange }: Props) {
  const settings = GRAPHICS_PRESETS[quality];

  return (
    <div className="perf-panel">
      <div className="fps-display">
        <span className="fps-value">{fps}</span>
        <span className="fps-label">FPS</span>
      </div>

      <div className="quality-section">
        <h3 className="section-title">Quality</h3>
        <div className="quality-buttons">
          {LEVELS.map(level => (
            <button
              key={level}
              className={`quality-btn ${quality === level ? 'active' : ''}`}
              onClick={() => onQualityChange(level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="quality-details">
        <h3 className="section-title">Current Settings</h3>
        <table className="settings-table">
          <tbody>
            <tr><td>Resolution scale</td><td>{settings.resolutionScale * 100}%</td></tr>
            <tr><td>FFT size</td><td>{settings.fftSize}</td></tr>
            <tr><td>Mesh size</td><td>{settings.meshWidth}×{settings.meshHeight}</td></tr>
            <tr><td>FPS cap</td><td>{settings.fpsCap === 0 ? 'Unlimited' : `${settings.fpsCap}`}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="quality-tips">
        <p>Lower quality settings reduce GPU load on weaker hardware. <strong>Low</strong> is recommended for laptops without a dedicated GPU.</p>
      </div>
    </div>
  );
}
