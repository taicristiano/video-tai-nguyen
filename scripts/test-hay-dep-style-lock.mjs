/**
 * scripts/test-hay-dep-style-lock.mjs
 *
 * Isolated test script for HAY & ĐẸP. V3.3A-1 — Visual Style Lock Only.
 *
 * Evaluates visual style stability across:
 * - @cf/black-forest-labs/flux-2-dev
 * - @cf/black-forest-labs/flux-2-klein-9b
 *
 * Does NOT import or modify active batch engine or template production code.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

export const STYLE_MODELS = {
  dev: '@cf/black-forest-labs/flux-2-dev',
  klein9b: '@cf/black-forest-labs/flux-2-klein-9b',
};

export const PASS1_SEEDS = [1101, 1102, 1103, 1104];

export const NEUTRAL_SUBJECT_PASS1 = `A Vietnamese adult standing beside a small warm-wood side table,
holding a simple ceramic cup,
calm neutral expression,
plain warm ivory background,
soft natural daylight.`;

export const TARGET_STYLE = `Premium warm editorial 2D illustration.

Natural Vietnamese / East Asian human proportions.
Believable adult anatomy.
Restrained expressive face.
Clean charcoal / sepia linework.
Soft warm ivory and cream base.
Muted sage accents.
Warm wood tones.
Subtle tactile paper/editorial texture.
Natural diffused daylight.
Gentle dimensional shading.
Calm premium magazine-illustration feeling.
Simple but not flat.
Human, warm, mature, understated.`;

export const TARGET_AVOID = `NOT photorealistic
NOT anime
NOT manga
NOT chibi
NOT children's-book cartoon
NOT corporate flat vector
NOT stick figure
NOT watercolor wash
NOT 3D render
NOT oil painting
NOT fashion sketch
NOT plastic glossy skin
NOT exaggerated facial features
NOT hyper-detailed cinematic realism`;

export const PASS1_PROMPT = `${NEUTRAL_SUBJECT_PASS1}

STYLE:
${TARGET_STYLE}

AVOID:
${TARGET_AVOID}`;

export const REPEATABILITY_SUBJECTS = {
  A: `Vietnamese adult man standing near a window,
holding a ceramic cup,
simple neutral clothing,
calm natural posture.`,
  B: `Vietnamese adult woman beside a small wooden table,
gently arranging a few flowers,
simple neutral clothing.`,
  C: `Vietnamese adult man seated at a small desk,
reading a short handwritten note,
calm daylight.`,
  D: `Vietnamese adult woman tying a simple apron
beside a small side table,
natural everyday posture.`,
};

export function buildRepeatabilityPrompt(subjectText) {
  return `STYLE REFERENCE MATCH:
Match the illustration medium, linework, gentle shading, tactile paper texture, and muted ivory/sage/warm-wood palette of the style reference.

STYLE:
${TARGET_STYLE}

AVOID:
${TARGET_AVOID}

NEW SUBJECT (PERSON DIFFERENT, STYLE SAME):
${subjectText}`;
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

export async function callCloudflareAI({
  model,
  prompt,
  referencePaths = [],
  width = 1024,
  height = 1024,
  seed = null,
}) {
  loadEnvFile('.env.local');
  loadEnvFile('.env');

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !token) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is missing from environment');
  }

  const targetModel = STYLE_MODELS[model] || model;
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${targetModel}`;

  // Cloudflare FLUX.2 endpoints strictly require multipart/form-data
  const form = new FormData();
  form.append('prompt', prompt);
  form.append('width', String(width));
  form.append('height', String(height));
  if (Number.isFinite(seed) && seed !== null) {
    form.append('seed', String(seed >>> 0));
  }

  for (let i = 0; i < referencePaths.length; i++) {
    const p = path.isAbsolute(referencePaths[i]) ? referencePaths[i] : path.resolve(ROOT, referencePaths[i]);
    if (!fs.existsSync(p)) {
      throw new Error(`Reference image not found: ${p}`);
    }
    const buffer = fs.readFileSync(p);
    const ext = path.extname(p).toLowerCase();
    const type = ext === '.png' ? 'image/png' : 'image/jpeg';
    form.append(`input_image_${i}`, new Blob([buffer], { type }), path.basename(p));
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Note: do not set Content-Type header manually so fetch sets multipart/form-data with boundary
    },
    body: form,
  });

  const textBody = await response.text();

  if (!response.ok) {
    throw new Error(`Cloudflare ${response.status} [${targetModel}]: ${textBody.slice(0, 1000)}`);
  }

  let data;
  try {
    data = JSON.parse(textBody);
  } catch {
    throw new Error(`Invalid JSON response from Cloudflare: ${textBody.slice(0, 500)}`);
  }

  const imageBase64 = data.result?.image;
  if (!imageBase64) {
    throw new Error(`No result.image returned from Cloudflare: ${textBody.slice(0, 500)}`);
  }

  return Buffer.from(imageBase64, 'base64');
}

export async function renderDiagnosticCard({
  modelName,
  seed,
  errorText,
  outputPath,
}) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background: #141416;
            color: #E6E6E6;
            width: 1024px;
            height: 1024px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            padding: 60px;
            text-align: center;
          }
          .badge {
            display: inline-block;
            background: #E06C7522;
            color: #E06C75;
            border: 1px solid #E06C7588;
            padding: 8px 24px;
            border-radius: 20px;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 1px;
            margin-bottom: 24px;
          }
          h2 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #FFFFFF;
          }
          .meta {
            font-size: 20px;
            color: #A3B18A;
            margin-bottom: 32px;
            font-family: monospace;
          }
          .box {
            background: #1C1D21;
            border: 1px solid #2D3039;
            border-radius: 12px;
            padding: 24px;
            max-width: 860px;
            text-align: left;
            font-size: 15px;
            line-height: 1.6;
            color: #B0B5C0;
            font-family: monospace;
            word-break: break-word;
          }
          .box-title {
            color: #E5C07B;
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 13px;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="badge">GENERATION BLOCKED • HTTP 429</div>
        <h2>${modelName}</h2>
        <div class="meta">Seed: ${seed} | Size: 1024x1024</div>
        <div class="box">
          <div class="box-title">Cloudflare Workers AI Response</div>
          ${errorText}
        </div>
      </body>
    </html>
  `;

  await page.setContent(html);
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  await page.screenshot({ path: outputPath, type: 'jpeg', quality: 90 });
  await browser.close();
}

export async function createContactSheet({
  imageGrid, // 2D array: rows of [ { path, label } ]
  outputPath,
  title = 'HAY & ĐẸP. V3.3A-1 — Visual Style Lock Contact Sheet',
  subtitle = 'Evaluated on neutral subject • Visual Medium Consistency Test',
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
          <div style="padding:8px 10px;font-size:13px;font-weight:600;color:#F0F0F0;background:#121212;text-align:center;letter-spacing:0.5px;border-top:1px solid #242424;">
            ${cell.label}
          </div>
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
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background: #0E0E10;
            color: #EDEDED;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            padding: 24px;
            width: fit-content;
            min-width: 1280px;
          }
          h1 {
            font-size: 20px;
            font-weight: 700;
            color: #C2D4C2; /* Sage accent */
            margin-bottom: 6px;
            letter-spacing: 0.5px;
          }
          .subtitle {
            font-size: 13px;
            color: #888888;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="subtitle">${subtitle}</div>
        ${gridHtml}
      </body>
    </html>
  `;

  await page.setContent(html);
  const bodyHandle = await page.$('body');
  const boundingBox = await bodyHandle.boundingBox();

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  await page.screenshot({
    path: outputPath,
    type: 'jpeg',
    quality: 92,
    clip: {
      x: 0,
      y: 0,
      width: Math.ceil(boundingBox.width),
      height: Math.ceil(boundingBox.height),
    },
  });

  await browser.close();
}

export async function runQuotaProbe() {
  const baseDir = path.resolve(ROOT, 'scratch/v33/style-lock');
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

  const probeModel = 'dev';
  const probeSeed = 1101;
  const probeOutputPath = path.join(baseDir, `flux2-dev-${probeSeed}.jpg`);

  console.log('--- PROBE: Calling Cloudflare AI (@cf/black-forest-labs/flux-2-dev, seed 1101) ---');
  try {
    const buf = await callCloudflareAI({
      model: probeModel,
      prompt: PASS1_PROMPT,
      seed: probeSeed,
      width: 1024,
      height: 1024,
    });
    fs.writeFileSync(probeOutputPath, buf);
    console.log(`✅ Probe successful! Saved candidate image to: ${probeOutputPath} (${buf.length} bytes)`);
    return { ok: true, status: 200, savedPath: probeOutputPath };
  } catch (err) {
    const errMsg = err.message || '';
    const isQuotaExhausted =
      errMsg.includes('429') ||
      errMsg.toLowerCase().includes('quota') ||
      errMsg.toLowerCase().includes('neurons') ||
      errMsg.toLowerCase().includes('limit') ||
      errMsg.toLowerCase().includes('exhausted') ||
      errMsg.includes('4006');

    // Extract safe error summary without tokens
    const safeError = errMsg.replace(/Bearer\s+[^\s]+/gi, 'Bearer ***');
    console.error(`❌ Probe call failed: ${safeError}`);

    return {
      ok: false,
      isQuotaExhausted,
      errorText: safeError,
    };
  }
}

export function parseArgs(argv) {
  const args = {
    probe: false,
    pass1: false,
    repeatability: false,
    contactSheetPass1: false,
    contactSheetRepeatability: false,
    winningModel: 'dev',
    styleRef: '',
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--probe') args.probe = true;
    else if (arg === '--pass1') args.pass1 = true;
    else if (arg === '--repeatability') args.repeatability = true;
    else if (arg === '--contact-sheet-pass1') args.contactSheetPass1 = true;
    else if (arg === '--contact-sheet-repeatability') args.contactSheetRepeatability = true;
    else if (arg === '--winning-model') args.winningModel = argv[++i];
    else if (arg === '--style-ref') args.styleRef = argv[++i];
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const baseDir = path.resolve(ROOT, 'scratch/v33/style-lock');

  console.log('=== HAY & ĐẸP. V3.3A-1: Style Lock Test Script ===');
  console.log(`Base directory: ${baseDir}`);

  if (args.probe) {
    console.log('\n--- Running Minimal Quota Probe ---');
    const result = await runQuotaProbe();
    if (!result.ok) {
      if (result.isQuotaExhausted) {
        console.log('\n==========================================');
        console.log('V3.3A-1 STYLE LOCK — PAUSED_QUOTA');
        console.log('==========================================');
        process.exit(2);
      }
      process.exit(1);
    }
    console.log('Probe passed! Quota is available.');
    return;
  }

  if (args.pass1) {
    console.log('\n--- Running Pass 1: Generating 8 Style Candidates ---');
    const models = ['dev', 'klein9b'];

    for (const mKey of models) {
      for (let idx = 0; idx < PASS1_SEEDS.length; idx++) {
        const seed = PASS1_SEEDS[idx];
        const outFileName = `flux2-${mKey}-${seed}.jpg`;
        const outPath = path.join(baseDir, outFileName);

        // If probe already generated and saved flux2-dev-1101.jpg, reuse it!
        if (mKey === 'dev' && seed === 1101 && fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) {
          console.log(`[${mKey.toUpperCase()}] Candidate (seed: ${seed}) already exists from probe: ${outFileName}`);
          continue;
        }

        console.log(`[${mKey.toUpperCase()}] Candidate ${idx + 1} (seed: ${seed}) -> ${outFileName}`);
        try {
          const buf = await callCloudflareAI({
            model: mKey,
            prompt: PASS1_PROMPT,
            seed,
            width: 1024,
            height: 1024,
          });
          fs.writeFileSync(outPath, buf);
          console.log(`  -> Saved ${buf.length} bytes to ${outPath}`);
        } catch (err) {
          console.error(`  ❌ Error generating [${mKey}] candidate ${seed}: ${err.message}`);
          console.log(`  -> Writing diagnostic card: ${outPath}`);
          await renderDiagnosticCard({
            modelName: STYLE_MODELS[mKey] || mKey,
            seed,
            errorText: err.message,
            outputPath: outPath,
          });
        }
      }
    }
  }

  if (args.contactSheetPass1) {
    console.log('\n--- Building Pass 1 Contact Sheet ---');
    const devRow = PASS1_SEEDS.map((seed) => ({
      path: path.join(baseDir, `flux2-dev-${seed}.jpg`),
      label: `FLUX.2 dev • Seed ${seed}`,
    }));
    const kleinRow = PASS1_SEEDS.map((seed) => ({
      path: path.join(baseDir, `flux2-klein9b-${seed}.jpg`),
      label: `FLUX.2 klein 9B • Seed ${seed}`,
    }));

    const sheetOut = path.join(baseDir, 'contact-sheet-pass1.jpg');
    await createContactSheet({
      imageGrid: [devRow, kleinRow],
      outputPath: sheetOut,
      title: 'HAY & ĐẸP. V3.3A-1 — Visual Style Lock: Pass 1 Candidates (8 Images)',
      subtitle: 'FLUX.2 dev vs FLUX.2 klein-9b • Seeds 1101–1104 • Evaluated on Neutral Adult Subject',
    });
    console.log(`  -> Contact sheet created at: ${sheetOut}`);
  }

  if (args.repeatability) {
    console.log('\n--- Running Pass 2: Style Repeatability ---');
    const model = args.winningModel;
    const styleRefPath = args.styleRef || path.join(baseDir, 'style-reference.jpg');

    if (!fs.existsSync(styleRefPath)) {
      console.warn(`⚠️ Style reference not found at: ${styleRefPath}`);
      console.warn('Per Section 11: NO STYLE REFERENCE APPROVED -> Generating diagnostic blocked cards.');

      const blockedStyleRef = path.join(baseDir, 'style-reference-blocked.jpg');
      await renderDiagnosticCard({
        modelName: 'NO APPROVED STYLE REFERENCE',
        seed: 'N/A',
        errorText: 'Pass 1 generation was blocked or no candidate was approved. Per Section 11, cannot test repeatability without an approved style reference.',
        outputPath: blockedStyleRef,
      });

      for (const [key, subjectText] of Object.entries(REPEATABILITY_SUBJECTS)) {
        const outFileName = `repeat-${key}.jpg`;
        const outPath = path.join(baseDir, outFileName);
        await renderDiagnosticCard({
          modelName: `REPEATABILITY BLOCKED [SUBJ ${key}]`,
          seed: 2200 + key.charCodeAt(0),
          errorText: `Execution blocked per Section 11 & 12: Cannot test style repeatability without an approved style reference. Subject was: "${subjectText.split('\n')[0]}"`,
          outputPath: outPath,
        });
        console.log(`  -> Diagnostic card written for subject ${key}: ${outPath}`);
      }
      return;
    }

    for (const [key, subjectText] of Object.entries(REPEATABILITY_SUBJECTS)) {
      const outFileName = `repeat-${key}.jpg`;
      const outPath = path.join(baseDir, outFileName);
      const prompt = buildRepeatabilityPrompt(subjectText);

      if (fs.existsSync(outPath) && fs.statSync(outPath).size > 200000) {
        console.log(`[REPEATABILITY] Subject ${key} already exists (${fs.statSync(outPath).size} bytes), skipping.`);
        continue;
      }

      console.log(`[REPEATABILITY] Subject ${key} -> ${outFileName}`);
      let buf = null;
      let lastErr = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          if (attempt > 1) {
            console.log(`  -> Retrying subject ${key} (attempt ${attempt})...`);
          }
          buf = await callCloudflareAI({
            model,
            prompt,
            referencePaths: [styleRefPath],
            seed: 2200 + key.charCodeAt(0),
            width: 1024,
            height: 1024,
          });
          break;
        } catch (err) {
          lastErr = err;
          console.error(`  ❌ Attempt ${attempt} failed for subject ${key}: ${err.message}`);
          if (attempt < 2 && err.message.includes('408')) {
            console.log('  -> Waiting 5s before retry...');
            await new Promise((r) => setTimeout(r, 5000));
          }
        }
      }

      if (buf) {
        fs.writeFileSync(outPath, buf);
        console.log(`  -> Saved ${buf.length} bytes to ${outPath}`);
      } else {
        console.log(`  -> Writing diagnostic card: ${outPath}`);
        await renderDiagnosticCard({
          modelName: STYLE_MODELS[model] || model,
          seed: 2200 + key.charCodeAt(0),
          errorText: lastErr?.message || 'Generation failed',
          outputPath: outPath,
        });
      }
    }
  }

  if (args.contactSheetRepeatability) {
    let styleRefPath = args.styleRef || path.join(baseDir, 'style-reference.jpg');
    if (!fs.existsSync(styleRefPath) && fs.existsSync(path.join(baseDir, 'style-reference-blocked.jpg'))) {
      styleRefPath = path.join(baseDir, 'style-reference-blocked.jpg');
    }

    const row = [
      { path: styleRefPath, label: 'STYLE REF (Selected)' },
      { path: path.join(baseDir, 'repeat-A.jpg'), label: 'SUBJ A: Man Window' },
      { path: path.join(baseDir, 'repeat-B.jpg'), label: 'SUBJ B: Woman Flowers' },
      { path: path.join(baseDir, 'repeat-C.jpg'), label: 'SUBJ C: Man Note' },
      { path: path.join(baseDir, 'repeat-D.jpg'), label: 'SUBJ D: Woman Apron' },
    ];

    const sheetOut = path.join(baseDir, 'contact-sheet-repeatability.jpg');
    await createContactSheet({
      imageGrid: [row],
      outputPath: sheetOut,
      title: 'HAY & ĐẸP. V3.3A-1 — Visual Style Lock: Repeatability Pass',
      subtitle: 'Same Style Reference vs 4 Different Neutral Subjects • Style Consistency Test',
    });
    console.log(`  -> Repeatability contact sheet created at: ${sheetOut}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`Fatal Error: ${err.message}`);
    process.exit(1);
  });
}
