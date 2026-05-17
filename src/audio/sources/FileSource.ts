import { audioEngine } from '../AudioEngine';

export async function connectFile(file: File): Promise<void> {
  await audioEngine.connectFile(file);
}
