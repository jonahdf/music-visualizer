# AI-Assisted Preset Generation Guide

This guide is designed to help AI agents generate custom presets for the music visualizer based on natural language descriptions. Use this guide when you want to create a preset but aren't sure which individual settings to adjust.

## How to Use This Guide

1. **Describe your desired visual effect** in plain English
2. **Provide context** about the music genre, mood, or use case
3. **Let the AI agent use this guide** to map your description to specific settings
4. **Get a complete preset JSON** that you can use directly

## Example User Request

> "I want a preset for dark, heavy metal music with aggressive, jagged visuals that react super fast to the drums. The waveform should be very prominent."

## Mapping Natural Language to Settings

### Step 1: Identify the Visual Character

Ask yourself: "What does this preset look like?"

| Description | Settings to Adjust |
|---|---|
| **Smooth, flowing, gentle** | ↓ FFT Smoothing (0.85–0.95), ↓ Response Speed (0.8), ↓ Particle Emission (10–25) |
| **Jagged, sharp, angular** | ↓ FFT Smoothing (0.7–0.75), ↑ Response Speed (0.95+), ↑ Decay Speed (0.9+) |
| **Minimal, clean, sparse** | ↓ Mesh Width/Height (12–24), ↓ Particle Emission (10–20), ↓ Waveform Intensity (0.6–0.8) |
| **Rich, dense, overwhelming** | ↑ Mesh Width/Height (48–64), ↑ Particle Emission (50–150), ↑ Waveform Intensity (1.4–2.0) |
| **Detailed, precise, technical** | ↑ FFT Size (2048–4096), ↑ Resolution Scale (0.9–1.0), ↑ Mesh Width/Height |
| **Fast, snappy, punchy** | ↓ FFT Smoothing (0.7–0.8), ↑ Response Speed (0.9–0.99), ↑ Decay Speed (0.85+) |
| **Slow, dreamy, meditative** | ↑ FFT Smoothing (0.85–0.95), ↓ Response Speed (0.75–0.85), ↓ Decay Speed (0.75–0.8) |

### Step 2: Identify the Audio Focus

Ask: "Which frequencies should be emphasized?"

| Description | Settings to Adjust |
|---|---|
| **Bass-heavy, deep, thumping** | ↑ FFT Size (1024–4096), ↑ Bass Boost (1.4–2.0), ↑ Waveform Intensity (1.2–1.6) |
| **Treble-focused, bright, sparkling** | ↓ FFT Size (512–1024), ↓ Bass Boost (0.8–1.0), ↑ Particle Emission (40–80) |
| **Balanced, neutral, full-spectrum** | FFT Size: 1024, Bass Boost: 1.0–1.2 |
| **Aggressive attack, fast decay** | ↑ Response Speed (0.95+), ↑ Decay Speed (0.9+), ↓ FFT Smoothing |
| **Sustained, lingering, ambient** | ↓ Response Speed (0.75–0.85), ↓ Decay Speed (0.75–0.8), ↑ Particle Life (200+) |

### Step 3: Identify Performance Needs

Ask: "What hardware is this for? What matters more — visuals or performance?"

| Context | Settings to Adjust |
|---|---|
| **High-end desktop, max visuals** | Resolution: 1.0, Mesh: 48–64, FPS Cap: 0, Particle Emission: 50–150 |
| **Laptop, balanced** | Resolution: 0.75, Mesh: 32×24, FPS Cap: 60, Particle Emission: 20–40 |
| **Low-end hardware, preserve responsiveness** | Resolution: 0.5, Mesh: 24×18, FPS Cap: 30, Particle Emission: 10–20 |
| **Mobile/battery, minimum power** | Resolution: 0.5, Mesh: 18×12, FPS Cap: 30, Particle Emission: 5–15 |

### Step 4: Finalize Derived Settings

Use the mappings above to construct the preset:

```json
{
  "resolutionScale": [from performance],
  "fpsCap": [from performance],
  "fftSize": [from audio focus],
  "fftSmoothing": [from visual character],
  "meshWidth": [from visual character],
  "meshHeight": [from visual character],
  "waveformIntensity": [from audio focus or visual character],
  "waveformScale": [smooth → higher, jagged → lower],
  "reactivityRespond": [from visual character],
  "reactivityDecay": [from visual character],
  "reactivityLineBoost": [from audio focus],
  "blendMode": "normal",
  "particleLife": [from visual character],
  "particleEmission": [from visual character]
}
```

## Detailed Mapping Tables

### Audio Analysis Settings

#### FFT Size
- **512:** EDM drops, fast breakbeats, rhythm-focused music
- **1024:** General-purpose, balanced detail
- **2048:** Hip-hop, trap, music with strong sub-bass
- **4096:** Ambient, classical, complex poly-rhythmic music

#### FFT Smoothing
- **0.7–0.75:** Metal, punk, aggressive genres
- **0.8:** Electronic, dance, synth-pop
- **0.85–0.90:** Soul, funk, R&B
- **0.90–0.95:** Ambient, chillout, experimental

#### Bass Boost
- **0.5–0.8:** Treble-focused (synth-pop, synthwave)
- **1.0–1.2:** Balanced (most genres)
- **1.4–1.6:** Bass-heavy (EDM, hip-hop, dubstep)
- **1.8–2.0:** Bass detector/extreme focus

### Rendering Performance

#### Resolution Scale
- **0.25:** Minimal GPU load (very low-end)
- **0.5:** Light load, still readable
- **0.75:** Balanced, sharp enough for laptops
- **1.0:** Maximum sharpness, highest load

#### FPS Cap
- **0:** Unlimited, maximum smoothness (high power draw)
- **30:** Low power, smooth enough for most viewers
- **60:** Standard gaming target, good balance

### Waveform Appearance

#### Intensity + Scale Combinations
| Intensity | Scale | Effect |
|---|---|---|
| 0.6 | 1.6 | Subtle, spread-out waveform (ambient) |
| 1.0 | 1.2 | Balanced, natural appearance |
| 1.4 | 1.0 | Prominent, compact, detailed waveform (bass-focused) |
| 1.8 | 0.8 | Extreme prominence, very tight spacing (showcase bass) |

### Mesh Configuration

#### Common Ratios (for 16:9 aspect)
- **12×9:** Minimal, clean (12:9 = 4:3)
- **16×12:** Light distortion (4:3)
- **32×24:** Balanced detail (4:3)
- **48×36:** Fine detail, higher cost (4:3)
- **64×48:** Maximum detail, expensive (4:3)

## Building Presets from Descriptions

### Example 1: "Dark Techno"
- **Visual character:** Sharp, aggressive, machine-like
- **Audio focus:** Bass-driven, syncopated
- **Performance:** Desktop, max visuals

```
Visual character → sharp: FFT Smoothing: 0.75, Response: 0.95, Decay: 0.9
Audio focus → bass-heavy: FFT Size: 2048, Bass Boost: 1.6
Performance → desktop: Resolution: 1.0, Mesh: 48×36, Particle Emission: 50
```

### Example 2: "Chill Lofi Hip-Hop"
- **Visual character:** Smooth, gentle, minimal
- **Audio focus:** Balanced, warm bass
- **Performance:** Laptop-friendly

```
Visual character → smooth, minimal: FFT Smoothing: 0.9, Response: 0.8, Decay: 0.75, Mesh: 24×18, Particle Emission: 20
Audio focus → warm bass: Bass Boost: 1.2, FFT Size: 1024
Performance → laptop: Resolution: 0.75, FPS Cap: 60
```

### Example 3: "Glitch / IDM"
- **Visual character:** Jagged, complex, detailed
- **Audio focus:** Treble-focused complexity
- **Performance:** Desktop, detail over speed

```
Visual character → jagged, detailed: FFT Smoothing: 0.7, Response: 0.95, Mesh: 64×48, Particle Emission: 40, Particle Life: 100
Audio focus → detailed: FFT Size: 4096, Bass Boost: 0.9
Performance → desktop: Resolution: 1.0, FPS Cap: 0
```

## Algorithm for AI Agents

**Given:** A natural language description of a desired preset

**Process:**

1. **Extract key descriptors** from the description (smooth/jagged, bass/treble, minimal/dense, fast/slow)
2. **Map each descriptor** to a setting range using the tables above
3. **Resolve conflicts** (if two descriptors suggest opposite changes, favor the most specific one)
4. **Set defaults** for any unmapped settings:
   - `blendMode`: "normal" (unless specifically requested otherwise)
   - `waveformScale`: 1.2 (neutral)
   - Any unmapped numeric setting: midpoint of its range
5. **Output** a complete preset JSON with all 14 settings

## Validation Rules

Before outputting a preset, verify:

- [ ] All 14 settings are present
- [ ] `resolutionScale`: 0.25–1.0
- [ ] `fpsCap`: 0–240 (0 = unlimited)
- [ ] `fftSize`: 256, 512, 1024, 2048, or 4096
- [ ] `fftSmoothing`: 0.7–0.95
- [ ] `meshWidth`: 12–64
- [ ] `meshHeight`: 9–48
- [ ] `waveformIntensity`: 0–2.0
- [ ] `waveformScale`: 0.5–2.0
- [ ] `reactivityRespond`: 0.75–0.99
- [ ] `reactivityDecay`: 0.7–0.95
- [ ] `reactivityLineBoost`: 0.5–2.0
- [ ] `blendMode`: "normal", "additive", or "multiply"
- [ ] `particleLife`: 50–500
- [ ] `particleEmission`: 10–150

## Example: Full Generation Walk-Through

**User Request:** "Create a preset for synthwave that's bright and energetic, with a strong waveform, but I'm on an older laptop so it needs to be optimized for battery life."

**AI Agent Process:**

1. **Extract descriptors:**
   - bright → treble-focused
   - energetic → fast response
   - strong waveform → high intensity
   - synthwave → genre-specific (electronic, melodic)
   - battery-optimized → lower resolution, lower FPS cap

2. **Map to settings:**
   - Treble-focused: `fftSize: 1024`, `bassBoost: 0.9`
   - Energetic: `reactivityRespond: 0.95`, `reactivityDecay: 0.88`
   - Strong waveform: `waveformIntensity: 1.4`, `waveformScale: 1.0`
   - Synthwave: `fftSmoothing: 0.8`, `meshWidth: 32`, `meshHeight: 24`
   - Battery-optimized: `resolutionScale: 0.75`, `fpsCap: 30`

3. **Resolve conflicts:** None

4. **Set defaults:**
   - `blendMode: "normal"`
   - Any unmapped settings: reasonable defaults

5. **Output preset:**

```json
{
  "resolutionScale": 0.75,
  "fpsCap": 30,
  "fftSize": 1024,
  "fftSmoothing": 0.8,
  "meshWidth": 32,
  "meshHeight": 24,
  "waveformIntensity": 1.4,
  "waveformScale": 1.0,
  "reactivityRespond": 0.95,
  "reactivityDecay": 0.88,
  "reactivityLineBoost": 0.9,
  "blendMode": "normal",
  "particleLife": 120,
  "particleEmission": 35
}
```

---

## Notes for AI Agents

- **Avoid extreme values** unless explicitly requested (e.g., don't set everything to max)
- **Preserve musicality:** Audio analysis settings should suit the described genre
- **Balance performance:** If low FPS is set, reduce particle emission and mesh size
- **Explain reasoning** in comments if requested (map each setting to the user's description)
- **Ask for clarification** if the description is too vague (e.g., "What genre of electronic music? EDM, IDM, ambient?")

## Sharing and Testing Presets

Once a preset is generated:

1. Copy the JSON object
2. Share via text, email, or code paste
3. Recipient can paste it into their preset file (future feature)
4. Or manually configure each slider in the Graphics menu

## Troubleshooting Generated Presets

If a preset doesn't feel right:

- **Too reactive?** Lower `reactivityRespond` or raise `fftSmoothing`
- **Too dim?** Raise `waveformIntensity` or `particleEmission`
- **Laggy?** Lower `resolutionScale`, `meshWidth/Height`, or `particleEmission`
- **Not enough bass detail?** Raise `fftSize` to 2048 and increase `bassBoost`
