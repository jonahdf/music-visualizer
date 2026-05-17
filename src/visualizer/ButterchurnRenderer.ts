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
    this.visualizer.loadPreset(preset, blendSeconds);
  }

  getCurrentPresetName() {
    return this.currentPresetName;
  }

  setCurrentPresetName(name: string) {
    this.currentPresetName = name;
  }

  connectAudio(node: AudioNode) {
    if (!this.visualizer) return;
    this.visualizer.connectAudio(node);
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
