import type { QualitySettings } from '../types';

export interface AudioData {
  frequencyData: Uint8Array;
  timeData: Uint8Array;
  bass: number;
  mid: number;
  treble: number;
  volume: number;
}

export class AudioEngine {
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: AudioNode | null = null;
  private stream: MediaStream | null = null;
  private frequencyData: Uint8Array = new Uint8Array(0);
  private timeData: Uint8Array = new Uint8Array(0);

  async initContext(fftSize: number): Promise<AudioContext> {
    if (this.context && this.context.state !== 'closed') {
      return this.context;
    }
    this.context = new AudioContext();
    this.setupAnalyser(fftSize);
    return this.context;
  }

  private setupAnalyser(fftSize: number) {
    if (!this.context) return;
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = fftSize;
    this.analyser.smoothingTimeConstant = 0.8;
    // Intentionally NOT connected to destination here — each source decides whether to route to output.
    // Tab/mic sources skip output (source tab already plays audio); file sources connect directly.
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.fftSize);
  }

  updateQuality(settings: QualitySettings) {
    if (!this.analyser) return;
    this.analyser.fftSize = settings.fftSize;
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.fftSize);
  }

  async connectStream(stream: MediaStream) {
    if (!this.context) await this.initContext(1024);
    this.disconnectSource();
    this.stream = stream;
    const mediaSource = this.context!.createMediaStreamSource(stream);
    mediaSource.connect(this.analyser!);
    // Route captured audio to this tab's output so the source tab can be muted.
    // This keeps the visualization tightly synced to what you hear.
    mediaSource.connect(this.context!.destination);
    this.source = mediaSource;
  }

  async connectFile(file: File): Promise<void> {
    if (!this.context) await this.initContext(1024);
    const ctx = this.context!;
    await ctx.resume();
    this.disconnectSource();

    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const bufferSource = ctx.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.loop = true;
    bufferSource.connect(this.analyser!);
    bufferSource.connect(ctx.destination);
    bufferSource.start();
    this.source = bufferSource;
  }

  disconnectSource() {
    if (this.source) {
      try { this.source.disconnect(); } catch {}
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  getAudioData(): AudioData {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(this.frequencyData);
      this.analyser.getByteTimeDomainData(this.timeData);
    }

    const bins = this.frequencyData.length;
    const bassEnd = Math.floor(bins * 0.1);
    const midEnd = Math.floor(bins * 0.5);

    const avg = (start: number, end: number) => {
      let sum = 0;
      for (let i = start; i < end; i++) sum += this.frequencyData[i];
      return (sum / (end - start)) / 255;
    };

    return {
      frequencyData: this.frequencyData,
      timeData: this.timeData,
      bass: avg(0, bassEnd),
      mid: avg(bassEnd, midEnd),
      treble: avg(midEnd, bins),
      volume: avg(0, bins),
    };
  }

  getContext() { return this.context; }
  getAnalyser() { return this.analyser; }

  destroy() {
    this.disconnectSource();
    this.context?.close();
    this.context = null;
    this.analyser = null;
  }
}

export const audioEngine = new AudioEngine();
