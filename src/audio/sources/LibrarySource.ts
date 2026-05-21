import { audioEngine } from '../AudioEngine';

export async function connectTrack(url: string): Promise<void> {
  await audioEngine.connectUrl(url);
}
