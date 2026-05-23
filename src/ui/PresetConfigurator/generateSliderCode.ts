import type { ParamDef } from './parameterDefs';
import { PARAM_DEFS } from './parameterDefs';

// Maps UI param keys → Milkdrop per-frame equation variable names.
// Keys absent from this map are used as-is (e.g. zoom, cx, wave_r).
const TO_PERFRAME: Record<string, string> = {
  fDecay: 'decay',
  fGammaAdj: 'gamma',
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
};

// Params with no standard per-frame equation equivalent.
const SKIP = new Set(['bRedBlueStereo']);

function fmtVal(v: number, param: ParamDef): string {
  if (param.type === 'bool' || param.type === 'enum') return String(Math.round(v));
  const step = param.step ?? 0.01;
  const decimals = step < 0.001 ? 4 : step < 0.01 ? 3 : step < 0.1 ? 2 : 1;
  return v.toFixed(decimals);
}

/**
 * Returns per-frame assignment statements for every slider param that differs
 * from its default value. Intended for read-only display in the Code tab so
 * users can see (and copy) exactly what the visual controls are doing.
 */
export function buildSliderCode(
  preset: Record<string, unknown>,
  defaults: Record<string, unknown>,
): string {
  const lines: string[] = [];

  for (const param of PARAM_DEFS) {
    if (param.type === 'code') continue;
    if (SKIP.has(param.key)) continue;

    const val = typeof preset[param.key] === 'number' ? (preset[param.key] as number) : null;
    if (val === null) continue;

    const defVal = typeof defaults[param.key] === 'number' ? (defaults[param.key] as number) : null;
    if (defVal !== null && Math.abs(val - defVal) < 1e-9) continue;

    const varName = TO_PERFRAME[param.key] ?? param.key;
    lines.push(`a.${varName} = ${fmtVal(val, param)};`);
  }

  return lines.join('\n');
}
