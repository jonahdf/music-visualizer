import { audioEngine } from '../AudioEngine';

export async function connectMic(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  await audioEngine.connectStream(stream);
}
