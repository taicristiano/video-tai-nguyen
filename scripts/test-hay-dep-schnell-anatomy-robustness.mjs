/**
 * HAY & ĐẸP. — V3.3A-S.1: Schnell Anatomy Robustness Test Script
 * Model: @cf/black-forest-labs/flux-1-schnell
 *
 * Scope:
 * - Test whether a stricter anatomical framing prompt eliminates severe structural failures.
 * - Prompt-only payload directly (seed/steps unsupported).
 * - 8 unbiased candidate calls.
 * - Generate contact sheet, evaluation markdown, comparison markdown, and run report.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export const MODEL_ID = '@cf/black-forest-labs/flux-1-schnell';

export const SUBJECT_TEXT = `A Vietnamese adult standing beside a small warm-wood side table,
holding a simple ceramic cup,
calm neutral expression,
plain warm ivory background,
soft natural daylight.`;

export const STYLE_PROMPT = `STYLE LOCK — HAY & ĐẸP.

Premium warm editorial 2D illustration.

Natural Vietnamese / East Asian adult proportions.
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

export const ANATOMY_LOCK = `ANATOMY AND FRAMING LOCK:

One complete adult human body is clearly readable.
Show the person from head to at least mid-thigh.
Head, neck, shoulders, torso, both upper arms and both forearms are anatomically connected.
Both hands must belong naturally to the same visible body.
One hand may hold the ceramic cup.
The other hand rests naturally beside the body or lightly on the table.
Keep the torso fully present and visually connected between head and hips.
Keep the whole upper body comfortably inside frame with breathing room.

No floating head.
No detached hand.
No detached arm.
No missing torso.
No severed body parts.
No duplicate hands.
No extra fingers dominating the composition.
No body hidden behind plants or decorative objects.
No extreme crop through the neck, shoulders, chest, wrists or hands.
No surreal anatomy.`;

export const FULL_PROMPT = `${SUBJECT_TEXT}

${STYLE_PROMPT}

${ANATOMY_LOCK}`;

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

export async function callCloudflareSchnellPromptOnly(prompt) {
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

export async function createContactSheet({
  imageGrid,
  outputPath,
  title = 'HAY & ĐẸP. V3.3A-S.1 — Schnell Anatomy Robustness',
  subtitle = '8 Candidates with Stricter Anatomical Framing Lock • Fixed Neutral Subject',
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

async function main() {
  const baseDir = path.resolve(ROOT, 'scratch/v33/schnell-anatomy-robustness');
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

  console.log('=== HAY & ĐẸP. V3.3A-S.1: Schnell Anatomy Robustness ===');
  console.log(`Base directory: ${baseDir}`);

  // 1. Auth Check
  const auth = auditAuth();
  console.log(`CLOUDFLARE_ACCOUNT_ID present: ${auth.hasAccountId ? 'YES' : 'NO'}`);
  console.log(`CLOUDFLARE_API_TOKEN present: ${auth.hasToken ? 'YES' : 'NO'}`);

  if (!auth.hasAccountId || !auth.hasToken) {
    console.error('\n❌ Authentication failed: Missing Cloudflare credentials.');
    console.log('\n==========================================');
    console.log('V3.3A-S.1 SCHNELL ANATOMY ROBUSTNESS — FAIL');
    console.log('==========================================');
    process.exit(1);
  }

  // 2. Generate exactly 8 candidates directly (no extra probe call per Section 3)
  console.log('\n--- Generating Exactly 8 Anatomy Candidates ---');
  let apiCalls = 0;

  for (let i = 1; i <= 8; i++) {
    const candidateIndex = String(i).padStart(2, '0');
    const outFileName = `anatomy-${candidateIndex}.jpg`;
    const outPath = path.join(baseDir, outFileName);

    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 50000) {
      console.log(`[CANDIDATE ${candidateIndex}] Reusing existing output (${fs.statSync(outPath).size} bytes)`);
      continue;
    }

    console.log(`[CANDIDATE ${candidateIndex}] Generating -> ${outFileName}...`);
    apiCalls++;
    try {
      const buf = await callCloudflareSchnellPromptOnly(FULL_PROMPT);
      fs.writeFileSync(outPath, buf);
      console.log(`  -> Saved ${buf.length} bytes to ${outPath}`);
    } catch (err) {
      console.error(`  ❌ Error generating candidate ${candidateIndex}: ${err.message}`);
      throw err;
    }
  }

  // 3. Build Contact Sheet
  console.log('\n--- Generating Contact Sheet (2 rows x 4 cols) ---');
  const row1 = [1, 2, 3, 4].map((i) => ({
    path: path.join(baseDir, `anatomy-${String(i).padStart(2, '0')}.jpg`),
    label: `Schnell Anatomy ${String(i).padStart(2, '0')}`,
  }));
  const row2 = [5, 6, 7, 8].map((i) => ({
    path: path.join(baseDir, `anatomy-${String(i).padStart(2, '0')}.jpg`),
    label: `Schnell Anatomy ${String(i).padStart(2, '0')}`,
  }));

  const sheetPath = path.join(baseDir, 'contact-sheet.jpg');
  await createContactSheet({
    imageGrid: [row1, row2],
    outputPath: sheetPath,
    title: 'HAY & ĐẸP. V3.3A-S.1 — Schnell Anatomy Robustness',
    subtitle: '8 Candidates with Stricter Anatomical Framing Lock • Fixed Neutral Subject',
  });
  console.log(`✅ Contact sheet saved to: ${sheetPath}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`Fatal Error: ${err.message}`);
    process.exit(1);
  });
}
