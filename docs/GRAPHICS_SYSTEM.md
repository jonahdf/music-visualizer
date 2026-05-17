# Graphics Settings System

## Overview

The music visualizer now features a comprehensive, granular graphics settings system. Each visual aspect can be tweaked individually, while preset buttons provide quick access to curated configurations for common use cases.

## Key Components

### Presets (Quick Access)

Four quality presets are available:
- **Low** — Optimized for old laptops and low-end hardware
- **Medium** — Recommended for most systems (default)
- **High** — High-quality visuals for modern laptops
- **Ultra** — Maximum visual fidelity and performance for desktops

Clicking a preset applies all its settings at once.

### Individual Settings

All 14 settings can be adjusted independently via sliders:

| Category | Settings | Range | Default (Medium) |
|---|---|---|---|
| **Rendering** | Resolution Scale | 0.25–1.0 | 0.75 |
| | FPS Cap | 0–240 | 60 |
| **Audio Analysis** | FFT Size | 256–4096 | 1024 |
| | FFT Smoothing | 0.7–0.95 | 0.8 |
| **Mesh & Waveform** | Mesh Width | 12–64 | 32 |
| | Mesh Height | 9–48 | 24 |
| | Waveform Intensity | 0–2.0 | 1.0 |
| | Waveform Scale | 0.5–2.0 | 1.2 |
| **Reactivity** | Response Speed | 0.75–0.99 | 0.9 |
| | Decay Speed | 0.7–0.95 | 0.85 |
| | Bass Boost | 0.5–2.0 | 1.2 |
| **Particles** | Particle Life | 50–500 ms | 150 |
| | Particle Emission | 10–150 | 30 |

### Descriptions

Each setting has a tooltip (?) button that explains:
- What the setting controls
- How it affects the visualization
- Suggested ranges for different use cases

## File Structure

```
src/types/index.ts
├── GraphicsSettings interface (all 14 settings)
├── GRAPHICS_PRESETS (4 presets: low, medium, high, ultra)
└── SETTINGS_DESCRIPTIONS (explanations for each setting)

src/ui/GraphicsPanel/index.tsx
├── SettingSlider component (reusable slider with description)
└── Graphics panel layout and state management

src/App.tsx
├── graphicsSettings state
├── handleSettingsChange callback
└── Integration with Menu and Renderer
```

## How It Works

1. **User selects a preset** → All 14 settings are applied at once
2. **User adjusts an individual slider** → Only that setting changes; quality level is no longer bound
3. **Renderer updates** → ButterchurnRenderer and AudioEngine respond to new settings

### State Management

- **App.tsx** owns the `graphicsSettings` state
- **handleSettingsChange** updates both state and renderer
- **GraphicsPanel** reads settings and calls `onSettingsChange` when sliders move
- **Menu** passes props through to GraphicsPanel

## Rendering Pipeline

```
GraphicsSettings (App state)
       ↓
handleSettingsChange()
       ↓
┌─────────────────┬──────────────────┐
↓                 ↓
ButterchurnRenderer.updateQuality()   AudioEngine.updateQuality()
(applies mesh, resolution, etc.)      (applies FFT size, smoothing, etc.)
```

## Adding New Settings

To add a new setting:

1. Add it to `GraphicsSettings` interface (src/types/index.ts)
2. Add a value to each preset in `GRAPHICS_PRESETS`
3. Add a description to `SETTINGS_DESCRIPTIONS`
4. Add a `SettingSlider` in GraphicsPanel
5. Handle the setting in `handleSettingsChange` (App.tsx)
6. Pass it to renderer/audio engine if needed

## Testing Presets

To test a preset:

1. Open the visualizer and connect an audio source
2. Click **Graphics** tab
3. Click a preset button to apply it
4. Play music and observe the visual response
5. Adjust individual sliders to fine-tune

## Future Enhancements

- [ ] Save custom presets to browser storage
- [ ] Export/import presets as JSON files
- [ ] Preset naming and organization
- [ ] A/B comparison between presets
- [ ] Real-time histogram of audio frequencies
- [ ] Recording preset changes as a "score" that plays back with music

## Documentation

- **[PRESET_GUIDE.md](./PRESET_GUIDE.md)** — User guide for creating custom presets
- **[PRESET_AI_GUIDE.md](./PRESET_AI_GUIDE.md)** — AI agent guide for generating presets from descriptions

## Types

```typescript
interface GraphicsSettings {
  resolutionScale: number;   // 0.25–1.0
  fpsCap: number;             // 0–240
  fftSize: number;            // 256, 512, 1024, 2048, 4096
  fftSmoothing: number;       // 0.7–0.95
  meshWidth: number;          // 12–64
  meshHeight: number;         // 9–48
  waveformIntensity: number;  // 0–2.0
  waveformScale: number;      // 0.5–2.0
  reactivityRespond: number;  // 0.75–0.99
  reactivityDecay: number;    // 0.7–0.95
  reactivityLineBoost: number;// 0.5–2.0
  blendMode: 'normal' | 'additive' | 'multiply';
  particleLife: number;       // 50–500 ms
  particleEmission: number;   // 10–150
}
```

## Component API

### GraphicsPanel Props

```typescript
interface Props {
  quality: QualityLevel;
  fps: number;
  blendTime: number;
  settings: GraphicsSettings;
  onQualityChange: (q: QualityLevel) => void;
  onSettingsChange: (s: Partial<GraphicsSettings>) => void;
  onBlendTimeChange: (t: number) => void;
}
```

### SettingSlider Props

```typescript
interface SettingSliderProps {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  isRecommended?: boolean;
}
```

## Performance Considerations

- **Higher resolution scale** → More pixels to render, higher GPU load
- **Larger FFT size** → More frequency analysis, slightly slower audio processing
- **Larger mesh** → More vertices to warp, higher GPU cost
- **More particles** → More draw calls, higher GPU load
- **Higher FPS cap** → More power draw, more heat generation

## Common Configurations

See [PRESET_GUIDE.md](./PRESET_GUIDE.md) for genre-specific presets and troubleshooting.
