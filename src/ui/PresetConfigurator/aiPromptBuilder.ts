import { PARAMS_BY_GROUP } from './parameterDefs';

export function buildAIPrompt(preset: Record<string, unknown>): string {
  const sections = [
    { title: 'Motion & Warp', group: 'motion' as const },
    { title: 'Wave', group: 'wave' as const },
    { title: 'Color & Effects', group: 'color' as const },
    { title: 'Borders', group: 'borders' as const },
  ];

  let out = `# Milkdrop Preset Editor — AI Assist

I'm editing a Milkdrop-style music visualizer preset. The parameters below control how the visualization looks and moves in real time to audio. Please help me modify this preset.

**What I want to achieve:** [DESCRIBE YOUR GOAL HERE — e.g., "make it more psychedelic and reactive to bass", "create a gentle flowing tunnel", "make it feel like a lava lamp with slow drift"]

---

`;

  for (const { title, group } of sections) {
    const params = PARAMS_BY_GROUP[group].filter(p => p.type !== 'code');
    out += `## ${title}\n\n`;
    for (const param of params) {
      const value = preset[param.key] ?? param.default;
      let valueStr: string;
      if (param.type === 'enum' && param.options) {
        const opt = param.options.find(o => o.value === value);
        const name = opt?.label.split(' — ')[1] ?? opt?.label ?? '';
        valueStr = `${value}${name ? ` (${name})` : ''}`;
      } else if (param.type === 'bool') {
        valueStr = (value === 1 || value === true) ? 'ON' : 'OFF';
      } else {
        valueStr = typeof value === 'number' ? value.toFixed(3) : String(value);
      }
      out += `- **${param.label}** (\`${param.key}\`): ${valueStr}\n`;
      out += `  → ${param.description}\n\n`;
    }
  }

  const initCode = String(preset['per_frame_init_eqs_str'] ?? '').trim();
  const perFrameCode = String(preset['per_frame_eqs_str'] ?? '').trim();
  const perPixelCode = String(preset['per_pixel_eqs_str'] ?? '').trim();

  out += `## Per-Frame Init Equations
\`\`\`
${initCode || '(none)'}
\`\`\`

## Per-Frame Equations (run every frame)
\`\`\`
${perFrameCode || '(none)'}
\`\`\`
Available audio variables: \`bass\`, \`mid\`, \`treb\`, \`vol\`, \`time\`, \`fps\`, \`frame\`
Can override per-frame: \`zoom\`, \`rot\`, \`dx\`, \`dy\`, \`cx\`, \`cy\`, \`sx\`, \`sy\`, \`warp\`, \`decay\`, \`wave_r\`, \`wave_g\`, \`wave_b\`

## Per-Vertex (Warp) Equations
\`\`\`
${perPixelCode || '(none)'}
\`\`\`
Per-vertex variables: \`x\`, \`y\` (0–1 coords), \`rad\`, \`ang\` (polar). Can override: \`zoom\`, \`rot\`, \`warp\`, \`x\`, \`y\`

---

## How to respond

Output ONLY a JSON object containing the parameters you want to change. Omit parameters that should stay the same. Example:

\`\`\`json
{
  "zoom": 1.05,
  "rot": 0.01,
  "fDecay": 0.95,
  "wave_r": 0.0,
  "wave_g": 1.0,
  "wave_b": 0.8,
  "bAdditiveWaves": 1,
  "per_frame_eqs_str": "zoom = 1.0 + 0.1*bass;\\nrot = 0.02*treble;"
}
\`\`\`

**Rules:**
- Float values must be numbers (not strings)
- Bool values: \`1\` = ON, \`0\` = OFF
- Equation strings: use \`\\n\` for newlines
- To replace the entire preset, include all parameters
- Only output the JSON block — no other text needed
`;

  return out;
}
