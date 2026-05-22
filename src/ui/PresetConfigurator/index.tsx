import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PARAMS_BY_GROUP, PARAM_BY_KEY } from './parameterDefs';
import type { ParamDef, ParamGroup } from './parameterDefs';
import { DEFAULT_PRESET } from './defaultPreset';
import { toButterchurnPreset, mergeIntoButterchurnPreset, fromButterchurnPreset } from './presetConvert';
import { buildAIPrompt } from './aiPromptBuilder';
import AnimationPanel from './AnimationPanel';
import type { ModulationMap, ParamModulation } from './animationTypes';
import { ANIM_PARAM_CONFIGS, defaultModulationMap } from './animationTypes';
import { generateAnimEquations } from './generateAnimEquations';
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

type SubTabId = ParamGroup | 'animate';

const SUB_TABS: { id: SubTabId; label: string }[] = [
  { id: 'motion', label: 'Motion' },
  { id: 'animate', label: 'Animate' },
  { id: 'wave', label: 'Wave' },
  { id: 'color', label: 'Color/FX' },
  { id: 'borders', label: 'Borders' },
  { id: 'code', label: 'Code' },
];

// ── Floating tooltip via portal ───────────────────────────────────────────────

function FloatingTooltip({
  btnRef,
  text,
  onClose,
}: {
  btnRef: React.RefObject<HTMLButtonElement | null>;
  text: string;
  onClose: () => void;
}) {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setStyle({
      position: 'fixed',
      top: r.bottom + 4,
      right: Math.max(8, window.innerWidth - r.right),
      maxWidth: 220,
      zIndex: 9999,
    });
  }, [btnRef]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('.cfg-tooltip') && !t.closest('.cfg-desc-btn')) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return createPortal(
    <div className="cfg-tooltip" style={style}>{text}</div>,
    document.body,
  );
}

// ── ParamRow ─────────────────────────────────────────────────────────────────

interface ParamRowProps {
  param: ParamDef;
  preset: Record<string, unknown>;
  setParam: (key: string, value: unknown) => void;
  compact?: boolean;
}

function ParamRow({ param, preset, setParam, compact }: ParamRowProps) {
  const [showDesc, setShowDesc] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  if (param.type === 'code') return null;

  const numValue = getNum(preset, param.key, typeof param.default === 'number' ? param.default : 0);
  const toggleDesc = () => setShowDesc(v => !v);
  const closeDesc = () => setShowDesc(false);

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
        <button ref={btnRef} className="cfg-desc-btn" onClick={toggleDesc} title="About">?</button>
        {showDesc && <FloatingTooltip btnRef={btnRef} text={param.description} onClose={closeDesc} />}
      </div>
    );
  }

  if (param.type === 'enum' && param.options) {
    return (
      <div className={`cfg-param-row${compact ? ' compact' : ''}`}>
        <div className="cfg-param-header">
          <label className="cfg-param-label">{compact ? shortLabel(param.key, param.label) : param.label}</label>
          <button ref={btnRef} className="cfg-desc-btn" onClick={toggleDesc} title="About">?</button>
          {showDesc && <FloatingTooltip btnRef={btnRef} text={param.description} onClose={closeDesc} />}
        </div>
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
            <>
              <button ref={btnRef} className="cfg-desc-btn" onClick={toggleDesc} title="About">?</button>
              {showDesc && <FloatingTooltip btnRef={btnRef} text={param.description} onClose={closeDesc} />}
            </>
          )}
        </div>
      </div>
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
  const [baseBcPreset, setBaseBcPreset] = useState<object | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [presetName, setPresetName] = useState('My Custom Preset');
  const [subTab, setSubTab] = useState<SubTabId>('motion');
  const [modulations, setModulations] = useState<ModulationMap>(defaultModulationMap);
  const [copied, setCopied] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importReplace, setImportReplace] = useState(false);
  const [importError, setImportError] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [confirmMode, setConfirmMode] = useState<'reset' | 'randomize' | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const buildBcPreset = useCallback((params: Record<string, unknown>, base: object | null): object => {
    return base ? mergeIntoButterchurnPreset(params, base) : toButterchurnPreset(params);
  }, []);

  const applyPreset = useCallback((updated: Record<string, unknown>, base: object | null = baseBcPreset) => {
    setPreset(updated);
    onLivePreviewChange(base ? mergeIntoButterchurnPreset(updated, base) : toButterchurnPreset(updated));
  }, [onLivePreviewChange, baseBcPreset]);

  const setParam = useCallback((key: string, value: unknown) => {
    setIsDirty(true);
    setPreset(prev => {
      const updated = { ...prev, [key]: value };
      // If an animated param's base value changed, rebuild the auto-block so the
      // embedded base number in the equation stays in sync with the slider.
      const isAnimated = ANIM_PARAM_CONFIGS.some(c => c.key === key);
      if (isAnimated) {
        setModulations(currentMods => {
          const newEq = generateAnimEquations(
            currentMods,
            updated,
            ANIM_PARAM_CONFIGS,
            String(updated.per_frame_eqs_str ?? ''),
          );
          const withEq = { ...updated, per_frame_eqs_str: newEq };
          onLivePreviewChange(baseBcPreset ? mergeIntoButterchurnPreset(withEq, baseBcPreset) : toButterchurnPreset(withEq));
          // Return unchanged mods — just needed preset access
          return currentMods;
        });
        return updated;
      }
      onLivePreviewChange(baseBcPreset ? mergeIntoButterchurnPreset(updated, baseBcPreset) : toButterchurnPreset(updated));
      return updated;
    });
  }, [onLivePreviewChange, baseBcPreset]);

  const setModulation = useCallback((key: string, mod: ParamModulation) => {
    setModulations(prevMods => {
      const newMods = { ...prevMods, [key]: mod };
      setPreset(prev => {
        const newEq = generateAnimEquations(
          newMods,
          prev,
          ANIM_PARAM_CONFIGS,
          String(prev.per_frame_eqs_str ?? ''),
        );
        const updated = { ...prev, per_frame_eqs_str: newEq };
        onLivePreviewChange(baseBcPreset ? mergeIntoButterchurnPreset(updated, baseBcPreset) : toButterchurnPreset(updated));
        return updated;
      });
      return newMods;
    });
  }, [onLivePreviewChange, baseBcPreset]);

  const handleClearAllAnimation = useCallback(() => {
    const cleared = defaultModulationMap();
    setModulations(cleared);
    setPreset(prev => {
      const newEq = generateAnimEquations(cleared, prev, ANIM_PARAM_CONFIGS, String(prev.per_frame_eqs_str ?? ''));
      const updated = { ...prev, per_frame_eqs_str: newEq };
      onLivePreviewChange(baseBcPreset ? mergeIntoButterchurnPreset(updated, baseBcPreset) : toButterchurnPreset(updated));
      return updated;
    });
  }, [onLivePreviewChange, baseBcPreset]);

  const handleLoadFromCurrent = () => {
    if (!activePresetData) return;
    const flat = fromButterchurnPreset(activePresetData);
    setPreset(flat);
    setBaseBcPreset(activePresetData);
    setIsDirty(false);
    onLivePreviewChange(activePresetData);
  };

  const handleResetAll = () => {
    setPreset({ ...DEFAULT_PRESET });
    setBaseBcPreset(null);
    setModulations(defaultModulationMap());
    setIsDirty(false);
    onLivePreviewChange(toButterchurnPreset(DEFAULT_PRESET));
    setConfirmMode(null);
    setConfirmChecked(false);
  };

  // Conservative ranges for randomize — avoids extreme values that look broken
  const RAND_RANGE: Record<string, [number, number]> = {
    zoom: [0.88, 1.12], rot: [-0.06, 0.06], warp: [0, 1.5],
    fDecay: [0.90, 0.998], fWarpScale: [0.1, 1.5], fWarpAnimSpeed: [0.1, 3.0],
    fZoomExponent: [0.5, 2.0], fShader: [0, 0.4],
    fWaveAlpha: [30, 180], fWaveScale: [0.1, 3.0],
    fVideoEchoZoom: [1.0, 1.4], fVideoEchoAlpha: [0, 0.4],
    dx: [-0.1, 0.1], dy: [-0.1, 0.1],
    sx: [0.8, 1.2], sy: [0.8, 1.2],
  };

  function randValue(param: ParamDef): number {
    const [lo, hi] = RAND_RANGE[param.key] ?? [param.min ?? 0, param.max ?? 1];
    return lo + Math.random() * (hi - lo);
  }

  const handleResetTab = () => {
    if (subTab === 'animate') return;
    const updates: Record<string, unknown> = {};
    for (const param of PARAMS_BY_GROUP[subTab]) {
      updates[param.key] = param.default;
    }
    applyPreset({ ...preset, ...updates });
  };

  const handleRandomizeTab = () => {
    if (subTab === 'animate') return;
    const updates: Record<string, unknown> = {};
    for (const param of PARAMS_BY_GROUP[subTab]) {
      if (param.type === 'float' || param.type === 'color-channel') {
        updates[param.key] = randValue(param);
      } else if (param.type === 'enum' && param.options) {
        updates[param.key] = param.options[Math.floor(Math.random() * param.options.length)].value;
      } else if (param.type === 'bool') {
        updates[param.key] = Math.random() > 0.5 ? 1 : 0;
      }
    }
    applyPreset({ ...preset, ...updates });
  };

  const doRandomizeAll = () => {
    const updates: Record<string, unknown> = {};
    const groups: ParamGroup[] = ['motion', 'wave', 'color', 'borders'];
    for (const group of groups) {
      for (const param of PARAMS_BY_GROUP[group]) {
        if (param.type === 'float' || param.type === 'color-channel') {
          updates[param.key] = randValue(param);
        } else if (param.type === 'enum' && param.options) {
          updates[param.key] = param.options[Math.floor(Math.random() * param.options.length)].value;
        } else if (param.type === 'bool') {
          updates[param.key] = Math.random() > 0.5 ? 1 : 0;
        }
      }
    }
    applyPreset({ ...preset, ...updates });
    setIsDirty(false);
    setConfirmMode(null);
    setConfirmChecked(false);
  };

  const handleRandomizeAll = () => {
    if (isDirty) {
      setConfirmMode('randomize');
    } else {
      doRandomizeAll();
    }
  };

  const handleCopyAIPrompt = async () => {
    const prompt = buildAIPrompt(preset);
    try {
      await navigator.clipboard.writeText(prompt);
    } catch { /* fallback: silent */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
    await onSaveCustomPreset(presetName.trim(), buildBcPreset(preset, baseBcPreset));
    setSaveMsg('Saved!');
    setTimeout(() => setSaveMsg(''), 2500);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(buildBcPreset(preset, baseBcPreset), null, 2)], { type: 'application/json' });
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
      {/* Global toolbar */}
      <div className="configurator-toolbar">
        <button
          className="cfg-btn"
          onClick={handleLoadFromCurrent}
          disabled={!activePresetData}
          title={activePresetData ? 'Copy currently playing preset into editor' : 'No preset loaded yet'}
        >
          Load Current
        </button>

        {confirmMode === null ? (
          <>
            <button
              className="cfg-btn"
              onClick={() => setConfirmMode('reset')}
              title="Reset all parameters to defaults"
            >
              Reset All
            </button>
            <button
              className="cfg-btn cfg-btn-accent"
              onClick={handleRandomizeAll}
              title="Randomize all parameters across every tab"
            >
              🎲 All
            </button>
          </>
        ) : (
          <div className="cfg-confirm-row">
            <label className="cfg-confirm-label">
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={e => setConfirmChecked(e.target.checked)}
              />
              {confirmMode === 'reset' ? 'Discard all?' : 'Randomize all?'}
            </label>
            <button
              className="cfg-btn"
              disabled={!confirmChecked}
              onClick={confirmMode === 'reset' ? handleResetAll : doRandomizeAll}
            >
              {confirmMode === 'reset' ? 'Reset' : '🎲 Go'}
            </button>
            <button
              className="cfg-btn"
              onClick={() => { setConfirmMode(null); setConfirmChecked(false); }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Sub-tabs + per-tab actions */}
      <div className="cfg-subtabs-row">
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
        {subTab !== 'code' && subTab !== 'animate' && (
          <div className="cfg-tab-actions">
            <button
              className="cfg-tab-action-btn"
              onClick={handleResetTab}
              title={`Reset ${subTab} tab to defaults`}
            >
              ↺
            </button>
            <button
              className="cfg-tab-action-btn cfg-tab-action-rand"
              onClick={handleRandomizeTab}
              title={`Randomize ${subTab} tab`}
            >
              🎲
            </button>
          </div>
        )}
      </div>

      {/* Parameter section */}
      <div className="cfg-section">

        {subTab === 'motion' && PARAMS_BY_GROUP.motion.map(p => (
          <ParamRow key={p.key} param={p} preset={preset} setParam={setParam} />
        ))}

        {subTab === 'animate' && (() => {
          const eqStr = String(preset.per_frame_eqs_str ?? '');
          const autoStart = eqStr.indexOf('// [auto]');
          const autoEnd = eqStr.indexOf('// [/auto]');
          const generatedCode = autoStart !== -1 && autoEnd !== -1
            ? eqStr.slice(autoStart, autoEnd + '// [/auto]'.length)
            : '';
          return (
            <AnimationPanel
              modulations={modulations}
              generatedCode={generatedCode}
              onModulationChange={setModulation}
              onClearAll={handleClearAllAnimation}
            />
          );
        })()}

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
