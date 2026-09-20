/**
 * scripts/test-hay-dep-video001-schnell-safe-pilot.mjs
 *
 * HAY & ĐẸP. — V3.3B-S.6
 * Single Goal: Video 001 Schnell-Safe Fulfillment Image Pilot
 * Model: @cf/black-forest-labs/flux-1-schnell
 *
 * Generates exactly 9 Schnell-safe beats (1 call each = 9 calls total).
 * Tests the raw yield of the simplified fulfillment plan.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import {
  ROUTES,
  routeSchnellBeat,
  getPlanForVideo,
} from './test-hay-dep-schnell-capability-router.mjs';
import {
  FULFILLMENTS,
  ANCHORS,
  planSchnellFulfillment,
} from './test-hay-dep-schnell-fulfillment-planner.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const BASE_DIR = path.join(ROOT, 'scratch', 'v33', 'video001-schnell-safe-pilot');

export const MODEL_ID = '@cf/black-forest-labs/flux-1-schnell';
export const TARGET_BEATS = [
  'beat-02',
  'beat-04',
  'beat-06',
  'beat-07',
  'beat-08',
  'beat-09',
  'beat-10',
  'beat-12',
  'beat-15',
];

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

// --- Style-First Blocks (Sections 7, 8, 9, 11, 13) ---

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
Simplified but believable Vietnamese / East Asian human features when people are present.
Edges remain visibly illustrated instead of photographic.
Background details are simplified into clean drawn shapes.`;

export const PALETTE = `PALETTE:

Warm ivory and cream.
Muted sage.
Warm medium wood.
Charcoal / sepia linework.
Small restrained terracotta or amber accents.
Low saturation.
No glossy surfaces.`;

export const WORLD = `WORLD:

Same warm Vietnamese family dining/home environment.
Warm ivory walls, medium warm wood furniture, one simple pendant lamp.
Keep architecture and decor understated and drawn.`;

export const HARD_EXCLUSIONS_BASE = `HARD EXCLUSIONS:

No written words anywhere.
No logo.
No signature.
No watermark-like marks.
No random lettering on walls, clothing, books or objects.
No anime.
No chibi.
No children's-book styling.
No corporate flat vector.
No 3D rendering.
No glossy realistic skin.
No extra people.
No malformed or detached body parts.`;

export const HARD_EXCLUSIONS_OBJECT = `${HARD_EXCLUSIONS_BASE}
No human body parts.`;

/**
 * Builds the exact style-first prompt for a given beat.
 */
export function buildPromptForBeat({ beatId, fulfillmentRow, originalBeat, cast }) {
  const fulfillment = fulfillmentRow.fulfillment;
  let peopleBlock = '';
  let sceneBlock = '';
  let framingBlock = '';
  let isObject = false;

  if (beatId === 'beat-02') {
    // SCHNELL_OBJECT — Simple meal still-life
    isObject = true;
    peopleBlock = `VISIBLE PEOPLE:
No people visible anywhere in the illustration.
No face, head, hand, arm, body, silhouette, reflection or background person.`;
    sceneBlock = `SCENE:
Simple bowls of rice, chopsticks, soup bowl, used wooden chairs around warm dining table, soft evening light, no visible people.`;
    framingBlock = `FRAMING:
Medium drawn composition. Balanced negative space.`;
  } else if (beatId === 'beat-04') {
    // SCHNELL_SINGLE — boy speaking
    isObject = false;
    const memberDesc = cast.members['boy'];
    peopleBlock = `VISIBLE PEOPLE:
Exactly one visible person in the entire illustration.
Only boy.
No second person.
No background person.
No partial extra human body.

CAST:
boy: ${memberDesc}`;
    sceneBlock = `SCENE:
Vietnamese school-age boy speaks with a small hand gesture, facing someone off-frame. Expressive friendly face. Other people are implied off-frame and must not be visible.`;
    framingBlock = `FRAMING:
Medium drawn portrait-focus composition. Balanced negative space.`;
  } else if (beatId === 'beat-06') {
    // UNCHANGED + SCHNELL_SAFE — father placing phone aside
    isObject = false;
    const memberDesc = cast.members['father'];
    peopleBlock = `VISIBLE PEOPLE:
Exactly one visible person in the entire illustration.
Only father.
No second person.
No background person.
No partial extra human body.

CAST:
father: ${memberDesc}`;
    sceneBlock = `SCENE:
Father places the smartphone face-down on a small wooden side shelf away from the dining table. Calm domestic moment. Other family members are off-frame and must not be visible.`;
    framingBlock = `FRAMING:
Editorial detail illustration. Close drawn focus.`;
  } else if (beatId === 'beat-07') {
    // SCHNELL_OBJECT — school/work bags near doorway
    isObject = true;
    peopleBlock = `VISIBLE PEOPLE:
No people visible anywhere in the illustration.
No face, head, hand, arm, body, silhouette, reflection or background person.`;
    sceneBlock = `SCENE:
School bag and work bag resting near the doorway or dining chair, soft warm indoor lighting, no visible people. Quiet trace of returning home after a day of school and work.`;
    framingBlock = `FRAMING:
Medium drawn composition. Editorial still-life framing.`;
  } else if (beatId === 'beat-08') {
    // SCHNELL_SINGLE — mother reflective pause
    isObject = false;
    const memberDesc = cast.members['mother'];
    peopleBlock = `VISIBLE PEOPLE:
Exactly one visible person in the entire illustration.
Only mother.
No second person.
No background person.
No partial extra human body.

CAST:
mother: ${memberDesc}`;
    sceneBlock = `SCENE:
Mother quietly pauses at the wooden dining table with a calm reflective expression, resting her hands on the table. Other family members are implied off-frame and must not be visible.`;
    framingBlock = `FRAMING:
Medium drawn portrait-focus composition. Balanced negative space.`;
  } else if (beatId === 'beat-09') {
    // SCHNELL_SINGLE — mother arranging small bowl
    isObject = false;
    const memberDesc = cast.members['mother'];
    peopleBlock = `VISIBLE PEOPLE:
Exactly one visible person in the entire illustration.
Only mother.
No second person.
No background person.
No partial extra human body.

CAST:
mother: ${memberDesc}`;
    sceneBlock = `SCENE:
Mother quietly arranges a small ceramic bowl at the dining table with a gentle serene smile, savoring a peaceful domestic moment. Other family members are implied off-frame and must not be visible.`;
    framingBlock = `FRAMING:
Medium drawn portrait-focus composition. Balanced negative space.`;
  } else if (beatId === 'beat-10') {
    // SCHNELL_SINGLE — mother setting dish
    isObject = false;
    const memberDesc = cast.members['mother'];
    peopleBlock = `VISIBLE PEOPLE:
Exactly one visible person in the entire illustration.
Only mother.
No second person.
No background person.
No partial extra human body.

CAST:
mother: ${memberDesc}`;
    sceneBlock = `SCENE:
Mother gently places a warm dish of food onto the wooden dining table, preparing for a family meal. Other family members are implied off-frame and must not be visible.`;
    framingBlock = `FRAMING:
Medium drawn portrait-focus composition. Balanced negative space.`;
  } else if (beatId === 'beat-12') {
    // UNCHANGED + SCHNELL_SAFE — father resting at table with phone aside
    isObject = false;
    const memberDesc = cast.members['father'];
    peopleBlock = `VISIBLE PEOPLE:
Exactly one visible person in the entire illustration.
Only father.
No second person.
No background person.
No partial extra human body.

CAST:
father: ${memberDesc}`;
    sceneBlock = `SCENE:
Father rests his hands calmly on the wooden table, the smartphone kept safely aside on a side shelf away from the table. Calm evening atmosphere. Other family members are off-frame and must not be visible.`;
    framingBlock = `FRAMING:
Editorial detail illustration. Close drawn focus.`;
  } else if (beatId === 'beat-15') {
    // UNCHANGED + SCHNELL_SAFE — release, 0 people
    isObject = true;
    peopleBlock = `VISIBLE PEOPLE:
No people visible anywhere in the illustration.
No face, head, hand, arm, body, silhouette, reflection or background person.`;
    sceneBlock = `SCENE:
Quiet warm dining room after a simple family dinner, empty wooden chairs slightly pulled back, used ceramic bowls on the wooden table under a warm glowing pendant lamp. Serene evening release. No visible people.`;
    framingBlock = `FRAMING:
Wide drawn establishing composition. Serene empty domestic space.`;
  }

  const exclusions = isObject ? HARD_EXCLUSIONS_OBJECT : HARD_EXCLUSIONS_BASE;

  const prompt = [
    MEDIUM_LOCK,
    RENDERING_RECIPE,
    PALETTE,
    peopleBlock,
    sceneBlock,
    WORLD,
    framingBlock,
    exclusions,
  ].join('\n\n');

  return { prompt, length: prompt.length, isObject };
}

/**
 * Calls Cloudflare Workers AI FLUX.1 Schnell endpoint.
 * Strictly prompt-only payload (seed/steps unsupported).
 */
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

/**
 * Creates 3x3 contact sheet using Playwright.
 */
export async function createContactSheet({
  imageGrid,
  outputPath,
  title = 'HAY & ĐẸP. V3.3B-S.6 — Video 001 Schnell-Safe Pilot',
  subtitle = '9 Target Beats • Prompt-Only FLUX.1 Schnell • 1 Call Each (No Retry)',
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
            imgTag = `<div style="width:100%;aspect-ratio:1/1;background:#2A2A2A;display:flex;align-items:center;justify-content:center;color:#E06C75;font-size:14px;padding:12px;">Image Missing<br/>${path.basename(cell.path)}</div>`;
          }
          return `
          <div style="background:#181818;border:1px solid #333;border-radius:6px;overflow:hidden;display:flex;flex-direction:column;">
            <div style="padding:8px 10px;font-size:12px;font-weight:700;color:#F0F0F0;background:#111;text-align:center;border-bottom:1px solid #282828;">
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
      return `<div style="display:grid;grid-template-columns:repeat(${row.length}, 1fr);gap:16px;margin-bottom:16px;">${cellsHtml}</div>`;
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
  await page.setViewportSize({ width: 1200, height: 1350 });

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await page.screenshot({ path: outputPath, type: 'jpeg', quality: 90, fullPage: true });
  await browser.close();
}

async function main() {
  if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true });

  console.log('=== HAY & ĐẸP. V3.3B-S.6: Video 001 Schnell-Safe Fulfillment Pilot ===');
  console.log(`Base directory: ${BASE_DIR}\n`);

  // 1. Audit Auth
  const auth = auditAuth();
  if (!auth.hasAccountId || !auth.hasToken) {
    console.error('❌ Cloudflare credentials missing from environment / .env');
    process.exit(1);
  }
  console.log('✅ Cloudflare auth credentials loaded.\n');

  // 2. Build and Validate Current Plan First (Section 3)
  console.log('=== 1. Validating S.5.1 Fulfillment Plan for Video 001 ===');
  const { video, plan, cast } = getPlanForVideo(1);
  const rows = [];
  const counts = {
    [FULFILLMENTS.CANONICAL_REQUIRED]: 0,
    [FULFILLMENTS.REUSE_CANONICAL]: 0,
    [FULFILLMENTS.SCHNELL_SINGLE]: 0,
    [FULFILLMENTS.SCHNELL_OBJECT]: 0,
    [FULFILLMENTS.UNCHANGED]: 0,
  };

  for (const beat of plan.beats) {
    const routeInfo = routeSchnellBeat({ beat, cast });
    const fulfillmentInfo = planSchnellFulfillment({
      beat,
      route: routeInfo.route,
      cast,
      plan,
    });
    counts[fulfillmentInfo.fulfillment]++;
    rows.push({
      beatId: beat.id,
      originalBeat: beat,
      routeInfo,
      fulfillmentInfo,
    });
  }

  console.log('Observed Video 001 Fulfillment counts:');
  console.table(counts);

  const expectedCounts = {
    CANONICAL_REQUIRED: 1,
    REUSE_CANONICAL: 3,
    SCHNELL_SINGLE: 4,
    SCHNELL_OBJECT: 2,
    UNCHANGED: 6,
  };

  for (const [k, v] of Object.entries(expectedCounts)) {
    if (counts[k] !== v) {
      console.error(`❌ Fulfillment count mismatch for ${k}: expected ${v}, got ${counts[k]}`);
      console.log('V3.3B-S.6 VIDEO 001 SCHNELL-SAFE PILOT — FAIL');
      process.exit(1);
    }
  }
  console.log('✅ Current S.5.1 fulfillment counts verified successfully.\n');

  // 3. Build prompts for the 9 target beats (Section 4 & 14)
  console.log('=== 2. Building Prompts for 9 Schnell-Safe Beats ===');
  const promptData = {};

  for (const beatId of TARGET_BEATS) {
    const row = rows.find((r) => r.beatId === beatId);
    if (!row) throw new Error(`Target beat not found: ${beatId}`);

    const built = buildPromptForBeat({
      beatId,
      fulfillmentRow: row.fulfillmentInfo,
      originalBeat: row.originalBeat,
      cast,
    });

    if (built.length > 2100) {
      console.error(`❌ Prompt for ${beatId} exceeds 2100 characters: ${built.length}`);
      process.exit(1);
    }

    promptData[beatId] = {
      beatId,
      fulfillment: row.fulfillmentInfo.fulfillment,
      sourceRoute: row.routeInfo.route,
      selectedMember: row.fulfillmentInfo.selectedMember || (row.originalBeat.presentMembers?.[0] ?? null),
      charCount: built.length,
      prompt: built.prompt,
    };

    console.log(`  ${beatId} (${row.fulfillmentInfo.fulfillment}): ${built.length} chars`);
  }

  const promptsJsonPath = path.join(BASE_DIR, 'prompts.json');
  fs.writeFileSync(promptsJsonPath, JSON.stringify(promptData, null, 2));
  console.log(`✅ Saved: ${promptsJsonPath}\n`);

  // 4. Generate Images (1 call per beat = 9 API calls) (Section 5)
  console.log('=== 3. Generating Exactly 9 Images via Cloudflare FLUX.1 Schnell ===');
  const generatedFiles = {};

  for (let i = 0; i < TARGET_BEATS.length; i++) {
    const beatId = TARGET_BEATS[i];
    const item = promptData[beatId];
    const imageFilename = `${beatId}.jpg`;
    const imagePath = path.join(BASE_DIR, imageFilename);

    console.log(`[${i + 1}/9] Generating ${beatId} (${item.fulfillment})...`);
    const startTime = Date.now();

    try {
      const buffer = await callCloudflareSchnell(item.prompt);
      fs.writeFileSync(imagePath, buffer);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`  ✅ Saved ${imageFilename} (${(buffer.length / 1024).toFixed(1)} KB, ${elapsed}s)`);
      generatedFiles[beatId] = {
        path: imagePath,
        sizeKb: (buffer.length / 1024).toFixed(1),
        success: true,
      };
    } catch (err) {
      console.error(`  ❌ Failed generating ${beatId}: ${err.message}`);
      generatedFiles[beatId] = {
        path: imagePath,
        error: err.message,
        success: false,
      };
    }

    // Brief polite pause between calls
    if (i < TARGET_BEATS.length - 1) {
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  // 5. Create 3x3 Contact Sheet (Section 21)
  console.log('\n=== 4. Creating 3x3 Contact Sheet ===');
  const contactSheetPath = path.join(BASE_DIR, 'contact-sheet.jpg');

  const gridRows = [
    ['beat-02', 'beat-04', 'beat-06'],
    ['beat-07', 'beat-08', 'beat-09'],
    ['beat-10', 'beat-12', 'beat-15'],
  ];

  const imageGrid = gridRows.map((rowIds) =>
    rowIds.map((id) => {
      const item = promptData[id];
      return {
        path: path.join(BASE_DIR, `${id}.jpg`),
        header: `${id.toUpperCase()}`,
        footer: `${item.fulfillment}\n${item.selectedMember ? `Member: ${item.selectedMember}` : '0 visible people'}`,
      };
    })
  );

  await createContactSheet({
    imageGrid,
    outputPath: contactSheetPath,
    title: 'HAY & ĐẸP. V3.3B-S.6 — Video 001 Schnell-Safe Pilot',
    subtitle: '9 Target Beats • 1 Call Each • Layout: 02 04 06 | 07 08 09 | 10 12 15',
  });
  console.log(`✅ Saved contact sheet: ${contactSheetPath}\n`);

  console.log('=== Image Generation Completed. Proceed to QA Inspection ===');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`Fatal Error: ${err.message}`);
    process.exit(1);
  });
}
