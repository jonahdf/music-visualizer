export type AudioSourceType = 'mic' | 'file' | 'tab' | 'library';

export interface SampleTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  url: string;
}

export interface AudioSourceState {
  type: AudioSourceType;
  active: boolean;
  label: string;
}

export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

export interface GraphicsSettings {
  // Rendering
  resolutionScale: number;
  fpsCap: number;

  // Audio analysis
  fftSize: number;
  fftSmoothing: number;

  // Mesh & waveform
  meshWidth: number;
  meshHeight: number;
  waveformIntensity: number;
  waveformScale: number;

  // Reactivity & responsiveness
  reactivityRespond: number;
  reactivityDecay: number;
  reactivityLineBoost: number;

  // Visual effects
  blendMode: 'normal' | 'additive' | 'multiply';
  particleLife: number;
  particleEmission: number;
}

export const GRAPHICS_PRESETS: Record<QualityLevel, GraphicsSettings> = {
  low: {
    resolutionScale: 0.5,
    fpsCap: 30,
    fftSize: 512,
    fftSmoothing: 0.85,
    meshWidth: 24,
    meshHeight: 18,
    waveformIntensity: 0.8,
    waveformScale: 1.0,
    reactivityRespond: 0.95,
    reactivityDecay: 0.9,
    reactivityLineBoost: 1.0,
    blendMode: 'normal',
    particleLife: 100,
    particleEmission: 20,
  },
  medium: {
    resolutionScale: 0.75,
    fpsCap: 60,
    fftSize: 1024,
    fftSmoothing: 0.8,
    meshWidth: 32,
    meshHeight: 24,
    waveformIntensity: 1.0,
    waveformScale: 1.2,
    reactivityRespond: 0.9,
    reactivityDecay: 0.85,
    reactivityLineBoost: 1.2,
    blendMode: 'normal',
    particleLife: 150,
    particleEmission: 30,
  },
  high: {
    resolutionScale: 1.0,
    fpsCap: 60,
    fftSize: 2048,
    fftSmoothing: 0.75,
    meshWidth: 48,
    meshHeight: 36,
    waveformIntensity: 1.2,
    waveformScale: 1.4,
    reactivityRespond: 0.85,
    reactivityDecay: 0.8,
    reactivityLineBoost: 1.4,
    blendMode: 'normal',
    particleLife: 200,
    particleEmission: 50,
  },
  ultra: {
    resolutionScale: 1.0,
    fpsCap: 0,
    fftSize: 4096,
    fftSmoothing: 0.7,
    meshWidth: 64,
    meshHeight: 48,
    waveformIntensity: 1.4,
    waveformScale: 1.6,
    reactivityRespond: 0.8,
    reactivityDecay: 0.75,
    reactivityLineBoost: 1.6,
    blendMode: 'additive',
    particleLife: 300,
    particleEmission: 80,
  },
};

export const SETTINGS_DESCRIPTIONS: Record<keyof Omit<GraphicsSettings, 'blendMode'>, string> = {
  resolutionScale: 'Canvas resolution as % of window size. Lower values reduce GPU load. 0.5 = 50% resolution.',
  fpsCap: 'Maximum render frames per second. 0 = unlimited (variable). Cap reduces power usage and heat.',
  fftSize: 'Audio frequency analysis bins. Higher = more detail in bass, lower = faster response. 512-4096.',
  fftSmoothing: 'Exponential averaging of frequency data. Higher = smoother but slower response (0.7-0.95).',
  meshWidth: 'Warp mesh columns. Higher = finer detail in distortion waves but more GPU cost.',
  meshHeight: 'Warp mesh rows. Higher = finer vertical detail in distortion.',
  waveformIntensity: 'Amplitude of the waveform overlay. Controls how prominent the audio wave appears.',
  waveformScale: 'Horizontal scaling of waveform points. Higher = wider spacing, more "zoomed out" appearance.',
  reactivityRespond: 'Speed of color/waveform response to audio changes. Higher (0.9+) = snappier, lower = delayed.',
  reactivityDecay: 'Fade speed of reactions when audio drops. Higher = faster fade, lower = longer glow/trail.',
  reactivityLineBoost: 'Intensity multiplier for waveform response to bass frequencies.',
  particleLife: 'Duration particles remain visible in milliseconds. Higher = longer trails, lower = more crisp.',
  particleEmission: 'Number of particles spawned per frame. Higher = richer effects, lower = cleaner look.',
};

export type QualitySettings = GraphicsSettings;

export interface SavedPreset {
  id: string;
  name: string;
  source: 'builtin' | 'uploaded' | 'custom';
  data: object;
  createdAt: number;
}
