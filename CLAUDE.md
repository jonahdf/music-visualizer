# Music Visualizer — Claude Context

## What this project is

A web-based music visualizer in the style of Milkdrop/ProjectM. Built with React + TypeScript + Vite. The core renderer is [Butterchurn](https://github.com/jberg/butterchurn), a WebGL2 port of Milkdrop that supports the classic `.milk` preset format.

**Dev server:** `npm run dev` → `http://localhost:5174`

---

## Architecture

```
src/
  audio/
    AudioEngine.ts          # Singleton Web Audio API graph (AnalyserNode)
    browserSupport.ts       # Browser capability detection (Firefox tab audio, etc.)
    sources/
      MicSource.ts          # getUserMedia → AudioEngine
      TabSource.ts          # getDisplayMedia → AudioEngine (Chrome/Edge only)
      FileSource.ts         # File → AudioEngine

  visualizer/
    ButterchurnRenderer.ts  # Wraps Butterchurn; owns canvas + render loop

  presets/
    PresetStore.ts          # IndexedDB CRUD via `idb` library
    usePresets.ts           # React hook; merges 1754 bundled presets + user uploads

  ui/
    Drawer/                 # Sidebar panel shell (tabs: Presets / Audio / Settings / Create)
    PresetBrowser/          # Searchable preset list + upload button
    AudioSourcePicker/      # Source selector cards with per-browser capability checks
    GraphicsPanel/          # Quality slider + detailed graphics/audio settings
    PresetConfigurator/     # "Create" tab — interactive preset editor (see below)

  types/
    index.ts                # AudioSourceType, QualityLevel, QualitySettings, QUALITY_PRESETS
    butterchurn.d.ts        # Hand-written type declarations for butterchurn + butterchurn-presets
```

### Audio data flow

```
[Mic / Tab / File]
       ↓
  MediaStream / BufferSource
       ↓
  AudioEngine.analyser (AnalyserNode)
       ↓
  ButterchurnRenderer.connectAudio(analyser) → Butterchurn reads FFT each frame
```

For **tab and mic** sources the stream is also connected to `context.destination` so the user hears the audio in the visualizer tab. The expectation is that the user mutes the source tab to avoid double audio. See audio routing section below.

For **file** sources the `BufferSource` is connected to both the analyser and `context.destination`.

### Quality settings

Defined in `src/types/index.ts` as `QUALITY_PRESETS`. Each level sets:
- `resolutionScale` — canvas pixel dimensions relative to window
- `fftSize` — Web Audio FFT bin count
- `meshWidth/Height` — Butterchurn warp mesh density
- `fpsCap` — render loop throttle (0 = unlimited)

---

## PresetConfigurator — "Create" tab

The Create tab (`src/ui/PresetConfigurator/`) is a full in-browser Milkdrop preset editor. It has five sub-tabs: **Motion**, **Animate**, **Wave**, **Color/FX**, **Borders**, **Code**.

### File map

```
src/ui/PresetConfigurator/
  index.tsx              # Main component — state, handlers, sub-tab routing
  parameterDefs.ts       # ~45 ParamDef entries grouped into motion/wave/color/borders/code
  defaultPreset.ts       # Blank starter preset with subtle audio-reactive equations
  presetConvert.ts       # Converts flat UI params ↔ butterchurn preset JSON
  aiPromptBuilder.ts     # Builds clipboard-ready AI assist prompt string
  animationTypes.ts      # Types + ANIM_PARAM_CONFIGS for the Animate sub-tab
  generateAnimEquations.ts # Builds per-frame equation strings from ModulationMap
  AnimationPanel.tsx     # Animate sub-tab UI component
  PresetConfigurator.css # All styles for the configurator
```

### Flat preset state

`index.tsx` keeps a single `preset: Record<string, unknown>` state object using the **configurator's own key names** (e.g. `fDecay`, `fWarpAnimSpeed`, `nWaveMode`). These differ from butterchurn's internal `baseVals` keys. The `presetConvert.ts` `TO_BC` map translates between them:

```
fDecay → decay,  fGammaAdj → gammaadj,  nWaveMode → wave_mode,  etc.
```

The three code fields (`per_frame_init_eqs_str`, `per_frame_eqs_str`, `per_pixel_eqs_str`) are stored in the flat preset state as-is and mapped to `init_eqs_str`, `frame_eqs_str`, `pixel_eqs_str` in the butterchurn format.

### Sending to the renderer

Every change goes through `pushToRenderer(params, base)`:

1. Calls `combineEquations(params, modulationsRef.current)` — prepends any auto-generated animation equations to the user's `per_frame_eqs_str` (see Animate sub-tab below).
2. If `base` is set (a loaded butterchurn preset): calls `mergeIntoButterchurnPreset(combined, base)` — patches only `baseVals` and code fields, preserving the original preset's warp/composite shaders, waves, and shapes.
3. If `base` is null (blank canvas): calls `toButterchurnPreset(combined)` — builds a minimal butterchurn preset object.
4. Calls `onLivePreviewChange(data)` → `renderer.loadPreset(data, 0)` (instant, no blend).

**Important:** `pushToRenderer` is a normal function call, never called inside a React state updater. Doing so causes crashes in React 18 StrictMode because updaters run twice and side-effects are not allowed inside them. `presetRef`, `modulationsRef`, and `baseBcPresetRef` provide synchronous read access to current state so setters can compute new values and call the renderer as sequential sibling statements.

### "Load from current" flow

When the user clicks **Load Current**, `fromButterchurnPreset(activePresetData)` extracts the known params from the running preset's `baseVals` into the flat state format. `baseBcPreset` is set to the full original preset object. Subsequent `pushToRenderer` calls use `mergeIntoButterchurnPreset` so the preset's custom shaders and shapes are preserved while the slider values override `baseVals`.

### Save / export

`buildBcPreset(preset, baseBcPreset)` mirrors `pushToRenderer` but returns the butterchurn object instead of sending it. It also calls `combineEquations` so auto-animation equations are baked into the saved `frame_eqs_str`. The saved preset is stored in IndexedDB via `PresetStore.ts` and appears in the Presets tab with a "custom" source badge.

---

### Animate sub-tab

Lets users add audio reactivity and time oscillation to 9 key parameters without writing code. Each parameter gets:
- **Audio band** selector (Off / Bass / Mid / Treb) + **Amount** slider (signed, ± the param's `audioRange`)
- **Oscillation Depth** + **Period** sliders (sine wave over time)

#### Key types (`animationTypes.ts`)

```ts
type AudioBand = 'none' | 'bass' | 'mid' | 'treb';

interface ParamModulation {
  audioBand: AudioBand;
  audioAmount: number;  // signed, within ±audioRange
  oscAmp: number;       // oscillation amplitude, within 0..oscAmpMax
  oscPeriod: number;    // seconds per full sine cycle
}

type ModulationMap = Record<string, ParamModulation>;  // keyed by UI param key

interface AnimParamConfig {
  key: string;        // UI param key (e.g. 'zoom', 'rot', 'fDecay')
  label: string;
  audioRange: number; // max abs audio amount
  oscAmpMax: number;  // max oscillation depth
  phaseOffset: number;// pre-staggered (60° apart) so params don't all peak together
}
```

The 9 animatable params, their ranges, and phase offsets are defined in `ANIM_PARAM_CONFIGS`.

#### Equation generation (`generateAnimEquations.ts`)

`buildAutoEquations(mods, preset, configs)` generates one equation per active param:

```
a.zoom = 1.0050 + 0.0200*a.bass_att;
a.warp = 0.5000 + 0.3000*a.mid_att + 0.1500*Math.sin(0.7854*a.time);
```

**Critical butterchurn format rules:**
- All variables use the `a.` namespace: `a.zoom`, `a.rot`, `a.bass_att`, `a.time`, etc.
- Math functions use the JavaScript `Math` object: `Math.sin()`, `Math.abs()` — not bare `sin()`.
- `//` comments break butterchurn's expression parser — never include them in `frame_eqs_str`.
- `fDecay` maps to `a.decay` in per-frame code (not `a.fDecay`).
- Audio variables: `a.bass_att`, `a.mid_att`, `a.treb_att` (smoothed); raw `a.bass`, `a.mid`, `a.treb` also available but jerkier.

Auto-equations are **never stored in `per_frame_eqs_str` state**. They are computed on-the-fly and prepended to the user's code only in `pushToRenderer` and `buildBcPreset`. The Code sub-tab shows only the user's hand-written code.

---

## Known quirks and gotchas

### 1. Butterchurn CJS interop
Butterchurn is a CommonJS module. Vite's ESM interop wraps it with an extra `.default`, so you get `butterchurn.default.createVisualizer` instead of `butterchurn.createVisualizer`. The renderer handles this:
```ts
const butterchurn = (_butterchurn as any).default ?? _butterchurn;
```
If butterchurn ever upgrades to ESM this unwrapping can be removed.

### 2. All TypeScript types must use `import type`
Vite transforms TS to JS at runtime. Any interface or type alias imported as a regular value import will throw a runtime `SyntaxError: does not provide an export named 'X'`. Every type-only symbol **must** use `import type { ... }`. Values (e.g. `QUALITY_PRESETS`, `openDB`) import normally.

### 3. Tab audio capture is Chrome/Edge only
`getDisplayMedia({ audio: true })` with per-tab audio selection is not supported in Firefox. `browserSupport.ts` detects this and `TabSource.ts` throws a user-friendly error before attempting the call. The `AudioSourcePicker` shows Tab Audio as disabled with a "Firefox" badge.

### 4. AudioContext requires user gesture
`AudioEngine.initContext()` is called lazily on the first user interaction (canvas click or menu open). The start overlay covers the canvas and must also have `onClick={handleCanvasClick}` or the click event never reaches React — the overlay is `z-index: 10` and intercepts all pointer events.

### 5. Tab audio routing and sync
`getDisplayMedia` captures audio with a small latency (typically 100–300 ms). The captured stream plays back through the visualizer tab's `AudioContext.destination`. Users should mute the source tab (Spotify/YouTube) to eliminate double audio. The visualizer's output is slightly delayed relative to the source tab, but it's perfectly synced to what is being analyzed/visualized.

---

## Phase roadmap

### Phase 1 — Done ✓
- Butterchurn renderer with 1754 bundled Milkdrop presets
- Mic / Tab Audio / File sources
- Preset browser with search and user upload (IndexedDB)
- Quality slider (Low/Medium/High/Ultra)
- HUD with live FPS counter

### Phase 2 — Spotify + YouTube (not started)
- Spotify Web Playback SDK for in-page playback (requires Premium account)
  - Playback control + `getDisplayMedia` for real-time FFT
  - Spotify Audio Analysis API for beat/bar/tatum metadata to supplement FFT
- YouTube IFrame API for in-page playback
  - Same `getDisplayMedia` approach for audio
- New UI source cards for Spotify and YouTube with OAuth flow

### Phase 3 — Custom preset editor (partially done)
- ✓ In-browser preset editor with sliders for all baseVals (Motion, Wave, Color/FX, Borders tabs)
- ✓ Per-frame / per-vertex code editor (Code tab) with live preview
- ✓ Animate tab: audio-reactive + time-oscillation modulation per parameter, auto-generates per-frame equations
- ✓ AI Assist: copies a structured prompt to clipboard; paste JSON response to apply changes
- ✓ Load Current: imports the running preset into the editor
- ✓ Save to IndexedDB, export as JSON
- Not started: Monaco Editor / syntax highlighting for equation fields
- Not started: Shader validation (gl.compileShader) before saving
- Not started: Custom warp/composite GLSL shader editing

### Phase 4 — 3D / WebXR (not started)
- Three.js renderer as an alternative to Butterchurn
- Frequency-reactive 3D geometry (particle systems, mesh deformation)
- WebXR session entry targeting Meta Quest 3 and Apple Vision Pro
- Controller/hand input for preset navigation in VR

---

## Development notes

- All CSS lives in `src/App.css` (component styles) and `src/index.css` (global reset)
- No CSS framework — plain CSS with custom properties
- `butterchurn-presets` is lazy-loaded in `usePresets.ts` to avoid blocking the initial render (it's a large bundle)
- The `.claude/launch.json` at the repo root registers the dev server on port 5174 for Claude Code preview tools
