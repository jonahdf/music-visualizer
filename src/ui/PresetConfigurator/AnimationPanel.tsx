import { useState } from 'react';
import type { AnimParamConfig, ModulationMap, ParamModulation, AudioBand } from './animationTypes';
import { ANIM_PARAM_CONFIGS, DEFAULT_MODULATION } from './animationTypes';

const BAND_LABELS: { id: AudioBand; label: string }[] = [
  { id: 'none', label: 'Off' },
  { id: 'bass', label: 'Bass' },
  { id: 'mid', label: 'Mid' },
  { id: 'treb', label: 'Treb' },
];

interface AnimParamRowProps {
  config: AnimParamConfig;
  mod: ParamModulation;
  onChange: (key: string, mod: ParamModulation) => void;
}

function AnimParamRow({ config, mod, onChange }: AnimParamRowProps) {
  const [expanded, setExpanded] = useState(false);
  const isActive = mod.audioBand !== 'none' || mod.oscAmp !== 0;

  const set = (updates: Partial<ParamModulation>) =>
    onChange(config.key, { ...mod, ...updates });

  return (
    <div className={`cfg-anim-row${isActive ? ' active' : ''}`}>
      <button
        className="cfg-anim-row-header"
        onClick={() => setExpanded(v => !v)}
      >
        <span className="cfg-anim-row-label">{config.label}</span>
        <span className="cfg-anim-row-right">
          {isActive && <span className="cfg-anim-dot" />}
          <span className="cfg-anim-chevron">{expanded ? '▲' : '▼'}</span>
        </span>
      </button>

      {expanded && (
        <div className="cfg-anim-controls">
          {/* Audio reactivity */}
          <div className="cfg-anim-section-label">Audio Reactivity</div>
          <div className="cfg-band-selector">
            {BAND_LABELS.map(b => (
              <button
                key={b.id}
                className={`cfg-band-btn${mod.audioBand === b.id ? ' active' : ''}`}
                onClick={() => set({ audioBand: b.id, audioAmount: b.id === 'none' ? 0 : mod.audioAmount })}
              >
                {b.label}
              </button>
            ))}
          </div>

          {mod.audioBand !== 'none' && (
            <div className="cfg-param-row">
              <div className="cfg-param-header">
                <label className="cfg-param-label">Amount</label>
                <span className="cfg-param-value">{mod.audioAmount >= 0 ? '+' : ''}{mod.audioAmount.toFixed(3)}</span>
              </div>
              <input
                type="range"
                className="cfg-slider"
                min={-config.audioRange}
                max={config.audioRange}
                step={config.audioRange / 100}
                value={mod.audioAmount}
                onChange={e => set({ audioAmount: Number(e.target.value) })}
              />
            </div>
          )}

          {/* Time oscillation */}
          <div className="cfg-anim-section-label" style={{ marginTop: 10 }}>Time Oscillation</div>
          <div className="cfg-param-row">
            <div className="cfg-param-header">
              <label className="cfg-param-label">Depth</label>
              <span className="cfg-param-value">{mod.oscAmp.toFixed(3)}</span>
            </div>
            <input
              type="range"
              className="cfg-slider"
              min={0}
              max={config.oscAmpMax}
              step={config.oscAmpMax / 100}
              value={mod.oscAmp}
              onChange={e => set({ oscAmp: Number(e.target.value) })}
            />
          </div>

          {mod.oscAmp > 0 && (
            <div className="cfg-param-row">
              <div className="cfg-param-header">
                <label className="cfg-param-label">Period</label>
                <span className="cfg-param-value">{mod.oscPeriod.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                className="cfg-slider"
                min={0.5}
                max={30}
                step={0.5}
                value={mod.oscPeriod}
                onChange={e => set({ oscPeriod: Number(e.target.value) })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface AnimationPanelProps {
  modulations: ModulationMap;
  generatedCode: string;
  animationsEnabled: boolean;
  onModulationChange: (key: string, mod: ParamModulation) => void;
  onClearAll: () => void;
  onToggleAnimations: () => void;
}

export default function AnimationPanel({
  modulations,
  generatedCode,
  animationsEnabled,
  onModulationChange,
  onClearAll,
  onToggleAnimations,
}: AnimationPanelProps) {
  const hasAny = ANIM_PARAM_CONFIGS.some(cfg => {
    const mod = modulations[cfg.key];
    return mod && (mod.audioBand !== 'none' || mod.oscAmp !== 0);
  });

  return (
    <div className="cfg-anim-panel">
      <div className="cfg-anim-header">
        <p className="cfg-anim-intro">
          Make parameters react to music or oscillate over time. The base value (set in Motion tab) is the center point.
        </p>
        <button
          className={`cfg-anim-toggle${animationsEnabled ? '' : ' off'}`}
          onClick={onToggleAnimations}
          title={animationsEnabled ? 'Click to disable all animations (settings are preserved)' : 'Click to re-enable animations'}
        >
          {animationsEnabled ? '⏵ Animations On' : '⏸ Animations Off'}
        </button>
      </div>

      {ANIM_PARAM_CONFIGS.map(cfg => (
        <AnimParamRow
          key={cfg.key}
          config={cfg}
          mod={modulations[cfg.key] ?? { ...DEFAULT_MODULATION }}
          onChange={onModulationChange}
        />
      ))}

      {hasAny && (
        <button className="cfg-anim-clear-btn" onClick={onClearAll}>
          Clear All Animation
        </button>
      )}

      {generatedCode && (
        <div className="cfg-anim-eq-preview-wrap">
          <div className="cfg-anim-eq-label">Generated equations (shown in Code tab → Per-Frame)</div>
          <pre className="cfg-anim-eq-preview">{generatedCode}</pre>
        </div>
      )}
    </div>
  );
}
