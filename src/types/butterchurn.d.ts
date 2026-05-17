declare module 'butterchurn' {
  interface VisualizerOptions {
    width: number;
    height: number;
    meshWidth?: number;
    meshHeight?: number;
    pixelRatio?: number;
  }

  interface Visualizer {
    loadPreset(preset: object, blendSeconds?: number): void;
    connectAudio(analyserNode: AnalyserNode): void;
    render(): void;
    setRendererSize(width: number, height: number): void;
  }

  const butterchurn: {
    createVisualizer(
      audioContext: AudioContext,
      canvas: HTMLCanvasElement,
      options: VisualizerOptions,
    ): Visualizer;
  };
  export default butterchurn;
}

declare module 'butterchurn-presets' {
  const presets: {
    getPresets?(): Record<string, object>;
    [key: string]: unknown;
  };
  export default presets;
}
