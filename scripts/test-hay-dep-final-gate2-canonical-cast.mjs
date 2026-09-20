/**
 * scripts/test-hay-dep-final-gate2-canonical-cast.mjs
 *
 * HAY & ĐẸP. — FINAL GATE 2
 * Canonical Cast + Reference Continuity Pilot
 * Primary Model: @cf/black-forest-labs/flux-2-dev
 *
 * Implements:
 * 1. Style-First Editorial 2D prompt geometry for family-young-01 in home-family-01
 * 2. Grounded FLUX.2 Dev multipart API request schema reused from repo truth
 * 3. Bounded generation for Canonical Family Master (max 3 attempts)
 * 4. Derived single-person reference-conditioned shots (1 call each: boy, mother, father)
 * 5. Visual QA ledgers and Playwright contact sheet rendering
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

export const MODEL_ID = '@cf/black-forest-labs/flux-2-dev';
export const OUT_DIR = path.resolve(ROOT, 'scratch/v33/final-gate2-canonical-cast');

export function prepareReferenceImage(inputPath, outputPath) {
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const result = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-i', inputPath,
      '-vf', "scale='min(512,iw)':'min(512,ih)':force_original_aspect_ratio=decrease",
      '-q:v', '3',
      outputPath,
    ],
    {
      cwd: ROOT,
      encoding: 'utf-8',
    },
  );

  if (result.status !== 0) {
    fs.copyFileSync(inputPath, outputPath);
  }
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
  return {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    token: process.env.CLOUDFLARE_API_TOKEN,
    hasAccountId: !!process.env.CLOUDFLARE_ACCOUNT_ID,
    hasToken: !!process.env.CLOUDFLARE_API_TOKEN,
  };
}

// -------------------------------------------------------------
// PROMPT GEOMETRY: STYLE-FIRST EDITORIAL 2D
// -------------------------------------------------------------

export const PROMPT_BLOCKS = {
  MEDIUM_LOCK: `MEDIUM LOCK:

2D EDITORIAL DRAWING ONLY.
Hand-drawn magazine illustration on warm paper.
Visible ink contour lines around faces, bodies, hands, furniture and objects.
Opaque matte color shapes with restrained soft shading.
Clearly drawn and illustrated, never camera-rendered.
Mature contemporary editorial illustration for adults.`,

  RENDERING_RECIPE: `RENDERING RECIPE:

Charcoal / sepia contour drawing.
Matte gouache-like color fills.
One restrained soft shadow layer.
Subtle paper grain visible across the image.
Simplified but believable Vietnamese / East Asian human features when people are present.
Edges remain visibly illustrated instead of photographic.
Background details are simplified into clean drawn shapes.`,

  PALETTE: `PALETTE:

Warm ivory and cream paper base.
Muted sage accents.
Warm medium-oak wood tones.
Charcoal / sepia linework.
Small restrained terracotta or amber accents.
Low saturation.
No glossy surfaces.`,

  WORLD: `WORLD:

WORLD LOCK: home-family-01
Modest Vietnamese apartment dining room.
Rectangular medium-oak dining table, cream walls, warm pendant lamp centered above table.
Window on camera-left with soft evening light, low sage ceramic vase on a narrow sideboard.
Keep architecture and decor understated and hand-drawn.`,

  HARD_EXCLUSIONS: `HARD EXCLUSIONS:

No written words anywhere.
No logo.
No signature.
No watermark-like marks.
No random lettering on walls, clothing, books or objects.
No photorealistic rendering.
No candid portrait photography.
No bokeh or depth of field blur.
No cinematic realism.
No lens language.
No anime.
No manga.
No chibi.
No children's-book cartoon styling.
No corporate flat vector.
No 3D rendering.
No glossy realistic skin.
No malformed or detached body parts.`,
};

export function buildCanonicalMasterPrompt() {
  return `${PROMPT_BLOCKS.MEDIUM_LOCK}

${PROMPT_BLOCKS.RENDERING_RECIPE}

${PROMPT_BLOCKS.PALETTE}

CAST:
Exactly four family members gathered together:
- Father: Vietnamese man, 34, oval face, straight brows, warm almond eyes, clean-shaven, NO GLASSES, short straight black hair with a neat side part, sage overshirt, cream T-shirt, charcoal trousers.
- Mother: Vietnamese woman, 32, soft oval face, warm almond eyes, black hair in one fixed low bun with two subtle loose strands, NO GLASSES, warm beige cardigan, cream dress.
- Boy: Vietnamese boy, 7, round face, short slightly spiky black fringe, sage cotton T-shirt.
- Girl: Vietnamese girl, 5–6, round-soft face, neat bob haircut with straight bangs, warm cream dress.

PRIMARY SCENE:
The recurring family identity master scene. The family is gathered naturally around a simple rectangular medium-oak dining table in their warm home.
All four people (father, mother, school-age boy, younger girl) are clearly visible with calm natural interaction.
All four faces are clearly visible, no overlapping faces, no hidden child, no cropped heads.
Adults and children are visibly distinct in age and body scale, with enough visual separation so each member can be clearly recognized as an identity master.

${PROMPT_BLOCKS.WORLD}

FRAMING:
Medium-wide drawn establishing composition showing all four family members gathered at the dining table. Balanced negative space.

${PROMPT_BLOCKS.HARD_EXCLUSIONS}
No extra people (strictly four people: father, mother, boy, girl).
No missing family members.
No duplicate children.
No overlapping faces.`;
}

export function buildDerivedPrompt(role) {
  if (role === 'boy') {
    return `CHARACTER & STYLE REFERENCE MATCH:
Match the exact character identity and visual style of the reference image (input_image_0).
Specifically reproduce the illustrated boy character from the reference: same Vietnamese 7-year-old boy, round face, short slightly spiky black fringe, sage cotton T-shirt, and matching 2D editorial illustration linework and palette.

${PROMPT_BLOCKS.MEDIUM_LOCK}

${PROMPT_BLOCKS.RENDERING_RECIPE}

${PROMPT_BLOCKS.PALETTE}

VISIBLE PEOPLE:
Exactly one visible person in the entire illustration.
Only the boy from the reference image.
No second person. No adults. No girl. No background person. No partial extra human body.

CAST:
boy: Vietnamese boy, 7, round face, short slightly spiky black fringe, sage cotton T-shirt. Same boy identity and features as seen in input_image_0.

PRIMARY SCENE:
Vietnamese school-age boy speaks gently with a small hand gesture, facing someone off-frame. Expressive friendly face. Warm family home. Other family members are off-frame and must not be visible.

${PROMPT_BLOCKS.WORLD}

FRAMING:
Medium drawn portrait-focus composition. Balanced negative space.

${PROMPT_BLOCKS.HARD_EXCLUSIONS}
No extra people (strictly one boy).
No adults.
No other children.`;
  }

  if (role === 'mother') {
    return `CHARACTER & STYLE REFERENCE MATCH:
Match the exact character identity and visual style of the reference image (input_image_0).
Specifically reproduce the illustrated mother character from the reference: same Vietnamese 32-year-old woman, soft oval face, warm almond eyes, black hair in one fixed low bun with two subtle loose strands, NO GLASSES, warm beige cardigan, cream dress, and matching 2D editorial illustration linework and palette.

${PROMPT_BLOCKS.MEDIUM_LOCK}

${PROMPT_BLOCKS.RENDERING_RECIPE}

${PROMPT_BLOCKS.PALETTE}

VISIBLE PEOPLE:
Exactly one visible person in the entire illustration.
Only the mother from the reference image.
No second person. No father. No children. No background person. No partial extra human body.

CAST:
mother: Vietnamese woman, 32, soft oval face, warm almond eyes, black hair in one fixed low bun with two subtle loose strands, NO GLASSES, warm beige cardigan, cream dress. Same mother identity and features as seen in input_image_0.

PRIMARY SCENE:
Mother quietly pauses in the living/dining area with a calm reflective expression, resting her hands gently. Quiet domestic reflection. Other family members are implied off-frame and must not be visible.

${PROMPT_BLOCKS.WORLD}

FRAMING:
Medium drawn portrait-focus composition. Balanced negative space.

${PROMPT_BLOCKS.HARD_EXCLUSIONS}
No extra people (strictly one mother).
No father.
No children.`;
  }

  if (role === 'father') {
    return `CHARACTER & STYLE REFERENCE MATCH:
Match the exact character identity and visual style of the reference image (input_image_0).
Specifically reproduce the illustrated father character from the reference: same Vietnamese 34-year-old man, oval face, straight brows, warm almond eyes, clean-shaven, NO GLASSES, short straight black hair with a neat side part, sage overshirt, cream T-shirt, charcoal trousers, and matching 2D editorial illustration linework and palette.

${PROMPT_BLOCKS.MEDIUM_LOCK}

${PROMPT_BLOCKS.RENDERING_RECIPE}

${PROMPT_BLOCKS.PALETTE}

VISIBLE PEOPLE:
Exactly one visible person in the entire illustration.
Only the father from the reference image.
No second person. No mother. No children. No background person. No partial extra human body.

CAST:
father: Vietnamese man, 34, oval face, straight brows, warm almond eyes, clean-shaven, NO GLASSES, short straight black hair with a neat side part, sage overshirt, cream T-shirt, charcoal trousers. Same father identity and features as seen in input_image_0.

PRIMARY SCENE:
Father performs a simple everyday domestic action near dining/living furniture, calmly placing a ceramic cup or adjusting a wooden chair. Calm evening atmosphere. Other family members are off-frame and must not be visible.

${PROMPT_BLOCKS.WORLD}

FRAMING:
Medium drawn portrait-focus composition. Balanced negative space.

${PROMPT_BLOCKS.HARD_EXCLUSIONS}
No extra people (strictly one father).
No mother.
No children.`;
  }

  throw new Error(`Unknown derived role: ${role}`);
}

// -------------------------------------------------------------
// REUSED GROUNDED CLOUDFLARE REQUEST SCHEMA
// -------------------------------------------------------------

export async function callFlux2Dev({ prompt, referencePaths = [], width = 1024, height = 1024, seed = null }) {
  const auth = auditAuth();
  if (!auth.hasAccountId || !auth.hasToken) {
    const err = new Error('CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is missing');
    err.httpStatus = 401;
    throw err;
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/ai/run/${MODEL_ID}`;

  const form = new FormData();
  form.append('prompt', prompt);
  form.append('width', String(width));
  form.append('height', String(height));
  if (Number.isFinite(seed) && seed !== null) {
    form.append('seed', String(seed >>> 0));
  }

  for (let i = 0; i < referencePaths.length; i++) {
    const ref = referencePaths[i];
    const absPath = path.isAbsolute(ref) ? ref : path.resolve(ROOT, ref);
    if (!fs.existsSync(absPath)) {
      throw new Error(`Reference image not found: ${absPath}`);
    }
    const buffer = fs.readFileSync(absPath);
    const ext = path.extname(absPath).toLowerCase();
    const type = ext === '.png' ? 'image/png' : 'image/jpeg';
    form.append(`input_image_${i}`, new Blob([buffer], { type }), path.basename(absPath));
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${auth.token}`,
      // Note: do not set Content-Type so fetch creates multipart/form-data with boundary
    },
    body: form,
  });

  const textBody = await response.text();

  if (!response.ok) {
    const err = new Error(`Cloudflare ${response.status} [${MODEL_ID}]: ${textBody.slice(0, 1000)}`);
    err.httpStatus = response.status;
    throw err;
  }

  let data;
  try {
    data = JSON.parse(textBody);
  } catch {
    const err = new Error(`Invalid JSON response: ${textBody.slice(0, 500)}`);
    err.httpStatus = 502;
    throw err;
  }

  const imageBase64 = data.result?.image;
  if (!imageBase64) {
    const err = new Error(`No result.image returned from Cloudflare: ${textBody.slice(0, 500)}`);
    err.httpStatus = 502;
    throw err;
  }

  return Buffer.from(imageBase64, 'base64');
}

// -------------------------------------------------------------
// STATE LEDGER & DATA STRUCTURES
// -------------------------------------------------------------

export function initLedger(outDir = OUT_DIR) {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const ledgerPath = path.join(outDir, 'gate2-ledger.json');
  if (fs.existsSync(ledgerPath)) {
    try {
      return JSON.parse(fs.readFileSync(ledgerPath, 'utf-8'));
    } catch {
      // re-initialize if corrupt
    }
  }

  const initial = {
    runStatus: 'INITIALIZED',
    updatedAt: new Date().toISOString(),
    operationalMetrics: {
      apiRequests: 0,
      successfulGenerations: 0,
      failedApiRequests: 0,
    },
    canonicalMaster: {
      status: 'NEEDS_GENERATION', // NEEDS_GENERATION | AWAITING_QA | SELECTED | EXHAUSTED
      selectedAttempt: null,
      selectedFile: null,
      attempts: [],
    },
    derived: {
      boy: {
        status: 'PENDING_CANONICAL', // PENDING_CANONICAL | NEEDS_GENERATION | AWAITING_QA | COMPLETED
        file: 'derived-boy.jpg',
        qa: null,
      },
      mother: {
        status: 'PENDING_CANONICAL',
        file: 'derived-mother.jpg',
        qa: null,
      },
      father: {
        status: 'PENDING_CANONICAL',
        file: 'derived-father.jpg',
        qa: null,
      },
    },
  };

  saveLedger(initial, outDir);
  return initial;
}

export function saveLedger(ledger, outDir = OUT_DIR) {
  ledger.updatedAt = new Date().toISOString();
  fs.writeFileSync(path.join(outDir, 'gate2-ledger.json'), JSON.stringify(ledger, null, 2), 'utf-8');
}

// -------------------------------------------------------------
// PLAYWRIGHT CONTACT SHEET RENDERER
// -------------------------------------------------------------

export async function renderContactSheetHtml({ title, subtitle, columns = 3, cards, outputPath }) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const gridHtml = cards
    .map((card) => {
      const isSelected = card.status === 'SELECTED' || card.status === 'PASS';
      const isFailed = card.status === 'REJECTED' || card.status === 'FAIL' || card.status === 'EXHAUSTED';
      const badgeColor = isSelected ? '#4E724E' : isFailed ? '#A64B4B' : '#7D6A58';
      const badgeText = card.status || 'PENDING';

      let imgTag = '';
      if (card.imagePath && fs.existsSync(card.imagePath)) {
        const b64 = fs.readFileSync(card.imagePath).toString('base64');
        imgTag = `<img src="data:image/jpeg;base64,${b64}" class="card-img" />`;
      } else {
        imgTag = `<div class="card-placeholder">${card.placeholderText || 'No Image'}</div>`;
      }

      return `
      <div class="card ${isSelected ? 'card-selected' : ''}">
        <div class="card-header">
          <span class="card-title">${card.title}</span>
          <span class="badge" style="background: ${badgeColor};">${badgeText}</span>
        </div>
        <div class="card-body">
          ${imgTag}
        </div>
        <div class="card-footer">
          <div class="footer-label">${card.subtitle || ''}</div>
          <div class="footer-notes">${card.notes || ''}</div>
        </div>
      </div>
    `;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #141210;
      color: #EDE6DC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 28px;
    }
    .header {
      margin-bottom: 24px;
      border-bottom: 1px solid #2B2622;
      padding-bottom: 16px;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      color: #F7F3EE;
      margin-bottom: 6px;
      letter-spacing: -0.3px;
    }
    .subtitle {
      font-size: 13px;
      color: #9E9185;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(${columns}, 320px);
      gap: 20px;
      justify-content: start;
    }
    .card {
      background: #1C1916;
      border: 1px solid #332D28;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .card-selected {
      border: 2px solid #5A875A;
      box-shadow: 0 0 12px rgba(90, 135, 90, 0.25);
    }
    .card-header {
      padding: 10px 14px;
      background: #24201C;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #332D28;
    }
    .card-title {
      font-size: 12px;
      font-weight: 600;
      color: #F7F3EE;
      letter-spacing: 0.2px;
    }
    .badge {
      font-size: 10px;
      font-weight: 700;
      color: #FFF;
      padding: 2px 7px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    .card-body {
      width: 320px;
      height: 320px;
      background: #110F0E;
      position: relative;
    }
    .card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .card-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6E6359;
      font-size: 13px;
      font-style: italic;
    }
    .card-footer {
      padding: 10px 14px;
      background: #1C1916;
      font-size: 11px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .footer-label {
      font-weight: 600;
      color: #D1C5B6;
    }
    .footer-notes {
      color: #8C7F72;
      line-height: 1.35;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
  </div>
  <div class="grid">
    ${gridHtml}
  </div>
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'load' });
  const viewportWidth = columns * 340 + 60;
  const rowCount = Math.ceil(cards.length / columns);
  const viewportHeight = rowCount * 450 + 150;
  await page.setViewportSize({ width: viewportWidth, height: viewportHeight });

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await page.screenshot({ path: outputPath, type: 'jpeg', quality: 90, fullPage: true });
  await browser.close();
}

// -------------------------------------------------------------
// CANONICAL MASTER GENERATION & QA
// -------------------------------------------------------------

export async function generateCanonicalAttempt(attemptNum, outDir = OUT_DIR) {
  const ledger = initLedger(outDir);

  if (ledger.canonicalMaster.status === 'SELECTED') {
    console.log(`Canonical master is already SELECTED (Attempt ${ledger.canonicalMaster.selectedAttempt}).`);
    return { status: 'ALREADY_SELECTED' };
  }

  if (ledger.canonicalMaster.attempts.length >= 3) {
    console.log('Canonical master has reached 3 attempts.');
    return { status: 'MAX_ATTEMPTS_REACHED' };
  }

  const prompt = buildCanonicalMasterPrompt();
  const filename = `canonical-attempt-0${attemptNum}.jpg`;
  const targetPath = path.join(outDir, filename);

  console.log(`\n======================================================`);
  console.log(`Generating Canonical Master Attempt ${attemptNum} via FLUX.2 Dev...`);
  console.log(`======================================================`);

  ledger.operationalMetrics.apiRequests++;
  saveLedger(ledger, outDir);

  try {
    const buffer = await callFlux2Dev({ prompt });
    fs.writeFileSync(targetPath, buffer);
    ledger.operationalMetrics.successfulGenerations++;

    ledger.canonicalMaster.status = 'AWAITING_QA';
    ledger.canonicalMaster.attempts.push({
      attempt: attemptNum,
      file: filename,
      generationStatus: 'SUCCESS',
      qaStatus: 'PENDING',
      timestamp: new Date().toISOString(),
    });
    saveLedger(ledger, outDir);

    console.log(`✅ Saved candidate to ${filename} (${buffer.length} bytes).`);
    console.log(`🛑 Visual QA required before proceeding.`);
    return { status: 'AWAITING_QA', file: filename };
  } catch (err) {
    ledger.operationalMetrics.failedApiRequests++;
    saveLedger(ledger, outDir);
    console.error(`❌ Generation error: ${err.message}`);
    if (err.httpStatus === 429) {
      ledger.runStatus = 'PAUSED_QUOTA';
      saveLedger(ledger, outDir);
      return { status: 'PAUSED_QUOTA', error: err.message };
    }
    throw err;
  }
}

export function recordCanonicalQa({ attemptNum, style, peopleCount, roleBinding, anatomy, textPollution, worldFit, notes = '', outDir = OUT_DIR }) {
  const ledger = initLedger(outDir);
  const entry = ledger.canonicalMaster.attempts.find((a) => a.attempt === attemptNum);
  if (!entry) {
    throw new Error(`Canonical attempt ${attemptNum} not found in ledger`);
  }

  const overall = (style === 'PASS' && peopleCount === 'PASS' && roleBinding === 'PASS' && anatomy === 'PASS' && textPollution === 'PASS' && worldFit === 'PASS') ? 'PASS' : 'FAIL';

  entry.qaStatus = 'COMPLETED';
  entry.style = style;
  entry.peopleCount = peopleCount;
  entry.roleBinding = roleBinding;
  entry.anatomy = anatomy;
  entry.textPollution = textPollution;
  entry.worldFit = worldFit;
  entry.overall = overall;
  entry.notes = notes;

  if (overall === 'PASS') {
    ledger.canonicalMaster.status = 'SELECTED';
    ledger.canonicalMaster.selectedAttempt = attemptNum;
    ledger.canonicalMaster.selectedFile = 'canonical-family-master.jpg';

    // Copy to canonical-family-master.jpg
    const srcPath = path.join(outDir, entry.file);
    const destPath = path.join(outDir, 'canonical-family-master.jpg');
    fs.copyFileSync(srcPath, destPath);
    console.log(`🌟 Canonical Master Attempt ${attemptNum} PASSED all 6 gates! Saved as canonical-family-master.jpg.`);

    // Enable derived generation
    ledger.derived.boy.status = 'NEEDS_GENERATION';
    ledger.derived.mother.status = 'NEEDS_GENERATION';
    ledger.derived.father.status = 'NEEDS_GENERATION';
  } else {
    console.log(`❌ Canonical Master Attempt ${attemptNum} FAILED QA: ${notes}`);
    if (attemptNum >= 3) {
      ledger.canonicalMaster.status = 'EXHAUSTED';
      ledger.runStatus = 'FAIL';
      console.log(`🛑 Canonical Master EXHAUSTED after 3 failed attempts.`);
    } else {
      ledger.canonicalMaster.status = 'NEEDS_GENERATION';
    }
  }

  saveLedger(ledger, outDir);
  return { overall, status: ledger.canonicalMaster.status };
}

// -------------------------------------------------------------
// DERIVED GENERATION & QA
// -------------------------------------------------------------

export async function generateDerivedShot(role, outDir = OUT_DIR) {
  const ledger = initLedger(outDir);

  if (ledger.canonicalMaster.status !== 'SELECTED') {
    throw new Error('Cannot generate derived shots: Canonical master is not SELECTED');
  }

  const canonicalPath = path.join(outDir, 'canonical-family-master.jpg');
  if (!fs.existsSync(canonicalPath)) {
    throw new Error('canonical-family-master.jpg does not exist');
  }

  const preparedRefPath = path.join(outDir, 'canonical-ref-prepared.jpg');
  prepareReferenceImage(canonicalPath, preparedRefPath);

  const target = ledger.derived[role];
  if (!target) throw new Error(`Invalid derived role: ${role}`);

  const prompt = buildDerivedPrompt(role);
  const targetPath = path.join(outDir, target.file);

  console.log(`\n======================================================`);
  console.log(`Generating Derived Shot [${role.toUpperCase()}] via FLUX.2 Dev (Reference-Conditioned)...`);
  console.log(`======================================================`);

  ledger.operationalMetrics.apiRequests++;
  saveLedger(ledger, outDir);

  try {
    const buffer = await callFlux2Dev({
      prompt,
      referencePaths: [preparedRefPath],
    });
    fs.writeFileSync(targetPath, buffer);
    ledger.operationalMetrics.successfulGenerations++;

    target.status = 'AWAITING_QA';
    target.timestamp = new Date().toISOString();
    saveLedger(ledger, outDir);

    console.log(`✅ Saved derived shot to ${target.file} (${buffer.length} bytes).`);
    console.log(`🛑 Visual QA required.`);
    return { status: 'AWAITING_QA', file: target.file };
  } catch (err) {
    ledger.operationalMetrics.failedApiRequests++;
    saveLedger(ledger, outDir);
    console.error(`❌ Generation error: ${err.message}`);
    if (err.httpStatus === 429) {
      ledger.runStatus = 'PAUSED_QUOTA';
      saveLedger(ledger, outDir);
      return { status: 'PAUSED_QUOTA', error: err.message };
    }
    throw err;
  }
}

export function recordDerivedQa({ role, identity, style, peopleContract, semanticFidelity, anatomy, textPollution, worldFit, notes = '', outDir = OUT_DIR }) {
  const ledger = initLedger(outDir);
  const target = ledger.derived[role];
  if (!target) throw new Error(`Invalid derived role: ${role}`);

  const overall = (
    identity === 'PASS' &&
    style === 'PASS' &&
    peopleContract === 'PASS' &&
    semanticFidelity === 'PASS' &&
    anatomy === 'PASS' &&
    textPollution === 'PASS' &&
    worldFit === 'PASS'
  ) ? 'PASS' : 'FAIL';

  target.qa = {
    identity,
    style,
    peopleContract,
    semanticFidelity,
    anatomy,
    textPollution,
    worldFit,
    overall,
    notes,
    timestamp: new Date().toISOString(),
  };

  target.status = 'COMPLETED';
  saveLedger(ledger, outDir);

  console.log(`Recorded QA for Derived ${role.toUpperCase()}: Overall ${overall}`);
  return { overall };
}

// -------------------------------------------------------------
// FINALIZE ARTIFACTS & REPORTS
// -------------------------------------------------------------

export async function finalizeGate2(outDir = OUT_DIR) {
  const ledger = initLedger(outDir);

  // 1. Prompts JSON
  const promptsData = {
    canonicalMaster: {
      model: MODEL_ID,
      prompt: buildCanonicalMasterPrompt(),
      referenceImage: null,
    },
    derivedBoy: {
      model: MODEL_ID,
      prompt: buildDerivedPrompt('boy'),
      referenceImage: 'canonical-family-master.jpg',
    },
    derivedMother: {
      model: MODEL_ID,
      prompt: buildDerivedPrompt('mother'),
      referenceImage: 'canonical-family-master.jpg',
    },
    derivedFather: {
      model: MODEL_ID,
      prompt: buildDerivedPrompt('father'),
      referenceImage: 'canonical-family-master.jpg',
    },
  };
  fs.writeFileSync(path.join(outDir, 'prompts.json'), JSON.stringify(promptsData, null, 2), 'utf-8');

  // 2. Canonical QA JSON
  const canonicalQaData = {
    status: ledger.canonicalMaster.status,
    selectedAttempt: ledger.canonicalMaster.selectedAttempt,
    attempts: ledger.canonicalMaster.attempts,
  };
  fs.writeFileSync(path.join(outDir, 'canonical-qa.json'), JSON.stringify(canonicalQaData, null, 2), 'utf-8');

  // 3. Continuity QA JSON
  const continuityQaData = {
    boy: ledger.derived.boy.qa,
    mother: ledger.derived.mother.qa,
    father: ledger.derived.father.qa,
  };
  fs.writeFileSync(path.join(outDir, 'continuity-qa.json'), JSON.stringify(continuityQaData, null, 2), 'utf-8');

  // 4. Contact Sheets
  console.log('Rendering contact-sheet-canonical.jpg...');
  const canonicalCards = ledger.canonicalMaster.attempts.map((att) => ({
    title: `CANONICAL ATTEMPT 0${att.attempt}`,
    status: att.overall === 'PASS' ? 'SELECTED' : 'REJECTED',
    imagePath: path.join(outDir, att.file),
    subtitle: att.overall === 'PASS' ? 'Passed all 6 gates' : 'Failed QA',
    notes: att.notes || '',
  }));

  // Pad to 3 cards if less than 3 attempts
  while (canonicalCards.length < 3) {
    canonicalCards.push({
      title: `ATTEMPT 0${canonicalCards.length + 1}`,
      status: 'NOT_NEEDED',
      imagePath: '',
      subtitle: 'Not generated',
      notes: 'Earlier attempt selected',
      placeholderText: 'Not Generated',
    });
  }

  await renderContactSheetHtml({
    title: 'HAY & ĐẸP. — FINAL GATE 2: CANONICAL FAMILY MASTER ATTEMPTS',
    subtitle: 'Model: @cf/black-forest-labs/flux-2-dev | Target: TARGET_EDITORIAL_2D | home-family-01',
    columns: 3,
    cards: canonicalCards,
    outputPath: path.join(outDir, 'contact-sheet-canonical.jpg'),
  });

  console.log('Rendering contact-sheet-continuity.jpg...');
  const continuityCards = [
    {
      title: 'CANONICAL MASTER (REFERENCE)',
      status: 'REFERENCE',
      imagePath: path.join(outDir, 'canonical-family-master.jpg'),
      subtitle: 'family-young-01 in home-family-01',
      notes: 'Father, Mother, Boy, Girl (4 people)',
    },
    {
      title: 'DERIVED A — BOY',
      status: ledger.derived.boy.qa?.identity === 'PASS' ? 'PASS' : 'FAIL',
      imagePath: path.join(outDir, 'derived-boy.jpg'),
      subtitle: 'Video 001 Speaking Beat (Single Boy)',
      notes: ledger.derived.boy.qa?.notes || '',
    },
    {
      title: 'DERIVED B — MOTHER',
      status: ledger.derived.mother.qa?.identity === 'PASS' ? 'PASS' : 'FAIL',
      imagePath: path.join(outDir, 'derived-mother.jpg'),
      subtitle: 'Video 001 Reflection Beat (Single Mother)',
      notes: ledger.derived.mother.qa?.notes || '',
    },
    {
      title: 'DERIVED C — FATHER',
      status: ledger.derived.father.qa?.identity === 'PASS' ? 'PASS' : 'FAIL',
      imagePath: path.join(outDir, 'derived-father.jpg'),
      subtitle: 'Video 001 Domestic Beat (Single Father)',
      notes: ledger.derived.father.qa?.notes || '',
    },
  ];

  await renderContactSheetHtml({
    title: 'HAY & ĐẸP. — FINAL GATE 2: RECURRING CHARACTER CONTINUITY',
    subtitle: 'Conditioned on Canonical Family Master via input_image_0 | @cf/black-forest-labs/flux-2-dev',
    columns: 4,
    cards: continuityCards,
    outputPath: path.join(outDir, 'contact-sheet-continuity.jpg'),
  });

  // 5. Decision & Evaluation
  const canonicalPass = ledger.canonicalMaster.status === 'SELECTED';
  const derivedBoyPass = ledger.derived.boy.qa?.overall === 'PASS';
  const derivedMotherPass = ledger.derived.mother.qa?.overall === 'PASS';
  const derivedFatherPass = ledger.derived.father.qa?.overall === 'PASS';

  let verdict = 'FINAL GATE 2 — CANONICAL CAST CONTINUITY — FAIL';
  let decisionReason = '';

  if (canonicalPass && derivedBoyPass && derivedMotherPass && derivedFatherPass) {
    verdict = 'FINAL GATE 2 — CANONICAL CAST CONTINUITY — PASS';
    decisionReason = 'Canonical master passed within 3 attempts, and all three derived reference-conditioned single-person shots achieved 100% pass across all 7 gates including identity continuity.';
  } else if (!canonicalPass) {
    decisionReason = 'Canonical master could not be successfully generated within 3 attempts.';
  } else {
    const failedDerived = [];
    if (!derivedBoyPass) failedDerived.push('boy');
    if (!derivedMotherPass) failedDerived.push('mother');
    if (!derivedFatherPass) failedDerived.push('father');
    decisionReason = `One or more derived shots failed QA gates: ${failedDerived.join(', ')}.`;
  }

  // Run Report JSON
  const reportData = {
    verdict,
    decisionReason,
    operationalMetrics: ledger.operationalMetrics,
    canonicalMaster: {
      status: ledger.canonicalMaster.status,
      selectedAttempt: ledger.canonicalMaster.selectedAttempt,
      attemptsCount: ledger.canonicalMaster.attempts.length,
    },
    derivedShots: {
      boy: ledger.derived.boy.qa?.overall || 'PENDING',
      mother: ledger.derived.mother.qa?.overall || 'PENDING',
      father: ledger.derived.father.qa?.overall || 'PENDING',
    },
  };
  fs.writeFileSync(path.join(outDir, 'run-report.json'), JSON.stringify(reportData, null, 2), 'utf-8');

  // Evaluation Markdown
  const evalMd = `# HAY & ĐẸP. — FINAL GATE 2 EVALUATION REPORT

## Verdict: ${verdict}

**Reason**: ${decisionReason}

---

## 1. Operational Metrics
- Live API Requests: ${ledger.operationalMetrics.apiRequests}
- Successful Generations: ${ledger.operationalMetrics.successfulGenerations}
- Failed API Requests: ${ledger.operationalMetrics.failedApiRequests}

---

## 2. Canonical Family Master Evaluation
- Status: ${ledger.canonicalMaster.status}
- Selected Attempt: ${ledger.canonicalMaster.selectedAttempt || 'None'}

| Attempt | Style | People Count | Role Binding | Anatomy | Text | World | Overall | Notes |
|---|---|---|---|---|---|---|---|---|
${ledger.canonicalMaster.attempts.map((a) => `| ${a.attempt} | ${a.style} | ${a.peopleCount} | ${a.roleBinding} | ${a.anatomy} | ${a.textPollution} | ${a.worldFit} | **${a.overall}** | ${a.notes || ''} |`).join('\n')}

---

## 3. Derived Reference Continuity Evaluation
Conditioned on \`canonical-family-master.jpg\` via \`input_image_0\`.

| Asset | Identity | Style | People | Semantic | Anatomy | Text | World | Overall | Notes |
|---|---|---|---|---|---|---|---|---|---|
| **Derived Boy** | ${ledger.derived.boy.qa?.identity || '-'} | ${ledger.derived.boy.qa?.style || '-'} | ${ledger.derived.boy.qa?.peopleContract || '-'} | ${ledger.derived.boy.qa?.semanticFidelity || '-'} | ${ledger.derived.boy.qa?.anatomy || '-'} | ${ledger.derived.boy.qa?.textPollution || '-'} | ${ledger.derived.boy.qa?.worldFit || '-'} | **${ledger.derived.boy.qa?.overall || '-'}** | ${ledger.derived.boy.qa?.notes || ''} |
| **Derived Mother** | ${ledger.derived.mother.qa?.identity || '-'} | ${ledger.derived.mother.qa?.style || '-'} | ${ledger.derived.mother.qa?.peopleContract || '-'} | ${ledger.derived.mother.qa?.semanticFidelity || '-'} | ${ledger.derived.mother.qa?.anatomy || '-'} | ${ledger.derived.mother.qa?.textPollution || '-'} | ${ledger.derived.mother.qa?.worldFit || '-'} | **${ledger.derived.mother.qa?.overall || '-'}** | ${ledger.derived.mother.qa?.notes || ''} |
| **Derived Father** | ${ledger.derived.father.qa?.identity || '-'} | ${ledger.derived.father.qa?.style || '-'} | ${ledger.derived.father.qa?.peopleContract || '-'} | ${ledger.derived.father.qa?.semanticFidelity || '-'} | ${ledger.derived.father.qa?.anatomy || '-'} | ${ledger.derived.father.qa?.textPollution || '-'} | ${ledger.derived.father.qa?.worldFit || '-'} | **${ledger.derived.father.qa?.overall || '-'}** | ${ledger.derived.father.qa?.notes || ''} |

---

## 4. Contact Sheets
- \`scratch/v33/final-gate2-canonical-cast/contact-sheet-canonical.jpg\`
- \`scratch/v33/final-gate2-canonical-cast/contact-sheet-continuity.jpg\`
`;
  fs.writeFileSync(path.join(outDir, 'evaluation.md'), evalMd, 'utf-8');

  console.log(`\n🎉 Finalized Gate 2 reports and contact sheets. Verdict: ${verdict}`);
  return { verdict, reportData };
}

// -------------------------------------------------------------
// CLI DISPATCHER
// -------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--status') {
    const ledger = initLedger();
    console.log(`\n=== HAY & ĐẸP. Final Gate 2 Status ===`);
    console.log(`Run Status: ${ledger.runStatus}`);
    console.log(`API Requests: ${ledger.operationalMetrics.apiRequests} (Success: ${ledger.operationalMetrics.successfulGenerations}, Failed: ${ledger.operationalMetrics.failedApiRequests})`);
    console.log(`Canonical Master: ${ledger.canonicalMaster.status} (Selected: ${ledger.canonicalMaster.selectedAttempt}, Attempts: ${ledger.canonicalMaster.attempts.length})`);
    console.log(`Derived Boy: ${ledger.derived.boy.status}`);
    console.log(`Derived Mother: ${ledger.derived.mother.status}`);
    console.log(`Derived Father: ${ledger.derived.father.status}`);
    return;
  }

  if (command === '--gen-canonical') {
    const attempt = Number(args[1] || 1);
    await generateCanonicalAttempt(attempt);
    return;
  }

  if (command === '--record-canonical-qa') {
    const attemptNum = Number(args[1]);
    const jsonPath = args[2];
    const data = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), jsonPath), 'utf-8'));
    recordCanonicalQa({
      attemptNum,
      ...data,
    });
    return;
  }

  if (command === '--gen-derived') {
    const role = args[1];
    await generateDerivedShot(role);
    return;
  }

  if (command === '--record-derived-qa') {
    const role = args[1];
    const jsonPath = args[2];
    const data = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), jsonPath), 'utf-8'));
    recordDerivedQa({
      role,
      ...data,
    });
    return;
  }

  if (command === '--finalize') {
    await finalizeGate2();
    return;
  }

  console.log(`Unknown command: ${command}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  });
}
