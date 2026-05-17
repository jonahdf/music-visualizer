import { useState, useEffect, useCallback } from 'react';
import type { SavedPreset } from '../types';
import { savePreset, loadAllPresets, deletePreset } from './PresetStore';

let builtinCache: { name: string; data: object }[] | null = null;

function extractPresets(mod: unknown): Record<string, object> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const m = mod as any;
  const raw = m?.default ?? m;
  if (typeof raw?.getPresets === 'function') return raw.getPresets() as Record<string, object>;
  if (raw && typeof raw === 'object') return raw as Record<string, object>;
  return {};
}

async function getBuiltinPresets() {
  if (builtinCache) return builtinCache;

  const packModules = await Promise.all([
    import('butterchurn-presets'),
    import('butterchurn-presets/lib/butterchurnPresetsExtra.min.js'),
    import('butterchurn-presets/lib/butterchurnPresetsExtra2.min.js'),
    import('butterchurn-presets/lib/butterchurnPresetsMD1.min.js'),
    import('butterchurn-presets/lib/butterchurnPresetsNonMinimal.min.js'),
  ]);

  const merged = new Map<string, object>();
  for (const mod of packModules) {
    const presets = extractPresets(mod);
    for (const [name, data] of Object.entries(presets)) {
      if (!merged.has(name)) merged.set(name, data);
    }
  }

  builtinCache = Array.from(merged.entries()).map(([name, data]) => ({ name, data }));
  builtinCache.sort((a, b) => a.name.localeCompare(b.name));
  return builtinCache;
}

export interface PresetEntry {
  id: string;
  name: string;
  source: 'builtin' | 'uploaded' | 'custom';
  data: object;
}

export function usePresets() {
  const [presets, setPresets] = useState<PresetEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const [builtin, saved] = await Promise.all([getBuiltinPresets(), loadAllPresets()]);

    const builtinEntries: PresetEntry[] = builtin.map(p => ({
      id: `builtin:${p.name}`,
      name: p.name,
      source: 'builtin',
      data: p.data,
    }));

    const userEntries: PresetEntry[] = saved.map((p: SavedPreset) => ({
      id: p.id,
      name: p.name,
      source: p.source,
      data: p.data,
    }));

    setPresets([...builtinEntries, ...userEntries]);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const uploadMilkPreset = useCallback(async (file: File) => {
    const text = await file.text();
    let data: object;
    try {
      data = JSON.parse(text);
    } catch {
      data = { rawMilk: text };
    }
    const preset: SavedPreset = {
      id: `uploaded:${Date.now()}:${file.name}`,
      name: file.name.replace(/\.(milk|json)$/i, ''),
      source: 'uploaded',
      data,
      createdAt: Date.now(),
    };
    await savePreset(preset);
    await reload();
  }, [reload]);

  const removePreset = useCallback(async (id: string) => {
    await deletePreset(id);
    await reload();
  }, [reload]);

  return { presets, loading, uploadMilkPreset, removePreset, reload };
}
