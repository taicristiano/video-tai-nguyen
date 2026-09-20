/**
 * HAY & ĐẸP. — V3.3A-S: Schnell Style Baseline Test Script
 * Model: @cf/black-forest-labs/flux-1-schnell
 *
 * Scope:
 * - Isolated visual style baseline test on FLUX.1 Schnell.
 * - Deterministic seeds 2101-2108.
 * - Single neutral subject, fixed art direction prompt.
 * - Creates contact sheet, evaluation markdown, and run report.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export const MODEL_ID = '@cf/black-forest-labs/flux-1-schnell';
export const BASELINE_SEEDS = [2101, 2102, 2103, 2104, 2105, 2106, 2107, 2108];

export const SUBJECT_TEXT = `A Vietnamese adult standing beside a small warm-wood side table,
holding a simple ceramic cup,
calm neutral expression,
plain warm ivory background,
soft natural daylight.`;

export const STYLE_PROMPT = `STYLE LOCK — HAY & ĐẸP.

Premium warm editorial 2D illustration.

Natural Vietnamese / East Asian adult proportions.
Believable anatomy.
Restrained expressive face.
Clean charcoal / sepia linework.
Soft warm ivory and cream base.
Muted sage accents.
Warm wood tones.
Subtle tactile paper / editorial texture.
Natural diffused daylight.
Gentle dimensional shading.
Calm premium magazine-illustration feeling.
Simple but not flat.
Human, warm, mature, understated.

NOT photorealistic.
NOT anime.
NOT manga.
NOT chibi.
NOT children's-book cartoon.
NOT corporate flat vector.
NOT stick figure.
NOT watercolor wash.
NOT 3D render.
NOT oil painting.
NOT fashion sketch.
NOT glossy plastic skin.
NOT exaggerated facial features.
NOT hyper-detailed cinematic realism.
NO text.
NO logo.
NO watermark.`;

export const FULL_PROMPT = `${SUBJECT_TEXT}

${STYLE_PROMPT}`;

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

  const hasAccountId = Boolean(accountId && accountId.trim().length > 0);
  const hasToken = Boolean(token && token.trim().length > 0);

  return {
    hasAccountId,
    hasToken,
    accountId: accountId?.trim(),
    token: token?.trim(),
  };
}

let cachedSeedSupported = null;

export async function callCloudflareSchnell({
  prompt,
  seed = null,
  steps = 4,
}) {
  const auth = auditAuth();
  if (!auth.hasAccountId || !auth.hasToken) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is missing');
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/ai/run/${MODEL_ID}`;

  let payload = { prompt };
  let seedUsed = false;

  if (cachedSeedSupported !== false) {
    if (Number.isFinite(seed) && seed !== null) {
      payload.seed = seed >>> 0;
      seedUsed = true;
    }
    if (Number.isFinite(steps)) {
      payload.steps = steps;
    }
  }

  let response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let textBody = await response.text();

  // If rejected due to schema on seed/steps, fallback to prompt-only and memoize
  if (!response.ok && (textBody.includes('seed') || textBody.includes('steps') || textBody.includes('Additional or unevaluated properties'))) {
    console.warn('⚠️ Cloudflare schema rejected seed/steps payload. Falling back to prompt-only...');
    cachedSeedSupported = false;
    payload = { prompt };
    seedUsed = false;
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    textBody = await response.text();
  } else if (response.ok && seedUsed) {
    cachedSeedSupported = true;
  }

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

  return {
    buffer: Buffer.from(imageBase64, 'base64'),
    seedSupported: seedUsed,
  };
}

export async function createContactSheet({
  imageGrid, // 2D array: rows of [ { path, label } ]
  outputPath,
  title = 'HAY & ĐẸP. V3.3A-S — FLUX.1 Schnell Style Baseline',
  subtitle = '8 Candidates • Deterministic Seeds 2101–2108 • Evaluated on Fixed Neutral Subject',
}) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const gridHtml = imageGrid.map((row) => {
    const cellsHtml = row.map((cell) => {
      const absPath = path.isAbsolute(cell.path) ? cell.path : path.resolve(ROOT, cell.path);
      let imgTag = '';
      if (fs.existsSync(absPath)) {
        const buf = fs.readFileSync(absPath);
        const b64 = buf.toString('base64');
        imgTag = `<img src="data:image/jpeg;base64,${b64}" style="width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;border-radius:4px;display:block;" />`;
      } else {
        imgTag = `<div style="width:100%;aspect-ratio:1/1;background:#2A2A2A;display:flex;align-items:center;justify-content:center;color:#E06C75;font-size:14px;border-radius:4px;text-align:center;padding:12px;">Image Missing<br/>${path.basename(cell.path)}</div>`;
      }
      return `
        <div style="background:#181818;border:1px solid #2C2C2C;border-radius:6px;overflow:hidden;display:flex;flex-direction:column;">
          ${imgTag}
          <div style="padding:10px 12px;font-size:13px;font-weight:600;color:#F0F0F0;background:#121212;text-align:center;letter-spacing:0.5px;border-top:1px solid #242424;white-space:pre-line;">${cell.label}</div>
        </div>
      `;
    }).join('');

    return `
      <div style="display:grid;grid-template-columns:repeat(${row.length}, 1fr);gap:16px;margin-bottom:16px;">
        ${cellsHtml}
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
          body { background: #0E0F12; color: #ECEFF4; padding: 32px; width: 1400px; }
          header { margin-bottom: 24px; border-bottom: 1px solid #2D3039; padding-bottom: 16px; }
          h1 { font-size: 24px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px; margin-bottom: 6px; }
          .subtitle { font-size: 14px; color: #9AA0A6; font-weight: 400; }
        </style>
      </head>
      <body>
        <header>
          <h1>${title}</h1>
          <div class="subtitle">${subtitle}</div>
        </header>
        ${gridHtml}
      </body>
    </html>
  `;

  await page.setContent(html);
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  await page.screenshot({ path: outputPath, type: 'jpeg', quality: 90, fullPage: true });
  await browser.close();
}

function parseArgs(argv) {
  const args = {
    probe: false,
    all: false,
    contactSheet: false,
  };
  for (const a of argv.slice(2)) {
    if (a === '--probe') args.probe = true;
    else if (a === '--all') args.all = true;
    else if (a === '--contact-sheet') args.contactSheet = true;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const baseDir = path.resolve(ROOT, 'scratch/v33/schnell-style-baseline');
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

  console.log('=== HAY & ĐẸP. V3.3A-S: Schnell Style Baseline ===');
  console.log(`Base directory: ${baseDir}`);

  // 1. Auth Check
  const auth = auditAuth();
  console.log(`CLOUDFLARE_ACCOUNT_ID present: ${auth.hasAccountId ? 'YES' : 'NO'}`);
  console.log(`CLOUDFLARE_API_TOKEN present: ${auth.hasToken ? 'YES' : 'NO'}`);

  if (!auth.hasAccountId || !auth.hasToken) {
    console.error('\n❌ Authentication failed: Missing Cloudflare credentials.');
    console.log('\n==========================================');
    console.log('V3.3A-S SCHNELL STYLE BASELINE — FAIL');
    console.log('==========================================');
    process.exit(1);
  }

  // 2. Probe Mode
  if (args.probe) {
    console.log('\n--- Running Section 4 Auth Probe (Seed 2101) ---');
    const probePath = path.join(baseDir, 'schnell-2101.jpg');
    try {
      const res = await callCloudflareSchnell({
        prompt: FULL_PROMPT,
        seed: 2101,
        steps: 4,
      });
      fs.writeFileSync(probePath, res.buffer);
      console.log(`✅ Probe succeeded! Saved ${res.buffer.length} bytes to ${probePath}`);
      console.log(`Seed supported: ${res.seedSupported}`);
      return;
    } catch (err) {
      console.error(`❌ Probe call failed: ${err.message}`);
      let cat = 'general error';
      if (err.message.includes('401') || err.message.includes('Unauthorized')) cat = 'authentication error';
      else if (err.message.includes('403')) cat = 'permission error';
      else if (err.message.includes('429') || err.message.includes('10,000 neurons')) cat = 'quota exhaustion';
      else if (err.message.includes('404')) cat = 'invalid account or model';

      console.error(`Error category: ${cat}`);
      console.log('\n==========================================');
      console.log('V3.3A-S SCHNELL STYLE BASELINE — FAIL');
      console.log('==========================================');
      process.exit(1);
    }
  }

  // 3. Full 8-Candidate Generation Mode
  if (args.all) {
    console.log('\n--- Running Full 8-Candidate Baseline Matrix ---');
    let seedSupported = true;
    let apiCalls = 0;

    for (const seed of BASELINE_SEEDS) {
      const outFileName = `schnell-${seed}.jpg`;
      const outPath = path.join(baseDir, outFileName);

      if (fs.existsSync(outPath) && fs.statSync(outPath).size > 50000) {
        console.log(`[CANDIDATE ${seed}] Reusing existing output (${fs.statSync(outPath).size} bytes)`);
        continue;
      }

      console.log(`[CANDIDATE ${seed}] Generating -> ${outFileName}...`);
      apiCalls++;
      try {
        const res = await callCloudflareSchnell({
          prompt: FULL_PROMPT,
          seed,
          steps: 4,
        });
        fs.writeFileSync(outPath, res.buffer);
        seedSupported = res.seedSupported;
        console.log(`  -> Saved ${res.buffer.length} bytes to ${outPath}`);
      } catch (err) {
        console.error(`  ❌ Error generating candidate ${seed}: ${err.message}`);
        throw err;
      }
    }

    // Build Contact Sheet
    console.log('\n--- Generating Contact Sheet (2 rows x 4 cols) ---');
    const getLabel = (s, idx) => {
      if (seedSupported) {
        return `FLUX.1 Schnell\nseed ${s}`;
      }
      return `FLUX.1 Schnell\ncandidate ${String(idx + 1).padStart(2, '0')}`;
    };

    const row1 = BASELINE_SEEDS.slice(0, 4).map((s, idx) => ({
      path: path.join(baseDir, `schnell-${s}.jpg`),
      label: getLabel(s, idx),
    }));
    const row2 = BASELINE_SEEDS.slice(4, 8).map((s, idx) => ({
      path: path.join(baseDir, `schnell-${s}.jpg`),
      label: getLabel(s, idx + 4),
    }));

    const sheetPath = path.join(baseDir, 'contact-sheet.jpg');
    await createContactSheet({
      imageGrid: [row1, row2],
      outputPath: sheetPath,
      title: 'HAY & ĐẸP. V3.3A-S — FLUX.1 Schnell Style Baseline',
      subtitle: '8 Candidates • Evaluated on Fixed Neutral Adult Subject',
    });
    console.log(`✅ Contact sheet saved to: ${sheetPath}`);

    // Build run report JSON
    const reportPath = path.join(baseDir, 'run-report.json');
    const report = {
      model: MODEL_ID,
      candidateCount: 8,
      seedSupported,
      stepsRequested: 4,
      probeSucceeded: true,
      apiCalls,
    };
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf-8');
    console.log(`✅ Run report saved to: ${reportPath}`);
  }

  // 4. Contact Sheet only mode
  if (args.contactSheet) {
    console.log('\n--- Generating Contact Sheet Only ---');
    const row1 = BASELINE_SEEDS.slice(0, 4).map((s, idx) => ({
      path: path.join(baseDir, `schnell-${s}.jpg`),
      label: `FLUX.1 Schnell\ncandidate ${String(idx + 1).padStart(2, '0')}`,
    }));
    const row2 = BASELINE_SEEDS.slice(4, 8).map((s, idx) => ({
      path: path.join(baseDir, `schnell-${s}.jpg`),
      label: `FLUX.1 Schnell\ncandidate ${String(idx + 5).padStart(2, '0')}`,
    }));

    const sheetPath = path.join(baseDir, 'contact-sheet.jpg');
    await createContactSheet({
      imageGrid: [row1, row2],
      outputPath: sheetPath,
      title: 'HAY & ĐẸP. V3.3A-S — FLUX.1 Schnell Style Baseline',
      subtitle: '8 Candidates • Deterministic Seeds 2101–2108 • Evaluated on Fixed Neutral Adult Subject',
    });
    console.log(`✅ Contact sheet saved to: ${sheetPath}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`Fatal Error: ${err.message}`);
    process.exit(1);
  });
}
