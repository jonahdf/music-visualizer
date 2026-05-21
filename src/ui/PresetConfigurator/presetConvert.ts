import { PARAM_BY_KEY } from './parameterDefs';
import { DEFAULT_PRESET } from './defaultPreset';

// Maps configurator param keys to butterchurn's baseVals keys
const TO_BC: Record<string, string> = {
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

const FROM_BC: Record<string, string> = Object.fromEntries(
  Object.entries(TO_BC).map(([a, b]) => [b, a]),
);

const EMPTY_UNIT = { baseVals: { enabled: 0 } };

export function toButterchurnPreset(params: Record<string, unknown>): object {
  const baseVals: Record<string, unknown> = {};
  let init_eqs_str = '';
  let frame_eqs_str = '';
  let pixel_eqs_str = '';

  for (const [k, v] of Object.entries(params)) {
    if (k === 'per_frame_init_eqs_str') init_eqs_str = String(v ?? '');
    else if (k === 'per_frame_eqs_str') frame_eqs_str = String(v ?? '');
    else if (k === 'per_pixel_eqs_str') pixel_eqs_str = String(v ?? '');
    else baseVals[TO_BC[k] ?? k] = v;
  }

  return {
    baseVals,
    waves: [EMPTY_UNIT, EMPTY_UNIT, EMPTY_UNIT, EMPTY_UNIT],
    shapes: [EMPTY_UNIT, EMPTY_UNIT, EMPTY_UNIT, EMPTY_UNIT],
    init_eqs_str,
    frame_eqs_str,
    pixel_eqs_str,
    warp: '',
    comp: '',
  };
}

export function fromButterchurnPreset(presetData: object): Record<string, unknown> {
  const data = presetData as Record<string, unknown>;
  const baseVals = (data.baseVals as Record<string, unknown>) ?? {};

  const flat: Record<string, unknown> = { ...DEFAULT_PRESET };

  for (const [k, v] of Object.entries(baseVals)) {
    const ourKey = FROM_BC[k] ?? k;
    if (PARAM_BY_KEY[ourKey] !== undefined) flat[ourKey] = v;
  }

  flat.per_frame_init_eqs_str = String(data.init_eqs_str ?? '');
  flat.per_frame_eqs_str = String(data.frame_eqs_str ?? '');
  flat.per_pixel_eqs_str = String(data.pixel_eqs_str ?? '');

  return flat;
}
