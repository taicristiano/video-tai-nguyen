/**
 * scripts/run-smoke-attempt3-regen.mjs
 *
 * HAY & ĐẸP. — PRODUCTION SMOKE TEST 01
 * Final Selective Regen — scene-08-beat-02 Attempt 3 Only
 * Model: @cf/black-forest-labs/flux-1-schnell ONLY
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import {
  callCloudflareSchnell,
  checkMachineIntegrity,
  MODEL_ID,
} from './run-v36-generalization.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const SMOKE_DIR = path.join(ROOT, 'scratch', 'production-smoke', 'video001');
const ASSETS_DIR = path.join(SMOKE_DIR, 'assets');
const ARCHIVE_DIR = path.join(SMOKE_DIR, 'archive');
const CANDIDATES_DIR = path.join(SMOKE_DIR, 'candidates');
const REVIEW_PACK_DIR = path.join(SMOKE_DIR, 'review-pack');
const PUBLIC_DIR = path.join(ROOT, 'public', 'scratch', 'production-smoke', 'video001');

fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
fs.mkdirSync(CANDIDATES_DIR, { recursive: true });
fs.mkdirSync(REVIEW_PACK_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const HUMAN_QA_ATTEMPT2_RECORDS = {
  'scene-09-beat-02': {
    status: 'PASS',
    style: 'PASS',
    peopleContract: 'PASS',
    semanticFidelity: 'PASS',
    anatomy: 'PASS',
    textPollution: 'PASS',
    reason: 'Clean 2D editorial interior with zero people, two empty chairs, simple dining table, plain ceramic cup, warm afternoon atmosphere, and no calendar/pseudo-text/writing-like marks. The missing cloth napkin is non-critical contextual detail and does not break the core semantic intent.'
  },
  'scene-08-beat-02': {
    status: 'NEEDS_REGEN',
    attempt2Fail: {
      style: 'PASS',
      peopleContract: 'PASS',
      semanticFidelity: 'FAIL',
      anatomy: 'PASS',
      textPollution: 'PASS',
      reason: 'Attempt 2 still contains a clearly visible smartphone on the tabletop. The authored semantic contract requires a completely phone-free / electronics-free dining surface.'
    }
  }
};

const ATTEMPT3_PROMPT = `CLEAN FLAT 2D CARTOON EDITORIAL ILLUSTRATION ONLY.
NOT photorealistic. NOT 3D.

Top-down close detail of a simple warm wooden dining table prepared for a quiet home meal.

The tabletop contains EXACTLY these visible objects and NOTHING ELSE:

1. ONE plain ceramic bowl filled with white rice.
2. ONE small plain ceramic side bowl.
3. ONE pair of wooden chopsticks resting neatly beside the rice bowl.

No people.
No hands.
No arms.
No body parts.

The rest of the tabletop must be completely empty and uninterrupted warm wood.
No extra objects at any edge.
No partially cropped objects.
No decorative accessories.
No cups.
No books.
No papers.
No utensils other than the single pair of chopsticks.

No words.
No letters.
No numbers.
No labels.
No logos.
No signature.
No watermark.
No pseudo-text.

Warm ivory / cream ambience, muted sage ceramic accent, warm wood tabletop, charcoal/sepia linework.
Simple clean hand-drawn 2D editorial cartoon style.`;

export async function runAttempt3Regen() {
  console.log('=== HAY & ĐẸP. PRODUCTION SMOKE TEST 01 — ATTEMPT 3 REGEN ===');
  console.log(`Target: scene-08-beat-02 ONLY`);
  console.log(`Model: ${MODEL_ID} ONLY\n`);

  // Step 1: Archive Attempt-2 asset before replacement
  console.log('1. Archiving Attempt-2 asset before replacement...');
  const currentAssetPath = path.join(ASSETS_DIR, 'shot-08-vb2.jpg');
  const archivePath = path.join(ARCHIVE_DIR, 'scene-08-beat-02-att2.jpg');
  if (fs.existsSync(currentAssetPath)) {
    fs.copyFileSync(currentAssetPath, archivePath);
    console.log(`   Archived Attempt-2 (${fs.statSync(archivePath).size} bytes) -> ${archivePath}`);
  }

  // Step 2: Generate Attempt 3
  console.log('\n2. Calling Cloudflare FLUX.1 Schnell for scene-08-beat-02 (Attempt 3)...');
  let imageBuf;
  try {
    imageBuf = await callCloudflareSchnell(ATTEMPT3_PROMPT);
  } catch (err) {
    if (err.httpStatus === 429) {
      console.error('\nPRODUCTION SMOKE TEST 01 — PAUSED_QUOTA');
      console.error('Cloudflare HTTP 429 rate limit encountered on Attempt 3. Stopping immediately.');
      process.exit(42);
    }
    console.error('Generation error:', err.message);
    throw err;
  }

  const candidatePath = path.join(CANDIDATES_DIR, 'scene-08-beat-02-att3.jpg');
  fs.writeFileSync(candidatePath, imageBuf);
  console.log(`   Saved candidate -> ${candidatePath} (${imageBuf.length} bytes)`);

  // Machine integrity check only (no auto-PASS)
  const integrity = checkMachineIntegrity(imageBuf);
  if (!integrity.ok) {
    throw new Error(`Machine integrity FAIL on Attempt 3: ${integrity.reason}`);
  }
  console.log(`   ✅ Machine integrity PASS: ${imageBuf.length} bytes, valid JPEG.`);

  // Export to target asset paths
  const targetAssetPath = path.join(ASSETS_DIR, 'shot-08-vb2.jpg');
  const targetPublicPath = path.join(PUBLIC_DIR, 'shot-08-vb2.jpg');
  const reviewPackPath = path.join(REVIEW_PACK_DIR, 'scene-08-beat-02.jpg');

  fs.copyFileSync(candidatePath, targetAssetPath);
  fs.copyFileSync(candidatePath, targetPublicPath);
  fs.copyFileSync(candidatePath, reviewPackPath);
  console.log('   Exported Attempt-3 asset to:');
  console.log(`     - ${targetAssetPath}`);
  console.log(`     - ${targetPublicPath}`);
  console.log(`     - ${reviewPackPath}`);

  // Step 3: Update Visual Review Manifest (visual-review.json)
  console.log('\n3. Updating visual-review.json...');
  const visualReviewPath = path.join(SMOKE_DIR, 'visual-review.json');
  const visualReview = JSON.parse(fs.readFileSync(visualReviewPath, 'utf8').replace(/^\uFEFF/, ''));

  for (const shot of visualReview.shots) {
    if (shot.slotId === 'scene-09-beat-02') {
      shot.qaStatus = 'PASS';
      shot.reviewedSource = 'HUMAN_QA_ATTEMPT_2';
      shot.qa = {
        style: 'PASS',
        peopleContract: 'PASS',
        semanticFidelity: 'PASS',
        anatomy: 'PASS',
        textPollution: 'PASS',
        overall: 'PASS',
        source: 'HUMAN_QA_ATTEMPT_2',
        reason: HUMAN_QA_ATTEMPT2_RECORDS['scene-09-beat-02'].reason
      };
    } else if (shot.slotId === 'scene-08-beat-02') {
      shot.qaStatus = 'PENDING_VISUAL_QA';
      shot.qa = null;
      shot.reviewedSource = null;
      shot.sizeBytes = imageBuf.length;
      shot.attempt = 3;
      shot.attemptHistory = [
        {
          attempt: 1,
          status: 'FAIL',
          failReason: 'The authored semantic contract explicitly requires the dining tabletop to be completely free of electronic devices, but a smartphone is clearly visible at the upper-left of the image.',
          archivedFile: 'scratch/production-smoke/video001/archive/scene-08-beat-02-att1.jpg'
        },
        {
          attempt: 2,
          status: 'FAIL',
          failReason: HUMAN_QA_ATTEMPT2_RECORDS['scene-08-beat-02'].attempt2Fail.reason,
          criteria: HUMAN_QA_ATTEMPT2_RECORDS['scene-08-beat-02'].attempt2Fail,
          archivedFile: 'scratch/production-smoke/video001/archive/scene-08-beat-02-att2.jpg'
        },
        {
          attempt: 3,
          status: 'PENDING_VISUAL_QA',
          machineIntegrity: 'PASS'
        }
      ];
    }
  }

  visualReview.updatedAt = new Date().toISOString();
  visualReview.qaStatus = 'PENDING_VISUAL_QA';
  visualReview.passSlots = visualReview.shots.filter(s => s.qaStatus === 'PASS').length;
  visualReview.pendingSlots = visualReview.shots.filter(s => s.qaStatus === 'PENDING_VISUAL_QA').length;
  fs.writeFileSync(visualReviewPath, JSON.stringify(visualReview, null, 2), 'utf8');
  console.log(`   Updated visual-review.json (PASS: ${visualReview.passSlots}, PENDING: ${visualReview.pendingSlots})`);

  // Step 4: Update review-manifest.json
  const reviewManifestPath = path.join(REVIEW_PACK_DIR, 'review-manifest.json');
  const reviewManifest = {
    test: 'HAY & ĐẸP. Production Smoke Test 01 (video001)',
    reviewTarget: '1 FINAL REGENERATED ATTEMPT-3 ASSET',
    updatedAt: new Date().toISOString(),
    model: MODEL_ID,
    items: [
      {
        slot: 'scene-08-beat-02',
        exportedFile: 'scratch/production-smoke/video001/review-pack/scene-08-beat-02.jpg',
        sourceAssetPath: 'scratch/production-smoke/video001/assets/shot-08-vb2.jpg',
        frameRange: {
          startFrame: 956,
          endFrame: 1058,
          durationFrames: 102,
          timeSeconds: '31.87s - 35.26s'
        },
        voiceNarrativeClause: 'và điện thoại không nằm giữa bàn.',
        semanticIntent: 'Top-down close detail of a simple warm wooden dining table prepared for a quiet home meal. EXACTLY 3 objects: 1 rice bowl, 1 small side bowl, 1 pair of chopsticks. Rest of tabletop completely empty uninterrupted wood. ABSOLUTELY NO PHONES/DEVICES.',
        peopleContract: '0 people',
        currentQaStatus: 'PENDING_VISUAL_QA',
        attempt: 3,
        priorFailures: [
          {
            attempt: 1,
            failReason: 'Smartphone visible at upper-left table edge.'
          },
          {
            attempt: 2,
            failReason: 'Smartphone still clearly visible on tabletop.'
          }
        ]
      }
    ]
  };
  fs.writeFileSync(reviewManifestPath, JSON.stringify(reviewManifest, null, 2), 'utf8');
  console.log('   Updated review-manifest.json');

  // Step 5: Update run-summary.json
  const runSummaryPath = path.join(SMOKE_DIR, 'run-summary.json');
  const runSummary = {
    testName: 'HAY & ĐẸP. Production Smoke Test 01',
    videoKey: 'video001',
    slug: 'phan-1-2026-09-19-co-nhung-bua-com-sau-nay-moi-hieu',
    title: 'Có những bữa cơm sau này mới hiểu là rất quý',
    status: 'PENDING_VISUAL_QA',
    timestamp: new Date().toISOString(),
    model: MODEL_ID,
    totalTimelineFrames: 1442,
    fps: 30,
    slotsSummary: {
      totalSlots: 13,
      reusedPassSlots: 7,
      reviewedPassSlots: 4,
      freshPendingSlots: 1,
      componentOutroSlots: 1,
      needsRegenSlots: 0
    },
    humanQaDecisions: {
      'scene-07': 'PASS (Attempt 1)',
      'scene-08-beat-01': 'PASS (Attempt 1)',
      'scene-09-beat-02': 'PASS (Attempt 2)',
      'scene-10': 'PASS (Attempt 1)',
      'scene-08-beat-02': 'PENDING_VISUAL_QA (Attempt 3)'
    },
    currentAssets: visualReview.shots.map(s => ({
      slotId: s.slotId,
      qaStatus: s.qaStatus,
      reviewedSource: s.reviewedSource
    }))
  };
  fs.writeFileSync(runSummaryPath, JSON.stringify(runSummary, null, 2), 'utf8');

  // Step 6: Render pending-1-contact-sheet.jpg via Playwright
  console.log('\n4. Rendering pending-1-contact-sheet.jpg...');
  await renderPending1ContactSheet(reviewPackPath, imageBuf.length);

  // Step 7: Re-render updated production-contact-sheet-full.jpg
  console.log('\n5. Re-rendering updated production-contact-sheet-full.jpg...');
  await renderUpdatedFullContactSheet();

  console.log('\nAttempt 3 regeneration and review artifacts completed successfully.');
}

async function renderPending1ContactSheet(imagePath, sizeBytes) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1100, height: 1150 });

    const imgBuf = fs.readFileSync(imagePath);
    const imgBase64 = `data:image/jpeg;base64,${imgBuf.toString('base64')}`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 32px 40px;
      background: #F6F1E8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #302D28;
    }
    .header {
      margin-bottom: 24px;
      text-align: center;
    }
    h1 {
      margin: 0 0 6px 0;
      font-size: 26px;
      letter-spacing: -0.01em;
    }
    p {
      margin: 0;
      font-size: 14px;
      color: rgba(48, 45, 40, 0.7);
    }
    .card-container {
      max-width: 820px;
      margin: 0 auto;
    }
    .card {
      background: #FFFFFF;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(48, 45, 40, 0.1);
      border: 1px solid rgba(48, 45, 40, 0.08);
      display: flex;
      flex-direction: column;
    }
    .img-container {
      width: 100%;
      height: 620px;
      background: #EDE6DA;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .img-container img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      display: block;
    }
    .info {
      padding: 22px 26px;
      background: #FFFCF7;
      border-top: 1px solid rgba(48, 45, 40, 0.08);
    }
    .info-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .slot-id {
      font-size: 20px;
      font-weight: 700;
      color: #302D28;
    }
    .badge {
      font-size: 12px;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: 6px;
      letter-spacing: 0.02em;
      background: #FEF3C7;
      color: #92400E;
      border: 1px solid #FCD34D;
    }
    .meta-row {
      font-size: 14px;
      margin-bottom: 6px;
      line-height: 1.45;
    }
    .meta-label {
      font-weight: 700;
      color: rgba(48, 45, 40, 0.85);
    }
    .voice-quote {
      font-style: italic;
      color: #1A365D;
      background: #EBF8FF;
      padding: 8px 12px;
      border-radius: 6px;
      margin: 10px 0;
      border-left: 4px solid #3182CE;
      font-size: 14px;
    }
    .history-box {
      background: #FEF2F2;
      border-left: 4px solid #EF4444;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      color: #991B1B;
      margin-top: 10px;
      line-height: 1.45;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>HAY & ĐẸP. Production Smoke Test 01 — Final Review Pack</h1>
    <p>Targeted Regeneration: scene-08-beat-02 (Attempt 3) | Model: @cf/black-forest-labs/flux-1-schnell</p>
  </div>
  <div class="card-container">
    <div class="card">
      <div class="img-container">
        <img src="${imgBase64}" />
      </div>
      <div class="info">
        <div class="info-top">
          <span class="slot-id">scene-08-beat-02 (Attempt 3)</span>
          <span class="badge">PENDING VISUAL QA</span>
        </div>
        <div class="voice-quote">"và điện thoại không nằm giữa bàn."</div>
        <div class="meta-row"><span class="meta-label">Timing:</span> Frames 956–1058 (102f | 31.87s–35.26s)</div>
        <div class="meta-row"><span class="meta-label">People Contract:</span> <strong>0 people</strong> (strictly zero hands, arms, body parts)</div>
        <div class="meta-row"><span class="meta-label">Semantic Intent:</span> Top-down close detail of a simple warm wooden dining table prepared for a quiet home meal. EXACTLY 3 objects: 1 rice bowl, 1 small side bowl, 1 pair of chopsticks. Rest of tabletop completely empty uninterrupted wood.</div>
        <div class="meta-row"><span class="meta-label">File Size:</span> ${sizeBytes} bytes (Machine integrity: PASS)</div>
        <div class="history-box">
          <strong>Prior Failures:</strong><br>
          • <strong>Attempt 1:</strong> Smartphone visible at upper-left table edge.<br>
          • <strong>Attempt 2:</strong> Smartphone still clearly visible on tabletop.<br>
          • <strong>Attempt 3 Strategy:</strong> Strictly positive constraint specifying EXACTLY 3 visible tableware items on plain empty wood surface without negative device priming.
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

    await page.setContent(html, { waitUntil: 'load' });
    const outputPath = path.join(REVIEW_PACK_DIR, 'pending-1-contact-sheet.jpg');
    await page.screenshot({ path: outputPath, type: 'jpeg', quality: 92, fullPage: true });
    console.log(`   ✅ Saved pending-1-contact-sheet.jpg (${fs.statSync(outputPath).size} bytes)`);
  } finally {
    await browser.close();
  }
}

async function renderUpdatedFullContactSheet() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1540, height: 1600 });

    const contactSheetCards = [
      { name: 'Shot 01 (Scene 1 & 9-VB1)', file: path.join(ASSETS_DIR, 'shot-01.jpg'), badgeText: 'PASS (V3.4A)', badgeClass: 'badge-pass', people: 'Family dinner', intent: 'Establishing family dinner at wooden table' },
      { name: 'Shot 02 (Scene 2)', file: path.join(ASSETS_DIR, 'shot-02.jpg'), badgeText: 'PASS (V3.4A)', badgeClass: 'badge-pass', people: '1 adult', intent: 'Serving rice quietly at dining table' },
      { name: 'Shot 03 (Scene 3)', file: path.join(ASSETS_DIR, 'shot-03.jpg'), badgeText: 'PASS (V3.4A)', badgeClass: 'badge-pass', people: 'Parent & child', intent: 'Parent and child talking at table' },
      { name: 'Shot 04 (Scene 4)', file: path.join(ASSETS_DIR, 'shot-04.jpg'), badgeText: 'PASS (V3.4A)', badgeClass: 'badge-pass', people: '1 person', intent: 'Placing phone aside deliberately' },
      { name: 'Shot 05 (Scene 5)', file: path.join(ASSETS_DIR, 'shot-05.jpg'), badgeText: 'PASS (V3.4A)', badgeClass: 'badge-pass', people: 'Family arriving', intent: 'Returning home after school and work' },
      { name: 'Shot 06 (Scene 6)', file: path.join(ASSETS_DIR, 'shot-06.jpg'), badgeText: 'PASS (V3.4A)', badgeClass: 'badge-pass', people: '1 adult', intent: 'Quiet reflective domestic pause' },
      { name: 'Shot 07 (Scene 7)', file: path.join(ASSETS_DIR, 'shot-07.jpg'), badgeText: 'PASS (HUMAN QA)', badgeClass: 'badge-pass', people: '1 adult', intent: 'Quiet domestic reflection holding bowl' },
      { name: 'Shot 08-VB1 (Scene 8 VB1)', file: path.join(ASSETS_DIR, 'shot-08-vb1.jpg'), badgeText: 'PASS (HUMAN QA)', badgeClass: 'badge-pass', people: '1 adult', intent: 'Adult seated calmly at dining table' },
      { name: 'Shot 08-VB2 (Scene 8 VB2)', file: path.join(ASSETS_DIR, 'shot-08-vb2.jpg'), badgeText: 'PENDING QA (Att 3)', badgeClass: 'badge-pending', people: '0 people (still life)', intent: 'Dining table surface without phones' },
      { name: 'Shot 09-VB2 (Scene 9 VB2)', file: path.join(ASSETS_DIR, 'shot-09-vb2.jpg'), badgeText: 'PASS (HUMAN QA)', badgeClass: 'badge-pass', people: '0 people (still life)', intent: 'Empty chairs by table in afternoon light' },
      { name: 'Shot 10 (Scene 10)', file: path.join(ASSETS_DIR, 'shot-10.jpg'), badgeText: 'PASS (HUMAN QA)', badgeClass: 'badge-pass', people: '1 adult', intent: 'Holding cup in thoughtful question pose' }
    ];

    const cardsHtml = contactSheetCards.map(item => {
      const data = fs.readFileSync(item.file);
      const src = `data:image/jpeg;base64,${data.toString('base64')}`;

      return `
        <div class="card">
          <div class="img-wrapper">
            <img src="${src}" />
          </div>
          <div class="caption">
            <div class="caption-header">
              <span class="shot-title">${escapeHtml(item.name)}</span>
              <span class="badge ${item.badgeClass}">${item.badgeText}</span>
            </div>
            <div class="caption-people" title="${escapeHtml(item.people)}">${escapeHtml(item.people)}</div>
            <div class="caption-intent" title="${escapeHtml(item.intent)}">${escapeHtml(item.intent)}</div>
          </div>
        </div>
      `;
    }).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 32px;
      background: #F6F1E8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #302D28;
    }
    .header {
      margin-bottom: 24px;
      text-align: center;
    }
    h1 {
      margin: 0 0 8px 0;
      font-size: 26px;
      letter-spacing: -0.01em;
    }
    p {
      margin: 0;
      font-size: 14px;
      color: rgba(48, 45, 40, 0.65);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      max-width: 1440px;
      margin: 0 auto;
    }
    .card {
      background: #FFFFFF;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(48, 45, 40, 0.08);
      border: 1px solid rgba(48, 45, 40, 0.06);
      display: flex;
      flex-direction: column;
    }
    .img-wrapper {
      width: 100%;
      aspect-ratio: 1 / 1;
      background: #E8E2D5;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .img-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .caption {
      padding: 10px 12px;
      background: #FFFCF7;
      border-top: 1px solid rgba(48, 45, 40, 0.06);
    }
    .caption-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .shot-title {
      font-size: 12px;
      font-weight: 700;
      color: #302D28;
    }
    .badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.02em;
    }
    .badge-pass {
      background: #DCFCE7;
      color: #166534;
    }
    .badge-pending {
      background: #FEF3C7;
      color: #92400E;
    }
    .caption-people {
      font-size: 11px;
      font-weight: 600;
      color: rgba(48, 45, 40, 0.85);
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .caption-intent {
      font-size: 11px;
      color: rgba(48, 45, 40, 0.65);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>HAY & ĐẸP. Production Smoke Test 01 — VIDEO001 (Updated Baseline)</h1>
    <p>Full End-to-End: 11 Visual Assets (10 PASS / 1 PENDING ATTEMPT 3)</p>
  </div>
  <div class="grid">
    ${cardsHtml}
  </div>
</body>
</html>`;

    await page.setContent(html, { waitUntil: 'load' });
    const fullOutputPath = path.join(SMOKE_DIR, 'production-contact-sheet-full.jpg');
    await page.screenshot({ path: fullOutputPath, type: 'jpeg', quality: 92, fullPage: true });
    console.log(`   ✅ Saved updated production-contact-sheet-full.jpg (${fs.statSync(fullOutputPath).size} bytes)`);
  } finally {
    await browser.close();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runAttempt3Regen().catch(err => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  });
}
