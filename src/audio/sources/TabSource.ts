import { audioEngine } from '../AudioEngine';
import { supportsTabAudioCapture } from '../browserSupport';

export async function connectTabAudio(): Promise<void> {
  if (!supportsTabAudioCapture()) {
    throw new Error(
      'Tab audio capture is not supported in Firefox. Use Chrome or Edge, or choose Microphone / Audio File instead.'
    );
  }
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { width: 1, height: 1, frameRate: 1 },
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      sampleRate: 48000,
      channelCount: 2,
    },
  });

  // Drop the video track — we only need audio
  stream.getVideoTracks().forEach(t => t.stop());

  if (stream.getAudioTracks().length === 0) {
    throw new Error('No audio track captured. Make sure to check "Share tab audio" in the browser dialog.');
  }

  await audioEngine.connectStream(stream);
}
