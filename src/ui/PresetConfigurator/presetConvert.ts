import { PARAM_BY_KEY } from './parameterDefs';
import { DEFAULT_PRESET } from './defaultPreset';
import type { WaveState } from './waveTypes';
import { defaultWave, waveFromBc, waveToBc } from './waveTypes';

// Maps configurator param keys to butterchurn's baseVals keys
export const TO_BC: Record<string, string> = {
  fDecay: 'decay',
  fGammaAdj: 'gammaadj',
  nWaveMode: 'wave_mode',
  fVideoEchoZoom: 'echo_zoom',
  fVideoEchoAlpha: 'echo_alpha',
  nVideoEchoOrientation: 'echo_orient',
  fWarpAnimSpeed: 'warpanimspeed',
  fWarpScale: 'warpscale',
  fZoomExponent: 'zoomexp',
  fShader: 'fshader',
  fWaveAlpha: 'wave_a',
  fWaveScale: 'wave_scale',
  fWaveSmoothing: 'wave_smoothing',
  bWaveDots: 'wave_dots',
  bWaveThick: 'wave_thick',
  bAdditiveWaves: 'additivewave',
  bModWaveAlphaByVolume: 'modwavealphabyvolume',
  bMaximizeWaveColor: 'wave_brighten',
  bTexWrap: 'wrap',
  bDarkenCenter: 'darken_center',
  bBrighten: 'brighten',
  bDarken: 'darken',
  bSolarize: 'solarize',
  bInvert: 'invert',
  bRedBlueStereo: 'b1ed',
};

export const FROM_BC: Record<string, string> = Object.fromEntries(
  Object.entries(TO_BC).map(([a, b]) => [b, a]),
);

// Ordered pairs: EEL name → butterchurn JS name. Compound names before substrings.
const EEL_VARS: [string, string][] = [
  ['bass_att', 'a.bass_att'], ['mid_att', 'a.mid_att'], ['treb_att', 'a.treb_att'],
  ['bass', 'a.bass_att'], ['mid', 'a.mid_att'], ['treb', 'a.treb_att'],
  ['vol', 'a.vol'],
  ['time', 'a.time'], ['fps', 'a.fps'], ['frame', 'a.frame'],
  ['decay', 'a.decay'], ['zoom', 'a.zoom'], ['rot', 'a.rot'], ['warp', 'a.warp'],
  ['dx', 'a.dx'], ['dy', 'a.dy'], ['cx', 'a.cx'], ['cy', 'a.cy'], ['sx', 'a.sx'], ['sy', 'a.sy'],
  ['wave_r', 'a.wave_r'], ['wave_g', 'a.wave_g'], ['wave_b', 'a.wave_b'],
  ['wave_a', 'a.wave_a'], ['wave_x', 'a.wave_x'], ['wave_y', 'a.wave_y'],
];
for (let i = 1; i <= 32; i++) EEL_VARS.push([`q${i}`, `a.q${i}`]);

const EEL_VAR_PATTERN = new RegExp(
  `\\b(${EEL_VARS.map(([v]) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
  'g',
);
const EEL_VAR_MAP = new Map(EEL_VARS);

const EEL_MATH: [RegExp, string][] = [
  [/\bsin\s*\(/g, 'Math.sin('], [/\bcos\s*\(/g, 'Math.cos('], [/\btan\s*\(/g, 'Math.tan('],
  [/\babs\s*\(/g, 'Math.abs('], [/\bsqrt\s*\(/g, 'Math.sqrt('], [/\blog\s*\(/g, 'Math.log('],
  [/\bpow\s*\(/g, 'Math.pow('], [/\bfloor\s*\(/g, 'Math.floor('], [/\bceil\s*\(/g, 'Math.ceil('],
  [/\bmin\s*\(/g, 'Math.min('], [/\bmax\s*\(/g, 'Math.max('],
];

/** Ensures each semicolon-terminated statement is on its own line. */
export function formatEquations(eqStr: string): string {
  if (!eqStr.trim()) return eqStr;
  return eqStr
    .replace(/;[ \t]*/g, ';\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

/**
 * Best-effort conversion of native Milkdrop EEL equation syntax to butterchurn JS format.
 * Skips if the string already uses the `a.` prefix (already butterchurn format).
 */
export function convertEelToButterchurnJs(eqStr: string): string {
  if (!eqStr.trim()) return eqStr;
  if (/\ba\.(zoom|rot|bass_att|mid_att|treb_att|time|decay)\b/.test(eqStr)) return eqStr;

  let out = eqStr;
  for (const [pattern, replacement] of EEL_MATH) {
    out = out.replace(pattern, replacement);
  }
  out = out.replace(EEL_VAR_PATTERN, (match) => EEL_VAR_MAP.get(match) ?? match);
  return out;
}

const EMPTY_UNIT = { baseVals: { enabled: 0 } };

export function toButterchurnPreset(params: Record<string, unknown>, waves?: WaveState[]): object {
  const baseVals: Record<string, unknown> = {};
  let init_eqs_str = '';
  let frame_eqs_str = '';
  let pixel_eqs_str = '';
  let warp = '';
  let comp = '';

  for (const [k, v] of Object.entries(params)) {
    if (k === 'per_frame_init_eqs_str') init_eqs_str = String(v ?? '');
    else if (k === 'per_frame_eqs_str') frame_eqs_str = String(v ?? '');
    else if (k === 'per_pixel_eqs_str') pixel_eqs_str = String(v ?? '');
    else if (k === 'warp_str') warp = String(v ?? '');
    else if (k === 'comp_str') comp = String(v ?? '');
    else baseVals[TO_BC[k] ?? k] = v;
  }

  const bcWaves = waves
    ? waves.map(waveToBc)
    : [EMPTY_UNIT, EMPTY_UNIT, EMPTY_UNIT, EMPTY_UNIT];

  return {
    baseVals,
    waves: bcWaves,
    shapes: [EMPTY_UNIT, EMPTY_UNIT, EMPTY_UNIT, EMPTY_UNIT],
    init_eqs_str,
    frame_eqs_str,
    pixel_eqs_str,
    warp,
    comp,
  };
}

/**
 * Merges flat configurator params into an existing butterchurn preset, preserving
 * its warp/composite shaders and shape data. Waves are replaced by the provided array.
 */
export function mergeIntoButterchurnPreset(params: Record<string, unknown>, base: object, waves?: WaveState[]): object {
  const data = base as Record<string, unknown>;
  const existingBaseVals = (data.baseVals as Record<string, unknown>) ?? {};
  const newBaseVals: Record<string, unknown> = { ...existingBaseVals };

  for (const [k, v] of Object.entries(params)) {
    if (k === 'per_frame_init_eqs_str' || k === 'per_frame_eqs_str' || k === 'per_pixel_eqs_str') continue;
    if (k === 'warp_str' || k === 'comp_str') continue;
    newBaseVals[TO_BC[k] ?? k] = v;
  }

  const bcWaves = waves
    ? waves.map(waveToBc)
    : (data.waves as object[] | undefined) ?? [EMPTY_UNIT, EMPTY_UNIT, EMPTY_UNIT, EMPTY_UNIT];

  return {
    ...data,
    baseVals: newBaseVals,
    waves: bcWaves,
    init_eqs_str: params.per_frame_init_eqs_str !== undefined
      ? String(params.per_frame_init_eqs_str)
      : (data.init_eqs_str ?? ''),
    frame_eqs_str: params.per_frame_eqs_str !== undefined
      ? String(params.per_frame_eqs_str)
      : (data.frame_eqs_str ?? ''),
    pixel_eqs_str: params.per_pixel_eqs_str !== undefined
      ? String(params.per_pixel_eqs_str)
      : (data.pixel_eqs_str ?? ''),
    warp: params.warp_str !== undefined ? String(params.warp_str) : (data.warp ?? ''),
    comp: params.comp_str !== undefined ? String(params.comp_str) : (data.comp ?? ''),
  };
}

export interface FromBcResult {
  flat: Record<string, unknown>;
  waves: WaveState[];
}

export function fromButterchurnPreset(presetData: object): FromBcResult {
  const data = presetData as Record<string, unknown>;
  const baseVals = (data.baseVals as Record<string, unknown>) ?? {};

  const flat: Record<string, unknown> = { ...DEFAULT_PRESET };

  for (const [k, v] of Object.entries(baseVals)) {
    const ourKey = FROM_BC[k] ?? k;
    if (PARAM_BY_KEY[ourKey] !== undefined) flat[ourKey] = v;
  }

  flat.per_frame_init_eqs_str = formatEquations(convertEelToButterchurnJs(String(data.init_eqs_str ?? '')));
  flat.per_frame_eqs_str      = formatEquations(convertEelToButterchurnJs(String(data.frame_eqs_str ?? '')));
  flat.per_pixel_eqs_str      = formatEquations(convertEelToButterchurnJs(String(data.pixel_eqs_str ?? '')));
  flat.warp_str               = String(data.warp ?? '');
  flat.comp_str               = String(data.comp ?? '');

  const rawWaves = Array.isArray(data.waves) ? data.waves : [];
  const waves: WaveState[] = [0, 1, 2, 3].map(i => waveFromBc(rawWaves[i] ?? defaultWave()));

  return { flat, waves };
}
