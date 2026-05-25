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
  private gainNode: GainNode | null = null;
  private vizBoostNode: GainNode | null = null;
  private source: AudioNode | null = null;
  private stream: MediaStream | null = null;
  private frequencyData: Uint8Array = new Uint8Array(0);
  private timeData: Uint8Array = new Uint8Array(0);
  private debugMode = false;
  private lastDebugLog = 0;

  private currentBuffer: AudioBuffer | null = null;
  private bufferStartedAt: number = 0;
  private bufferOffset: number = 0;
  private bufferPaused: boolean = false;

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
    this.vizBoostNode = this.context.createGain();
    this.vizBoostNode.gain.value = 1.0;
    this.analyser.connect(this.vizBoostNode);
    this.gainNode = this.context.createGain();
    this.gainNode.connect(this.context.destination);
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.fftSize);
  }

  updateQuality(settings: QualitySettings) {
    if (!this.analyser) return;
    this.analyser.fftSize = settings.fftSize;
    this.analyser.smoothingTimeConstant = settings.fftSmoothing;
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.fftSize);
  }

  async connectStream(stream: MediaStream, type: 'mic' | 'tab' = 'tab') {
    if (!this.context) await this.initContext(1024);
    await this.context!.resume();
    this.disconnectSource();
    this.stream = stream;
    const mediaSource = this.context!.createMediaStreamSource(stream);
    mediaSource.connect(this.analyser!);
    if (type !== 'mic') mediaSource.connect(this.gainNode!);
    // Mic input benefits from a gain boost since it's raw (no AGC) and butterchurn
    // normalizes to a long-term average — boosting helps transients register clearly.
    if (this.vizBoostNode) {
      this.vizBoostNode.gain.value = type === 'mic' ? 2.0 : 1.0;
    }
    this.source = mediaSource;
  }

  async connectFile(file: File): Promise<void> {
    if (!this.context) await this.initContext(1024);
    const ctx = this.context!;
    await ctx.resume();
    this.disconnectSource();

    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    if (this.vizBoostNode) this.vizBoostNode.gain.value = 1.0;
    this.currentBuffer = audioBuffer;
    this.bufferPaused = false;
    this._startBuffer(0);
  }

  async connectUrl(url: string): Promise<void> {
    if (!this.context) await this.initContext(1024);
    const ctx = this.context!;
    await ctx.resume();
    this.disconnectSource();

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load track (HTTP ${response.status})`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    if (this.vizBoostNode) this.vizBoostNode.gain.value = 1.0;
    this.currentBuffer = audioBuffer;
    this.bufferPaused = false;
    this._startBuffer(0);
  }

  private _startBuffer(offset: number) {
    if (!this.context || !this.currentBuffer) return;
    if (this.source) {
      try { this.source.disconnect(); } catch {}
      this.source = null;
    }
    const safeOffset = offset % this.currentBuffer.duration;
    const bufferSource = this.context.createBufferSource();
    bufferSource.buffer = this.currentBuffer;
    bufferSource.loop = true;
    bufferSource.connect(this.analyser!);
    bufferSource.connect(this.gainNode!);
    bufferSource.start(0, safeOffset);
    this.bufferStartedAt = this.context.currentTime;
    this.bufferOffset = safeOffset;
    this.source = bufferSource;
  }

  pauseBuffer() {
    if (!this.context || !this.currentBuffer || this.bufferPaused || !this.source) return;
    const elapsed = this.context.currentTime - this.bufferStartedAt;
    const offset = (this.bufferOffset + elapsed) % this.currentBuffer.duration;
    try { (this.source as AudioBufferSourceNode).stop(); } catch {}
    this.source = null;
    this.bufferOffset = offset;
    this.bufferPaused = true;
  }

  resumeBuffer() {
    if (!this.currentBuffer || !this.bufferPaused) return;
    this.bufferPaused = false;
    this._startBuffer(this.bufferOffset);
  }

  seekBuffer(time: number) {
    if (!this.currentBuffer) return;
    const safeTime = Math.max(0, Math.min(time, this.currentBuffer.duration));
    if (this.bufferPaused) {
      this.bufferOffset = safeTime;
    } else {
      this._startBuffer(safeTime);
    }
  }

  getBufferProgress(): { current: number; duration: number; paused: boolean } | null {
    if (!this.currentBuffer || !this.context) return null;
    let current: number;
    if (this.bufferPaused) {
      current = this.bufferOffset;
    } else {
      const elapsed = this.context.currentTime - this.bufferStartedAt;
      current = (this.bufferOffset + elapsed) % this.currentBuffer.duration;
    }
    return { current, duration: this.currentBuffer.duration, paused: this.bufferPaused };
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
    this.currentBuffer = null;
    this.bufferPaused = false;
    this.bufferOffset = 0;
    this.bufferStartedAt = 0;
  }

  getAudioData(): AudioData {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(this.frequencyData as Uint8Array<ArrayBuffer>);
      this.analyser.getByteTimeDomainData(this.timeData as Uint8Array<ArrayBuffer>);
    }

    if (this.debugMode) {
      const now = performance.now();
      if (now - this.lastDebugLog > 1000) {
        const max = Math.max(...this.frequencyData);
        const avg = Math.floor(this.frequencyData.reduce((a, b) => a + b, 0) / this.frequencyData.length);
        const nonZero = Array.from(this.frequencyData).filter(v => v > 0).length;
        console.log(`[Audio Debug] Max: ${max}, Avg: ${avg}, Non-zero bins: ${nonZero}/${this.frequencyData.length}`);
        console.log(`[Audio Debug] Frequency data:`, Array.from(this.frequencyData.slice(0, 32)));
        this.lastDebugLog = now;
      }
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

  setMuted(muted: boolean) {
    if (this.gainNode) this.gainNode.gain.value = muted ? 0 : 1;
  }

  setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
    console.log(`[Audio Debug] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  getContext() { return this.context; }
  getAnalyser() { return this.analyser; }
  getVizNode() { return this.vizBoostNode; }

  destroy() {
    this.disconnectSource();
    this.context?.close();
    this.context = null;
    this.analyser = null;
    this.gainNode = null;
    this.vizBoostNode = null;
  }
}

export const audioEngine = new AudioEngine();
