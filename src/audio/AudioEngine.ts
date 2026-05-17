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
    // Dedicated gain node in the butterchurn signal path — gain adjusted per source type
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
    const bufferSource = ctx.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.loop = true;
    bufferSource.connect(this.analyser!);
    bufferSource.connect(this.gainNode!);
    bufferSource.start();
    if (this.vizBoostNode) this.vizBoostNode.gain.value = 1.0;
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
      this.analyser.getByteFrequencyData(this.frequencyData as Uint8Array<ArrayBuffer>);
      this.analyser.getByteTimeDomainData(this.timeData as Uint8Array<ArrayBuffer>);
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
