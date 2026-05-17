import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { SavedPreset } from '../types';

interface VisualizerDB extends DBSchema {
  presets: {
    key: string;
    value: SavedPreset;
    indexes: { 'by-name': string };
  };
}

let db: IDBPDatabase<VisualizerDB> | null = null;

async function getDB() {
  if (!db) {
    db = await openDB<VisualizerDB>('music-visualizer', 1, {
      upgrade(database) {
        const store = database.createObjectStore('presets', { keyPath: 'id' });
        store.createIndex('by-name', 'name');
      },
    });
  }
  return db;
}

export async function savePreset(preset: SavedPreset): Promise<void> {
  const database = await getDB();
  await database.put('presets', preset);
}

export async function loadAllPresets(): Promise<SavedPreset[]> {
  const database = await getDB();
  return database.getAll('presets');
}

export async function deletePreset(id: string): Promise<void> {
  const database = await getDB();
  await database.delete('presets', id);
}

export async function getPreset(id: string): Promise<SavedPreset | undefined> {
  const database = await getDB();
  return database.get('presets', id);
}
