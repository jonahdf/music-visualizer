export type AudioBand = 'none' | 'bass' | 'mid' | 'treb';

// Maps to the smoothed/attenuated versions butterchurn exposes in per-frame code
export const AUDIO_VAR: Record<AudioBand, string | null> = {
  none: null,
  bass: 'bass_att',
  mid: 'mid_att',
  treb: 'treb_att',
};

export interface ParamModulation {
  audioBand: AudioBand;
  audioAmount: number;
  oscAmp: number;
  oscPeriod: number; // seconds
}

export type ModulationMap = Record<string, ParamModulation>;

export interface AnimParamConfig {
  key: string;
  label: string;
  audioRange: number; // max abs value for audio amount slider
  oscAmpMax: number;  // max oscillation amplitude
  phaseOffset: number; // built-in phase offset so params don't all peak together
}

export const ANIM_PARAM_CONFIGS: AnimParamConfig[] = [
  { key: 'zoom',    label: 'Zoom',       audioRange: 0.20, oscAmpMax: 0.15, phaseOffset: 0.000 },
  { key: 'rot',     label: 'Rotation',   audioRange: 0.05, oscAmpMax: 0.03, phaseOffset: 1.047 },
  { key: 'dx',      label: 'X Drift',    audioRange: 0.08, oscAmpMax: 0.06, phaseOffset: 2.094 },
  { key: 'dy',      label: 'Y Drift',    audioRange: 0.08, oscAmpMax: 0.06, phaseOffset: 3.142 },
  { key: 'warp',    label: 'Warp Amount', audioRange: 1.00, oscAmpMax: 0.80, phaseOffset: 4.189 },
  { key: 'fDecay',  label: 'Decay',      audioRange: 0.05, oscAmpMax: 0.03, phaseOffset: 5.236 },
  { key: 'wave_r',  label: 'Wave Red',   audioRange: 0.50, oscAmpMax: 0.45, phaseOffset: 0.000 },
  { key: 'wave_g',  label: 'Wave Green', audioRange: 0.50, oscAmpMax: 0.45, phaseOffset: 2.094 },
  { key: 'wave_b',  label: 'Wave Blue',  audioRange: 0.50, oscAmpMax: 0.45, phaseOffset: 4.189 },
];

export const DEFAULT_MODULATION: ParamModulation = {
  audioBand: 'none',
  audioAmount: 0,
  oscAmp: 0,
  oscPeriod: 4,
};

export function defaultModulationMap(): ModulationMap {
  const map: ModulationMap = {};
  for (const cfg of ANIM_PARAM_CONFIGS) {
    map[cfg.key] = { ...DEFAULT_MODULATION };
  }
  return map;
}

// Initial modulations for new presets — zoom reacts to bass, warp reacts to mid.
// These mirror what DEFAULT_PRESET's base values are tuned for (zoom=1.005, warp=0.5).
export function defaultPresetModulations(): ModulationMap {
  const map = defaultModulationMap();
  map['zoom'] = { audioBand: 'bass', audioAmount: 0.02, oscAmp: 0, oscPeriod: 4 };
  map['warp'] = { audioBand: 'mid', audioAmount: 0.3, oscAmp: 0, oscPeriod: 4 };
  return map;
}
