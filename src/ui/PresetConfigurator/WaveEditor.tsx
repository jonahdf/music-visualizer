import { useState } from 'react';
import type { WaveState } from './waveTypes';

interface Props {
  index: number;
  wave: WaveState;
  onChange: (wave: WaveState) => void;
}

function serializeWaveBaseVals(baseVals: Record<string, number>): string {
  return Object.entries(baseVals)
    .filter(([k]) => k !== 'enabled')
    .map(([k, v]) => {
      const formatted = Number.isInteger(v) ? String(v) : v.toFixed(4);
      return `${k} = ${formatted};`;
    })
    .join('\n');
}

function parseWaveBaseVals(text: string, existing: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = { ...existing };
  for (const line of text.split('\n')) {
    const m = line.trim().match(/^(\w+)\s*=\s*(-?[\d.]+)\s*;?\s*$/);
    if (!m) continue;
    if (m[1] !== 'enabled') result[m[1]] = parseFloat(m[2]);
  }
  return result;
}

export default function WaveEditor({ index, wave, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [baseValsText, setBaseValsText] = useState(() => serializeWaveBaseVals(wave.baseVals));

  const toggleEnabled = () => {
    const enabled = !wave.enabled;
    onChange({ ...wave, enabled });
    if (enabled && !expanded) setExpanded(true);
  };

  const handleBaseValsChange = (text: string) => {
    setBaseValsText(text);
    const newBaseVals = parseWaveBaseVals(text, wave.baseVals);
    onChange({ ...wave, baseVals: newBaseVals });
  };

  const handleEqChange = (field: 'init_eqs_str' | 'frame_eqs_str' | 'per_point_eqs_str', value: string) => {
    onChange({ ...wave, [field]: value });
  };

  return (
    <div className="cfg-wave-section">
      <div className="cfg-wave-header">
        <button
          className={`cfg-wave-toggle${wave.enabled ? ' enabled' : ''}`}
          onClick={toggleEnabled}
          title={wave.enabled ? 'Disable wave' : 'Enable wave'}
        >
          {wave.enabled ? '●' : '○'}
        </button>
        <span className="cfg-wave-title">Wave {index}</span>
        <button
          className="cfg-wave-expand"
          onClick={() => setExpanded(v => !v)}
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {expanded && (
        <div className="cfg-wave-body">
          <div className="cfg-code-field">
            <div className="cfg-code-label">
              <span>Base Values</span>
              <button
                className="cfg-code-clear"
                onClick={() => {
                  const reset = serializeWaveBaseVals(wave.baseVals);
                  setBaseValsText(reset);
                }}
                title="Reset"
              >↺</button>
            </div>
            <p className="cfg-code-desc">
              r, g, b, a (color), x, y (position 0–1), mode, scaling, smoothing, sep, dots, thick, additive, spectrum, usedots, mystery
            </p>
            <textarea
              className="cfg-code-editor"
              value={baseValsText}
              onChange={e => handleBaseValsChange(e.target.value)}
              spellCheck={false}
              rows={6}
            />
          </div>

          <div className="cfg-code-field">
            <div className="cfg-code-label">
              <span>Init Equations</span>
              <button className="cfg-code-clear" onClick={() => handleEqChange('init_eqs_str', '')} title="Clear">✕</button>
            </div>
            <textarea
              className="cfg-code-editor"
              value={wave.init_eqs_str}
              onChange={e => handleEqChange('init_eqs_str', e.target.value)}
              spellCheck={false}
              placeholder="Runs once on preset load."
              rows={2}
            />
          </div>

          <div className="cfg-code-field">
            <div className="cfg-code-label">
              <span>Per-Frame Equations</span>
              <button className="cfg-code-clear" onClick={() => handleEqChange('frame_eqs_str', '')} title="Clear">✕</button>
            </div>
            <textarea
              className="cfg-code-editor"
              value={wave.frame_eqs_str}
              onChange={e => handleEqChange('frame_eqs_str', e.target.value)}
              spellCheck={false}
              placeholder="a.r = 0.5 + 0.5*a.bass_att;"
              rows={3}
            />
          </div>

          <div className="cfg-code-field" style={{ marginBottom: 0 }}>
            <div className="cfg-code-label">
              <span>Per-Point Equations</span>
              <button className="cfg-code-clear" onClick={() => handleEqChange('per_point_eqs_str', '')} title="Clear">✕</button>
            </div>
            <p className="cfg-code-desc">Runs per sample point. Variables: x, y, r, g, b, a, t1–t8.</p>
            <textarea
              className="cfg-code-editor"
              value={wave.per_point_eqs_str}
              onChange={e => handleEqChange('per_point_eqs_str', e.target.value)}
              spellCheck={false}
              placeholder="x = x + 0.1*a.bass_att;"
              rows={3}
            />
          </div>
        </div>
      )}
    </div>
  );
}
