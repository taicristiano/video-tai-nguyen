/**
 * scripts/test-hay-dep-schnell-clean-surface-geometry.mjs
 *
 * HAY & ĐẸP. — V3.3B-S.6.1
 * Single Goal: Schnell Text-Pollution Prompt Geometry Only
 * Model: @cf/black-forest-labs/flux-1-schnell
 *
 * Tests whether removing all writing/signature/logo/watermark vocabulary
 * and replacing with positive clean-surface policy eliminates pseudo-signatures.
 *
 * Evaluates 4 previously polluted beats x 2 independent calls = 8 images:
 * - beat-06 (father)
 * - beat-07 (school/work object)
 * - beat-09 (mother)
 * - beat-15 (release, 0 people)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const BASE_DIR = path.join(ROOT, 'scratch', 'v33', 'schnell-clean-surface');

export const MODEL_ID = '@cf/black-forest-labs/flux-1-schnell';
export const TARGET_BEATS = ['beat-06', 'beat-07', 'beat-09', 'beat-15'];

export const FORBIDDEN_TOKENS = [
  'text',
  'word',
  'written',
  'writing',
  'letter',
  'lettering',
  'logo',
  'signature',
  'watermark',
  'caption',
  'label',
  'brand',
  'typography',
  'font',
  'sign',
  'signed',
];

export function validatePrompt(prompt) {
  const promptLower = prompt.toLowerCase();
  for (const token of FORBIDDEN_TOKENS) {
    const regex = new RegExp(`\\b${token}[a-z]*\\b`, 'i');
    if (regex.test(promptLower)) {
      const match = promptLower.match(regex);
      return { valid: false, forbiddenToken: match ? match[0] : token };
    }
  }
  return { valid: true };
}

export function loadEnvFile(filename) {
  const fullPath = path.resolve(ROOT, filename);
  if (!fs.existsSync(fullPath)) return;
  const content = fs.readFileSync(fullPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

export function auditAuth() {
  loadEnvFile('.env.local');
  loadEnvFile('.env');

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;

  return {
    hasAccountId: Boolean(accountId && accountId.trim().length > 0),
    hasToken: Boolean(token && token.trim().length > 0),
    accountId: accountId?.trim(),
    token: token?.trim(),
  };
}

// --- Style-First Prompt Blocks (Sections 4, 6, 7, 8, 10) ---

export const MEDIUM_LOCK = `MEDIUM LOCK:

2D EDITORIAL DRAWING ONLY.
Hand-drawn magazine illustration on warm paper.
Visible ink contour lines around faces, bodies, hands, furniture and objects.
Opaque matte color shapes with restrained soft shading.
Clearly drawn and illustrated, never camera-rendered.
Mature contemporary editorial illustration for adults.`;

export const RENDERING_RECIPE = `RENDERING RECIPE:

Charcoal / sepia contour drawing.
Matte gouache-like color fills.
One restrained soft shadow layer.
Subtle paper grain visible across the image.
Simplified believable Vietnamese / East Asian features when people are present.
Edges remain visibly illustrated instead of photographic.
Background details are simplified into clean drawn shapes.`;

export const PALETTE = `PALETTE:

Warm ivory and cream.
Muted sage.
Warm medium wood.
Charcoal / sepia linework.
Small restrained terracotta or amber accents.
Low saturation. No glossy surfaces.`;

export const WORLD = `WORLD:

Warm Vietnamese family home. Warm ivory walls, medium warm wood furniture, simple hanging lamp. Plain smooth walls.`;

export const CLEAN_SURFACE_POLICY = `CLEAN SURFACE POLICY:

Plain uninterrupted warm-paper surfaces.
Walls and furniture use simple solid shapes and natural wood grain only.
Decor consists only of simple plants, plain ceramic objects and geometric color blocks.
Bottom-right area remains quiet blank warm ivory paper with generous empty space.
Frame edges and corners stay visually clean and undecorated.`;

export function buildCleanSurfacePrompt(beatId) {
  let peopleBlock = '';
  let castBlock = '';
  let sceneBlock = '';
  let framingBlock = '';

  if (beatId === 'beat-06') {
    peopleBlock = `VISIBLE PEOPLE:
Exactly one visible person in the entire illustration.
Only father.
No second person.
No background person.
No partial extra human body.`;

    castBlock = `CAST:
father: Vietnamese man, 34, clean-shaven, NO GLASSES, short black hair, sage overshirt, cream T-shirt, charcoal trousers.`;

    sceneBlock = `SCENE:
Father rests his hands calmly on a plain wooden side table in a quiet room. Peaceful domestic atmosphere. Lower-right area remains quiet empty warm ivory paper.`;

    framingBlock = `FRAMING:
Editorial portrait composition. Subject on the left; lower-right corner remains completely open and empty.`;
  } else if (beatId === 'beat-07') {
    peopleBlock = `VISIBLE PEOPLE:
No people visible anywhere in the illustration.
No face, head, hand, arm, body, silhouette, reflection or background person.`;

    sceneBlock = `SCENE:
Two plain unadorned canvas bags resting on the wooden floor near a plain curtain. Soft warm indoor lighting. No wall decorations. Lower-right corner remains quiet empty warm ivory paper.`;

    framingBlock = `FRAMING:
Still-life composition. Objects on the left; lower-right corner remains completely open and empty.`;
  } else if (beatId === 'beat-09') {
    peopleBlock = `VISIBLE PEOPLE:
Exactly one visible person in the entire illustration.
Only mother.
No second person.
No background person.
No partial extra human body.`;

    castBlock = `CAST:
mother: Vietnamese woman, 32, low bun, NO GLASSES, warm beige cardigan, cream dress.`;

    sceneBlock = `SCENE:
Mother quietly pauses on an undecorated sofa with a gentle serene smile. Plain walls and curtain behind. Lower-right corner remains quiet empty warm ivory paper.`;

    framingBlock = `FRAMING:
Editorial portrait composition. Subject on the left; lower-right corner remains completely open and empty.`;
  } else if (beatId === 'beat-15') {
    peopleBlock = `VISIBLE PEOPLE:
No people visible anywhere in the illustration.
No face, head, hand, arm, body, silhouette, reflection or background person.`;

    sceneBlock = `SCENE:
Quiet warm room after dinner, plain wooden dining table, empty wooden chairs, blank ceramic vase, soft warm hanging lamp. Entirely plain smooth walls without frames. Lower-right corner remains quiet empty warm ivory paper.`;

    framingBlock = `FRAMING:
Wide drawn composition. Empty room, leaving the lower-right area completely open and empty.`;
  }

  // Order: MEDIUM LOCK -> RENDERING RECIPE -> PALETTE -> VISIBLE PEOPLE -> CAST/SCENE -> WORLD -> FRAMING -> CLEAN SURFACE POLICY
  const parts = [
    MEDIUM_LOCK,
    RENDERING_RECIPE,
    PALETTE,
    peopleBlock,
    castBlock,
    sceneBlock,
    WORLD,
    framingBlock,
    CLEAN_SURFACE_POLICY,
  ].filter(Boolean);

  const prompt = parts.join('\n\n');

  return { prompt, length: prompt.length };
}

export async function callCloudflareSchnell(prompt) {
  const auth = auditAuth();
  if (!auth.hasAccountId || !auth.hasToken) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is missing');
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/ai/run/${MODEL_ID}`;
  const payload = { prompt };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const textBody = await response.text();

  if (!response.ok) {
    throw new Error(`Cloudflare ${response.status} [${MODEL_ID}]: ${textBody.slice(0, 500)}`);
  }

  let data;
  try {
    data = JSON.parse(textBody);
  } catch {
    throw new Error(`Invalid JSON response: ${textBody.slice(0, 300)}`);
  }

  const imageBase64 = data.result?.image;
  if (!imageBase64) {
    throw new Error(`No result.image in response: ${textBody.slice(0, 300)}`);
  }

  return Buffer.from(imageBase64, 'base64');
}

export async function createContactSheet({
  imageGrid, // 4 rows x 2 cols
  outputPath,
  title = 'HAY & ĐẸP. V3.3B-S.6.1 — Clean-Surface Geometry Test',
  subtitle = '4 Previously Polluted Beats × 2 Calls = 8 Images • Zero Writing Keywords in Prompt',
}) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const gridHtml = imageGrid
    .map((row) => {
      const cellsHtml = row
        .map((cell) => {
          const absPath = path.isAbsolute(cell.path) ? cell.path : path.resolve(ROOT, cell.path);
          let imgTag = '';
          if (fs.existsSync(absPath)) {
            const buf = fs.readFileSync(absPath);
            const b64 = buf.toString('base64');
            imgTag = `<img src="data:image/jpeg;base64,${b64}" style="width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;display:block;" />`;
          } else {
            imgTag = `<div style="width:100%;aspect-ratio:1/1;background:#2A2A2A;display:flex;align-items:center;justify-content:center;color:#E06C75;font-size:14px;padding:12px;">Missing<br/>${path.basename(cell.path)}</div>`;
          }
          return `
          <div style="background:#181818;border:1px solid #333;border-radius:6px;overflow:hidden;display:flex;flex-direction:column;">
            <div style="padding:8px 10px;font-size:13px;font-weight:700;color:#F0F0F0;background:#111;text-align:center;border-bottom:1px solid #282828;">
              ${cell.header}
            </div>
            ${imgTag}
            <div style="padding:8px 10px;font-size:11px;font-weight:500;color:#AAA;background:#141414;text-align:center;border-top:1px solid #282828;white-space:pre-line;">
              ${cell.footer}
            </div>
          </div>
        `;
        })
        .join('');
      return `<div style="display:grid;grid-template-columns:repeat(${row.length}, 1fr);gap:20px;margin-bottom:20px;">${cellsHtml}</div>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 24px;
      background: #0D0D0D;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #FFF;
      box-sizing: border-box;
    }
    .header {
      margin-bottom: 20px;
      border-bottom: 1px solid #222;
      padding-bottom: 14px;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      color: #F5EFEB;
      margin-bottom: 6px;
      letter-spacing: -0.3px;
    }
    .subtitle {
      font-size: 13px;
      color: #8C827A;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
  </div>
  <div>
    ${gridHtml}
  </div>
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'load' });
  await page.setViewportSize({ width: 900, height: 1800 });

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await page.screenshot({ path: outputPath, type: 'jpeg', quality: 90, fullPage: true });
  await browser.close();
}

async function main() {
  if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true });

  console.log('=== HAY & ĐẸP. V3.3B-S.6.1: Schnell Clean-Surface Geometry Test ===');
  console.log(`Base directory: ${BASE_DIR}\n`);

  const auth = auditAuth();
  if (!auth.hasAccountId || !auth.hasToken) {
    console.error('❌ Cloudflare credentials missing from environment / .env');
    process.exit(1);
  }
  console.log('✅ Cloudflare auth credentials loaded.\n');

  // 1. Build and validate prompts for the 4 target beats
  console.log('=== 1. Building and Validating Clean-Surface Prompts ===');
  const promptData = {};

  for (const beatId of TARGET_BEATS) {
    const built = buildCleanSurfacePrompt(beatId);

    // Critical programmatic validation (Section 5)
    const val = validatePrompt(built.prompt);
    if (!val.valid) {
      console.error(`❌ FORBIDDEN TOKEN DETECTED in ${beatId}: "${val.forbiddenToken}"`);
      throw new Error(`Forbidden token detected in prompt for ${beatId}: "${val.forbiddenToken}"`);
    }

    if (built.length > 2100) {
      console.error(`❌ Prompt for ${beatId} exceeds 2100 characters: ${built.length}`);
      process.exit(1);
    }

    promptData[beatId] = {
      beatId,
      charCount: built.length,
      forbiddenTokenValidation: 'PASSED (0 forbidden tokens)',
      prompt: built.prompt,
    };

    console.log(`  ${beatId}: ${built.length} chars | Forbidden Tokens: 0 (VALID)`);
  }

  const promptsJsonPath = path.join(BASE_DIR, 'prompts.json');
  fs.writeFileSync(promptsJsonPath, JSON.stringify(promptData, null, 2));
  console.log(`✅ Saved: ${promptsJsonPath}\n`);

  // 2. Generate 4 beats x 2 calls = 8 images
  console.log('=== 2. Generating 8 Images (4 beats × 2 independent calls) ===');
  const runs = [
    { beatId: 'beat-06', callId: 'a', filename: 'beat-06-a.jpg' },
    { beatId: 'beat-06', callId: 'b', filename: 'beat-06-b.jpg' },
    { beatId: 'beat-07', callId: 'a', filename: 'beat-07-a.jpg' },
    { beatId: 'beat-07', callId: 'b', filename: 'beat-07-b.jpg' },
    { beatId: 'beat-09', callId: 'a', filename: 'beat-09-a.jpg' },
    { beatId: 'beat-09', callId: 'b', filename: 'beat-09-b.jpg' },
    { beatId: 'beat-15', callId: 'a', filename: 'beat-15-a.jpg' },
    { beatId: 'beat-15', callId: 'b', filename: 'beat-15-b.jpg' },
  ];

  for (let i = 0; i < runs.length; i++) {
    const run = runs[i];
    const imagePath = path.join(BASE_DIR, run.filename);
    const p = promptData[run.beatId].prompt;

    // Validate again immediately before call
    const val = validatePrompt(p);
    if (!val.valid) {
      throw new Error(`Pre-call validation failed for ${run.filename}: found "${val.forbiddenToken}"`);
    }

    console.log(`[${i + 1}/8] Generating ${run.filename} (${run.beatId} call ${run.callId.toUpperCase()})...`);
    const startTime = Date.now();

    const buffer = await callCloudflareSchnell(p);
    fs.writeFileSync(imagePath, buffer);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`  ✅ Saved ${run.filename} (${(buffer.length / 1024).toFixed(1)} KB, ${elapsed}s)`);

    if (i < runs.length - 1) {
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  // 3. Create 4x2 Contact Sheet
  console.log('\n=== 3. Creating 4x2 Contact Sheet ===');
  const contactSheetPath = path.join(BASE_DIR, 'contact-sheet.jpg');

  const gridRows = TARGET_BEATS.map((beatId) => [
    {
      path: path.join(BASE_DIR, `${beatId}-a.jpg`),
      header: `${beatId.toUpperCase()} A`,
      footer: 'Clean-surface geometry\nCall A',
    },
    {
      path: path.join(BASE_DIR, `${beatId}-b.jpg`),
      header: `${beatId.toUpperCase()} B`,
      footer: 'Clean-surface geometry\nCall B',
    },
  ]);

  await createContactSheet({
    imageGrid: gridRows,
    outputPath: contactSheetPath,
    title: 'HAY & ĐẸP. V3.3B-S.6.1 — Clean-Surface Geometry Test',
    subtitle: '4 Previously Polluted Beats × 2 Calls = 8 Images • Layout: [A, B] per row',
  });
  console.log(`✅ Saved contact sheet: ${contactSheetPath}\n`);

  console.log('=== Image Generation Completed. Ready for Visual QA Inspection ===');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`Fatal Error: ${err.message}`);
    process.exit(1);
  });
}
