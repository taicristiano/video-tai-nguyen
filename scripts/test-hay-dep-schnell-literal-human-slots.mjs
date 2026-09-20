import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { parseHayDepVideos } from './parse-hay-dep-videos.mjs';
import { buildStoryPlan } from './human-insight-story-planner.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const BASE_DIR = path.join(ROOT, 'scratch', 'v33', 'schnell-literal-human-slots');
export const MODEL_ID = '@cf/black-forest-labs/flux-1-schnell';

export const TARGET_BEATS = ['beat-01', 'beat-02', 'beat-04', 'beat-09'];

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

export const MEDIUM_LOCK = `MEDIUM LOCK:
2D EDITORIAL DRAWING ONLY.
Hand-drawn magazine illustration on warm paper.
Visible ink contour lines around faces, bodies, hands, furniture and objects.
Opaque matte color shapes with restrained soft shading.
Clearly drawn and illustrated, never camera-rendered.
Mature contemporary editorial illustration for adults.`.replace(/\r\n/g, '\n');

export const RENDERING_RECIPE = `RENDERING RECIPE:
Charcoal / sepia contour drawing.
Matte gouache-like color fills.
One restrained soft shadow layer.
Subtle paper grain visible across the image.
Simplified but believable adult facial features.
Natural Vietnamese / East Asian proportions.
Edges remain visibly illustrated instead of photographic.
Background details are simplified into clean drawn shapes.
No lens effects, no bokeh, no cinematic camera realism.`.replace(/\r\n/g, '\n');

export const PALETTE = `PALETTE:
Warm ivory and cream background.
Muted sage clothing or accents.
Warm medium wood.
Charcoal / sepia linework.
Small restrained terracotta or amber accents.
Low saturation.
No glossy surfaces.`.replace(/\r\n/g, '\n');

export const CAST_CONSISTENCY = `CAST CONSISTENCY:
Keep clothing colors and age appearance consistent with slots above.`.replace(/\r\n/g, '\n');

export const HARD_EXCLUSIONS = `HARD EXCLUSIONS:
No words, signs, labels, logos, signatures or watermarks.
No anime, chibi, children's-book, corporate vector or 3D rendering.
No glossy skin or decorative wall lettering.`.replace(/\r\n/g, '\n');

export const BEAT_SPECS = {
  'beat-01': {
    role: 'establish',
    expectedHumanCount: 4,
    slots: [
      { id: 'slot1', desc: 'Vietnamese adult man, age 35–40, adult male build, short black hair, sage shirt', position: 'left' },
      { id: 'slot2', desc: 'Vietnamese adult woman, age 32–38, adult female build, tied black hair, warm cardigan', position: 'right' },
      { id: 'slot3', desc: 'Vietnamese boy, age 8–10, child body, 2/3 adult seated height, short black hair, sage top', position: 'front-left' },
      { id: 'slot4', desc: 'Vietnamese girl, age 6–8, child body, smaller than adults, dark hair, cream clothing', position: 'front-right' },
    ],
    humanLayout: `HUMAN LAYOUT:
VISIBLE HUMAN COUNT = 4.
SLOT 1 (left): Vietnamese adult man, age 35–40, adult male build, short black hair, sage shirt.
SLOT 2 (right): Vietnamese adult woman, age 32–38, adult female build, tied black hair, warm cardigan.
SLOT 3 (front-left): Vietnamese boy, age 8–10, child body, 2/3 adult seated height, short black hair, sage top.
SLOT 4 (front-right): Vietnamese girl, age 6–8, child body, smaller than adults, dark hair, cream clothing.
The entire illustration contains these four human figures only, all clearly visible as separate coherent bodies.`.replace(/\r\n/g, '\n'),
    action: `PRIMARY ACTION:
Four family members eat dinner at the wooden table.
MEANING:
Ordinary simple dinner.`.replace(/\r\n/g, '\n'),
    world: `WORLD:
Vietnamese dining room. Wood table, ivory walls, pendant lamp.`.replace(/\r\n/g, '\n'),
    framing: `FRAMING:
Wide drawn establishing composition.`.replace(/\r\n/g, '\n'),
  },
  'beat-02': {
    role: 'reflection',
    expectedHumanCount: 2,
    slots: [
      { id: 'slot1', desc: 'Vietnamese adult woman, age 32–38, adult female build, tied black hair, warm cardigan', position: 'left' },
      { id: 'slot2', desc: 'Vietnamese boy, age 8–10, child body, 2/3 adult seated height, short black hair, sage top', position: 'right' },
    ],
    humanLayout: `HUMAN LAYOUT:
VISIBLE HUMAN COUNT = 2.
SLOT 1 (left): Vietnamese adult woman, age 32–38, adult female build, tied black hair, warm cardigan.
SLOT 2 (right): Vietnamese boy, age 8–10, child body, 2/3 adult seated height, short black hair, sage top.
The entire illustration contains these two human figures only, both clearly visible as separate coherent bodies.`.replace(/\r\n/g, '\n'),
    action: `PRIMARY ACTION:
Mother serves rice into child’s bowl at the table.
MEANING:
Simple dinner action.`.replace(/\r\n/g, '\n'),
    world: `WORLD:
Vietnamese dining room. Wood table, ivory walls, pendant lamp.`.replace(/\r\n/g, '\n'),
    framing: `FRAMING:
Medium drawn reflection composition.`.replace(/\r\n/g, '\n'),
  },
  'beat-04': {
    role: 'interaction',
    expectedHumanCount: 3,
    slots: [
      { id: 'slot1', desc: 'Vietnamese adult man, age 35–40, adult male build, short black hair, muted sage shirt', position: 'left' },
      { id: 'slot2', desc: 'Vietnamese boy, age 8–10, child body, smaller than adults, short black hair, sage top', position: 'center' },
      { id: 'slot3', desc: 'Vietnamese adult woman, age 32–38, adult female build, tied black hair, warm cardigan', position: 'right' },
    ],
    humanLayout: `HUMAN LAYOUT:
VISIBLE HUMAN COUNT = 3.
SLOT 1 (left): Vietnamese adult man, age 35–40, adult male build, short black hair, muted sage shirt.
SLOT 2 (center): Vietnamese boy, age 8–10, child body, smaller than adults, short black hair, sage top.
SLOT 3 (right): Vietnamese adult woman, age 32–38, adult female build, tied black hair, warm cardigan.
Figures arranged left-center-right with child visibly between adults.
The entire illustration contains these three human figures only, all clearly visible as separate coherent bodies.`.replace(/\r\n/g, '\n'),
    action: `PRIMARY ACTION:
Boy speaks with hand gesture while parents listen warmly.
MEANING:
Warm reactive exchange.`.replace(/\r\n/g, '\n'),
    world: `WORLD:
Vietnamese dining room. Wood table, ivory walls, pendant lamp.`.replace(/\r\n/g, '\n'),
    framing: `FRAMING:
Medium drawn interaction composition.`.replace(/\r\n/g, '\n'),
  },
  'beat-09': {
    role: 'reflection',
    expectedHumanCount: 2,
    slots: [
      { id: 'slot1', desc: 'Vietnamese adult woman, age 32–38, adult female build, tied black hair, warm cardigan', position: 'left' },
      { id: 'slot2', desc: 'Vietnamese boy, age 8–10, child body, 2/3 adult seated height, short black hair, sage top', position: 'right' },
    ],
    humanLayout: `HUMAN LAYOUT:
VISIBLE HUMAN COUNT = 2.
SLOT 1 (left): Vietnamese adult woman, age 32–38, adult female build, tied black hair, warm cardigan.
SLOT 2 (right): Vietnamese boy, age 8–10, child body, 2/3 adult seated height, short black hair, sage top.
The entire illustration contains these two human figures only, both clearly visible as separate coherent bodies.`.replace(/\r\n/g, '\n'),
    action: `PRIMARY ACTION:
Mother and child perform a calm dinner action together.
MEANING:
Small domestic everyday moment.`.replace(/\r\n/g, '\n'),
    world: `WORLD:
Vietnamese dining room. Wood table, ivory walls, pendant lamp.`.replace(/\r\n/g, '\n'),
    framing: `FRAMING:
Medium drawn reflection composition.`.replace(/\r\n/g, '\n'),
  },
};

export function buildLiteralHumanSlotsPrompt(beatId) {
  const spec = BEAT_SPECS[beatId];
  if (!spec) throw new Error(`Unknown target beat: ${beatId}`);

  const parts = [
    MEDIUM_LOCK,
    RENDERING_RECIPE,
    PALETTE,
    spec.humanLayout,
    CAST_CONSISTENCY,
    spec.action,
    spec.world,
    spec.framing,
    HARD_EXCLUSIONS,
  ];

  return parts.join('\n\n');
}

export function loadVideo001StoryPlan() {
  const videos = parseHayDepVideos();
  const v1 = videos[0];
  const slug = 'phan-1-2026-09-19-co-nhung-bua-com-sau-nay-moi-hieu';
  const timelinePath = path.join(ROOT, 'public', slug, 'timeline.json');
  if (!fs.existsSync(timelinePath)) {
    throw new Error(`Timeline not found: ${timelinePath}`);
  }
  const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));
  const { plan, validation } = buildStoryPlan(v1, timeline.segments);
  return { v1, plan, validation, slug };
}

export async function callCloudflareSchnell(prompt) {
  const auth = auditAuth();
  if (!auth.hasAccountId || !auth.hasToken) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is missing');
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/ai/run/${MODEL_ID}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  const textBody = await response.text();
  if (!response.ok) {
    throw new Error(`Cloudflare ${response.status} [${MODEL_ID}]: ${textBody.slice(0, 1000)}`);
  }

  let data;
  try {
    data = JSON.parse(textBody);
  } catch {
    throw new Error(`Invalid JSON response from Cloudflare: ${textBody.slice(0, 500)}`);
  }

  const imageBase64 = data.result?.image;
  if (!imageBase64) {
    throw new Error(`No result.image in Cloudflare response: ${textBody.slice(0, 500)}`);
  }

  return Buffer.from(imageBase64, 'base64');
}

export async function createGridContactSheet({
  images,
  columns = 2,
  outputPath,
  title,
  subtitle,
}) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const cellsHtml = images.map((img) => {
    const absPath = path.isAbsolute(img.path) ? img.path : path.resolve(ROOT, img.path);
    let imgTag = '';
    if (fs.existsSync(absPath)) {
      const buf = fs.readFileSync(absPath);
      const b64 = buf.toString('base64');
      imgTag = `<img src="data:image/jpeg;base64,${b64}" style="width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;border-radius:4px;display:block;" />`;
    } else {
      imgTag = `<div style="width:100%;aspect-ratio:1/1;background:#2A2A2A;display:flex;align-items:center;justify-content:center;color:#E06C75;font-size:14px;border-radius:4px;">Missing</div>`;
    }
    return `
      <div style="background:#181818;border:1px solid #2C2C2C;border-radius:6px;overflow:hidden;display:flex;flex-direction:column;">
        ${imgTag}
        <div style="padding:10px 12px;font-size:14px;font-weight:700;color:#FFFFFF;background:#121212;text-align:center;border-top:1px solid #242424;">${img.label}</div>
        ${img.sublabel ? `<div style="padding:6px 10px;font-size:12px;color:#A0A5B0;background:#0E0F12;text-align:center;border-top:1px solid #1A1A1A;white-space:pre-line;">${img.sublabel}</div>` : ''}
      </div>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          body { background: #0A0B0E; color: #ECEFF4; padding: 32px; width: 1100px; }
          header { margin-bottom: 24px; border-bottom: 1px solid #2D3039; padding-bottom: 16px; }
          h1 { font-size: 22px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px; margin-bottom: 6px; }
          .subtitle { font-size: 13px; color: #9AA0A6; font-weight: 400; }
          .grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px; }
        </style>
      </head>
      <body>
        <header>
          <h1>${title}</h1>
          <div class="subtitle">${subtitle}</div>
        </header>
        <div class="grid">
          ${cellsHtml}
        </div>
      </body>
    </html>
  `;

  await page.setContent(html);
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const bodyHandle = await page.$('body');
  await bodyHandle.screenshot({
    path: outputPath,
    type: 'jpeg',
    quality: 90,
  });

  await browser.close();
}

export function parseArgs(argv) {
  const args = {
    plan: false,
    generate: false,
    contactSheet: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--plan') args.plan = true;
    else if (a === '--generate') args.generate = true;
    else if (a === '--contact-sheet') args.contactSheet = true;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true });

  console.log('=== HAY & ĐẸP. V3.3B-S.3: Literal Human Slots Test ===');
  console.log(`Base directory: ${BASE_DIR}`);

  const auth = auditAuth();
  console.log(`CLOUDFLARE_ACCOUNT_ID present: ${auth.hasAccountId ? 'YES' : 'NO'}`);
  console.log(`CLOUDFLARE_API_TOKEN present: ${auth.hasToken ? 'YES' : 'NO'}`);

  if (!auth.hasAccountId || !auth.hasToken) {
    console.error('❌ Missing credentials.');
    process.exit(1);
  }

  const { plan, validation } = loadVideo001StoryPlan();
  console.log(`Story Plan Valid: ${validation.valid ? 'YES' : 'NO'}`);
  if (!validation.valid) {
    console.error('Validation errors:', validation.errors);
    process.exit(1);
  }

  // Build prompts and check lengths
  const promptsRecord = {};
  console.log('\n--- Prompt Geometries & Lengths ---');
  for (const beatId of TARGET_BEATS) {
    const beat = plan.beats.find((b) => b.id === beatId);
    const prompt = buildLiteralHumanSlotsPrompt(beatId);
    const spec = BEAT_SPECS[beatId];
    promptsRecord[beatId] = {
      role: beat.storyRole,
      expectedHumanCount: spec.expectedHumanCount,
      slots: spec.slots,
      charCount: prompt.length,
      voiceClause: beat.voiceClause,
      prompt,
    };
    const targetStatus = prompt.length <= 1900 ? 'PASS (<=1900)' : prompt.length <= 2100 ? 'PASS (<=2100)' : 'FAIL';
    console.log(`[${beatId}] (${beat.storyRole}) Expected Humans: ${spec.expectedHumanCount} | Length: ${prompt.length} chars (Target <= 1900, Hard Max 2100: ${targetStatus}, Cloudflare API <= 2048: ${prompt.length <= 2048 ? 'PASS' : 'FAIL'})`);
    if (prompt.length > 2048) {
      throw new Error(`Beat ${beatId} prompt exceeded Cloudflare API limit of 2048 characters (${prompt.length})!`);
    }
  }

  const promptsJsonPath = path.join(BASE_DIR, 'prompts.json');
  fs.writeFileSync(promptsJsonPath, JSON.stringify(promptsRecord, null, 2));
  console.log(`✅ Saved prompts to: ${promptsJsonPath}`);

  if (args.plan) {
    console.log('\nPlan and prompt audit complete.');
    return;
  }

  // Generate 8 images (4 beats x 2 calls)
  if (args.generate) {
    console.log('\n--- Generating 8 Images (4 beats x 2 independent calls) ---');
    for (const beatId of TARGET_BEATS) {
      const beat = plan.beats.find((b) => b.id === beatId);
      const prompt = promptsRecord[beatId].prompt;

      for (const variant of ['a', 'b']) {
        const outName = `${beatId}-${variant}.jpg`;
        const outPath = path.join(BASE_DIR, outName);

        if (fs.existsSync(outPath) && fs.statSync(outPath).size > 50000) {
          console.log(`[${outName}] already exists (${fs.statSync(outPath).size} bytes), skipping.`);
          continue;
        }

        console.log(`Generating ${outName} (${beat.storyRole} variant ${variant.toUpperCase()})...`);
        try {
          const buf = await callCloudflareSchnell(prompt);
          fs.writeFileSync(outPath, buf);
          console.log(`  -> Saved ${buf.length} bytes to ${outName}`);
        } catch (err) {
          console.error(`  ❌ Failed ${outName}: ${err.message}`);
          throw err;
        }
      }
    }
    console.log('✅ Generation of 8 images complete.');
  }

  // Generate Contact Sheet (4 rows x 2 columns)
  if (args.generate || args.contactSheet) {
    console.log('\n--- Generating Contact Sheet (4 rows x 2 cols) ---');
    const sheetImages = [];
    for (const beatId of TARGET_BEATS) {
      const beat = plan.beats.find((b) => b.id === beatId);
      const spec = BEAT_SPECS[beatId];
      for (const variant of ['a', 'b']) {
        const outName = `${beatId}-${variant}.jpg`;
        const outPath = path.join(BASE_DIR, outName);
        sheetImages.push({
          path: outPath,
          label: `${beatId} ${variant.toUpperCase()} • ${beat.storyRole.toUpperCase()} (Slots: ${spec.expectedHumanCount})`,
          sublabel: beat.voiceClause.slice(0, 48) + '...',
        });
      }
    }

    const contactSheetOut = path.join(BASE_DIR, 'contact-sheet.jpg');
    await createGridContactSheet({
      images: sheetImages,
      columns: 2,
      outputPath: contactSheetOut,
      title: 'HAY & ĐẸP. V3.3B-S.3 — Schnell Literal Human Slots Test',
      subtitle: '4 Hard Beats × 2 Independent Calls (8 Images) • Model: @cf/black-forest-labs/flux-1-schnell',
    });
    console.log(`✅ Contact sheet generated at: ${contactSheetOut}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`Fatal Error: ${err.message}`);
    process.exit(1);
  });
}
