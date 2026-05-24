import _butterchurn from 'butterchurn';
// Vite CJS interop wraps the module in an extra .default
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const butterchurn = (_butterchurn as any).default ?? _butterchurn;
import type { QualitySettings } from '../types';

export class ButterchurnRenderer {
  private visualizer: ReturnType<typeof butterchurn.createVisualizer> | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private animFrameId: number | null = null;
  private lastFrameTime = 0;
  private fpsCap = 60;
  private currentPresetName = '';
  private analyser: AnalyserNode | null = null;
  private debugMode = false;
  private lastDebugLog = 0;

  init(canvas: HTMLCanvasElement, audioContext: AudioContext, quality: QualitySettings) {
    this.canvas = canvas;
    this.fpsCap = quality.fpsCap;

    this.visualizer = butterchurn.createVisualizer(audioContext, canvas, {
      width: canvas.width,
      height: canvas.height,
      meshWidth: quality.meshWidth,
      meshHeight: quality.meshHeight,
      pixelRatio: window.devicePixelRatio || 1,
    });
  }

  loadPreset(preset: object, blendSeconds = 2.7) {
    if (!this.visualizer) return;
    try {
      this.visualizer.loadPreset(preset, blendSeconds);
    } catch {
      // Malformed per-frame equations or other preset parse errors must not
      // propagate into React's state update machinery.
    }
  }

  getCurrentPresetName() {
    return this.currentPresetName;
  }

  setCurrentPresetName(name: string) {
    this.currentPresetName = name;
  }

  connectAudio(node: AudioNode, analyser?: AnalyserNode) {
    if (!this.visualizer) return;
    this.visualizer.connectAudio(node);
    this.analyser = analyser ?? null;
  }

  setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
    console.log(`[Renderer Debug] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  resize(width: number, height: number, quality: QualitySettings) {
    if (!this.canvas || !this.visualizer) return;
    const scaledW = Math.floor(width * quality.resolutionScale);
    const scaledH = Math.floor(height * quality.resolutionScale);
    this.canvas.width = scaledW;
    this.canvas.height = scaledH;
    this.visualizer.setRendererSize(scaledW, scaledH);
  }

  updateQuality(quality: QualitySettings) {
    this.fpsCap = quality.fpsCap;
    if (this.canvas) {
      this.resize(
        Math.floor(this.canvas.width / (this.canvas.width / window.innerWidth || 1)),
        Math.floor(this.canvas.height / (this.canvas.height / window.innerHeight || 1)),
        quality,
      );
    }
  }

  startRenderLoop() {
    if (this.animFrameId !== null) return;

    const loop = (timestamp: number) => {
      this.animFrameId = requestAnimationFrame(loop);

      const minInterval = this.fpsCap > 0 ? 1000 / this.fpsCap : 0;
      if (timestamp - this.lastFrameTime < minInterval) return;
      this.lastFrameTime = timestamp;

      if (this.debugMode && this.analyser) {
        const now = performance.now();
        if (now - this.lastDebugLog > 1000) {
          const freqData = new Uint8Array(this.analyser.frequencyBinCount);
          this.analyser.getByteFrequencyData(freqData);
          const max = Math.max(...freqData);
          const avg = Math.floor(freqData.reduce((a, b) => a + b, 0) / freqData.length);
          const nonZero = Array.from(freqData).filter(v => v > 0).length;
          console.log(`[Renderer Debug] Max: ${max}, Avg: ${avg}, Non-zero bins: ${nonZero}/${freqData.length}`);
          console.log(`[Renderer Debug] Frequency data:`, Array.from(freqData.slice(0, 32)));
          this.lastDebugLog = now;
        }
      }

      if (this.visualizer) {
        this.visualizer.render();
      }
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  stopRenderLoop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  destroy() {
    this.stopRenderLoop();
    this.visualizer = null;
    this.canvas = null;
  }
}
