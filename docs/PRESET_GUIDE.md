# Custom Preset Creation Guide

A preset in the music visualizer is a configuration that controls how the visual effects respond to and display audio. This guide explains how to create your own presets by tweaking individual graphics settings.

## Understanding Presets

A preset is a JSON object that contains settings for:
- **Rendering performance** — resolution, frame rate limits
- **Audio analysis** — how audio frequency data is processed
- **Mesh and waveform** — distortion grid density and waveform appearance
- **Reactivity** — how quickly visuals respond to audio changes
- **Visual effects** — particles and blending modes

## Quick Start: Modify a Built-in Preset

The easiest way to create a custom preset is to start with an existing one and tweak individual settings:

1. **Open the Graphics menu** in the visualizer (Settings → Graphics tab)
2. **Select a preset** as your starting point (e.g., "Medium" for a balanced foundation)
3. **Adjust individual sliders** to customize the behavior:
   - Hover the **?** icon next to each setting to see what it does
   - Experiment and watch how the visualizer responds to music
4. **Save your settings** to the browser's local storage (coming in a future release)

## Individual Settings Reference

### Rendering Settings

#### Resolution Scale (0.25–1.0)
- **Controls:** Canvas pixel dimensions as a percentage of your window
- **Lower values (0.25–0.5):** Reduces GPU load; good for older hardware
- **Higher values (0.75–1.0):** Sharper image but higher power consumption
- **Recommendation:** Start with 0.75 for laptops; increase to 1.0 if your GPU can handle it

#### FPS Cap (0–240)
- **Controls:** Maximum render frames per second
- **0 = Unlimited:** Variable frame rate, highest visual smoothness but more heat/power
- **60:** Common target for balanced performance
- **30:** Reduces power usage; good for battery-powered devices
- **Recommendation:** 60 for most systems; 30 for laptops, 0 for high-end desktops

### Audio Analysis Settings

#### FFT Size (256–4096)
- **Controls:** Number of frequency bins for audio analysis
- **Smaller (256–512):** Faster response, but less bass detail
- **Larger (2048–4096):** More detail across all frequencies, but slower response
- **Common values:**
  - 512: Fast, snappy response (good for rhythmic music)
  - 1024: Balanced (good for general use)
  - 2048: Detailed bass response (good for electronic/EDM)
  - 4096: Maximum detail (CPU-intensive)
- **Recommendation:** 1024 for most music; increase to 2048 for bass-heavy genres

#### FFT Smoothing (0.7–0.95)
- **Controls:** How much the frequency data is smoothed/averaged over time
- **Higher values (0.9–0.95):** Smoother animations, less jittery
- **Lower values (0.7–0.8):** Snappier response, more reactive
- **Formula:** `new_fft = (old_fft * smoothing) + (incoming_data * (1 - smoothing))`
- **Recommendation:** 0.8 for responsive feel; 0.9 for smooth, flowing motion

### Mesh & Waveform Settings

#### Mesh Width / Mesh Height (12–64 / 9–48)
- **Controls:** Grid density for distortion effects
- **Lower values:** Fewer mesh lines = less detail but faster rendering
- **Higher values:** More mesh lines = finer distortion detail but more GPU cost
- **Ratio tip:** Keep aspect ratio close to your window (e.g., 48×36 for 16:9)
- **Recommendation:** 32×24 for balanced visual detail and performance

#### Waveform Intensity (0–2.0)
- **Controls:** Amplitude (height) of the audio waveform overlay
- **0:** No waveform visible
- **1.0:** Default prominence
- **2.0:** Very large, dominant waveform
- **Recommendation:** 1.0 for balanced look; increase for bass-heavy music to see low-freq details

#### Waveform Scale (0.5–2.0)
- **Controls:** Horizontal spacing/zoom of waveform points
- **Lower values (0.5–1.0):** Tightly spaced, detailed waveform
- **Higher values (1.4–2.0):** Zoomed-out, smoother curves
- **Recommendation:** 1.2 for a smooth but detailed appearance

### Reactivity Settings

#### Response Speed (0.75–0.99)
- **Controls:** How quickly the visualizer reacts to audio peaks
- **Higher values (0.95–0.99):** Snappy, immediate response to hits
- **Lower values (0.75–0.85):** Delayed, smoother transitions
- **Example:** At 0.95, the visualizer responds immediately to a kick drum
- **Recommendation:** 0.9 for tight, responsive feel

#### Decay Speed (0.7–0.95)
- **Controls:** How fast effects fade when audio drops
- **Higher values (0.9–0.95):** Fast fade, minimal trailing glow
- **Lower values (0.7–0.8):** Slow fade, long trailing effects
- **Analogy:** Like reverb decay in audio — higher = dry, lower = wet/ambient
- **Recommendation:** 0.85 for a balanced, natural look

#### Bass Boost (0.5–2.0)
- **Controls:** How much the low frequencies amplify the waveform response
- **1.0:** Normal bass sensitivity
- **0.5:** Bass frequencies have less effect
- **2.0:** Bass frequencies create twice the visual intensity
- **Use case:** Increase to 1.4–1.6 for music with prominent bass (electronic, hip-hop)
- **Recommendation:** 1.2 for most music

### Particles & Effects

#### Particle Life (50–500 ms)
- **Controls:** How long particles remain visible before fading
- **50 ms:** Very brief, sharp look
- **150 ms:** Balanced trails and glow
- **300+ ms:** Long, smooth trails
- **Recommendation:** 150 for most music; up to 250 for smooth, flowing visuals

#### Particle Emission (10–150)
- **Controls:** How many particles spawn per frame
- **Lower values (10–30):** Sparse, clean look
- **Medium values (30–50):** Rich, balanced look
- **Higher values (80+):** Thick, overwhelming particle clouds
- **Recommendation:** 30 for balanced density

## Creating a Preset for a Specific Genre

### Bass-Heavy Music (EDM, Hip-Hop, Dubstep)
```
Resolution Scale: 1.0 (show every detail)
FFT Size: 2048 (resolve bass frequencies)
FFT Smoothing: 0.8 (responsive to drops)
Mesh Width/Height: 48×36 (fine detail)
Waveform Intensity: 1.4 (emphasize bass lines)
Waveform Scale: 1.2
Response Speed: 0.85 (snappy, punchy)
Decay Speed: 0.9 (quick fade for stabs)
Bass Boost: 1.6 (bass-forward)
Particle Life: 200 ms (trails for energy)
Particle Emission: 50 (rich effects)
```

### Acoustic/Vocal Music
```
Resolution Scale: 0.75 (adequate detail, lighter load)
FFT Size: 1024 (balanced frequency detail)
FFT Smoothing: 0.85 (smooth, less jittery)
Mesh Width/Height: 32×24 (moderate detail)
Waveform Intensity: 0.9 (subtle waveform)
Waveform Scale: 1.4 (spread-out curves)
Response Speed: 0.9 (responsive but not aggressive)
Decay Speed: 0.8 (longer fade for ambient feel)
Bass Boost: 1.0 (neutral)
Particle Life: 150 ms
Particle Emission: 25 (lighter, cleaner)
```

### Synthwave/Retrowave
```
Resolution Scale: 1.0 (crisp)
FFT Size: 512 (fast, snappy response)
FFT Smoothing: 0.75 (reactive, less smoothing)
Mesh Width/Height: 32×24
Waveform Intensity: 1.3 (prominent waveform)
Waveform Scale: 1.0 (compact, precise)
Response Speed: 0.95 (immediate reaction)
Decay Speed: 0.9 (quick decay for sharp look)
Bass Boost: 1.3 (emphasize the groove)
Particle Life: 100 ms (crisp trails)
Particle Emission: 40 (visible but not overwhelming)
```

### Ambient/Chill Music
```
Resolution Scale: 0.75 (performance)
FFT Size: 2048 (detailed, slow response)
FFT Smoothing: 0.92 (very smooth)
Mesh Width/Height: 24×18 (simple grid)
Waveform Intensity: 0.6 (subtle)
Waveform Scale: 1.6 (gentle, spread-out)
Response Speed: 0.8 (slow, dreamy)
Decay Speed: 0.75 (long trailing effects)
Bass Boost: 0.9 (neutral)
Particle Life: 300 ms (long ambient trails)
Particle Emission: 15 (minimal, sparse)
```

## Preset JSON Format

For advanced users, presets can be shared as JSON objects:

```json
{
  "resolutionScale": 1.0,
  "fpsCap": 60,
  "fftSize": 1024,
  "fftSmoothing": 0.8,
  "meshWidth": 32,
  "meshHeight": 24,
  "waveformIntensity": 1.0,
  "waveformScale": 1.2,
  "reactivityRespond": 0.9,
  "reactivityDecay": 0.85,
  "reactivityLineBoost": 1.2,
  "blendMode": "normal",
  "particleLife": 150,
  "particleEmission": 30
}
```

To share a preset, copy this JSON and send it to a friend. They can paste it into their preset file (future feature) or manually set each slider.

## Experimental Settings to Try

- **Extreme bass boost** (2.0): Make a "bass detector" preset for detecting low-frequency presence
- **Low FFT smoothing** (0.7) + **high response speed** (0.99): Ultra-reactive, twitchy effect
- **High particle emission** (150) + **long particle life** (500): Dense, accumulating particle clouds
- **Minimal mesh** (12×9) + **high resolution** (1.0): Clean, simple lines with sharp rendering

## Troubleshooting

**Visualizer is choppy/stuttering:**
- Lower resolution scale to 0.5 or 0.75
- Lower mesh width/height
- Reduce particle emission
- Cap FPS at 30–60

**Waveform doesn't react to music:**
- Increase FFT size to 2048
- Lower FFT smoothing to 0.75
- Increase response speed to 0.95

**Visualizer looks dull:**
- Increase waveform intensity to 1.4–1.6
- Increase bass boost to 1.4–1.6
- Increase particle emission to 50+
- Lower decay speed to 0.8 for longer glows

**Takes too long to load presets:**
- FFT sizes above 2048 can slow audio initialization
- Try 1024 or 2048 instead of 4096

---

**Next Step:** Use the [AI-Assisted Preset Generation Guide](./PRESET_AI_GUIDE.md) if you want an AI agent to help you create a preset based on a text description.
