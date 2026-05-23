export type ParamType = 'float' | 'bool' | 'enum' | 'color-channel' | 'code';
export type ParamGroup = 'motion' | 'wave' | 'color' | 'borders' | 'code';

export interface ParamDef {
  key: string;
  label: string;
  description: string;
  type: ParamType;
  min?: number;
  max?: number;
  step?: number;
  default: number | string;
  group: ParamGroup;
  options?: { value: number; label: string }[];
}

export const PARAM_DEFS: ParamDef[] = [
  // ── Motion ──────────────────────────────────────────────────────────────────
  {
    key: 'zoom', label: 'Zoom', group: 'motion', type: 'float',
    min: 0.5, max: 2.0, step: 0.001, default: 1.0,
    description: 'Base zoom factor per frame. >1.0 = tunnel inward, <1.0 = collapse outward. Values close to 1.02 create a smooth infinite-tunnel effect.',
  },
  {
    key: 'rot', label: 'Rotation', group: 'motion', type: 'float',
    min: -2.0, max: 2.0, step: 0.001, default: 0.0,
    description: 'Rotation speed in radians per frame. Positive = clockwise, negative = counter-clockwise. ~0.01 is a slow spin; ~0.3 is fast.',
  },
  {
    key: 'cx', label: 'Center X', group: 'motion', type: 'float',
    min: 0.0, max: 1.0, step: 0.01, default: 0.5,
    description: 'Horizontal center point for rotation and zoom. 0=left edge, 0.5=center, 1=right edge.',
  },
  {
    key: 'cy', label: 'Center Y', group: 'motion', type: 'float',
    min: 0.0, max: 1.0, step: 0.01, default: 0.5,
    description: 'Vertical center point for rotation and zoom. 0=top, 0.5=center, 1=bottom.',
  },
  {
    key: 'dx', label: 'Drift X', group: 'motion', type: 'float',
    min: -0.5, max: 0.5, step: 0.001, default: 0.0,
    description: 'Horizontal translation drift per frame. Positive = drift right, negative = left. Small values (±0.01) create a slow pan.',
  },
  {
    key: 'dy', label: 'Drift Y', group: 'motion', type: 'float',
    min: -0.5, max: 0.5, step: 0.001, default: 0.0,
    description: 'Vertical translation drift per frame. Positive = drift down, negative = up.',
  },
  {
    key: 'warp', label: 'Warp Amount', group: 'motion', type: 'float',
    min: 0.0, max: 4.0, step: 0.01, default: 1.0,
    description: 'Amplitude of the mesh warp distortion. 0=no warp, 1=default, higher values create more chaotic fluid distortion.',
  },
  {
    key: 'sx', label: 'Stretch X', group: 'motion', type: 'float',
    min: 0.5, max: 2.0, step: 0.01, default: 1.0,
    description: 'Horizontal stretch factor. >1.0 = wider, <1.0 = narrower. Stretches the entire warp field.',
  },
  {
    key: 'sy', label: 'Stretch Y', group: 'motion', type: 'float',
    min: 0.5, max: 2.0, step: 0.01, default: 1.0,
    description: 'Vertical stretch factor. >1.0 = taller, <1.0 = shorter.',
  },
  {
    key: 'fZoomExponent', label: 'Zoom Exponent', group: 'motion', type: 'float',
    min: 0.1, max: 4.0, step: 0.01, default: 1.0,
    description: 'Nonlinearity of zoom falloff from center. 1.0=linear, <1.0 makes center zoom faster (fisheye), >1.0 makes edges zoom faster.',
  },
  {
    key: 'fWarpScale', label: 'Warp Scale', group: 'motion', type: 'float',
    min: 0.001, max: 1.0, step: 0.001, default: 1.0,
    description: 'Spatial frequency of the warp distortion. Higher values = finer, more intricate warp patterns. Lower = large sweeping distortions.',
  },
  {
    key: 'fWarpAnimSpeed', label: 'Warp Speed', group: 'motion', type: 'float',
    min: 0.01, max: 10.0, step: 0.01, default: 1.0,
    description: 'Speed at which the warp pattern evolves over time. 1.0=normal, 0.1=very slow/dreamlike, 5.0=fast and chaotic.',
  },
  {
    key: 'fDecay', label: 'Trail Length (Decay)', group: 'motion', type: 'float',
    min: 0.5, max: 1.0, step: 0.001, default: 0.98,
    description: 'How quickly previous frames fade. 1.0=no fade (permanent trails), 0.98=long trails, 0.9=medium, 0.7=very short. One of the most impactful parameters.',
  },
  {
    key: 'fShader', label: 'Composite Shader', group: 'motion', type: 'float',
    min: 0.0, max: 1.0, step: 0.01, default: 0.0,
    description: 'Blend amount for the composite shader pass. 0=off, 1=full effect. Only relevant if the preset has custom composite shaders defined.',
  },

  // ── Wave ────────────────────────────────────────────────────────────────────
  {
    key: 'nWaveMode', label: 'Wave Style', group: 'wave', type: 'enum', default: 0,
    description: 'Shape and style of the audio waveform overlay drawn on top of the visualization.',
    options: [
      { value: 0, label: '0 — Center line' },
      { value: 1, label: '1 — Blob' },
      { value: 2, label: '2 — Scope (centered)' },
      { value: 3, label: '3 — Radial circles' },
      { value: 4, label: '4 — Star' },
      { value: 5, label: '5 — Horizontal line' },
      { value: 6, label: '6 — Rope / loop' },
      { value: 7, label: '7 — Solid block' },
    ],
  },
  {
    key: 'fWaveAlpha', label: 'Wave Opacity', group: 'wave', type: 'float',
    min: 0, max: 255, step: 1, default: 80,
    description: 'Opacity of the wave overlay. 0=invisible, ~80=semi-transparent, 255=fully opaque.',
  },
  {
    key: 'fWaveScale', label: 'Wave Amplitude', group: 'wave', type: 'float',
    min: 0.01, max: 10.0, step: 0.01, default: 1.0,
    description: 'Height/amplitude of the waveform. 0.01=tiny, 1.0=normal, 5.0=very tall. Scales how much the audio signal drives wave displacement.',
  },
  {
    key: 'fWaveSmoothing', label: 'Wave Smoothing', group: 'wave', type: 'float',
    min: 0.0, max: 0.99, step: 0.01, default: 0.75,
    description: 'Low-pass smoothing on the waveform samples. 0=raw/choppy, 0.75=default smooth, 0.98=very smooth/rounded.',
  },
  {
    key: 'wave_r', label: 'Wave Red', group: 'wave', type: 'color-channel',
    min: 0.0, max: 1.0, step: 0.01, default: 1.0,
    description: 'Red channel of the wave color (0.0–1.0).',
  },
  {
    key: 'wave_g', label: 'Wave Green', group: 'wave', type: 'color-channel',
    min: 0.0, max: 1.0, step: 0.01, default: 1.0,
    description: 'Green channel of the wave color (0.0–1.0).',
  },
  {
    key: 'wave_b', label: 'Wave Blue', group: 'wave', type: 'color-channel',
    min: 0.0, max: 1.0, step: 0.01, default: 1.0,
    description: 'Blue channel of the wave color (0.0–1.0).',
  },
  {
    key: 'wave_x', label: 'Wave Position X', group: 'wave', type: 'float',
    min: 0.0, max: 1.0, step: 0.01, default: 0.5,
    description: 'Horizontal anchor point for the waveform. 0=left edge, 0.5=center, 1=right edge.',
  },
  {
    key: 'wave_y', label: 'Wave Position Y', group: 'wave', type: 'float',
    min: 0.0, max: 1.0, step: 0.01, default: 0.5,
    description: 'Vertical anchor point for the waveform. 0=top, 0.5=center, 1=bottom.',
  },
  {
    key: 'wave_mystery', label: 'Wave Mystery', group: 'wave', type: 'float',
    min: -1.0, max: 1.0, step: 0.01, default: 0.0,
    description: 'An extra wave parameter whose effect depends on the wave mode. In modes 0/5 it shifts the wave vertically; in modes 3/4 it controls radial spread.',
  },
  {
    key: 'bWaveDots', label: 'Wave as Dots', group: 'wave', type: 'bool', default: 0,
    description: 'Render the waveform as individual dots instead of a continuous line.',
  },
  {
    key: 'bWaveThick', label: 'Thick Wave', group: 'wave', type: 'bool', default: 0,
    description: 'Draw the waveform with double line thickness for a bolder appearance.',
  },
  {
    key: 'bAdditiveWaves', label: 'Additive Blend', group: 'wave', type: 'bool', default: 0,
    description: 'Use additive blending for the wave — creates a glowing/neon appearance instead of normal overdraw.',
  },
  {
    key: 'bModWaveAlphaByVolume', label: 'Volume-fade Wave', group: 'wave', type: 'bool', default: 0,
    description: 'Fade wave opacity proportionally to audio volume. Wave disappears during silence.',
  },
  {
    key: 'bMaximizeWaveColor', label: 'Maximize Color', group: 'wave', type: 'bool', default: 0,
    description: 'Force the wave color to maximum brightness regardless of the RGB values set.',
  },

  // ── Color/FX ────────────────────────────────────────────────────────────────
  {
    key: 'fGammaAdj', label: 'Gamma / Brightness', group: 'color', type: 'float',
    min: 0.5, max: 4.0, step: 0.01, default: 1.0,
    description: 'Overall brightness gamma multiplier. 1.0=normal, 2.0=much brighter, 0.5=dimmer. Affects the entire rendered frame.',
  },
  {
    key: 'fVideoEchoZoom', label: 'Echo Zoom', group: 'color', type: 'float',
    min: 1.0, max: 2.0, step: 0.01, default: 1.0,
    description: 'Zoom factor of the video feedback echo layer. 1.0=same size, 1.5=50% larger echo. Only visible when Echo Alpha > 0.',
  },
  {
    key: 'fVideoEchoAlpha', label: 'Echo Alpha', group: 'color', type: 'float',
    min: 0.0, max: 1.0, step: 0.01, default: 0.0,
    description: 'Opacity of the video feedback echo layer. 0=off, 0.5=ghost double image, 1.0=fully visible. Creates a ghosting/mirroring effect.',
  },
  {
    key: 'nVideoEchoOrientation', label: 'Echo Flip', group: 'color', type: 'enum', default: 0,
    description: 'How the echo layer is flipped/mirrored before compositing.',
    options: [
      { value: 0, label: '0 — Normal' },
      { value: 1, label: '1 — Flip horizontal' },
      { value: 2, label: '2 — Flip vertical' },
      { value: 3, label: '3 — Flip both (180°)' },
    ],
  },
  {
    key: 'bTexWrap', label: 'Texture Wrap', group: 'color', type: 'bool', default: 0,
    description: 'Enable texture wrapping at screen edges — content that scrolls off one side reappears on the other, creating a tiling effect.',
  },
  {
    key: 'bDarkenCenter', label: 'Darken Center', group: 'color', type: 'bool', default: 0,
    description: 'Apply a small darkening circle at the center each frame. Gradually creates a vignette tunnel effect over time.',
  },
  {
    key: 'bRedBlueStereo', label: 'Red/Blue Stereo', group: 'color', type: 'bool', default: 0,
    description: 'Apply a red/blue anaglyph stereo 3D split effect. Requires red-cyan 3D glasses for the full effect.',
  },
  {
    key: 'bBrighten', label: 'Brighten', group: 'color', type: 'bool', default: 0,
    description: 'Apply a brightening post-process filter to the entire frame.',
  },
  {
    key: 'bDarken', label: 'Darken', group: 'color', type: 'bool', default: 0,
    description: 'Apply a darkening post-process filter to the entire frame.',
  },
  {
    key: 'bSolarize', label: 'Solarize', group: 'color', type: 'bool', default: 0,
    description: 'Apply a solarize effect (inverts bright pixels) — creates a psychedelic film-negative look.',
  },
  {
    key: 'bInvert', label: 'Invert Colors', group: 'color', type: 'bool', default: 0,
    description: 'Invert all colors in the frame (negative image). Black becomes white, etc.',
  },

  // ── Borders ─────────────────────────────────────────────────────────────────
  {
    key: 'ob_size', label: 'Outer Border Width', group: 'borders', type: 'float',
    min: 0.0, max: 0.5, step: 0.001, default: 0.0,
    description: 'Thickness of the outer border as a fraction of screen size. 0=none, 0.1=10% of screen.',
  },
  {
    key: 'ob_r', label: 'Outer Border Red', group: 'borders', type: 'color-channel',
    min: 0.0, max: 1.0, step: 0.01, default: 0.0,
    description: 'Red channel of the outer border color.',
  },
  {
    key: 'ob_g', label: 'Outer Border Green', group: 'borders', type: 'color-channel',
    min: 0.0, max: 1.0, step: 0.01, default: 0.0,
    description: 'Green channel of the outer border color.',
  },
  {
    key: 'ob_b', label: 'Outer Border Blue', group: 'borders', type: 'color-channel',
    min: 0.0, max: 1.0, step: 0.01, default: 0.0,
    description: 'Blue channel of the outer border color.',
  },
  {
    key: 'ob_a', label: 'Outer Border Alpha', group: 'borders', type: 'float',
    min: 0.0, max: 1.0, step: 0.01, default: 0.0,
    description: 'Opacity of the outer border. 0=transparent, 1=fully opaque.',
  },
  {
    key: 'ib_size', label: 'Inner Border Width', group: 'borders', type: 'float',
    min: 0.0, max: 0.5, step: 0.001, default: 0.0,
    description: 'Thickness of the inner border (drawn just inside the outer border).',
  },
  {
    key: 'ib_r', label: 'Inner Border Red', group: 'borders', type: 'color-channel',
    min: 0.0, max: 1.0, step: 0.01, default: 0.0,
    description: 'Red channel of the inner border color.',
  },
  {
    key: 'ib_g', label: 'Inner Border Green', group: 'borders', type: 'color-channel',
    min: 0.0, max: 1.0, step: 0.01, default: 0.0,
    description: 'Green channel of the inner border color.',
  },
  {
    key: 'ib_b', label: 'Inner Border Blue', group: 'borders', type: 'color-channel',
    min: 0.0, max: 1.0, step: 0.01, default: 0.0,
    description: 'Blue channel of the inner border color.',
  },
  {
    key: 'ib_a', label: 'Inner Border Alpha', group: 'borders', type: 'float',
    min: 0.0, max: 1.0, step: 0.01, default: 0.0,
    description: 'Opacity of the inner border. 0=transparent, 1=fully opaque.',
  },

  // ── Code ────────────────────────────────────────────────────────────────────
  {
    key: 'per_frame_init_eqs_str', label: 'Init Equations', group: 'code', type: 'code', default: '',
    description: 'Runs once when the preset loads. Initialize q1–q32 and custom variables here.',
  },
  {
    key: 'per_frame_eqs_str', label: 'Per-Frame Equations', group: 'code', type: 'code', default: '',
    description: 'Runs every frame. Slider values appear as simple assignments — edit them or replace with expressions. Audio: a.bass_att, a.mid_att, a.treb_att. Time: a.time, a.fps. Motion: a.zoom, a.rot, a.decay, a.warp, a.dx, a.dy.',
  },
  {
    key: 'per_pixel_eqs_str', label: 'Per-Vertex Equations', group: 'code', type: 'code', default: '',
    description: 'Runs per mesh vertex. Variables: x, y (0–1), rad, ang (polar). Can override zoom, rot, warp, dx, dy per vertex.',
  },
  {
    key: 'warp_str', label: 'Warp Shader (GLSL)', group: 'code', type: 'code', default: '',
    description: 'Per-pixel GLSL shader for the warp pass. Inputs: uv, uv_orig (vec2), rad, ang (float). Blur access: GetBlur1/2/3(uv). Output: ret (vec4). q1–q32 available from per-frame equations.',
  },
  {
    key: 'comp_str', label: 'Composite Shader (GLSL)', group: 'code', type: 'code', default: '',
    description: 'Per-pixel GLSL shader for the final composite pass. Inputs: uv (vec2), rad, ang, hue_shader (vec3). Output: ret (vec4). q1–q32 available from per-frame equations.',
  },
];

export const PARAM_BY_KEY: Record<string, ParamDef> = Object.fromEntries(
  PARAM_DEFS.map(p => [p.key, p])
);

export const PARAMS_BY_GROUP: Record<ParamGroup, ParamDef[]> = {
  motion: PARAM_DEFS.filter(p => p.group === 'motion'),
  wave: PARAM_DEFS.filter(p => p.group === 'wave'),
  color: PARAM_DEFS.filter(p => p.group === 'color'),
  borders: PARAM_DEFS.filter(p => p.group === 'borders'),
  code: PARAM_DEFS.filter(p => p.group === 'code'),
};
