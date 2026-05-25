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

  // Mesh
  meshWidth: number;
  meshHeight: number;
}

export const GRAPHICS_PRESETS: Record<QualityLevel, GraphicsSettings> = {
  low: {
    resolutionScale: 0.5,
    fpsCap: 30,
    fftSize: 512,
    fftSmoothing: 0.85,
    meshWidth: 24,
    meshHeight: 18,
  },
  medium: {
    resolutionScale: 0.75,
    fpsCap: 60,
    fftSize: 1024,
    fftSmoothing: 0.8,
    meshWidth: 32,
    meshHeight: 24,
  },
  high: {
    resolutionScale: 1.0,
    fpsCap: 60,
    fftSize: 2048,
    fftSmoothing: 0.75,
    meshWidth: 48,
    meshHeight: 36,
  },
  ultra: {
    resolutionScale: 1.0,
    fpsCap: 0,
    fftSize: 4096,
    fftSmoothing: 0.7,
    meshWidth: 64,
    meshHeight: 48,
  },
};

export const SETTINGS_DESCRIPTIONS: Record<keyof GraphicsSettings, string> = {
  resolutionScale: 'Canvas resolution as % of window size. Lower values reduce GPU load. 0.5 = 50% resolution.',
  fpsCap: 'Maximum render frames per second. 0 = unlimited (variable). Cap reduces power usage and heat.',
  fftSize: 'Audio frequency analysis bins. Higher = more detail in bass, lower = faster response. 512-4096.',
  fftSmoothing: 'Exponential averaging of frequency data. Higher = smoother but slower response (0.7-0.95).',
  meshWidth: 'Warp mesh columns. Higher = finer detail in distortion waves but more GPU cost.',
  meshHeight: 'Warp mesh rows. Higher = finer vertical detail in distortion.',
};

export type QualitySettings = GraphicsSettings;

export interface SavedPreset {
  id: string;
  name: string;
  source: 'builtin' | 'uploaded' | 'custom';
  data: object;
  createdAt: number;
}
