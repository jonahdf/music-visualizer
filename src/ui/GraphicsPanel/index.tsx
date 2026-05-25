import { useState } from 'react';
import { GRAPHICS_PRESETS, SETTINGS_DESCRIPTIONS } from '../../types';
import type { QualityLevel, GraphicsSettings } from '../../types';

type SubTab = 'performance' | 'visual';

interface Props {
  quality: QualityLevel;
  fps: number;
  blendTime: number;
  settings: GraphicsSettings;
  onQualityChange: (q: QualityLevel) => void;
  onSettingsChange: (s: Partial<GraphicsSettings>) => void;
  onBlendTimeChange: (t: number) => void;
}

const LEVELS: QualityLevel[] = ['low', 'medium', 'high', 'ultra'];

const BLEND_OPTIONS = [
  { label: 'Instant', value: 0 },
  { label: '1s', value: 1 },
  { label: '2.7s', value: 2.7 },
  { label: '5s', value: 5 },
  { label: '10s', value: 10 },
];

interface SettingSliderProps {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  isRecommended?: boolean;
}

function SettingSlider({ label, description, value, min, max, step, onChange, isRecommended }: SettingSliderProps) {
  const [showDesc, setShowDesc] = useState(false);

  return (
    <div className="setting-row">
      <div className="setting-header">
        <label className="setting-label">
          {label}
          {isRecommended && <span className="badge badge-recommended">DEFAULT</span>}
        </label>
        <button
          className="desc-toggle"
          onClick={() => setShowDesc(!showDesc)}
          title="Show description"
        >
          ?
        </button>
      </div>
      {showDesc && <p className="setting-description">{description}</p>}
      <div className="setting-control">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="slider"
        />
        <span className="setting-value">{value.toFixed(value < 1 ? 2 : 0)}</span>
      </div>
    </div>
  );
}

export default function GraphicsPanel({
  quality,
  fps,
  blendTime,
  settings,
  onQualityChange,
  onSettingsChange,
  onBlendTimeChange,
}: Props) {
  const recommendedSettings = GRAPHICS_PRESETS['medium'];
  const [subTab, setSubTab] = useState<SubTab>('performance');

  return (
    <div className="graphics-panel">
      <div className="graphics-subtabs">
        <button className={`graphics-subtab ${subTab === 'performance' ? 'active' : ''}`} onClick={() => setSubTab('performance')}>Performance</button>
        <button className={`graphics-subtab ${subTab === 'visual' ? 'active' : ''}`} onClick={() => setSubTab('visual')}>Visual</button>
      </div>

      {subTab === 'performance' && (
        <>
          <div className="fps-display">
            <span className="fps-value">{fps}</span>
            <span className="fps-label">FPS</span>
          </div>

          <div className="presets-section">
            <h3 className="section-title">Presets</h3>
            <p className="preset-subtitle">Quick settings for common use cases</p>
            <div className="preset-buttons">
              {LEVELS.map(level => (
                <button
                  key={level}
                  className={`preset-btn ${quality === level ? 'active' : ''} ${
                    level === 'medium' ? 'recommended' : ''
                  }`}
                  onClick={() => {
                    onQualityChange(level);
                    onSettingsChange(GRAPHICS_PRESETS[level]);
                  }}
                  title={level === 'medium' ? 'Recommended for most systems' : ''}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                  {level === 'medium' && <span className="badge badge-small">Recommended</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-divider" />

          <div className="individual-settings">
            <h3 className="section-title">Individual Settings</h3>
            <p className="settings-subtitle">Fine-tune each parameter</p>

            <div className="settings-group">
              <h4 className="group-title">Rendering</h4>
              <SettingSlider
                label="Resolution Scale"
                description={SETTINGS_DESCRIPTIONS.resolutionScale}
                value={settings.resolutionScale}
                min={0.25}
                max={1}
                step={0.05}
                onChange={v => onSettingsChange({ resolutionScale: v })}
                isRecommended={settings.resolutionScale === recommendedSettings.resolutionScale}
              />
              <SettingSlider
                label="FPS Cap"
                description={SETTINGS_DESCRIPTIONS.fpsCap}
                value={settings.fpsCap || 240}
                min={0}
                max={240}
                step={10}
                onChange={v => onSettingsChange({ fpsCap: v === 0 ? 0 : v })}
                isRecommended={settings.fpsCap === recommendedSettings.fpsCap}
              />
            </div>

            <div className="settings-group">
              <h4 className="group-title">Audio Analysis</h4>
              <SettingSlider
                label="FFT Size"
                description={SETTINGS_DESCRIPTIONS.fftSize}
                value={settings.fftSize}
                min={256}
                max={4096}
                step={256}
                onChange={v => onSettingsChange({ fftSize: v })}
                isRecommended={settings.fftSize === recommendedSettings.fftSize}
              />
              <SettingSlider
                label="FFT Smoothing"
                description={SETTINGS_DESCRIPTIONS.fftSmoothing}
                value={settings.fftSmoothing}
                min={0.7}
                max={0.95}
                step={0.01}
                onChange={v => onSettingsChange({ fftSmoothing: v })}
                isRecommended={settings.fftSmoothing === recommendedSettings.fftSmoothing}
              />
            </div>

            <div className="settings-group">
              <h4 className="group-title">Mesh</h4>
              <SettingSlider
                label="Mesh Width"
                description={SETTINGS_DESCRIPTIONS.meshWidth}
                value={settings.meshWidth}
                min={12}
                max={64}
                step={2}
                onChange={v => onSettingsChange({ meshWidth: v })}
                isRecommended={settings.meshWidth === recommendedSettings.meshWidth}
              />
              <SettingSlider
                label="Mesh Height"
                description={SETTINGS_DESCRIPTIONS.meshHeight}
                value={settings.meshHeight}
                min={9}
                max={48}
                step={2}
                onChange={v => onSettingsChange({ meshHeight: v })}
                isRecommended={settings.meshHeight === recommendedSettings.meshHeight}
              />
            </div>
          </div>
        </>
      )}

      {subTab === 'visual' && (
        <>
          <div className="blend-section">
            <h3 className="section-title">Preset Transition</h3>
            <div className="blend-buttons">
              {BLEND_OPTIONS.map(({ label, value }) => (
                <button
                  key={value}
                  className={`blend-btn ${blendTime === value ? 'active' : ''}`}
                  onClick={() => onBlendTimeChange(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
