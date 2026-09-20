/**
 * HAY & ĐẸP. — V3.3B-S: Video 001 Real-Asset Pilot with Bounded QA/Retry
 * Model: @cf/black-forest-labs/flux-1-schnell
 *
 * Scope:
 * - Real Video 001 asset generation across 16 beats.
 * - Honors canonical reuse for beats 13, 14, 16.
 * - Sanitized brand tokens from style prompt to prevent text bleed.
 * - Compact anatomy block for beats with people.
 * - Bounded QA/retry up to 3 attempts per beat.
 * - Generates selected/ directory, contact-sheet-selected.jpg, contact-sheet-rejected.jpg, qa.json, pilot-report.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

import { parseHayDepVideos } from './parse-hay-dep-videos.mjs';
import { buildStoryPlan, validateStoryPlan, STORY_ROLES } from './human-insight-story-planner.mjs';
import { buildPrompt, buildPresentCastPrompt } from './human-insight-image.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export const MODEL_ID = '@cf/black-forest-labs/flux-1-schnell';
export const BASE_DIR = path.resolve(ROOT, 'scratch/v33/video001-schnell-pilot');

export const COMPACT_ANATOMY_BLOCK = [
  'ANATOMY:',
  'Believable connected human anatomy.',
  'Head, neck, torso, arms and visible hands belong naturally to the same body.',
  'No floating head.',
  'No detached hand or arm.',
  'No duplicate limbs.',
  'No missing torso.',
  'No surreal anatomy.',
  'Keep intended people comfortably inside frame.',
].join('\n');

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

export function buildPilotPrompt(beat) {
  const scene = {
    ...beat,
    action: beat.visualAction,
    visual: beat.visualIntent,
    text: beat.voiceClause,
  };

  const action = scene.action || scene.visual || scene.text;
  const rawMeaning = scene.visual || scene.text;
  const sceneMeaning = rawMeaning
    .replace(/\.\s*Convert this priority.*$/i, '.')
    .replace(/\s*Visual priority hint:.*$/i, '.')
    .trim();

  const castPrompt = buildPresentCastPrompt(scene, beat.castId);
  const worldPrompt = scene.worldLock
    ? `WORLD LOCK: ${beat.worldId || ''}\n${scene.worldLock}`
    : 'WORLD:\nWarm believable Vietnamese everyday-life environment.\nIvory / warm cream, muted sage, warm wood, charcoal details.';

  const stylePrompt = [
    'STYLE LOCK:',
    'Premium warm editorial 2D illustration.',
    'Soft ivory and warm cream palette, muted sage accents, warm wood, charcoal/sepia linework.',
    'Natural gentle light, tactile editorial texture, proportional expressive Vietnamese characters.',
    'Calm uncluttered composition, subtle depth, believable anatomy.',
  ].join('\n');

  const shotPrompt = `SHOT: Vertical 9:16 editorial framing, candid, unposed.\n${beat.shotScale || 'medium'}\n${beat.composition || 'portrait-focus'}`;

  const negPrompt = 'NEGATIVE: NO TEXT, NO LOGO, NO WATERMARK. No posed portrait, no extra people, no luxury showroom look.';

  const sections = [
    `ACTION:\n${action}`,
    `SCENE MEANING:\n${sceneMeaning}`,
    castPrompt,
    worldPrompt,
    stylePrompt,
    beat.needsPeople !== false ? COMPACT_ANATOMY_BLOCK : null,
    shotPrompt,
    negPrompt,
  ].filter(Boolean);

  let full = sections.join('\n\n');

  // Strip literal brand tokens
  full = full
    .replace(/for\s+HAY\s*&\s*ĐẸP\.?/gi, '')
    .replace(/for\s+HAY\s*&\s*DEP\.?/gi, '')
    .replace(/for\s+HAY\s*DEP\.?/gi, '')
    .replace(/STYLE\s+LOCK\s*—\s*HAY\s*&\s*ĐẸP\.?/gi, 'STYLE LOCK:')
    .replace(/HAY\s*&\s*ĐẸP\.?/gi, '')
    .replace(/HAY\s*&\s*DEP\.?/gi, '')
    .replace(/HAY\s*DEP\.?/gi, '')
    .trim();

  if (full.length > 2000) {
    full = full
      .replace('Use same recurring identities, no random extra people.', 'Use recurring identities.')
      .replace('Keep these stable anchors across all connected scenes.', 'Keep stable anchors.')
      .replace(/\n{2,}/g, '\n');
  }

  return full;
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

export async function createGridContactSheet({
  images, // array of { path, label, sublabel }
  columns = 4,
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
      imgTag = `<div style="width:100%;aspect-ratio:1/1;background:#2A2A2A;display:flex;align-items:center;justify-content:center;color:#E06C75;font-size:14px;border-radius:4px;text-align:center;padding:12px;">Missing<br/>${path.basename(img.path)}</div>`;
    }
    return `
      <div style="background:#181818;border:1px solid #2C2C2C;border-radius:6px;overflow:hidden;display:flex;flex-direction:column;">
        ${imgTag}
        <div style="padding:8px 10px;font-size:12px;font-weight:700;color:#FFFFFF;background:#121212;text-align:center;border-top:1px solid #242424;">${img.label}</div>
        ${img.sublabel ? `<div style="padding:4px 8px;font-size:11px;color:#A0A5B0;background:#0E0F12;text-align:center;border-top:1px solid #1A1A1A;white-space:pre-line;">${img.sublabel}</div>` : ''}
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
          body { background: #0A0B0E; color: #ECEFF4; padding: 32px; width: 1500px; }
          header { margin-bottom: 24px; border-bottom: 1px solid #2D3039; padding-bottom: 16px; }
          h1 { font-size: 24px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px; margin-bottom: 6px; }
          .subtitle { font-size: 14px; color: #9AA0A6; font-weight: 400; }
          .grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 16px; }
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
  await page.screenshot({ path: outputPath, type: 'jpeg', quality: 90, fullPage: true });
  await browser.close();
}

function parseArgs(argv) {
  const args = {
    plan: false,
    generateAttempt1: false,
    generateRetry: false,
    beat: null,
    attempt: null,
    buildSelected: false,
    contactSheets: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--plan') args.plan = true;
    else if (a === '--generate-attempt-1') args.generateAttempt1 = true;
    else if (a === '--generate-retry') args.generateRetry = true;
    else if (a === '--beat') args.beat = argv[++i];
    else if (a === '--attempt') args.attempt = parseInt(argv[++i], 10);
    else if (a === '--build-selected') args.buildSelected = true;
    else if (a === '--contact-sheets') args.contactSheets = true;
    else if (a === '--compile-report' || a === '--finalize') args.compileReport = true;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true });

  console.log('=== HAY & ĐẸP. V3.3B-S: Video 001 Schnell Asset Pilot ===');
  console.log(`Base directory: ${BASE_DIR}`);

  // 1. Auth Check
  const auth = auditAuth();
  console.log(`CLOUDFLARE_ACCOUNT_ID present: ${auth.hasAccountId ? 'YES' : 'NO'}`);
  console.log(`CLOUDFLARE_API_TOKEN present: ${auth.hasToken ? 'YES' : 'NO'}`);

  if (!auth.hasAccountId || !auth.hasToken) {
    console.error('❌ Missing credentials.');
    process.exit(1);
  }

  // 2. Load and Validate Story Plan
  const { plan, validation } = loadVideo001StoryPlan();
  console.log(`Content Mode: ${plan.contentMode}`);
  console.log(`Cast ID: ${plan.castId}`);
  console.log(`World ID: ${plan.worldId}`);
  console.log(`Beat Count: ${plan.beats.length}`);
  console.log(`Plan Valid: ${validation.valid ? 'YES' : 'NO'}`);

  if (!validation.valid) {
    console.error('Validation errors:', validation.errors);
    process.exit(1);
  }

  // Generate Attempt 1 for all non-canonical beats
  if (args.generateAttempt1) {
    console.log('\n--- Generating Attempt 1 for all beats requiring generation ---');
    for (const beat of plan.beats) {
      if (beat.assetStrategy === 'reuse-canonical') {
        console.log(`[${beat.id}] REUSE CANONICAL (${beat.storyRole}) -> skipping generation`);
        continue;
      }

      const outName = `${beat.id}-attempt-01.jpg`;
      const outPath = path.join(BASE_DIR, outName);

      if (fs.existsSync(outPath) && fs.statSync(outPath).size > 50000) {
        console.log(`[${beat.id}] Reusing existing ${outName} (${fs.statSync(outPath).size} bytes)`);
        continue;
      }

      console.log(`[${beat.id}] Generating ${outName}... (${beat.storyRole})`);
      const prompt = buildPilotPrompt(beat);
      try {
        const buf = await callCloudflareSchnell(prompt);
        fs.writeFileSync(outPath, buf);
        console.log(`  -> Saved ${buf.length} bytes to ${outPath}`);
      } catch (err) {
        console.error(`  ❌ Failed ${beat.id}: ${err.message}`);
        throw err;
      }
    }
    console.log('✅ Attempt 1 generation complete.');
  }

  // Generate Retry for a specific beat and attempt
  if (args.generateRetry && args.beat && args.attempt) {
    const beat = plan.beats.find((b) => b.id === args.beat);
    if (!beat) {
      throw new Error(`Beat ${args.beat} not found in plan`);
    }
    const attemptStr = String(args.attempt).padStart(2, '0');
    const outName = `${beat.id}-attempt-${attemptStr}.jpg`;
    const outPath = path.join(BASE_DIR, outName);

    console.log(`\n--- Generating Retry: ${outName} (${beat.storyRole}) ---`);
    const prompt = buildPilotPrompt(beat);
    const buf = await callCloudflareSchnell(prompt);
    fs.writeFileSync(outPath, buf);
    console.log(`✅ Saved ${buf.length} bytes to ${outPath}`);
  }

  // Compile QA, Report, Selected Assets & Contact Sheets
  if (args.compileReport || args.finalize) {
    const qaRecords = [
      {
        beatId: "beat-01",
        storyRole: "establish",
        voiceClause: "khi còn nhỏ, một bữa cơm đủ người thường chỉ là chuyện rất bình thường.",
        attempts: [
          { file: "beat-01-attempt-01.jpg", verdict: "FAIL", reasons: ["severe style drift: photorealism"] },
          { file: "beat-01-attempt-02.jpg", verdict: "FAIL", reasons: ["severe style drift: photorealism", "people contract: 5 people (extra adult male in blue shirt)"] },
          { file: "beat-01-attempt-03.jpg", verdict: "FAIL", reasons: ["severe style drift: photorealism", "people contract: 5 people (extra girl in foreground)", "text pollution: 'MAKKIN' plaque on wall shelf"] }
        ],
        selectedFile: "beat-01-attempt-01.jpg",
        qaVerdict: "FAIL",
        note: "Failed after max 3 retries due to photorealism drift. Used attempt-01 as visual fallback for sequence review."
      },
      {
        beatId: "beat-02",
        storyRole: "reflection",
        voiceClause: "Giá trị của bữa cơm không nằm ở món ăn cầu kỳ",
        attempts: [
          { file: "beat-02-attempt-01.jpg", verdict: "FAIL", reasons: ["severe style drift: photorealism"] },
          { file: "beat-02-attempt-02.jpg", verdict: "FAIL", reasons: ["severe style drift: photorealism"] },
          { file: "beat-02-attempt-03.jpg", verdict: "FAIL", reasons: ["severe style drift: photorealism", "anatomy: detached floating third hand near bowl"] }
        ],
        selectedFile: "beat-02-attempt-01.jpg",
        qaVerdict: "FAIL",
        note: "Failed after max 3 retries due to photorealism drift and anatomy failure in attempt 3."
      },
      {
        beatId: "beat-03",
        storyRole: "interaction",
        voiceClause: "mà ở việc mọi người cùng có mặt",
        attempts: [
          { file: "beat-03-attempt-01.jpg", verdict: "PASS", reasons: [] }
        ],
        selectedFile: "beat-03-attempt-01.jpg",
        qaVerdict: "PASS"
      },
      {
        beatId: "beat-04",
        storyRole: "interaction",
        voiceClause: "nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài.",
        attempts: [
          { file: "beat-04-attempt-01.jpg", verdict: "FAIL", reasons: ["severe style drift: photorealism"] },
          { file: "beat-04-attempt-02.jpg", verdict: "FAIL", reasons: ["severe style drift: photorealism"] },
          { file: "beat-04-attempt-03.jpg", verdict: "FAIL", reasons: ["severe style drift: photorealism", "people contract: 5 people (extra children in foreground)"] }
        ],
        selectedFile: "beat-04-attempt-01.jpg",
        qaVerdict: "FAIL",
        note: "Failed after max 3 retries due to photorealism drift."
      },
      {
        beatId: "beat-05",
        storyRole: "detail-action",
        voiceClause: "Có thể là một mâm cơm đơn giản có đủ người.",
        attempts: [
          { file: "beat-05-attempt-01.jpg", verdict: "FAIL", reasons: ["text pollution: artist signature glyph in bottom-right corner"] },
          { file: "beat-05-attempt-02.jpg", verdict: "PASS", reasons: [] }
        ],
        selectedFile: "beat-05-attempt-02.jpg",
        qaVerdict: "PASS"
      },
      {
        beatId: "beat-06",
        storyRole: "detail-action",
        voiceClause: "Hoặc chiếc điện thoại được đặt sang một bên.",
        attempts: [
          { file: "beat-06-attempt-01.jpg", verdict: "FAIL", reasons: ["anatomy: severe deformed hand with 6+ distorted fingers", "core semantic failure: holding phone mid-air over dining table instead of setting face-down on shelf"] },
          { file: "beat-06-attempt-02.jpg", verdict: "FAIL", reasons: ["anatomy: detached arm entering from right side", "core semantic failure: holding phone up toward camera instead of setting face-down on shelf"] },
          { file: "beat-06-attempt-03.jpg", verdict: "FAIL", reasons: ["text pollution: Chinese calligraphy character framed on wall", "core semantic failure: phone placed directly over dinner bowl on table instead of on side shelf"] }
        ],
        selectedFile: "beat-06-attempt-03.jpg",
        qaVerdict: "FAIL",
        note: "Failed after max 3 retries due to severe anatomy defects, persistent semantic action failure, and text pollution."
      },
      {
        beatId: "beat-07",
        storyRole: "action",
        voiceClause: "Có khi chỉ là câu chuyện nhỏ sau một ngày đi học, đi làm.",
        attempts: [
          { file: "beat-07-attempt-01.jpg", verdict: "FAIL", reasons: ["severe style drift: photorealism"] },
          { file: "beat-07-attempt-02.jpg", verdict: "FAIL", reasons: ["severe style drift: photorealism", "text pollution: commercial Apple logo on tablet"] },
          { file: "beat-07-attempt-03.jpg", verdict: "FAIL", reasons: ["severe style drift: photorealism", "people contract: father missing (only boy present)"] }
        ],
        selectedFile: "beat-07-attempt-01.jpg",
        qaVerdict: "FAIL",
        note: "Failed after max 3 retries due to photorealism drift."
      },
      {
        beatId: "beat-08",
        storyRole: "context",
        voiceClause: "Những chi tiết như vậy không tạo cảm giác mình vừa thay đổi cả cuộc sống.",
        attempts: [
          { file: "beat-08-attempt-01.jpg", verdict: "PASS", reasons: [] }
        ],
        selectedFile: "beat-08-attempt-01.jpg",
        qaVerdict: "PASS"
      },
      {
        beatId: "beat-09",
        storyRole: "reflection",
        voiceClause: "Nhưng chính vì nhỏ, chúng có cơ hội xuất hiện trong những ngày thật.",
        attempts: [
          { file: "beat-09-attempt-01.jpg", verdict: "FAIL", reasons: ["severe style drift: photorealism"] },
          { file: "beat-09-attempt-02.jpg", verdict: "FAIL", reasons: ["severe style drift: photorealism"] },
          { file: "beat-09-attempt-03.jpg", verdict: "FAIL", reasons: ["severe style drift: photorealism"] }
        ],
        selectedFile: "beat-09-attempt-01.jpg",
        qaVerdict: "FAIL",
        note: "Failed after max 3 retries due to photorealism drift."
      },
      {
        beatId: "beat-10",
        storyRole: "context",
        voiceClause: "Tuần này, thử giữ lại ít nhất một bữa ăn",
        attempts: [
          { file: "beat-10-attempt-01.jpg", verdict: "FAIL", reasons: ["severe style drift: photorealism"] },
          { file: "beat-10-attempt-02.jpg", verdict: "FAIL", reasons: ["severe style drift: photorealism"] },
          { file: "beat-10-attempt-03.jpg", verdict: "FAIL", reasons: ["severe style drift: photorealism", "anatomy: severed arm floating out of thin air on table"] }
        ],
        selectedFile: "beat-10-attempt-01.jpg",
        qaVerdict: "FAIL",
        note: "Failed after max 3 retries due to photorealism drift and severed arm defect."
      },
      {
        beatId: "beat-11",
        storyRole: "interaction",
        voiceClause: "mà mọi người ngồi cùng nhau",
        attempts: [
          { file: "beat-11-attempt-01.jpg", verdict: "PASS", reasons: [] }
        ],
        selectedFile: "beat-11-attempt-01.jpg",
        qaVerdict: "PASS"
      },
      {
        beatId: "beat-12",
        storyRole: "detail-action",
        voiceClause: "và điện thoại không nằm giữa bàn.",
        attempts: [
          { file: "beat-12-attempt-01.jpg", verdict: "PASS", reasons: [] }
        ],
        selectedFile: "beat-12-attempt-01.jpg",
        qaVerdict: "PASS"
      },
      {
        beatId: "beat-13",
        storyRole: "reflection",
        voiceClause: "Có những điều lúc đang có thì rất bình thường.",
        assetStrategy: "reuse-canonical",
        selectedFrom: "beat-01",
        apiCalls: 0
      },
      {
        beatId: "beat-14",
        storyRole: "reflection",
        voiceClause: "Đến khi lịch mỗi người khác đi, ta mới biết chúng từng đẹp đến mức nào.",
        assetStrategy: "reuse-canonical",
        selectedFrom: "beat-01",
        apiCalls: 0
      },
      {
        beatId: "beat-15",
        storyRole: "release",
        voiceClause: "Nhà bạn có bữa ăn nào dù món rất đơn giản",
        attempts: [
          { file: "beat-15-attempt-01.jpg", verdict: "FAIL", reasons: ["people contract: 3 people present despite noPeople requested", "text pollution: Chinese calligraphy on wall"] },
          { file: "beat-15-attempt-02.jpg", verdict: "FAIL", reasons: ["people contract: 4 people present despite noPeople requested"] },
          { file: "beat-15-attempt-03.jpg", verdict: "FAIL", reasons: ["people contract: 3 people present despite noPeople requested", "anatomy: floating severed arm holding bowl in center"] }
        ],
        selectedFile: "beat-15-attempt-01.jpg",
        qaVerdict: "FAIL",
        note: "Failed after max 3 retries: model persistently generated people despite noPeople prompt, with severe floating arm defect in attempt 3."
      },
      {
        beatId: "beat-16",
        storyRole: "question",
        voiceClause: "nhưng vẫn nhớ lâu không?",
        assetStrategy: "reuse-canonical",
        selectedFrom: "beat-01",
        apiCalls: 0
      }
    ];

    const qaPath = path.join(BASE_DIR, 'qa.json');
    fs.writeFileSync(qaPath, JSON.stringify(qaRecords, null, 2));
    console.log(`✅ Saved QA record to: ${qaPath}`);

    // Pilot metrics report
    const report = {
      videoIndex: 1,
      model: MODEL_ID,
      beatCount: 16,
      generatedBeatCount: 13,
      reuseCanonicalBeatCount: 3,
      totalApiCalls: 30,
      firstAttemptPassCount: 4,
      retryBeatCount: 9,
      failedAfterMaxRetriesCount: 8,
      anatomyRejectCount: 5,
      textPollutionRejectCount: 5,
      peopleContractRejectCount: 7,
      semanticRejectCount: 3,
      styleDriftRejectCount: 18
    };

    const reportPath = path.join(BASE_DIR, 'pilot-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`✅ Saved Pilot Report to: ${reportPath}`);

    // Copy selected assets to selected/
    const selectedDir = path.join(BASE_DIR, 'selected');
    if (!fs.existsSync(selectedDir)) fs.mkdirSync(selectedDir, { recursive: true });

    const beat1Record = qaRecords.find((r) => r.beatId === 'beat-01');
    const canonicalFile = beat1Record?.selectedFile;
    const canonicalSrcPath = path.join(BASE_DIR, canonicalFile);

    for (const beat of plan.beats) {
      const destPath = path.join(selectedDir, `${beat.id}.jpg`);
      if (beat.assetStrategy === 'reuse-canonical') {
        fs.copyFileSync(canonicalSrcPath, destPath);
        console.log(`[${beat.id}] Reuse canonical from beat-01 (${canonicalFile}) -> selected/${beat.id}.jpg`);
      } else {
        const record = qaRecords.find((r) => r.beatId === beat.id);
        const srcPath = path.join(BASE_DIR, record.selectedFile);
        fs.copyFileSync(srcPath, destPath);
        console.log(`[${beat.id}] ${record.selectedFile} -> selected/${beat.id}.jpg (${record.qaVerdict})`);
      }
    }
    console.log('✅ All 16 selected assets assembled in selected/');

    // Generate Contact Sheet - Selected (4x4)
    console.log('\n--- Generating Contact Sheets ---');
    const selectedImages = plan.beats.map((beat) => {
      const selectedPath = path.join(BASE_DIR, 'selected', `${beat.id}.jpg`);
      const isReuse = beat.assetStrategy === 'reuse-canonical';
      const record = isReuse ? beat1Record : qaRecords.find((r) => r.beatId === beat.id);
      const passTag = isReuse ? '[CANONICAL REUSE]' : (record.qaVerdict === 'PASS' ? '[QA PASS]' : '[QA FAIL - FALLBACK]');
      return {
        path: selectedPath,
        label: `${beat.id} • ${beat.storyRole.toUpperCase()} ${passTag}`,
        sublabel: isReuse ? 'REUSE CANONICAL (beat-01)' : `${beat.voiceClause.slice(0, 48)}...\n(${record.selectedFile})`,
      };
    });

    const selectedSheetOut = path.join(BASE_DIR, 'contact-sheet-selected.jpg');
    await createGridContactSheet({
      images: selectedImages,
      columns: 4,
      outputPath: selectedSheetOut,
      title: 'HAY & ĐẸP. V3.3B-S — Video 001 Real-Asset Pilot: Selected Set',
      subtitle: '16 Story Beats in Sequence • FLUX.1 Schnell with Bounded QA/Retry Gate',
    });
    console.log(`✅ Selected contact sheet created at: ${selectedSheetOut}`);

    // Generate Contact Sheet - Rejected (25 candidates)
    const rejectedImages = [];
    for (const rec of qaRecords) {
      if (rec.attempts) {
        for (const att of rec.attempts) {
          if (att.verdict === 'FAIL') {
            rejectedImages.push({
              path: path.join(BASE_DIR, att.file),
              label: `${rec.beatId} • ${att.file.replace(`${rec.beatId}-`, '')}`,
              sublabel: `FAIL: ${att.reasons.join(' • ')}`,
            });
          }
        }
      }
    }

    if (rejectedImages.length > 0) {
      const rejectedSheetOut = path.join(BASE_DIR, 'contact-sheet-rejected.jpg');
      await createGridContactSheet({
        images: rejectedImages,
        columns: 5,
        outputPath: rejectedSheetOut,
        title: 'HAY & ĐẸP. V3.3B-S — Video 001 Pilot: Rejected Candidates',
        subtitle: `${rejectedImages.length} Rejected Candidate(s) across Bounded QA Gate (Max 3 Attempts/Beat)`,
      });
      console.log(`✅ Rejected contact sheet created at: ${rejectedSheetOut}`);
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`Fatal Error: ${err.message}`);
    process.exit(1);
  });
}
