import { useState, useCallback } from 'react';
import { PARAMS_BY_GROUP, PARAM_BY_KEY } from './parameterDefs';
import type { ParamDef, ParamGroup } from './parameterDefs';
import { DEFAULT_PRESET } from './defaultPreset';
import { toButterchurnPreset, fromButterchurnPreset } from './presetConvert';
import { buildAIPrompt } from './aiPromptBuilder';
import './PresetConfigurator.css';

interface Props {
  activePresetData: object | null;
  onLivePreviewChange: (data: object) => void;
  onSaveCustomPreset: (name: string, data: object) => Promise<void>;
}

function getNum(preset: Record<string, unknown>, key: string, fallback = 0): number {
  const v = preset[key];
  if (typeof v === 'number') return v;
  if (typeof v === 'string') { const n = parseFloat(v); return isNaN(n) ? fallback : n; }
  return fallback;
}

function getStr(preset: Record<string, unknown>, key: string): string {
  const v = preset[key];
  return typeof v === 'string' ? v : '';
}

function shortLabel(key: string, label: string): string {
  if (key.endsWith('_r')) return 'R';
  if (key.endsWith('_g')) return 'G';
  if (key.endsWith('_b')) return 'B';
  if (key.endsWith('_a')) return 'A';
  if (key.endsWith('_size')) return 'Size';
  return label;
}

const SUB_TABS: { id: ParamGroup; label: string }[] = [
  { id: 'motion', label: 'Motion' },
  { id: 'wave', label: 'Wave' },
  { id: 'color', label: 'Color/FX' },
  { id: 'borders', label: 'Borders' },
  { id: 'code', label: 'Code' },
];

// ── ParamRow ─────────────────────────────────────────────────────────────────

interface ParamRowProps {
  param: ParamDef;
  preset: Record<string, unknown>;
  setParam: (key: string, value: unknown) => void;
  compact?: boolean;
}

function ParamRow({ param, preset, setParam, compact }: ParamRowProps) {
  const [showDesc, setShowDesc] = useState(false);
  if (param.type === 'code') return null;

  const numValue = getNum(preset, param.key, typeof param.default === 'number' ? param.default : 0);

  if (param.type === 'bool') {
    const on = numValue === 1;
    return (
      <div className="cfg-bool-row">
        <button
          className={`cfg-bool-btn${on ? ' active' : ''}`}
          onClick={() => setParam(param.key, on ? 0 : 1)}
        >
          {on ? '● ' : '○ '}{param.label}
        </button>
        <button className="cfg-desc-btn" onClick={() => setShowDesc(v => !v)} title="About">?</button>
        {showDesc && <p className="cfg-param-desc" style={{ width: '100%' }}>{param.description}</p>}
      </div>
    );
  }

  if (param.type === 'enum' && param.options) {
    return (
      <div className={`cfg-param-row${compact ? ' compact' : ''}`}>
        <div className="cfg-param-header">
          <label className="cfg-param-label">{compact ? shortLabel(param.key, param.label) : param.label}</label>
          <button className="cfg-desc-btn" onClick={() => setShowDesc(v => !v)} title="About">?</button>
        </div>
        {showDesc && <p className="cfg-param-desc">{param.description}</p>}
        <select
          className="cfg-select"
          value={numValue}
          onChange={e => setParam(param.key, Number(e.target.value))}
        >
          {param.options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }

  // float or color-channel
  const min = param.min ?? 0;
  const max = param.max ?? 1;
  const step = param.step ?? 0.01;
  const range = max - min;
  const decimals = range >= 100 ? 0 : range >= 1 ? 2 : step < 0.01 ? 3 : 2;
  const displayValue = typeof numValue === 'number' && isFinite(numValue)
    ? numValue.toFixed(decimals)
    : '—';

  return (
    <div className={`cfg-param-row${compact ? ' compact' : ''}`}>
      <div className="cfg-param-header">
        <label className="cfg-param-label">{compact ? shortLabel(param.key, param.label) : param.label}</label>
        <div className="cfg-param-right">
          <span className="cfg-param-value">{displayValue}</span>
          {!compact && (
            <button className="cfg-desc-btn" onClick={() => setShowDesc(v => !v)} title="About">?</button>
          )}
        </div>
      </div>
      {showDesc && <p className="cfg-param-desc">{param.description}</p>}
      <input
        type="range"
        className="cfg-slider"
        min={min}
        max={max}
        step={step}
        value={isFinite(numValue) ? numValue : min}
        onChange={e => setParam(param.key, Number(e.target.value))}
      />
    </div>
  );
}

// ── PresetConfigurator ───────────────────────────────────────────────────────

export default function PresetConfigurator({ activePresetData, onLivePreviewChange, onSaveCustomPreset }: Props) {
  const [preset, setPreset] = useState<Record<string, unknown>>({ ...DEFAULT_PRESET });
  const [presetName, setPresetName] = useState('My Custom Preset');
  const [subTab, setSubTab] = useState<ParamGroup>('motion');
  const [copied, setCopied] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importReplace, setImportReplace] = useState(false);
  const [importError, setImportError] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  const applyPreset = useCallback((updated: Record<string, unknown>) => {
    setPreset(updated);
    onLivePreviewChange(toButterchurnPreset(updated));
  }, [onLivePreviewChange]);

  const setParam = useCallback((key: string, value: unknown) => {
    setPreset(prev => {
      const updated = { ...prev, [key]: value };
      onLivePreviewChange(toButterchurnPreset(updated));
      return updated;
    });
  }, [onLivePreviewChange]);

  const handleLoadFromCurrent = () => {
    if (!activePresetData) return;
    applyPreset(fromButterchurnPreset(activePresetData));
  };

  const handleReset = () => applyPreset({ ...DEFAULT_PRESET });

  const handleRandomize = () => {
    const updates: Record<string, unknown> = {};
    for (const param of PARAMS_BY_GROUP[subTab]) {
      if (param.type === 'float' || param.type === 'color-channel') {
        updates[param.key] = param.min! + Math.random() * (param.max! - param.min!);
      } else if (param.type === 'enum' && param.options) {
        updates[param.key] = param.options[Math.floor(Math.random() * param.options.length)].value;
      } else if (param.type === 'bool') {
        updates[param.key] = Math.random() > 0.5 ? 1 : 0;
      }
    }
    applyPreset({ ...preset, ...updates });
  };

  const handleCopyAIPrompt = async () => {
    const prompt = buildAIPrompt(preset);
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: show prompt in a textarea for manual copy
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleImport = () => {
    setImportError('');
    let jsonStr = importText.trim();
    const match = jsonStr.match(/```(?:json)?\s*([\s\S]+?)```/);
    if (match) jsonStr = match[1].trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonStr) as Record<string, unknown>;
    } catch (e) {
      setImportError(`Parse error: ${(e as Error).message}`);
      return;
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      setImportError('Expected a JSON object { ... }');
      return;
    }

    let updatedPreset: Record<string, unknown>;
    if (importReplace) {
      updatedPreset = { ...DEFAULT_PRESET, ...parsed };
    } else {
      const updates: Record<string, unknown> = {};
      for (const key of Object.keys(parsed)) {
        if (PARAM_BY_KEY[key]) updates[key] = parsed[key];
      }
      if (Object.keys(updates).length === 0) {
        setImportError('No recognized preset parameters found. Check "Replace entirely" to import a full preset JSON.');
        return;
      }
      updatedPreset = { ...preset, ...updates };
    }

    setShowImport(false);
    setImportText('');
    applyPreset(updatedPreset);
  };

  const handleSave = async () => {
    if (!presetName.trim()) return;
    await onSaveCustomPreset(presetName.trim(), toButterchurnPreset(preset));
    setSaveMsg('Saved!');
    setTimeout(() => setSaveMsg(''), 2500);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(toButterchurnPreset(preset), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(presetName.trim() || 'preset').replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const waveColor = `rgb(${Math.round(getNum(preset, 'wave_r') * 255)},${Math.round(getNum(preset, 'wave_g') * 255)},${Math.round(getNum(preset, 'wave_b') * 255)})`;
  const obColor = `rgba(${Math.round(getNum(preset, 'ob_r') * 255)},${Math.round(getNum(preset, 'ob_g') * 255)},${Math.round(getNum(preset, 'ob_b') * 255)},${getNum(preset, 'ob_a')})`;
  const ibColor = `rgba(${Math.round(getNum(preset, 'ib_r') * 255)},${Math.round(getNum(preset, 'ib_g') * 255)},${Math.round(getNum(preset, 'ib_b') * 255)},${getNum(preset, 'ib_a')})`;

  return (
    <div className="configurator">
      {/* Toolbar */}
      <div className="configurator-toolbar">
        <button
          className="cfg-btn"
          onClick={handleLoadFromCurrent}
          disabled={!activePresetData}
          title={activePresetData ? 'Copy currently playing preset into editor' : 'No preset loaded yet'}
        >
          Load Current
        </button>
        <button className="cfg-btn" onClick={handleReset} title="Reset all parameters to defaults">
          Reset
        </button>
        <button
          className="cfg-btn cfg-btn-accent"
          onClick={handleRandomize}
          title={`Randomize all ${subTab} parameters`}
        >
          ⟳ Randomize
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="cfg-subtabs">
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            className={`cfg-subtab${subTab === t.id ? ' active' : ''}`}
            onClick={() => setSubTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Parameter section */}
      <div className="cfg-section">

        {subTab === 'motion' && PARAMS_BY_GROUP.motion.map(p => (
          <ParamRow key={p.key} param={p} preset={preset} setParam={setParam} />
        ))}

        {subTab === 'wave' && (
          <>
            <ParamRow param={PARAM_BY_KEY['nWaveMode']} preset={preset} setParam={setParam} />

            <div className="cfg-color-group">
              <div className="cfg-color-label">
                <span>Wave Color</span>
                <div className="cfg-color-swatch" style={{ backgroundColor: waveColor }} />
              </div>
              {['wave_r', 'wave_g', 'wave_b'].map(k => (
                <ParamRow key={k} param={PARAM_BY_KEY[k]} preset={preset} setParam={setParam} compact />
              ))}
            </div>

            {PARAMS_BY_GROUP.wave
              .filter(p => !['nWaveMode', 'wave_r', 'wave_g', 'wave_b'].includes(p.key) && p.type !== 'bool')
              .map(p => <ParamRow key={p.key} param={p} preset={preset} setParam={setParam} />)}

            <div className="cfg-bool-grid">
              {PARAMS_BY_GROUP.wave
                .filter(p => p.type === 'bool')
                .map(p => <ParamRow key={p.key} param={p} preset={preset} setParam={setParam} />)}
            </div>
          </>
        )}

        {subTab === 'color' && (
          <>
            {PARAMS_BY_GROUP.color
              .filter(p => p.type !== 'bool')
              .map(p => <ParamRow key={p.key} param={p} preset={preset} setParam={setParam} />)}

            <p className="cfg-param-label" style={{ marginBottom: 6, marginTop: 2 }}>Post-process Toggles</p>
            <div className="cfg-bool-grid">
              {PARAMS_BY_GROUP.color
                .filter(p => p.type === 'bool')
                .map(p => <ParamRow key={p.key} param={p} preset={preset} setParam={setParam} />)}
            </div>
          </>
        )}

        {subTab === 'borders' && (
          <>
            <div className="cfg-border-group">
              <div className="cfg-border-label">
                <span>Outer Border</span>
                <div className="cfg-color-swatch" style={{ backgroundColor: obColor }} />
              </div>
              {['ob_size', 'ob_r', 'ob_g', 'ob_b', 'ob_a'].map(k => (
                <ParamRow key={k} param={PARAM_BY_KEY[k]} preset={preset} setParam={setParam} compact />
              ))}
            </div>

            <div className="cfg-border-group">
              <div className="cfg-border-label">
                <span>Inner Border</span>
                <div className="cfg-color-swatch" style={{ backgroundColor: ibColor }} />
              </div>
              {['ib_size', 'ib_r', 'ib_g', 'ib_b', 'ib_a'].map(k => (
                <ParamRow key={k} param={PARAM_BY_KEY[k]} preset={preset} setParam={setParam} compact />
              ))}
            </div>
          </>
        )}

        {subTab === 'code' && PARAMS_BY_GROUP.code.map(p => (
          <div key={p.key} className="cfg-code-field">
            <div className="cfg-code-label">
              <span>{p.label}</span>
              <button className="cfg-code-clear" onClick={() => setParam(p.key, '')} title="Clear">✕</button>
            </div>
            <p className="cfg-code-desc">{p.description}</p>
            <textarea
              className="cfg-code-editor"
              value={getStr(preset, p.key)}
              onChange={e => setParam(p.key, e.target.value)}
              spellCheck={false}
              placeholder="// e.g.: zoom = 1.0 + 0.1*bass;"
              rows={5}
            />
          </div>
        ))}
      </div>

      {/* AI Assist */}
      <div className="cfg-ai-bar">
        <button
          className={`cfg-ai-btn${copied ? ' cfg-ai-copied' : ''}`}
          onClick={handleCopyAIPrompt}
          title="Copy a prompt describing all current parameters. Paste into Claude/ChatGPT and describe what you want to change."
        >
          {copied ? '✓ Copied to clipboard!' : '✦ Copy AI Prompt'}
        </button>
        <button
          className={`cfg-import-toggle${showImport ? ' active' : ''}`}
          onClick={() => { setShowImport(v => !v); setImportError(''); }}
          title="Import parameters from AI response"
        >
          Import ↓
        </button>
      </div>

      {/* Import panel */}
      {showImport && (
        <div className="cfg-import-panel">
          <p className="cfg-import-hint">Paste the AI's JSON output below.</p>
          <label className="cfg-import-replace">
            <input
              type="checkbox"
              checked={importReplace}
              onChange={e => setImportReplace(e.target.checked)}
            />
            Replace entirely (uncheck to merge changes only)
          </label>
          <textarea
            className="cfg-import-textarea"
            value={importText}
            onChange={e => setImportText(e.target.value)}
            placeholder={'{\n  "zoom": 1.05,\n  "rot": 0.01\n}'}
            rows={5}
          />
          {importError && <p className="cfg-import-error">{importError}</p>}
          <div className="cfg-import-actions">
            <button className="cfg-btn cfg-btn-accent" onClick={handleImport}>Apply</button>
            <button className="cfg-btn" onClick={() => { setShowImport(false); setImportText(''); setImportError(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Save row */}
      <div className="cfg-save-row">
        <input
          className="cfg-name-input"
          value={presetName}
          onChange={e => setPresetName(e.target.value)}
          placeholder="Preset name..."
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
        />
        <button
          className="cfg-btn cfg-btn-save"
          onClick={handleSave}
          disabled={!presetName.trim()}
          title="Save as custom preset (shows up in Presets tab)"
        >
          {saveMsg || 'Save'}
        </button>
        <button className="cfg-btn" onClick={handleExportJSON} title="Download as JSON file">
          ↓ JSON
        </button>
      </div>
    </div>
  );
}
