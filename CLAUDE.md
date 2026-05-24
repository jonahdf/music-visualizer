# ButterMilk Studio — Claude Context

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
    Menu/                   # Overlay menu shell (tabs: Presets / Source / Performance)
    PresetBrowser/          # Searchable preset list + upload button
    AudioSourcePicker/      # Source selector cards with per-browser capability checks
    PerformancePanel/       # Quality slider (Low/Medium/High/Ultra) + live FPS

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

### Phase 3 — Custom preset editor (not started)
- Monaco Editor (VS Code engine) for in-browser GLSL/preset editing
- Custom JSON preset format with `warpShader`, `compositeShader`, `perFrameCode` fields
- Shader validation (`gl.compileShader` + error check) before saving
- Live reload on save

### Phase 4 — 3D / WebXR (not started)
- Three.js renderer as an alternative to Butterchurn
- Frequency-reactive 3D geometry (particle systems, mesh deformation)
- WebXR session entry targeting Meta Quest 3 and Apple Vision Pro
- Controller/hand input for preset navigation in VR

---

## Test-driven development

All bug fixes and new features must follow TDD. The test suite uses `playwright-bdd` — run it with `npm test`.

### Fixing a bug

1. **Write a failing scenario first.** Add a Gherkin scenario to the relevant `.feature` file (or create `e2e/features/NN-<topic>.feature`) that reproduces the bug. Run `npm test` and confirm it fails before touching any source code.
2. **Fix the source code** until the new scenario passes.
3. **Confirm nothing regressed** — the full suite must stay green.

### Adding a new feature

1. **Align on the spec in Gherkin first.** Write the `.feature` scenarios that describe the intended behavior before writing any implementation. This is the contract — agree on it before building.
2. **Add step definitions** in the matching `e2e/steps/<topic>.steps.ts` file (reuse steps from `common.steps.ts` wherever possible).
3. **Run `npm test`** — new scenarios should fail (red). This confirms the feature isn't already implemented and the steps are wired up correctly.
4. **Implement the feature** until all new scenarios pass green.
5. **Confirm nothing regressed** — the full suite must stay green.

### Test file locations

```
e2e/
  features/          # Gherkin .feature files — one file per feature area
  steps/             # Step definitions — mirror the feature file names
  support/
    fixtures.ts      # appPage / firefoxPage fixtures + openApp / initializeApp / openMenu helpers
    mocks.ts         # addInitScript strings for getUserMedia, getDisplayMedia, Firefox UA
    common.steps.ts  # Shared Given/When/Then used across multiple features
```

### Key conventions

- **Shared steps belong in `common.steps.ts`**, not duplicated across step files.
- **New fixtures** (e.g., a page with a specific permission denied) go in `e2e/support/fixtures.ts`.
- **CSS selectors** must match the actual class names in `src/`. Cross-check against `src/App.tsx` and `src/ui/*/index.tsx` before writing a locator.
- **HUD interactions** require a `mouse.move(400, 300)` + `waitForFunction(() => !document.querySelector('.hud')?.classList.contains('hud-hidden'))` before clicking — the HUD auto-hides after 3 s of inactivity and sets `pointer-events: none`.
- **`closeMenu()`** clicks `.close-btn` (the app has no Escape key handler).

---

## Development notes

- All CSS lives in `src/App.css` (component styles) and `src/index.css` (global reset)
- No CSS framework — plain CSS with custom properties
- `butterchurn-presets` is lazy-loaded in `usePresets.ts` to avoid blocking the initial render (it's a large bundle)
- The `.claude/launch.json` at the repo root registers the dev server on port 5174 for Claude Code preview tools
