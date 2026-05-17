import { audioEngine } from '../AudioEngine';

export async function connectMic(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
    video: false,
  });
  await audioEngine.connectStream(stream, 'mic');
}
