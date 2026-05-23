import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PARAMS_BY_GROUP, PARAM_BY_KEY } from './parameterDefs';
import type { ParamDef, ParamGroup } from './parameterDefs';
import { DEFAULT_PRESET } from './defaultPreset';
import { toButterchurnPreset, mergeIntoButterchurnPreset, fromButterchurnPreset } from './presetConvert';
import { buildAIPrompt } from './aiPromptBuilder';
import AnimationPanel from './AnimationPanel';
import type { ModulationMap, ParamModulation } from './animationTypes';
import { ANIM_PARAM_CONFIGS, defaultModulationMap } from './animationTypes';
import { buildAutoEquations } from './generateAnimEquations';
import { serializeBaseVals, parseBaseVals, hasEelSyntax } from './generateSliderCode';
import type { WaveState } from './waveTypes';
import { defaultWaves } from './waveTypes';
import WaveEditor from './WaveEditor';
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
  const [waves, setWaves] = useState<WaveState[]>(defaultWaves);
  const [baseValsText, setBaseValsText] = useState<string>(() => serializeBaseVals(DEFAULT_PRESET));
  const [copied, setCopied] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importReplace, setImportReplace] = useState(false);
  const [importError, setImportError] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [confirmMode, setConfirmMode] = useState<'reset' | 'randomize' | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  // Refs give synchronous read access without nesting state setters.
  // Updated immediately before every matching setPreset / setModulations call.
  const presetRef = useRef<Record<string, unknown>>({ ...DEFAULT_PRESET });
  const modulationsRef = useRef<ModulationMap>(modulations);
  const baseBcPresetRef = useRef<object | null>(null);
  const wavesRef = useRef<WaveState[]>(defaultWaves());

  // Combine user's per_frame_eqs with the auto-generated animation equations.
  // Auto-equations are prepended; user code comes after. No comment markers —
  // butterchurn's expression parser doesn't support them.
  const combineEquations = useCallback((params: Record<string, unknown>, mods: ModulationMap): Record<string, unknown> => {
    const autoEqs = buildAutoEquations(mods, params, ANIM_PARAM_CONFIGS);
    const userEqs = String(params.per_frame_eqs_str ?? '');
    const combined = autoEqs && userEqs ? autoEqs + '\n' + userEqs : autoEqs || userEqs;
    return { ...params, per_frame_eqs_str: combined };
  }, []);

  // Helper: push a flat preset to the renderer (side-effect, never call inside an updater)
  const pushToRenderer = useCallback((params: Record<string, unknown>, base: object | null, wvs?: WaveState[]) => {
    const combined = combineEquations(params, modulationsRef.current);
    const waveArr = wvs ?? wavesRef.current;
    const data = base ? mergeIntoButterchurnPreset(combined, base, waveArr) : toButterchurnPreset(combined, waveArr);
    onLivePreviewChange(data);
  }, [onLivePreviewChange, combineEquations]);

  // Build butterchurn preset for save/export — bakes auto-equations in
  const buildBcPreset = useCallback((params: Record<string, unknown>, base: object | null, wvs?: WaveState[]): object => {
    const combined = combineEquations(params, modulationsRef.current);
    const waveArr = wvs ?? wavesRef.current;
    return base ? mergeIntoButterchurnPreset(combined, base, waveArr) : toButterchurnPreset(combined, waveArr);
  }, [combineEquations]);

  // Apply a new flat preset (replaces entire state) and push to renderer
  const applyPreset = useCallback((updated: Record<string, unknown>, base: object | null = baseBcPresetRef.current) => {
    presetRef.current = updated;
    setPreset(updated);
    setBaseValsText(serializeBaseVals(updated));
    pushToRenderer(updated, base);
  }, [pushToRenderer]);

  // Update a single non-code parameter. Syncs the Base Values textarea.
  const setParam = useCallback((key: string, value: unknown) => {
    setIsDirty(true);
    const updated = { ...presetRef.current, [key]: value };
    presetRef.current = updated;
    setPreset(updated);
    setBaseValsText(serializeBaseVals(updated));
    pushToRenderer(updated, baseBcPresetRef.current);
  }, [pushToRenderer]);

  // Handle code textarea changes (init, per-frame, per-vertex, warp, comp).
  const handleCodeChange = useCallback((key: string, code: string) => {
    setIsDirty(true);
    const updated = { ...presetRef.current, [key]: code };
    presetRef.current = updated;
    setPreset(updated);
    pushToRenderer(updated, baseBcPresetRef.current);
  }, [pushToRenderer]);

  // Handle Base Values textarea edits — parse and sync back to sliders.
  const handleBaseValsChange = useCallback((text: string) => {
    setIsDirty(true);
    setBaseValsText(text);
    const parsed = parseBaseVals(text);
    const updated = { ...presetRef.current };
    for (const [uiKey, numVal] of Object.entries(parsed)) {
      const p = PARAM_BY_KEY[uiKey];
      if (p && p.type !== 'code') {
        const clamped = p.min !== undefined && p.max !== undefined
          ? Math.max(p.min, Math.min(p.max, numVal))
          : numVal;
        updated[uiKey] = clamped;
      }
    }
    presetRef.current = updated;
    setPreset(updated);
    pushToRenderer(updated, baseBcPresetRef.current);
  }, [pushToRenderer]);

  // Update one modulation entry.
  const setModulation = useCallback((key: string, mod: ParamModulation) => {
    const newMods = { ...modulationsRef.current, [key]: mod };
    modulationsRef.current = newMods;
    setModulations(newMods);
    pushToRenderer(presetRef.current, baseBcPresetRef.current);
  }, [pushToRenderer]);

  const handleClearAllAnimation = useCallback(() => {
    const cleared = defaultModulationMap();
    modulationsRef.current = cleared;
    setModulations(cleared);
    pushToRenderer(presetRef.current, baseBcPresetRef.current);
  }, [pushToRenderer]);

  // Handle changes to a specific wave in the Code tab.
  const handleWaveChange = useCallback((index: number, wave: WaveState) => {
    const newWaves = [...wavesRef.current];
    newWaves[index] = wave;
    wavesRef.current = newWaves;
    setWaves(newWaves);
    pushToRenderer(presetRef.current, baseBcPresetRef.current);
  }, [pushToRenderer]);

  const handleLoadFromCurrent = () => {
    if (!activePresetData) return;
    const { flat, waves: loadedWaves } = fromButterchurnPreset(activePresetData);
    presetRef.current = flat;
    baseBcPresetRef.current = activePresetData;
    wavesRef.current = loadedWaves;
    setPreset(flat);
    setBaseBcPreset(activePresetData);
    setWaves(loadedWaves);
    setBaseValsText(serializeBaseVals(flat));
    setIsDirty(false);
    onLivePreviewChange(activePresetData);
  };

  const handleResetAll = () => {
    const defaults = { ...DEFAULT_PRESET };
    const clearedMods = defaultModulationMap();
    const resetWaves = defaultWaves();
    presetRef.current = defaults;
    baseBcPresetRef.current = null;
    modulationsRef.current = clearedMods;
    wavesRef.current = resetWaves;
    setPreset(defaults);
    setBaseBcPreset(null);
    setModulations(clearedMods);
    setWaves(resetWaves);
    setBaseValsText(serializeBaseVals(defaults));
    setIsDirty(false);
    pushToRenderer(defaults, null, resetWaves);
    setConfirmMode(null);
    setConfirmChecked(false);
  };

  // Live preview of auto-equations shown in the Animate tab (no comment markers)
  const autoEqPreview = useMemo(
    () => buildAutoEquations(modulations, preset, ANIM_PARAM_CONFIGS),
    [modulations, preset],
  );

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

    // Butterchurn native format (has baseVals key) — extract flat params + waves
    if ('baseVals' in parsed) {
      const { flat, waves: loadedWaves } = fromButterchurnPreset(parsed as object);
      wavesRef.current = loadedWaves;
      setWaves(loadedWaves);
      setShowImport(false);
      setImportText('');
      applyPreset(flat);
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
        setImportError('No recognized preset parameters found. Check "Replace entirely" to import a full preset JSON, or paste a butterchurn JSON with a "baseVals" key.');
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

        {subTab === 'animate' && (
          <AnimationPanel
            modulations={modulations}
            generatedCode={autoEqPreview}
            onModulationChange={setModulation}
            onClearAll={handleClearAllAnimation}
          />
        )}

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

        {subTab === 'code' && (() => {
          const animCount = autoEqPreview ? autoEqPreview.split('\n').filter(Boolean).length : 0;
          const eelFields = ['per_frame_init_eqs_str', 'per_frame_eqs_str', 'per_pixel_eqs_str'];
          const showEelWarning = eelFields.some(k => hasEelSyntax(getStr(preset, k)));
          return (
            <>
              {/* Base Values */}
              <div className="cfg-code-field">
                <div className="cfg-code-label">
                  <span>Base Values</span>
                  <button
                    className="cfg-code-clear"
                    onClick={() => setBaseValsText(serializeBaseVals(presetRef.current))}
                    title="Re-sync from current sliders"
                  >↺</button>
                </div>
                <p className="cfg-code-desc">
                  All slider parameters as butterchurn <code className="cfg-inline-code">baseVals</code> key=value pairs.
                  Edit here to update sliders, or move sliders to update this.
                </p>
                <textarea
                  className="cfg-code-editor cfg-baseval-editor"
                  value={baseValsText}
                  onChange={e => handleBaseValsChange(e.target.value)}
                  spellCheck={false}
                  rows={14}
                />
              </div>

              {/* EEL syntax warning */}
              {showEelWarning && (
                <div className="cfg-eel-warning">
                  ⚠ Some equations appear to use native Milkdrop EEL syntax (bare variable names).
                  Use <code className="cfg-inline-code">a.zoom</code>, <code className="cfg-inline-code">a.bass_att</code>, <code className="cfg-inline-code">Math.sin(a.time)</code> format for butterchurn compatibility.
                  Paste a butterchurn-format preset JSON to auto-convert on import.
                </div>
              )}

              {/* Init equations */}
              <div className="cfg-code-field">
                <div className="cfg-code-label">
                  <span>Init Equations</span>
                  <button className="cfg-code-clear" onClick={() => handleCodeChange('per_frame_init_eqs_str', '')} title="Clear">✕</button>
                </div>
                <p className="cfg-code-desc">Runs once on preset load. Initialize q1–q32 and custom variables here.</p>
                <textarea
                  className="cfg-code-editor"
                  value={getStr(preset, 'per_frame_init_eqs_str')}
                  onChange={e => handleCodeChange('per_frame_init_eqs_str', e.target.value)}
                  spellCheck={false}
                  placeholder="q1 = 0; q2 = 0;"
                  rows={3}
                />
              </div>

              {/* Per-frame equations */}
              <div className="cfg-code-field">
                <div className="cfg-code-label">
                  <span>Per-Frame Equations</span>
                  <button className="cfg-code-clear" onClick={() => handleCodeChange('per_frame_eqs_str', '')} title="Clear">✕</button>
                </div>
                <p className="cfg-code-desc">
                  Runs every frame. Audio: <code className="cfg-inline-code">a.bass_att</code>, <code className="cfg-inline-code">a.mid_att</code>, <code className="cfg-inline-code">a.treb_att</code>. Time: <code className="cfg-inline-code">a.time</code>.
                  {animCount > 0 && (
                    <span className="cfg-code-anim-hint"> · {animCount} animation {animCount === 1 ? 'equation' : 'equations'} from Animate tab are prepended at runtime.</span>
                  )}
                </p>
                <textarea
                  className="cfg-code-editor"
                  value={getStr(preset, 'per_frame_eqs_str')}
                  onChange={e => handleCodeChange('per_frame_eqs_str', e.target.value)}
                  spellCheck={false}
                  placeholder="a.zoom = 1.0 + 0.1*a.bass_att;"
                  rows={6}
                />
              </div>

              {/* Per-vertex equations */}
              <div className="cfg-code-field">
                <div className="cfg-code-label">
                  <span>Per-Vertex Equations</span>
                  <button className="cfg-code-clear" onClick={() => handleCodeChange('per_pixel_eqs_str', '')} title="Clear">✕</button>
                </div>
                <p className="cfg-code-desc">Runs per mesh vertex. Variables: x, y, rad, ang. Can override zoom, rot, warp, dx, dy per vertex.</p>
                <textarea
                  className="cfg-code-editor"
                  value={getStr(preset, 'per_pixel_eqs_str')}
                  onChange={e => handleCodeChange('per_pixel_eqs_str', e.target.value)}
                  spellCheck={false}
                  placeholder="a.zoom = 1.0 + 0.1*a.rad;"
                  rows={4}
                />
              </div>

              {/* Warp shader */}
              <div className="cfg-code-field">
                <div className="cfg-code-label">
                  <span>Warp Shader (GLSL)</span>
                  <button className="cfg-code-clear" onClick={() => handleCodeChange('warp_str', '')} title="Clear">✕</button>
                </div>
                <p className="cfg-code-desc">Per-pixel shader for the warp pass. Inputs: uv, uv_orig (vec2), rad, ang. Blur textures via GetBlur1/2/3(uv). Output: ret (vec4).</p>
                <textarea
                  className="cfg-code-editor"
                  value={getStr(preset, 'warp_str')}
                  onChange={e => handleCodeChange('warp_str', e.target.value)}
                  spellCheck={false}
                  placeholder="ret = tex2D(sampler_fw_main, uv);"
                  rows={5}
                />
              </div>

              {/* Composite shader */}
              <div className="cfg-code-field">
                <div className="cfg-code-label">
                  <span>Composite Shader (GLSL)</span>
                  <button className="cfg-code-clear" onClick={() => handleCodeChange('comp_str', '')} title="Clear">✕</button>
                </div>
                <p className="cfg-code-desc">Per-pixel shader for the final pass. Inputs: uv (vec2), rad, ang, hue_shader (vec3). Output: ret (vec4).</p>
                <textarea
                  className="cfg-code-editor"
                  value={getStr(preset, 'comp_str')}
                  onChange={e => handleCodeChange('comp_str', e.target.value)}
                  spellCheck={false}
                  placeholder="ret = tex2D(sampler_fw_main, uv) * float4(hue_shader, 1);"
                  rows={5}
                />
              </div>

              {/* Custom Waves */}
              <div className="cfg-code-waves-header">Custom Waves</div>
              {waves.map((wave, i) => (
                <WaveEditor
                  key={i}
                  index={i}
                  wave={wave}
                  onChange={(w) => handleWaveChange(i, w)}
                />
              ))}
            </>
          );
        })()}
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
