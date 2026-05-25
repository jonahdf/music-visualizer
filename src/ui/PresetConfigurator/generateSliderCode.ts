import { PARAM_DEFS, PARAM_BY_KEY } from './parameterDefs';
import type { ParamDef } from './parameterDefs';
import { TO_BC, FROM_BC } from './presetConvert';
import type { AnimParamConfig, ModulationMap } from './animationTypes';

// UI key → per-frame variable name (without `a.` prefix). Only entries that differ.
const PER_FRAME_KEY: Record<string, string> = { fDecay: 'decay' };

/**
 * Serializes all non-code preset params as butterchurn baseVals key=value lines.
 * Displayed in the Code tab Base Values section (bidirectionally synced with sliders).
 */
export function serializeBaseVals(preset: Record<string, unknown>): string {
  const lines: string[] = [];
  for (const param of PARAM_DEFS) {
    if (param.type === 'code') continue;
    const v = preset[param.key];
    const numVal = typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) : NaN;
    if (isNaN(numVal)) continue;
    const bcKey = TO_BC[param.key] ?? param.key;
    const formatted = param.type === 'bool' || param.type === 'enum'
      ? String(Math.round(numVal))
      : numVal.toFixed(4);
    lines.push(`${bcKey} = ${formatted};`);
  }
  return lines.join('\n');
}

/**
 * Parses `key = value;` lines from the Base Values textarea back to flat UI key→number.
 */
export function parseBaseVals(text: string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const line of text.split('\n')) {
    const m = line.trim().match(/^(\w+)\s*=\s*(-?[\d.]+)\s*;?\s*$/);
    if (!m) continue;
    const uiKey = FROM_BC[m[1]] ?? m[1];
    const param = PARAM_BY_KEY[uiKey];
    if (param && param.type !== 'code') {
      result[uiKey] = parseFloat(m[2]);
    }
  }
  return result;
}

/** Format a number value for injection into per-frame equation strings. */
export function fmtVal(v: number, param: ParamDef): string {
  if (param.type === 'bool' || param.type === 'enum') return String(Math.round(v));
  const step = param.step ?? 0.01;
  const decimals = step < 0.001 ? 4 : step < 0.01 ? 3 : step < 0.1 ? 2 : 1;
  return v.toFixed(decimals);
}

/**
 * Builds static `a.varName = value;` override lines for all animatable params
 * that are NOT currently animated. Injected BEFORE user equations so user code
 * can override slider defaults, while animations (appended last) always win.
 */
export function buildSliderOverrides(
  params: Record<string, unknown>,
  mods: ModulationMap,
  configs: AnimParamConfig[],
  userEqStr = '',
): string {
  const lines: string[] = [];
  for (const cfg of configs) {
    const mod = mods[cfg.key];
    if (mod && (mod.audioBand !== 'none' || mod.oscAmp !== 0)) continue;
    const varName = PER_FRAME_KEY[cfg.key] ?? cfg.key;
    // Skip override when user equations already reference this variable —
    // those equations may be accumulators that rely on prior-frame state.
    if (userEqStr && new RegExp(`\\ba\\.${varName}\\b`).test(userEqStr)) continue;
    const v = params[cfg.key];
    const numVal = typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) : NaN;
    if (isNaN(numVal)) continue;
    const param = PARAM_BY_KEY[cfg.key];
    if (!param) continue;
    lines.push(`a.${varName} = ${fmtVal(numVal, param)};`);
  }
  return lines.join('\n');
}

/**
 * Scans per-frame equation code for static literal assignments like `a.zoom = 1.05;`
 * (right-hand side is a plain number with no variables or operators beyond an optional
 * leading minus). Extracted assignments become slider values; those lines are removed
 * from the returned `remaining` string. Dynamic equations (`a.zoom = 1+0.1*a.bass_att;`)
 * are left in place.
 *
 * Called when loading an external preset so that static equations sync to sliders
 * and no longer compete with slider overrides at runtime.
 */
export function extractStaticLiterals(
  code: string,
  configs: AnimParamConfig[],
): { extracted: Record<string, number>; remaining: string } {
  const extracted: Record<string, number> = {};
  const lines = code.split('\n');
  const remaining: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    let matched = false;
    for (const cfg of configs) {
      const varName = PER_FRAME_KEY[cfg.key] ?? cfg.key;
      const m = trimmed.match(new RegExp(`^a\\.${varName}\\s*=\\s*(-?[\\d.]+)\\s*;?\\s*$`));
      if (m) {
        extracted[cfg.key] = parseFloat(m[1]);
        matched = true;
        break;
      }
    }
    if (!matched) remaining.push(line);
  }

  return { extracted, remaining: remaining.join('\n').trim() };
}

/**
 * Detects whether a JS equation string likely uses native Milkdrop EEL syntax
 * (bare variable names without `a.` prefix). Used to show a warning banner.
 */
export function hasEelSyntax(code: string): boolean {
  if (!code.trim()) return false;
  if (/\ba\.(zoom|rot|bass_att|mid_att|treb_att|time|decay)\b/.test(code)) return false;
  return /\b(zoom|rot|decay|bass|mid|treb|time)\s*=/.test(code);
}
