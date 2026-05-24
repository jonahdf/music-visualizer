export interface WaveState {
  enabled: boolean;
  baseVals: Record<string, number>;
  init_eqs_str: string;
  frame_eqs_str: string;
  per_point_eqs_str: string;
}

export const DEFAULT_WAVE_BASE_VALS: Record<string, number> = {
  enabled: 0,
  r: 1, g: 1, b: 1, a: 1,
  x: 0.5, y: 0.5,
  mystery: 0,
  mode: 0,
  dots: 0,
  thick: 0,
  additive: 0,
  spectrum: 0,
  usedots: 0,
  scaling: 1,
  smoothing: 0.5,
  sep: 0,
};

export function defaultWave(): WaveState {
  return {
    enabled: false,
    baseVals: { ...DEFAULT_WAVE_BASE_VALS },
    init_eqs_str: '',
    frame_eqs_str: '',
    per_point_eqs_str: '',
  };
}

export function defaultWaves(): WaveState[] {
  return [defaultWave(), defaultWave(), defaultWave(), defaultWave()];
}

export function waveFromBc(waveBc: unknown): WaveState {
  const w = (waveBc as Record<string, unknown>) ?? {};
  const bv = (w.baseVals as Record<string, number>) ?? {};
  return {
    enabled: (bv.enabled ?? 0) !== 0,
    baseVals: { ...DEFAULT_WAVE_BASE_VALS, ...bv },
    init_eqs_str: String(w.init_eqs_str ?? ''),
    frame_eqs_str: String(w.frame_eqs_str ?? ''),
    per_point_eqs_str: String(w.per_point_eqs_str ?? ''),
  };
}

export function waveToBc(wave: WaveState): object {
  return {
    baseVals: { ...wave.baseVals, enabled: wave.enabled ? 1 : 0 },
    init_eqs_str: wave.init_eqs_str,
    frame_eqs_str: wave.frame_eqs_str,
    per_point_eqs_str: wave.per_point_eqs_str,
  };
}
