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

**IMPORTANT — Variable format:** Use butterchurn JavaScript format with \`a.\` prefix. NOT native Milkdrop EEL syntax.
- Audio (smoothed): \`a.bass_att\`, \`a.mid_att\`, \`a.treb_att\`, \`a.vol\`
- Time / state: \`a.time\`, \`a.fps\`, \`a.frame\`
- Motion: \`a.zoom\`, \`a.rot\`, \`a.decay\`, \`a.warp\`, \`a.dx\`, \`a.dy\`, \`a.cx\`, \`a.cy\`, \`a.sx\`, \`a.sy\`
- Wave color: \`a.wave_r\`, \`a.wave_g\`, \`a.wave_b\`
- Math: \`Math.sin()\`, \`Math.cos()\`, \`Math.abs()\` — NOT \`sin()\`, \`cos()\` etc.
- Q-variables (persist across frames): \`a.q1\` through \`a.q32\`

Correct: \`a.zoom = 1.05 + 0.1*a.bass_att;\`
Wrong: \`zoom = 1.05 + 0.1*bass;\`

## Per-Vertex (Warp) Equations
\`\`\`
${perPixelCode || '(none)'}
\`\`\`
Per-vertex variables: \`a.x\`, \`a.y\` (0–1 coords), \`a.rad\`, \`a.ang\` (polar). Can override: \`a.zoom\`, \`a.rot\`, \`a.warp\`, \`a.dx\`, \`a.dy\`

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
  "per_frame_eqs_str": "a.zoom = 1.0 + 0.1*a.bass_att;\\na.rot = 0.02*Math.sin(a.time);"
}
\`\`\`

**Rules:**
- Float values must be numbers (not strings)
- Bool values: \`1\` = ON, \`0\` = OFF
- Equation strings: use \`\\n\` for newlines; use \`a.\` prefix on all variables; use \`Math.sin()\` not \`sin()\`
- To replace the entire preset, include all parameters
- Only output the JSON block — no other text needed
`;

  return out;
}
