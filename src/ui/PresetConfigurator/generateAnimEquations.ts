import type { AnimParamConfig, ModulationMap, ParamModulation } from './animationTypes';
import { AUDIO_VAR } from './animationTypes';

// butterchurn frame_eqs_str uses JavaScript with an `a.` variable namespace.
// UI key → per-frame variable name (prefixed with `a.` when emitted)
const PER_FRAME_KEY: Record<string, string> = {
  fDecay: 'decay',
};

function fmt(n: number, decimals = 4): string {
  return n.toFixed(decimals);
}

function buildParamEq(
  config: AnimParamConfig,
  mod: ParamModulation,
  baseVal: number,
): string | null {
  const hasAudio = mod.audioBand !== 'none' && mod.audioAmount !== 0;
  const hasOsc = mod.oscAmp !== 0;
  if (!hasAudio && !hasOsc) return null;

  const varName = `a.${PER_FRAME_KEY[config.key] ?? config.key}`;
  let eq = `${varName} = ${fmt(baseVal)}`;

  if (hasAudio) {
    const audioVar = `a.${AUDIO_VAR[mod.audioBand]!}`;
    const sign = mod.audioAmount >= 0 ? '+' : '-';
    eq += ` ${sign} ${fmt(Math.abs(mod.audioAmount))}*${audioVar}`;
  }

  if (hasOsc) {
    const angularFreq = (2 * Math.PI) / mod.oscPeriod;
    const phaseStr = config.phaseOffset !== 0
      ? `${fmt(angularFreq)}*a.time+${fmt(config.phaseOffset)}`
      : `${fmt(angularFreq)}*a.time`;
    eq += ` + ${fmt(mod.oscAmp)}*Math.sin(${phaseStr})`;
  }

  return eq + ';';
}

/**
 * Returns the auto-generated equation lines as a single string (no comment
 * markers). Combine with user code in the caller — never store the result
 * inside per_frame_eqs_str state so the Code tab stays clean.
 */
export function buildAutoEquations(
  mods: ModulationMap,
  preset: Record<string, unknown>,
  configs: AnimParamConfig[],
): string {
  const lines: string[] = [];
  for (const config of configs) {
    const mod = mods[config.key];
    if (!mod) continue;
    const baseVal = typeof preset[config.key] === 'number'
      ? (preset[config.key] as number)
      : 0;
    const eq = buildParamEq(config, mod, baseVal);
    if (eq) lines.push(eq);
  }
  return lines.join('\n');
}
