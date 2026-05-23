import type { ParamDef } from './parameterDefs';
import { PARAM_DEFS, PARAM_BY_KEY } from './parameterDefs';

// Maps UI param keys → Milkdrop per-frame equation variable names.
// Keys absent from this map use the UI key directly (e.g. zoom, cx, wave_r).
export const TO_PERFRAME: Record<string, string> = {
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

// UI param keys with no per-frame equation equivalent.
export const SKIP_PERFRAME = new Set(['bRedBlueStereo']);

// Reverse map: per-frame var name → UI param key (includes direct-mapped params).
export const PERFRAME_TO_UI: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const [ui, pf] of Object.entries(TO_PERFRAME)) map[pf] = ui;
  for (const param of PARAM_DEFS) {
    if (param.type === 'code') continue;
    if (SKIP_PERFRAME.has(param.key)) continue;
    if (!TO_PERFRAME[param.key]) map[param.key] = param.key;
  }
  return map;
})();

export function fmtVal(v: number, param: ParamDef): string {
  if (param.type === 'bool' || param.type === 'enum') return String(Math.round(v));
  const step = param.step ?? 0.01;
  const decimals = step < 0.001 ? 4 : step < 0.01 ? 3 : step < 0.1 ? 2 : 1;
  return v.toFixed(decimals);
}

function simpleLiteralRe(varName: string) {
  return new RegExp(`^\\s*a\\.${varName}\\s*=\\s*-?[\\d.]+\\s*;?\\s*$`);
}

function anyAssignRe(varName: string) {
  return new RegExp(`a\\.${varName}\\s*=`);
}

/**
 * Upserts `a.varName = value;` in the code string.
 * - Replaces an existing simple literal assignment.
 * - Leaves code unchanged if a complex expression already exists for that var.
 * - Appends a new line if neither exists.
 */
export function upsertCodeLine(code: string, varName: string, value: string): string {
  const lines = code.split('\n');
  const simpleIdx = lines.findIndex(l => simpleLiteralRe(varName).test(l));
  if (simpleIdx >= 0) {
    lines[simpleIdx] = `a.${varName} = ${value};`;
    return lines.join('\n');
  }
  if (anyAssignRe(varName).test(code)) return code; // complex expression — leave it
  const newLine = `a.${varName} = ${value};`;
  return code ? `${code}\n${newLine}` : newLine;
}

/**
 * Removes a simple literal `a.varName = <number>;` from the code.
 * Complex expressions are left intact.
 */
export function removeSimpleLiteral(code: string, varName: string): string {
  const lines = code.split('\n').filter(l => !simpleLiteralRe(varName).test(l));
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Parses code and returns UI-key → number for every simple literal found.
 * Complex expressions are ignored so they don't clobber slider state.
 */
export function parseCodeSliders(code: string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const line of code.split('\n')) {
    const m = line.trim().match(/^a\.(\w+)\s*=\s*(-?[\d.]+)\s*;?\s*$/);
    if (!m) continue;
    const uiKey = PERFRAME_TO_UI[m[1]];
    if (uiKey && PARAM_BY_KEY[uiKey]) result[uiKey] = parseFloat(m[2]);
  }
  return result;
}
