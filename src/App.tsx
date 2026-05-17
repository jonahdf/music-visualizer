import { useCallback, useEffect, useRef, useState } from 'react';
import { audioEngine } from './audio/AudioEngine';
import { connectMic } from './audio/sources/MicSource';
import { connectTabAudio } from './audio/sources/TabSource';
import { connectFile } from './audio/sources/FileSource';
import { ButterchurnRenderer } from './visualizer/ButterchurnRenderer';
import { usePresets } from './presets/usePresets';
import type { PresetEntry } from './presets/usePresets';
import { usePlaylist } from './presets/usePlaylist';
import Menu from './ui/Menu';
import { GRAPHICS_PRESETS } from './types';
import type { AudioSourceType, QualityLevel, GraphicsSettings } from './types';
import './App.css';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ButterchurnRenderer | null>(null);
  const fpsCounterRef = useRef({ frames: 0, lastTime: performance.now() });

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSource, setActiveSource] = useState<AudioSourceType | null>(null);
  const [quality, setQuality] = useState<QualityLevel>('medium');
  const [graphicsSettings, setGraphicsSettings] = useState<GraphicsSettings>(GRAPHICS_PRESETS['medium']);
  const [activePresetId, setActivePresetId] = useState('');
  const [blendTime, setBlendTime] = useState(2.7);
  const [fps, setFps] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hudVisible, setHudVisible] = useState(true);
  const activityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { presets, loading: loadingPresets, uploadMilkPreset, removePreset } = usePresets();

  const {
    favorites,
    excluded,
    isFavorite,
    isExcluded,
    toggleFavorite,
    toggleExclude,
    getPool,
    playlistMode,
    setPlaylistMode,
    interval,
    setInterval: setPlaylistInterval,
    isHeld,
    toggleHold,
  } = usePlaylist();

  const favoritePresets = presets.filter(p => favorites.includes(p.id));

  const initRenderer = useCallback(async () => {
    if (initialized || !canvasRef.current) return;
    const canvas = canvasRef.current;

    canvas.width = Math.floor(window.innerWidth * graphicsSettings.resolutionScale);
    canvas.height = Math.floor(window.innerHeight * graphicsSettings.resolutionScale);

    await audioEngine.initContext(graphicsSettings.fftSize);
    const ctx = audioEngine.getContext()!;
    await ctx.resume();

    const renderer = new ButterchurnRenderer();
    renderer.init(canvas, ctx, graphicsSettings);
    rendererRef.current = renderer;

    const analyser = audioEngine.getAnalyser();
    if (analyser) renderer.connectAudio(analyser);

    renderer.startRenderLoop();
    setInitialized(true);
  }, [initialized, graphicsSettings]);

  // FPS counter via rAF
  useEffect(() => {
    let raf: number;
    const tick = () => {
      const counter = fpsCounterRef.current;
      counter.frames++;
      const now = performance.now();
      const elapsed = now - counter.lastTime;
      if (elapsed >= 1000) {
        setFps(Math.round(counter.frames * 1000 / elapsed));
        counter.frames = 0;
        counter.lastTime = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Handle window resize
  useEffect(() => {
    const onResize = () => {
      if (!rendererRef.current || !canvasRef.current) return;
      rendererRef.current.resize(window.innerWidth, window.innerHeight, graphicsSettings);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [graphicsSettings]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }, []);

  // Sync fullscreen state
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Auto-load first preset once presets are available and renderer is ready
  useEffect(() => {
    if (!initialized || presets.length === 0 || activePresetId) return;
    const first = presets[0];
    rendererRef.current?.loadPreset(first.data, blendTime);
    rendererRef.current?.setCurrentPresetName(first.name);
    setActivePresetId(first.id);
  }, [initialized, presets, activePresetId, blendTime]);

  const handleSelectPreset = useCallback((preset: PresetEntry) => {
    if (!initialized) return;
    rendererRef.current?.loadPreset(preset.data, blendTime);
    rendererRef.current?.setCurrentPresetName(preset.name);
    setActivePresetId(preset.id);
  }, [initialized, blendTime]);

  // Playlist navigation helpers
  const goNext = useCallback(() => {
    if (!initialized || presets.length === 0) return;
    const pool = getPool(presets);
    if (pool.length === 0) return;
    const idx = pool.findIndex(p => p.id === activePresetId);
    handleSelectPreset(pool[(idx + 1) % pool.length]);
  }, [initialized, presets, activePresetId, getPool, handleSelectPreset]);

  const goPrev = useCallback(() => {
    if (!initialized || presets.length === 0) return;
    const pool = getPool(presets);
    if (pool.length === 0) return;
    const idx = pool.findIndex(p => p.id === activePresetId);
    handleSelectPreset(pool[(idx - 1 + pool.length) % pool.length]);
  }, [initialized, presets, activePresetId, getPool, handleSelectPreset]);

  const goRandom = useCallback(() => {
    if (!initialized || presets.length === 0) return;
    const pool = getPool(presets);
    if (pool.length === 0) return;
    const candidates = pool.length > 1 ? pool.filter(p => p.id !== activePresetId) : pool;
    handleSelectPreset(candidates[Math.floor(Math.random() * candidates.length)]);
  }, [initialized, presets, activePresetId, getPool, handleSelectPreset]);

  // Auto-advance timer
  useEffect(() => {
    if (!initialized || interval === 0 || isHeld) return;
    const id = window.setInterval(goRandom, interval);
    return () => window.clearInterval(id);
  }, [initialized, interval, isHeld, goRandom]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        setMenuOpen(open => !open);
        return;
      }
      if ((e.key === 'f' || e.key === 'F') && !isInput) {
        toggleFullscreen();
        return;
      }
      if (!initialized || isInput) return;

      switch (e.code) {
        case 'ArrowRight':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'KeyR':
          goRandom();
          break;
        case 'KeyH':
          toggleHold();
          break;
        case 'KeyM':
          setIsMuted(prev => {
            const next = !prev;
            audioEngine.setMuted(next);
            return next;
          });
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [initialized, toggleFullscreen, goNext, goPrev, goRandom, toggleHold]);

  const handleSelectSource = useCallback(async (type: AudioSourceType) => {
    setError(null);
    try {
      await initRenderer();
      if (type === 'mic') await connectMic();
      else if (type === 'tab') {
        await connectTabAudio();
        setHint('Press F for fullscreen to hide the browser bar');
        setTimeout(() => setHint(null), 4000);
      }
      setActiveSource(type);
    } catch (err) {
      setError((err as Error).message || 'Failed to connect audio source');
    }
  }, [initRenderer]);

  const handleSelectFile = useCallback(async (file: File) => {
    setError(null);
    try {
      await initRenderer();
      await connectFile(file);
      setActiveSource('file');
    } catch (err) {
      setError((err as Error).message || 'Failed to load audio file');
    }
  }, [initRenderer]);

  const handleQualityChange = useCallback((q: QualityLevel) => {
    setQuality(q);
    const settings = GRAPHICS_PRESETS[q];
    setGraphicsSettings(settings);
    if (!rendererRef.current) return;
    rendererRef.current.updateQuality(settings);
    audioEngine.updateQuality(settings);
  }, []);

  const handleSettingsChange = useCallback((newSettings: Partial<GraphicsSettings>) => {
    setGraphicsSettings(s => {
      const updated = { ...s, ...newSettings };
      if (rendererRef.current) {
        rendererRef.current.updateQuality(updated);
        audioEngine.updateQuality(updated);
      }
      return updated;
    });
  }, []);

  const handleCanvasClick = useCallback(async () => {
    if (!initialized) {
      await initRenderer();
    }
  }, [initialized, initRenderer]);

  // Auto-hide HUD after 3s of mouse inactivity
  useEffect(() => {
    const resetTimer = () => {
      setHudVisible(true);
      if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
      activityTimerRef.current = setTimeout(() => setHudVisible(false), 3000);
    };
    resetTimer();
    window.addEventListener('mousemove', resetTimer);
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    };
  }, []);

  const hudHidden = !hudVisible && !menuOpen;
  const activePreset = presets.find(p => p.id === activePresetId) ?? null;

  return (
    <div className={`app${hudHidden ? ' cursor-hidden' : ''}`}>
      <canvas
        ref={canvasRef}
        className="visualizer-canvas"
        onClick={handleCanvasClick}
      />

      {!initialized && (
        <div className="start-overlay" onClick={handleCanvasClick}>
          <div className="start-prompt">
            <h1>Music Visualizer</h1>
            <p>Click anywhere to begin</p>
            <p className="start-hint">Press Space to open the menu and connect an audio source</p>
          </div>
        </div>
      )}

      {error && (
        <div className="error-toast" onClick={() => setError(null)}>
          ⚠ {error} <span className="error-dismiss">(click to dismiss)</span>
        </div>
      )}

      {hint && (
        <div className="hint-toast">{hint}</div>
      )}

      <div className={`hud${hudHidden ? ' hud-hidden' : ''}`}>
        <button
          className="menu-toggle"
          onClick={() => {
            initRenderer();
            setMenuOpen(open => !open);
          }}
          title="Open menu (Space)"
        >
          ☰
        </button>
        <button
          className={`hud-btn${isFullscreen ? ' active' : ''}`}
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
        >
          {isFullscreen ? '⤡' : '⛶'}
        </button>
        {initialized && interval > 0 && (
          <button
            className={`hud-btn${isHeld ? ' active' : ''}`}
            onClick={toggleHold}
            title="Hold auto-advance (H)"
          >
            {isHeld ? '⏸' : '▶'}
          </button>
        )}
        {initialized && activeSource && (
          <button
            className={`hud-btn${isMuted ? ' active' : ''}`}
            onClick={() => setIsMuted(prev => {
              const next = !prev;
              audioEngine.setMuted(next);
              return next;
            })}
            title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        )}
        {initialized && activePreset && (
          <div className="hud-now-playing">
            <span className="hud-preset-name" title={activePreset.name}>
              {activePreset.name}
            </span>
            <button
              className={`favorite-btn${isFavorite(activePresetId) ? ' active' : ''}`}
              onClick={() => toggleFavorite(activePresetId)}
              title={isFavorite(activePresetId) ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite(activePresetId) ? '♥' : '♡'}
            </button>
          </div>
        )}
        {initialized && activeSource && (
          <span className="hud-source">{activeSource}</span>
        )}
        {initialized && (
          <span className="hud-fps">{fps} fps</span>
        )}
      </div>

      {menuOpen && (
        <Menu
          presets={presets}
          loadingPresets={loadingPresets}
          activePresetId={activePresetId}
          activePresetName={activePreset?.name ?? ''}
          activeSource={activeSource}
          quality={quality}
          graphicsSettings={graphicsSettings}
          fps={fps}
          blendTime={blendTime}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          isExcluded={isExcluded}
          onToggleExclude={toggleExclude}
          favoritePresets={favoritePresets}
          excludedCount={excluded.length}
          playlistMode={playlistMode}
          onPlaylistModeChange={setPlaylistMode}
          interval={interval}
          onIntervalChange={setPlaylistInterval}
          isHeld={isHeld}
          onToggleHold={toggleHold}
          onPrev={goPrev}
          onNext={goNext}
          onRandom={goRandom}
          onSelectPreset={handleSelectPreset}
          onUploadPreset={uploadMilkPreset}
          onRemovePreset={removePreset}
          onSelectSource={handleSelectSource}
          onSelectFile={handleSelectFile}
          onQualityChange={handleQualityChange}
          onSettingsChange={handleSettingsChange}
          onBlendTimeChange={setBlendTime}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
