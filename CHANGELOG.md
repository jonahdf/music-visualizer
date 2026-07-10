# Changelog

All notable changes to ButterMilk Studio are documented here, newest first.

## 2026-06-26

- **fix:** Create mode — slider overrides no longer reset per-frame accumulator variables (e.g. wave_r) driven by user equations, eliminating visual mismatch on preset load ([#11](https://github.com/jonahdf/music-visualizer/pull/11))
- **fix:** ButterchurnRenderer — loadPreset errors now logged to console.error instead of silently swallowed ([#11](https://github.com/jonahdf/music-visualizer/pull/11))

## 2026-05-25

- **fix:** Removed non-functional waveform, reactivity, and particle sliders from the Visual settings tab; FFT smoothing now correctly applied when changed ([#24](https://github.com/jonahdf/music-visualizer/pull/24))

## 2026-05-24

- **feat:** Changelog modal — "What's New" button in the bottom bar opens a chronological list of updates ([#30](https://github.com/jonahdf/music-visualizer/pull/30))
- **fix:** Responsive HUD — bottom bar and now-playing HUD stay outside the drawer area when the sidebar is open ([#26](https://github.com/jonahdf/music-visualizer/pull/26))
- **feat:** GitHub issues link in the Settings drawer footer for reporting bugs and requesting features ([#23](https://github.com/jonahdf/music-visualizer/pull/23))
- **fix:** Preset configurator slider ranges restricted to sensible Milkdrop values; wave opacity corrected from 0–255 to 0–1 ([#21](https://github.com/jonahdf/music-visualizer/pull/21))
- **refactor:** Project renamed to ButterMilk Studio ([#20](https://github.com/jonahdf/music-visualizer/pull/20))
- **fix:** E2E test selectors updated after UI redesign; test suite expanded to 104 scenarios ([#13](https://github.com/jonahdf/music-visualizer/pull/13))
- **fix:** Preset configurator — line breaks in per-frame equation fields now render correctly ([#12](https://github.com/jonahdf/music-visualizer/pull/12))

## 2026-05-23

- **feat:** Preset configurator Code tab — read-only preview of slider-generated per-frame code alongside the custom code editor ([#8](https://github.com/jonahdf/music-visualizer/pull/8))
- **feat:** Sample music library with 7 tracks and now-playing HUD with prev/pause/next transport controls ([#7](https://github.com/jonahdf/music-visualizer/pull/7))

## 2026-05-21

- **feat:** Milkdrop preset configurator (Create tab) — Motion/Wave/Color/Code editors, live preview, randomize, save & export ([#5](https://github.com/jonahdf/music-visualizer/pull/5))
- **feat:** Redesigned UI — fixed bottom bar, slide-out drawer, keyboard shortcut guide overlay ([#4](https://github.com/jonahdf/music-visualizer/pull/4))

## 2026-05-17

- **fix:** Mic audio reactivity — disabled browser AGC/noise-suppression, added visualization gain boost ([#3](https://github.com/jonahdf/music-visualizer/pull/3))
- **feat:** Graphics panel — Performance/Visual sub-tabs, settings persistence via localStorage ([#2](https://github.com/jonahdf/music-visualizer/pull/2))
- **feat:** Mute button with M keyboard shortcut ([#1](https://github.com/jonahdf/music-visualizer/pull/1))
- **feat:** Initial release — Butterchurn WebGL2 visualizer with 1754 bundled Milkdrop presets, mic/tab/file audio sources
