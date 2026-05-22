import type { AnimParamConfig, ModulationMap, ParamModulation } from './animationTypes';
import { AUDIO_VAR } from './animationTypes';

const AUTO_START = '// [auto]';
const AUTO_END = '// [/auto]';

// butterchurn's frame_eqs_str uses JavaScript with an `a.` variable namespace.
// UI key → per-frame variable name (all prefixed with `a.` when emitted)
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

  // All identifiers in butterchurn's frame_eqs are accessed via `a.`
  const varName = `a.${PER_FRAME_KEY[config.key] ?? config.key}`;
  let eq = `${varName} = ${fmt(baseVal)}`;

  if (hasAudio) {
    const audioVar = `a.${AUDIO_VAR[mod.audioBand]!}`;
    const sign = mod.audioAmount >= 0 ? '+' : '-';
    eq += ` ${sign} ${fmt(Math.abs(mod.audioAmount))}*${audioVar}`;
  }

  if (hasOsc) {
    const angularFreq = (2 * Math.PI) / mod.oscPeriod;
    // Math.sin — butterchurn frame_eqs are evaluated as JavaScript
    const phaseStr = config.phaseOffset !== 0
      ? `${fmt(angularFreq)}*a.time+${fmt(config.phaseOffset)}`
      : `${fmt(angularFreq)}*a.time`;
    eq += ` + ${fmt(mod.oscAmp)}*Math.sin(${phaseStr})`;
  }

  return eq + ';';
}

function injectAutoBlock(existing: string, autoLines: string[]): string {
  const hasBlock = existing.includes(AUTO_START);

  if (autoLines.length === 0) {
    if (!hasBlock) return existing;
    // Remove the block
    const end = existing.indexOf(AUTO_END);
    if (end === -1) return existing;
    const after = existing.slice(end + AUTO_END.length).replace(/^\n/, '');
    return after;
  }

  const block = [AUTO_START, ...autoLines, AUTO_END].join('\n');

  if (!hasBlock) {
    return existing ? block + '\n' + existing : block;
  }

  // Replace existing block
  const end = existing.indexOf(AUTO_END);
  if (end === -1) return block + '\n' + existing;
  const after = existing.slice(end + AUTO_END.length);
  return block + after;
}

export function generateAnimEquations(
  mods: ModulationMap,
  preset: Record<string, unknown>,
  configs: AnimParamConfig[],
  currentEqStr: string,
): string {
  const autoLines: string[] = [];

  for (const config of configs) {
    const mod = mods[config.key];
    if (!mod) continue;
    const baseVal = typeof preset[config.key] === 'number'
      ? (preset[config.key] as number)
      : 0;
    const eq = buildParamEq(config, mod, baseVal);
    if (eq) autoLines.push(eq);
  }

  return injectAutoBlock(currentEqStr, autoLines);
}
