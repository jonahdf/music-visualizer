# ButterMilk Studio

A web-based Milkdrop visualizer and preset studio, running entirely in the browser.

## Features

- **1,754 built-in presets** from the Milkdrop/Butterchurn library, searchable and instantly switchable
- **Upload custom presets** — drag in any `.milk` or `.json` preset file, stored locally in IndexedDB
- **Three audio sources:**
  - **Microphone** — works in all browsers
  - **Tab Audio** — capture any browser tab (Spotify, YouTube, etc.) via `getDisplayMedia`; Chrome/Edge only
  - **Audio File** — load a local MP3, WAV, FLAC, etc.
- **Quality slider** — Low / Medium / High / Ultra, adjusting resolution, FFT size, and mesh density for smooth performance on any hardware
- **Live FPS counter**

## Getting started

```bash
npm install
npm run dev        # http://localhost:5174
```

1. Click anywhere (or press **Space**) to initialize the visualizer
2. Open the menu (☰ button or **Space**)
3. Pick an audio source under **Source**
4. Browse and select a preset under **Presets**

## Tab Audio (Spotify / YouTube)

1. Open Spotify or YouTube in a **separate browser tab** and start playing
2. In the visualizer, open the menu → Source → **Tab Audio**
3. In the browser picker, select the music tab and check **"Share tab audio"**
4. **Mute the source tab** (click the speaker icon in its browser tab) — audio will play in the visualizer tab, perfectly synced to the visualization

> Tab audio capture requires **Chrome or Edge**. Firefox is not supported for this source.

## Stack

| Layer | Library |
|-------|---------|
| UI | React 19 + TypeScript |
| Build | Vite |
| Renderer | [Butterchurn](https://github.com/jberg/butterchurn) (WebGL2 Milkdrop port) |
| Audio | Web Audio API |
| Preset storage | IndexedDB via [idb](https://github.com/jakearchibald/idb) |

## Roadmap

- **Phase 2** — Spotify Web Playback SDK + YouTube IFrame API integration
- **Phase 3** — In-browser GLSL preset editor (Monaco) + custom preset format
- **Phase 4** — Three.js 3D mode + WebXR support (Meta Quest 3, Apple Vision Pro)

See `CLAUDE.md` for full architecture notes and implementation details.
