import { PARAM_DEFS, PARAM_BY_KEY } from './parameterDefs';
import type { ParamDef } from './parameterDefs';
import { TO_BC, FROM_BC } from './presetConvert';

/**
 * Serializes all non-code preset params as butterchurn baseVals key=value lines.
 * This text is displayed (and bidirectionally edited) in the Code tab Base Values section.
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
 * Lines that don't match the simple pattern are silently skipped.
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

/** Format a number value for display (used in animation equation generation). */
export function fmtVal(v: number, param: ParamDef): string {
  if (param.type === 'bool' || param.type === 'enum') return String(Math.round(v));
  const step = param.step ?? 0.01;
  const decimals = step < 0.001 ? 4 : step < 0.01 ? 3 : step < 0.1 ? 2 : 1;
  return v.toFixed(decimals);
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
