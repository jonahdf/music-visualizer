import { PARAMS_BY_GROUP } from './parameterDefs';

export function buildAIPrompt(preset: Record<string, unknown>): string {
  const sections = [
    { title: 'Motion & Warp', group: 'motion' as const },
    { title: 'Wave', group: 'wave' as const },
    { title: 'Color & Effects', group: 'color' as const },
    { title: 'Borders', group: 'borders' as const },
  ];

  let out = `# ButterMilk Studio — AI Preset Authoring Guide

I'm editing a **Butterchurn** music visualizer preset. Butterchurn is a JavaScript port of Milkdrop that renders in WebGL2. Please help me modify this preset.

**What I want to achieve:** [DESCRIBE YOUR GOAL HERE — e.g., "make it more psychedelic and reactive to bass", "create a gentle flowing tunnel", "make it feel like a lava lamp with slow drift"]

---

## ⚠️ Butterchurn vs. Native Milkdrop: Critical Differences

Butterchurn uses **JavaScript syntax** in per-frame and per-pixel equations. If you write native Milkdrop EEL syntax it will silently fail.

| EEL (native Milkdrop — WRONG) | Butterchurn JS (CORRECT) |
|---|---|
| \`zoom = 1.0 + 0.1*bass;\` | \`a.zoom = 1.0 + 0.1*a.bass_att;\` |
| \`sin(x)\`, \`cos(x)\`, \`abs(x)\` | \`Math.sin(x)\`, \`Math.cos(x)\`, \`Math.abs(x)\` |
| \`sqrt(x)\`, \`pow(x,y)\` | \`Math.sqrt(x)\`, \`Math.pow(x,y)\` |
| \`if(cond, then, else)\` | \`cond ? then : else\` |
| \`above(x, threshold)\` | \`x > threshold ? 1 : 0\` |
| \`below(x, threshold)\` | \`x < threshold ? 1 : 0\` |
| \`equal(x, y)\` | \`x === y ? 1 : 0\` |
| \`bnot(x)\` | \`x === 0 ? 1 : 0\` |
| \`int(x)\` | \`Math.floor(x)\` |
| \`q1 = ...\` (bare name) | \`a.q1 = ...\` (always \`a.\` prefix) |

**All variables must have the \`a.\` prefix.** There are no bare global names.

---

## Variable Reference

### Audio (already smoothed/normalized to 0–1)
- \`a.bass\` — raw bass (0–1), snappy but noisy
- \`a.bass_att\` — bass with slower attack, recommended for zoom/scale
- \`a.mid\`, \`a.mid_att\` — midrange frequencies
- \`a.treb\`, \`a.treb_att\` — treble/hi-hat frequencies
- \`a.vol\`, \`a.vol_att\` — overall volume

### Time & Frame
- \`a.time\` — seconds since preset loaded (float, always increasing)
- \`a.fps\` — current frame rate
- \`a.frame\` — frame count (integer, always increasing)

### Motion (writeable each frame)
- \`a.zoom\` — zoom factor (1.0 = no zoom, 1.05 = tunnel inward, 0.97 = collapse)
- \`a.rot\` — rotation in radians/frame (0.01 = slow spin)
- \`a.decay\` — trail fade (1.0 = no fade, 0.98 = long trails, 0.9 = short)
- \`a.warp\` — warp amplitude (0 = flat, 1 = normal, 2 = heavy distortion)
- \`a.dx\`, \`a.dy\` — horizontal/vertical drift
- \`a.cx\`, \`a.cy\` — rotation/zoom center (0.5 = screen center)
- \`a.sx\`, \`a.sy\` — x/y stretch

### Wave Color (writeable, can be accumulators)
- \`a.wave_r\`, \`a.wave_g\`, \`a.wave_b\` — wave RGB (0–1)
  **Important:** these are stateful — if you write \`a.wave_r = a.wave_r + delta\`
  the value accumulates across frames. Don't reset them to a constant unless you
  want to stop the accumulation.

### Q-Variables (persist across frames — key for state/beat-detection)
- \`a.q1\` through \`a.q32\` — user-defined variables that survive from one frame to the next
- Initialize them in **per_frame_init_eqs_str** (runs once when preset loads)
- Read and write them in per-frame equations to build up state over time
- Example: \`a.q1 = a.q1 + a.bass * 0.1;\` — accumulates a beat phase counter

### GLSL Shaders (warp_str / comp_str)
- Q-variables \`q1\`–\`q32\` are available as GLSL uniforms (no \`a.\` prefix in GLSL)
- \`uv\`, \`uv_orig\` — vec2 texture coordinates
- \`rad\`, \`ang\` — float polar coordinates
- \`GetBlur1(uv)\`, \`GetBlur2(uv)\`, \`GetBlur3(uv)\` — blurred frame samples
- Output: write to \`ret\` (vec4) or return it

---

## Pattern Examples (Butterchurn JS)

### Pattern 1: Beat-Reactive Zoom with Smooth Decay (inspired by Geiss presets)
\`\`\`js
// per_frame_eqs_str
a.zoom = 1.0 + 0.08 * a.bass_att;
a.rot = 0.003 * Math.sin(a.time * 0.7);
a.decay = 0.97;
a.warp = 0.5 + 0.5 * a.mid_att;
\`\`\`

### Pattern 2: Color Cycling via Accumulation (inspired by Martin presets)
These wave color variables are used as **accumulators** — they read their own previous
value and add sine terms. The slider system won't reset them mid-equation if they're
already referenced here.
\`\`\`js
// per_frame_init_eqs_str
a.q1 = 0;  // hue phase

// per_frame_eqs_str
a.q1 = a.q1 + 0.004;  // slow hue drift (accumulates across frames)
a.wave_r = a.wave_r + 0.25 * Math.sin(1.4 * a.time) + 0.25 * Math.sin(2.25 * a.time);
a.wave_g = a.wave_g + 0.25 * Math.sin(1.7 * a.time) + 0.25 * Math.sin(2.11 * a.time);
a.wave_b = a.wave_b + 0.25 * Math.sin(1.84 * a.time) + 0.25 * Math.sin(2.3 * a.time);
\`\`\`

### Pattern 3: Beat Detection with Q-Variable State
\`\`\`js
// per_frame_init_eqs_str
a.q1 = 0;  // beat flash brightness
a.q2 = 0;  // previous bass level for edge detection

// per_frame_eqs_str
var bassEdge = a.bass - a.q2;  // positive = bass rising
a.q2 = a.bass;                  // store for next frame
a.q1 = bassEdge > 0.2 ? 1.0 : a.q1 * 0.85;  // flash on beat, decay otherwise
a.zoom = 1.0 + 0.12 * a.q1;
a.decay = 0.95 + 0.04 * (1.0 - a.q1);
\`\`\`

### Pattern 4: Tunnel Effect via Per-Vertex (per_pixel_eqs_str)
Per-vertex equations run on every mesh vertex. Use \`a.rad\` and \`a.ang\` for
radial/angular control. Setting \`a.zoom\` here overrides it per-vertex.
\`\`\`js
// per_pixel_eqs_str — creates perspective tunnel zoom strongest at center
var pullStrength = 0.04 * a.bass_att;
a.zoom = 1.0 + pullStrength / (a.rad + 0.3);
a.rot = a.ang * 0.02;  // gentle angular spin
\`\`\`

### Pattern 5: Kaleidoscope-Style Radial Symmetry (per_pixel_eqs_str)
\`\`\`js
// per_pixel_eqs_str
var folds = 6.0;
var snappedAng = Math.round(a.ang * folds / (2.0 * Math.PI)) * (2.0 * Math.PI) / folds;
a.dx = (snappedAng - a.ang) * a.rad * 0.02;
\`\`\`

### Pattern 6: RGB Color Split via GLSL (comp_str)
\`\`\`glsl
// comp_str (GLSL)
vec2 offset = vec2(0.003 * q1, 0.0);
vec4 r = texture2D(sampler_main, uv + offset);
vec4 b = texture2D(sampler_main, uv - offset);
ret = vec4(r.r, texture2D(sampler_main, uv).g, b.b, 1.0);
\`\`\`

---

## Reference: https://www.geisswerks.com/milkdrop/milkdrop_preset_authoring.html

The Geisswerks guide describes the Milkdrop preset system in depth. When adapting
code from that guide to Butterchurn:
- Replace EEL bare names with \`a.varName\` (e.g. \`zoom\` → \`a.zoom\`)
- Replace EEL math with JS Math object (\`sin\` → \`Math.sin\`)
- Replace EEL conditionals with ternary (\`if(c,t,e)\` → \`c ? t : e\`)
- GLSL shaders (\`warp_str\`, \`comp_str\`) work the same way as Milkdrop's shader system

---

## Current Preset Parameters

`;

  for (const { title, group } of sections) {
    const params = PARAMS_BY_GROUP[group].filter(p => p.type !== 'code');
    out += `### ${title}\n\n`;
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
    }
    out += '\n';
  }

  const initCode = String(preset['per_frame_init_eqs_str'] ?? '').trim();
  const perFrameCode = String(preset['per_frame_eqs_str'] ?? '').trim();
  const perPixelCode = String(preset['per_pixel_eqs_str'] ?? '').trim();
  const warpShader = String(preset['warp_str'] ?? '').trim();
  const compShader = String(preset['comp_str'] ?? '').trim();

  out += `### Equations & Shaders

**per_frame_init_eqs_str** (runs once on load):
\`\`\`
${initCode || '(none)'}
\`\`\`

**per_frame_eqs_str** (runs every frame — use \`a.\` prefix, \`Math.sin()\` etc.):
\`\`\`
${perFrameCode || '(none)'}
\`\`\`

**per_pixel_eqs_str** (runs per mesh vertex — \`a.rad\`, \`a.ang\`, \`a.x\`, \`a.y\` available):
\`\`\`
${perPixelCode || '(none)'}
\`\`\`

**warp_str** (GLSL warp shader):
\`\`\`glsl
${warpShader || '(none)'}
\`\`\`

**comp_str** (GLSL composite shader):
\`\`\`glsl
${compShader || '(none)'}
\`\`\`

---

## How to Respond

Output ONLY a JSON object with the parameters you want to change. Omit unchanged parameters. Example:

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
- Equation strings: use \`\\n\` for newlines; **always** \`a.\` prefix; **always** \`Math.sin()\` not \`sin()\`
- To replace the entire preset, include all parameters
- Only output the JSON block — no other text
`;

  return out;
}
