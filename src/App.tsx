import { useCallback, useEffect, useRef, useState } from 'react';
import { audioEngine } from './audio/AudioEngine';
import { connectMic } from './audio/sources/MicSource';
import { connectTabAudio } from './audio/sources/TabSource';
import { connectFile } from './audio/sources/FileSource';
import { connectTrack } from './audio/sources/LibrarySource';
import { SAMPLE_TRACKS } from './audio/sampleTracks';
import { ButterchurnRenderer } from './visualizer/ButterchurnRenderer';
import { usePresets } from './presets/usePresets';
import type { PresetEntry } from './presets/usePresets';
import { savePreset } from './presets/PresetStore';
import type { SavedPreset } from './types';
import { usePlaylist } from './presets/usePlaylist';
import BottomBar from './ui/BottomBar';
import Drawer from './ui/Drawer';
import type { DrawerTab } from './ui/Drawer';
import KeyGuide from './ui/KeyGuide';
import NowPlayingHUD from './ui/NowPlayingHUD';
import { GRAPHICS_PRESETS } from './types';
import { DEFAULT_PRESET } from './ui/PresetConfigurator/defaultPreset';
import { toButterchurnPreset } from './ui/PresetConfigurator/presetConvert';
import type { AudioSourceType, QualityLevel, GraphicsSettings, SampleTrack } from './types';
import './App.css';

const INTERVALS = [0, 15000, 30000, 60000, 300000];
const DRAWER_WIDTH_DEFAULT = 340;
const DRAWER_WIDTH_MIN = 240;
const DRAWER_WIDTH_MAX = 560;

function readQuality(): QualityLevel {
  const raw = localStorage.getItem('mv_quality');
  if (raw === 'low' || raw === 'medium' || raw === 'high' || raw === 'ultra') return raw;
  return 'medium';
}

function readGraphicsSettings(): GraphicsSettings {
  try {
    const raw = localStorage.getItem('mv_graphics_settings');
    if (raw) return { ...GRAPHICS_PRESETS['medium'], ...JSON.parse(raw) } as GraphicsSettings;
  } catch { /* ignore */ }
  return GRAPHICS_PRESETS['medium'];
}

function readBlendTime(): number {
  const raw = localStorage.getItem('mv_blend_time');
  if (raw !== null) {
    const n = parseFloat(raw);
    if (isFinite(n)) return n;
  }
  return 2.7;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ButterchurnRenderer | null>(null);
  const fpsCounterRef = useRef({ frames: 0, lastTime: performance.now() });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(DRAWER_WIDTH_DEFAULT);
  const [isResizingDrawer, setIsResizingDrawer] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('presets');
  const [keyGuideVisible, setKeyGuideVisible] = useState(false);
  const [activeSource, setActiveSource] = useState<AudioSourceType | null>(null);
  const [quality, setQuality] = useState<QualityLevel>(readQuality);
  const [graphicsSettings, setGraphicsSettings] = useState<GraphicsSettings>(readGraphicsSettings);
  const [activePresetId, setActivePresetId] = useState('');
  const [blendTime, setBlendTime] = useState(readBlendTime);
  const [fps, setFps] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const [currentTrack, setCurrentTrack] = useState<SampleTrack | null>(null);
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  const [trackPlaying, setTrackPlaying] = useState(false);
  const [trackTime, setTrackTime] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [barVisible, setBarVisible] = useState(true);
  const activityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { presets, loading: loadingPresets, uploadMilkPreset, removePreset, reload: reloadPresets } = usePresets();

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

    const vizNode = audioEngine.getVizNode();
    const analyser = audioEngine.getAnalyser();
    if (vizNode) renderer.connectAudio(vizNode, analyser ?? undefined);

    renderer.startRenderLoop();
    setInitialized(true);
  }, [initialized, graphicsSettings]);

  // Expose debug interface to console
  useEffect(() => {
    (window as any).audioDebug = {
      setDebugMode: (enabled: boolean) => {
        if (rendererRef.current) {
          rendererRef.current.setDebugMode(enabled);
        } else {
          console.warn('Renderer not initialized yet. Click the canvas or open the menu first.');
        }
      },
    };
  }, []);

  // Update debug interface when renderer initializes
  useEffect(() => {
    if (initialized) {
      console.log('Audio debug available: window.audioDebug.setDebugMode(true)');
    }
  }, [initialized]);

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

  // Handle window resize (accounts for open drawer)
  useEffect(() => {
    const onResize = () => {
      if (!rendererRef.current) return;
      const w = window.innerWidth - (drawerOpen ? drawerWidth : 0);
      rendererRef.current.resize(w, window.innerHeight, graphicsSettings);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [graphicsSettings, drawerOpen, drawerWidth]);

  // Resize canvas when drawer opens or closes
  useEffect(() => {
    if (!initialized || !rendererRef.current) return;
    const w = window.innerWidth - (drawerOpen ? drawerWidth : 0);
    rendererRef.current.resize(w, window.innerHeight, graphicsSettings);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen, drawerWidth, initialized]);

  const handleDrawerResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = drawerWidth;
    setIsResizingDrawer(true);

    const onMove = (ev: MouseEvent) => {
      const newWidth = Math.max(DRAWER_WIDTH_MIN, Math.min(DRAWER_WIDTH_MAX, startWidth + ev.clientX - startX));
      setDrawerWidth(newWidth);
      rendererRef.current?.resize(window.innerWidth - newWidth, window.innerHeight, graphicsSettings);
    };
    const onUp = () => {
      setIsResizingDrawer(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [drawerWidth, graphicsSettings]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Auto-load bare default preset on first init
  useEffect(() => {
    if (!initialized || activePresetId) return;
    rendererRef.current?.loadPreset(toButterchurnPreset(DEFAULT_PRESET), 0);
    rendererRef.current?.setCurrentPresetName('Default');
    setActivePresetId('default');
  }, [initialized, activePresetId]);

  const handleSelectPreset = useCallback((preset: PresetEntry) => {
    if (!initialized) return;
    rendererRef.current?.loadPreset(preset.data, blendTime);
    rendererRef.current?.setCurrentPresetName(preset.name);
    setActivePresetId(preset.id);
  }, [initialized, blendTime]);

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

  // Track progress polling
  useEffect(() => {
    if (!currentTrack) return;
    const id = window.setInterval(() => {
      const progress = audioEngine.getBufferProgress();
      if (progress) {
        setTrackTime(progress.current);
        setTrackDuration(progress.duration);
        setTrackPlaying(!progress.paused);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [currentTrack]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      if (e.code === 'Escape') {
        setDrawerOpen(false);
        setKeyGuideVisible(false);
        return;
      }
      if (e.key === '?' && !isInput) {
        setKeyGuideVisible(v => !v);
        return;
      }
      if ((e.key === 'f' || e.key === 'F') && !isInput) {
        toggleFullscreen();
        return;
      }
      if ((e.key === 'p' || e.key === 'P') && !isInput) {
        setDrawerOpen(open => !open);
        setDrawerTab('presets');
        return;
      }
      if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        if (initialized) goRandom();
        else initRenderer();
        return;
      }

      if (isInput) return;

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
        case 'KeyL':
          if (activePresetId) toggleFavorite(activePresetId);
          break;
        case 'KeyM':
          setIsMuted(prev => {
            const next = !prev;
            audioEngine.setMuted(next);
            return next;
          });
          break;
        case 'KeyA': {
          const idx = INTERVALS.indexOf(interval);
          setPlaylistInterval(INTERVALS[(idx + 1) % INTERVALS.length]);
          break;
        }
        case 'Digit1': handleQualityChange('low'); break;
        case 'Digit2': handleQualityChange('medium'); break;
        case 'Digit3': handleQualityChange('high'); break;
        case 'Digit4': handleQualityChange('ultra'); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, toggleFullscreen, goNext, goPrev, goRandom, toggleHold, toggleFavorite, activePresetId, interval, setPlaylistInterval, initRenderer]);

  const handleSelectSource = useCallback(async (type: AudioSourceType) => {
    setError(null);
    setCurrentTrack(null);
    setTrackPlaying(false);
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
    setCurrentTrack(null);
    setTrackPlaying(false);
    try {
      await initRenderer();
      await connectFile(file);
      setActiveSource('file');
    } catch (err) {
      setError((err as Error).message || 'Failed to load audio file');
    }
  }, [initRenderer]);

  const handleSelectTrack = useCallback(async (track: SampleTrack) => {
    setError(null);
    setLoadingTrackId(track.id);
    try {
      await initRenderer();
      await connectTrack(track.url);
      setCurrentTrack(track);
      setTrackPlaying(true);
      setTrackTime(0);
      setTrackDuration(0);
      setActiveSource('library');
    } catch (err) {
      setError((err as Error).message || 'Failed to load track. Check your internet connection.');
    } finally {
      setLoadingTrackId(null);
    }
  }, [initRenderer]);

  const handleTrackPlay = useCallback(() => {
    audioEngine.resumeBuffer();
    setTrackPlaying(true);
  }, []);

  const handleTrackPause = useCallback(() => {
    audioEngine.pauseBuffer();
    setTrackPlaying(false);
  }, []);

  const handleTrackPrev = useCallback(() => {
    if (!currentTrack) return;
    const idx = SAMPLE_TRACKS.findIndex(t => t.id === currentTrack.id);
    const prev = SAMPLE_TRACKS[(idx - 1 + SAMPLE_TRACKS.length) % SAMPLE_TRACKS.length];
    handleSelectTrack(prev);
  }, [currentTrack, handleSelectTrack]);

  const handleTrackNext = useCallback(() => {
    if (!currentTrack) return;
    const idx = SAMPLE_TRACKS.findIndex(t => t.id === currentTrack.id);
    const next = SAMPLE_TRACKS[(idx + 1) % SAMPLE_TRACKS.length];
    handleSelectTrack(next);
  }, [currentTrack, handleSelectTrack]);

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

  const handleLivePreviewChange = useCallback((data: object) => {
    rendererRef.current?.loadPreset(data, 0);
  }, []);

  const handleSaveCustomPreset = useCallback(async (name: string, data: object) => {
    const id = `custom:${Date.now()}:${name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const preset: SavedPreset = { id, name, source: 'custom', data, createdAt: Date.now() };
    await savePreset(preset);
    await reloadPresets();
    rendererRef.current?.setCurrentPresetName(name);
    setActivePresetId(id);
  }, [reloadPresets]);

  const handleCanvasClick = useCallback(async () => {
    if (!initialized) await initRenderer();
  }, [initialized, initRenderer]);

  // Auto-hide bottom bar after 3s of inactivity
  useEffect(() => {
    const resetTimer = () => {
      setBarVisible(true);
      if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
      activityTimerRef.current = setTimeout(() => setBarVisible(false), 3000);
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart'] as const;
    resetTimer();
    events.forEach(e => window.addEventListener(e, resetTimer));
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    };
  }, []);

  // Persist settings
  useEffect(() => { localStorage.setItem('mv_quality', quality); }, [quality]);
  useEffect(() => { localStorage.setItem('mv_graphics_settings', JSON.stringify(graphicsSettings)); }, [graphicsSettings]);
  useEffect(() => { localStorage.setItem('mv_blend_time', String(blendTime)); }, [blendTime]);

  const barShown = barVisible || drawerOpen || keyGuideVisible;
  const activePreset = presets.find(p => p.id === activePresetId) ?? null;

  const appStyle = drawerOpen
    ? { '--drawer-width': `${drawerWidth}px` } as React.CSSProperties
    : undefined;

  return (
    <div
      className={`app${!barShown ? ' cursor-hidden' : ''}${drawerOpen ? ' app--drawer-open' : ''}${isResizingDrawer ? ' app--resizing' : ''}`}
      style={appStyle}
    >
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
            <p className="start-hint">Connect an audio source via ☰ menu</p>
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

      <NowPlayingHUD
        track={currentTrack}
        isPlaying={trackPlaying}
        currentTime={trackTime}
        duration={trackDuration}
        loading={loadingTrackId !== null}
        visible={barShown && activeSource === 'library' && !!currentTrack}
        onPlay={handleTrackPlay}
        onPause={handleTrackPause}
        onPrev={handleTrackPrev}
        onNext={handleTrackNext}
      />

      <BottomBar
        visible={barShown}
        initialized={initialized}
        activePreset={activePreset}
        activePresetId={activePresetId}
        activeSource={activeSource}
        quality={quality}
        fps={fps}
        isMuted={isMuted}
        isHeld={isHeld}
        isFullscreen={isFullscreen}
        interval={interval}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        isExcluded={isExcluded}
        onToggleExclude={toggleExclude}
        onPrev={goPrev}
        onNext={goNext}
        onRandom={goRandom}
        onToggleMute={() => setIsMuted(prev => {
          const next = !prev;
          audioEngine.setMuted(next);
          return next;
        })}
        onToggleFullscreen={toggleFullscreen}
        onToggleHold={toggleHold}
        onOpenMenu={() => { initRenderer(); setDrawerOpen(open => !open); setDrawerTab('presets'); }}
        onToggleKeyGuide={() => setKeyGuideVisible(v => !v)}
      />

      <KeyGuide
        visible={keyGuideVisible}
        onClose={() => setKeyGuideVisible(false)}
      />

      <Drawer
        open={drawerOpen}
        drawerWidth={drawerWidth}
        onResizeStart={handleDrawerResizeStart}
        tab={drawerTab}
        onTabChange={setDrawerTab}
        onClose={() => setDrawerOpen(false)}
        presets={presets}
        loadingPresets={loadingPresets}
        activePresetId={activePresetId}
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
        onSelectPreset={handleSelectPreset}
        onUploadPreset={uploadMilkPreset}
        onRemovePreset={removePreset}
        onSelectSource={handleSelectSource}
        onSelectFile={handleSelectFile}
        libraryTracks={SAMPLE_TRACKS}
        currentTrackId={currentTrack?.id ?? null}
        loadingTrackId={loadingTrackId}
        onSelectTrack={handleSelectTrack}
        onQualityChange={handleQualityChange}
        onSettingsChange={handleSettingsChange}
        onBlendTimeChange={setBlendTime}
        activePresetData={activePreset?.data ?? null}
        onLivePreviewChange={handleLivePreviewChange}
        onSaveCustomPreset={handleSaveCustomPreset}
      />
    </div>
  );
}
