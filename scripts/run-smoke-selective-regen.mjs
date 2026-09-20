/**
 * scripts/run-smoke-selective-regen.mjs
 *
 * HAY & ĐẸP. — PRODUCTION SMOKE TEST 01
 * Human QA Recording + Selective Regen for 2 Failed Production Assets
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

const HUMAN_QA_RECORDS = {
  'scene-07': {
    status: 'PASS',
    style: 'PASS',
    peopleContract: 'PASS',
    semanticFidelity: 'PASS',
    anatomy: 'PASS',
    textPollution: 'PASS',
    reason: 'Clean 2D editorial illustration, exactly one visible adult, adult is in a quiet domestic pause holding a plain ceramic bowl, anatomy is acceptable, and no material text/logo/signature pollution is visible.'
  },
  'scene-08-beat-01': {
    status: 'PASS',
    style: 'PASS',
    peopleContract: 'PASS',
    semanticFidelity: 'PASS',
    anatomy: 'PASS',
    textPollution: 'PASS',
    reason: 'Clean 2D editorial illustration, exactly one visible adult seated at a warm wooden dining table with rice bowl and chopsticks in calm anticipation, anatomy is acceptable, and no material text pollution is visible.'
  },
  'scene-08-beat-02': {
    status: 'NEEDS_REGEN',
    attempt1Fail: {
      style: 'PASS',
      peopleContract: 'PASS',
      semanticFidelity: 'FAIL',
      anatomy: 'PASS',
      textPollution: 'PASS',
      reason: 'The authored semantic contract explicitly requires the dining tabletop to be completely free of electronic devices, but a smartphone is clearly visible at the upper-left of the image.'
    }
  },
  'scene-09-beat-02': {
    status: 'NEEDS_REGEN',
    attempt1Fail: {
      style: 'PASS',
      peopleContract: 'PASS',
      semanticFidelity: 'PASS',
      anatomy: 'PASS',
      textPollution: 'FAIL',
      reason: 'The wall sheet/calendar on the left contains visible writing-like pseudo-text. This violates the strict clean-surface TEXT_POLLUTION contract.'
    }
  },
  'scene-10': {
    status: 'PASS',
    style: 'PASS',
    peopleContract: 'PASS',
    semanticFidelity: 'PASS',
    anatomy: 'PASS',
    textPollution: 'PASS',
    reason: 'Clean 2D editorial illustration, exactly one adult seated at a wooden table holding a warm ceramic cup with both hands in a gentle reflective pose; anatomy is acceptable and no material text/logo/signature pollution is visible.'
  }
};

const REGEN_TARGETS = [
  {
    slotId: 'scene-08-beat-02',
    file: 'shot-08-vb2.jpg',
    shotIndex: 9,
    title: 'Scene 08 Beat 2: Phone kept away from table',
    voice: 'và điện thoại không nằm giữa bàn.',
    peopleContract: '0 people',
    semanticIntent: 'The visual must communicate a phone-free table by ABSENCE of electronics. Top-down close detail of a simple warm wooden dining table prepared for a home meal.',
    frameRange: {
      startFrame: 956,
      endFrame: 1058,
      durationFrames: 102,
      timeSeconds: '31.87s - 35.26s'
    },
    attempt: 2,
    prompt: `CLEAN FLAT 2D CARTOON EDITORIAL ILLUSTRATION ONLY.
NOT photorealistic. NOT 3D.

Top-down close detail of a simple warm wooden dining table prepared for a home meal.

Show exactly:
- one plain ceramic rice bowl;
- one small plain ceramic side dish;
- one pair of wooden chopsticks resting neatly on a simple chopstick rest.

ZERO PEOPLE.
No hands.
No arms.
No body parts.

ABSOLUTELY NO ELECTRONIC DEVICES:
NO smartphone.
NO mobile phone.
NO tablet.
NO screen.
NO laptop.
NO watch.
NO charger.
NO cable.
NO remote control.

Do not show a phone even at the edge or partially cropped.

No words.
No letters.
No numbers.
No labels.
No logos.
No signature.
No watermark.
No pseudo-text.

Warm ivory / cream ambience, muted sage accent, warm wood, charcoal/sepia linework.
Simple clean 2D editorial cartoon style.`
  },
  {
    slotId: 'scene-09-beat-02',
    file: 'shot-09-vb2.jpg',
    shotIndex: 11,
    title: 'Scene 09 Beat 2: Quiet room after changing schedules',
    voice: 'Đến khi lịch mỗi người khác đi, ta mới biết chúng từng đẹp đến mức nào.',
    peopleContract: '0 people',
    semanticIntent: 'A quiet poignant after-meal dining room in soft afternoon light. Two empty wooden chairs, one simple wooden dining table, one plain ceramic cup, folded cloth napkin.',
    frameRange: {
      startFrame: 1136,
      endFrame: 1261,
      durationFrames: 125,
      timeSeconds: '37.87s - 42.02s'
    },
    attempt: 2,
    prompt: `CLEAN FLAT 2D CARTOON EDITORIAL ILLUSTRATION ONLY.
NOT photorealistic. NOT 3D.

A quiet poignant after-meal dining room in soft afternoon light.

Show:
- two empty wooden chairs;
- one simple wooden dining table;
- one plain ceramic cup;
- one folded cloth napkin;
- subtle warm lived-in atmosphere.

ZERO PEOPLE.
No human body parts.

BACKGROUND MUST BE SIMPLE:
plain warm ivory wall;
one small framed botanical illustration is allowed.

DO NOT SHOW:
calendar,
menu,
poster,
paper sheet,
wall note,
label,
receipt,
document,
whiteboard,
chart,
newspaper,
book with visible writing.

No words.
No letters.
No numbers.
No pseudo-text.
No writing-like marks.
No logo.
No signature.
No watermark.

Warm ivory / cream palette, muted sage accents, warm wood, charcoal/sepia linework.`
  }
];

export async function runSelectiveRegen() {
  console.log('=== HAY & ĐẸP. PRODUCTION SMOKE TEST 01 — SELECTIVE REGEN ===');
  console.log(`Model: ${MODEL_ID} ONLY\n`);

  // Step 1: Archive Attempt-1 failed assets before replacement
  console.log('1. Archiving Attempt-1 assets before replacement...');
  for (const target of REGEN_TARGETS) {
    const currentAsset = path.join(ASSETS_DIR, target.file);
    const archivePath = path.join(ARCHIVE_DIR, `${target.slotId}-att1.jpg`);
    if (fs.existsSync(currentAsset)) {
      fs.copyFileSync(currentAsset, archivePath);
      console.log(`   Archived ${target.slotId} Attempt-1 (${fs.statSync(archivePath).size} bytes) -> ${archivePath}`);
    } else {
      console.warn(`   Notice: ${currentAsset} did not exist to archive.`);
    }
  }

  // Step 2: Regenerate the 2 targets using FLUX.1 Schnell
  console.log('\n2. Executing selective generation (Attempt 2)...');
  const generatedResults = {};

  for (const target of REGEN_TARGETS) {
    console.log(`\n[GENERATING] ${target.slotId} (Attempt 2)...`);
    let imageBuf;
    try {
      imageBuf = await callCloudflareSchnell(target.prompt);
    } catch (err) {
      if (err.httpStatus === 429) {
        console.error(`\nPRODUCTION SMOKE TEST 01 — PAUSED_QUOTA`);
        console.error(`Cloudflare HTTP 429 rate limit reached on ${target.slotId}. Exiting immediately.`);
        process.exit(42);
      }
      console.error(`Error generating ${target.slotId}:`, err.message);
      throw err;
    }

    const candidatePath = path.join(CANDIDATES_DIR, `${target.slotId}-att2.jpg`);
    fs.writeFileSync(candidatePath, imageBuf);
    console.log(`   Saved candidate -> ${candidatePath} (${imageBuf.length} bytes)`);

    // Machine integrity check only (no auto-PASS)
    const integrity = checkMachineIntegrity(imageBuf);
    if (!integrity.ok) {
      throw new Error(`Machine integrity FAIL on ${target.slotId} Attempt 2: ${integrity.reason}`);
    }
    console.log(`   ✅ Machine integrity PASS: ${imageBuf.length} bytes, valid JPEG dimensions.`);

    // Replace production asset paths
    const targetAssetPath = path.join(ASSETS_DIR, target.file);
    const targetPublicPath = path.join(PUBLIC_DIR, target.file);
    const reviewPackPath = path.join(REVIEW_PACK_DIR, `${target.slotId}.jpg`);

    fs.copyFileSync(candidatePath, targetAssetPath);
    fs.copyFileSync(candidatePath, targetPublicPath);
    fs.copyFileSync(candidatePath, reviewPackPath);
    console.log(`   Exported to:`);
    console.log(`     - ${targetAssetPath}`);
    console.log(`     - ${targetPublicPath}`);
    console.log(`     - ${reviewPackPath}`);

    generatedResults[target.slotId] = {
      file: target.file,
      sizeBytes: imageBuf.length,
      candidatePath,
      targetAssetPath,
      reviewPackPath,
      attempt: 2,
      qaStatus: 'PENDING_VISUAL_QA'
    };
  }

  // Step 3: Update Visual Review Manifest (visual-review.json)
  console.log('\n3. Updating visual-review.json and metadata...');
  const visualReviewPath = path.join(SMOKE_DIR, 'visual-review.json');
  const visualReview = JSON.parse(fs.readFileSync(visualReviewPath, 'utf8').replace(/^\uFEFF/, ''));

  for (const shot of visualReview.shots) {
    if (shot.slotId === 'scene-07') {
      shot.qaStatus = 'PASS';
      shot.reviewedSource = 'HUMAN_QA_ATTEMPT_1';
      shot.qa = {
        style: 'PASS',
        peopleContract: 'PASS',
        semanticFidelity: 'PASS',
        anatomy: 'PASS',
        textPollution: 'PASS',
        overall: 'PASS',
        source: 'HUMAN_QA_ATTEMPT_1',
        reason: HUMAN_QA_RECORDS['scene-07'].reason
      };
    } else if (shot.slotId === 'scene-08-beat-01') {
      shot.qaStatus = 'PASS';
      shot.reviewedSource = 'HUMAN_QA_ATTEMPT_1';
      shot.qa = {
        style: 'PASS',
        peopleContract: 'PASS',
        semanticFidelity: 'PASS',
        anatomy: 'PASS',
        textPollution: 'PASS',
        overall: 'PASS',
        source: 'HUMAN_QA_ATTEMPT_1',
        reason: HUMAN_QA_RECORDS['scene-08-beat-01'].reason
      };
    } else if (shot.slotId === 'scene-10') {
      shot.qaStatus = 'PASS';
      shot.reviewedSource = 'HUMAN_QA_ATTEMPT_1';
      shot.qa = {
        style: 'PASS',
        peopleContract: 'PASS',
        semanticFidelity: 'PASS',
        anatomy: 'PASS',
        textPollution: 'PASS',
        overall: 'PASS',
        source: 'HUMAN_QA_ATTEMPT_1',
        reason: HUMAN_QA_RECORDS['scene-10'].reason
      };
    } else if (shot.slotId === 'scene-08-beat-02') {
      shot.qaStatus = 'PENDING_VISUAL_QA';
      shot.qa = null;
      shot.reviewedSource = null;
      shot.sizeBytes = generatedResults['scene-08-beat-02'].sizeBytes;
      shot.attemptHistory = [
        {
          attempt: 1,
          status: 'FAIL',
          failReason: HUMAN_QA_RECORDS['scene-08-beat-02'].attempt1Fail.reason,
          criteria: HUMAN_QA_RECORDS['scene-08-beat-02'].attempt1Fail,
          archivedFile: 'scratch/production-smoke/video001/archive/scene-08-beat-02-att1.jpg'
        },
        {
          attempt: 2,
          status: 'PENDING_VISUAL_QA',
          machineIntegrity: 'PASS'
        }
      ];
    } else if (shot.slotId === 'scene-09-beat-02') {
      shot.qaStatus = 'PENDING_VISUAL_QA';
      shot.qa = null;
      shot.reviewedSource = null;
      shot.sizeBytes = generatedResults['scene-09-beat-02'].sizeBytes;
      shot.attemptHistory = [
        {
          attempt: 1,
          status: 'FAIL',
          failReason: HUMAN_QA_RECORDS['scene-09-beat-02'].attempt1Fail.reason,
          criteria: HUMAN_QA_RECORDS['scene-09-beat-02'].attempt1Fail,
          archivedFile: 'scratch/production-smoke/video001/archive/scene-09-beat-02-att1.jpg'
        },
        {
          attempt: 2,
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

  // Step 4: Update review-pack/review-manifest.json
  const reviewManifestPath = path.join(REVIEW_PACK_DIR, 'review-manifest.json');
  const reviewManifest = {
    test: 'HAY & ĐẸP. Production Smoke Test 01 (video001)',
    reviewTarget: '2 REGENERATED ATTEMPT-2 ASSETS',
    updatedAt: new Date().toISOString(),
    model: MODEL_ID,
    items: REGEN_TARGETS.map(t => ({
      slot: t.slotId,
      exportedFile: `scratch/production-smoke/video001/review-pack/${t.slotId}.jpg`,
      sourceAssetPath: `scratch/production-smoke/video001/assets/${t.file}`,
      frameRange: t.frameRange,
      voiceNarrativeClause: t.voice,
      semanticIntent: t.semanticIntent,
      peopleContract: t.peopleContract,
      currentQaStatus: 'PENDING_VISUAL_QA',
      attempt: 2,
      attempt1Failure: HUMAN_QA_RECORDS[t.slotId].attempt1Fail
    }))
  };
  fs.writeFileSync(reviewManifestPath, JSON.stringify(reviewManifest, null, 2), 'utf8');
  console.log(`   Updated review-manifest.json`);

  // Step 5: Update run-summary.json and run-summary.md
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
      reviewedPassSlots: 3,
      freshPendingSlots: 2,
      componentOutroSlots: 1,
      needsRegenSlots: 0
    },
    humanQaDecisionsAttempt1: HUMAN_QA_RECORDS,
    currentAssets: visualReview.shots.map(s => ({
      slotId: s.slotId,
      qaStatus: s.qaStatus,
      reviewedSource: s.reviewedSource
    }))
  };
  fs.writeFileSync(runSummaryPath, JSON.stringify(runSummary, null, 2), 'utf8');

  // Step 6: Render pending-2-contact-sheet.jpg via Playwright
  console.log('\n4. Rendering pending-2-contact-sheet.jpg (high-res inspection view)...');
  await renderPending2ContactSheet(generatedResults);

  // Step 7: Re-render production-contact-sheet-full.jpg to keep it up to date
  console.log('\n5. Re-rendering full unclipped production contact sheet...');
  await renderUpdatedFullContactSheet(visualReview);

  console.log('\nSelective regeneration and review artifacts completed successfully.');
}

async function renderPending2ContactSheet(generatedResults) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1700, height: 1150 });

    const card1Buf = fs.readFileSync(generatedResults['scene-08-beat-02'].reviewPackPath);
    const card2Buf = fs.readFileSync(generatedResults['scene-09-beat-02'].reviewPackPath);
    const card1Base64 = `data:image/jpeg;base64,${card1Buf.toString('base64')}`;
    const card2Base64 = `data:image/jpeg;base64,${card2Buf.toString('base64')}`;

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
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      max-width: 1600px;
      margin: 0 auto;
    }
    .card {
      background: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 6px 24px rgba(48, 45, 40, 0.08);
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
      padding: 18px 22px;
      background: #FFFCF7;
      border-top: 1px solid rgba(48, 45, 40, 0.08);
      flex: 1;
    }
    .info-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .slot-id {
      font-size: 18px;
      font-weight: 700;
      color: #302D28;
    }
    .badge {
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      letter-spacing: 0.02em;
      background: #FEF3C7;
      color: #92400E;
      border: 1px solid #FCD34D;
    }
    .meta-row {
      font-size: 13px;
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
      padding: 6px 10px;
      border-radius: 6px;
      margin: 8px 0;
      border-left: 3px solid #3182CE;
      font-size: 13px;
    }
    .fail-note {
      background: #FEF2F2;
      border-left: 3px solid #EF4444;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 12px;
      color: #991B1B;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>HAY & ĐẸP. Production Smoke Test 01 — Attempt 2 Review Pack</h1>
    <p>Targeted Regeneration: 2 Failed Assets | Model: @cf/black-forest-labs/flux-1-schnell</p>
  </div>
  <div class="grid">
    <!-- Card 1: scene-08-beat-02 -->
    <div class="card">
      <div class="img-container">
        <img src="${card1Base64}" />
      </div>
      <div class="info">
        <div class="info-top">
          <span class="slot-id">scene-08-beat-02 (Attempt 2)</span>
          <span class="badge">PENDING VISUAL QA</span>
        </div>
        <div class="voice-quote">"và điện thoại không nằm giữa bàn."</div>
        <div class="meta-row"><span class="meta-label">Timing:</span> Frames 956–1058 (102f | 31.87s–35.26s)</div>
        <div class="meta-row"><span class="meta-label">People Contract:</span> <strong>0 people</strong> (strictly no hands/arms/body)</div>
        <div class="meta-row"><span class="meta-label">Semantic Intent:</span> Clean wooden dining table top prepared for home meal. Single rice bowl, small side dish, chopsticks on rest. <strong>ABSOLUTELY NO PHONES OR SCREENS</strong> anywhere.</div>
        <div class="fail-note"><strong>Attempt 1 Fail:</strong> Smartphone was visible at upper-left table edge. Tightened prompt enforces complete absence of electronics.</div>
      </div>
    </div>

    <!-- Card 2: scene-09-beat-02 -->
    <div class="card">
      <div class="img-container">
        <img src="${card2Base64}" />
      </div>
      <div class="info">
        <div class="info-top">
          <span class="slot-id">scene-09-beat-02 (Attempt 2)</span>
          <span class="badge">PENDING VISUAL QA</span>
        </div>
        <div class="voice-quote">"Đến khi lịch mỗi người khác đi, ta mới biết chúng từng đẹp đến mức nào."</div>
        <div class="meta-row"><span class="meta-label">Timing:</span> Frames 1136–1261 (125f | 37.87s–42.02s)</div>
        <div class="meta-row"><span class="meta-label">People Contract:</span> <strong>0 people</strong> (interior stillness / human traces after meal)</div>
        <div class="meta-row"><span class="meta-label">Semantic Intent:</span> Two empty wooden chairs by dining table, plain ceramic cup, cloth napkin in soft afternoon light. <strong>NO WALL CALENDAR / NO WRITING</strong>.</div>
        <div class="fail-note"><strong>Attempt 1 Fail:</strong> Wall sheet/calendar had writing-like pseudo-text. Tightened prompt strictly bans calendars, sheets, and documents.</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    await page.setContent(html, { waitUntil: 'load' });
    const outputPath = path.join(REVIEW_PACK_DIR, 'pending-2-contact-sheet.jpg');
    await page.screenshot({ path: outputPath, type: 'jpeg', quality: 92, fullPage: true });
    console.log(`   ✅ Saved pending-2-contact-sheet.jpg (${fs.statSync(outputPath).size} bytes)`);
  } finally {
    await browser.close();
  }
}

async function renderUpdatedFullContactSheet(visualReview) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1540, height: 1600 });

    const contactSheetCards = [
      { name: 'Shot 01 (Scene 1 & 9-VB1)', file: path.join(ASSETS_DIR, 'shot-01.jpg'), status: 'PASS', badgeText: 'PASS (V3.4A)', badgeClass: 'badge-pass', people: 'Family dinner', intent: 'Establishing family dinner at wooden table' },
      { name: 'Shot 02 (Scene 2)', file: path.join(ASSETS_DIR, 'shot-02.jpg'), status: 'PASS', badgeText: 'PASS (V3.4A)', badgeClass: 'badge-pass', people: '1 adult', intent: 'Serving rice quietly at dining table' },
      { name: 'Shot 03 (Scene 3)', file: path.join(ASSETS_DIR, 'shot-03.jpg'), status: 'PASS', badgeText: 'PASS (V3.4A)', badgeClass: 'badge-pass', people: 'Parent & child', intent: 'Parent and child talking at table' },
      { name: 'Shot 04 (Scene 4)', file: path.join(ASSETS_DIR, 'shot-04.jpg'), status: 'PASS', badgeText: 'PASS (V3.4A)', badgeClass: 'badge-pass', people: '1 person', intent: 'Placing phone aside deliberately' },
      { name: 'Shot 05 (Scene 5)', file: path.join(ASSETS_DIR, 'shot-05.jpg'), status: 'PASS', badgeText: 'PASS (V3.4A)', badgeClass: 'badge-pass', people: 'Family arriving', intent: 'Returning home after school and work' },
      { name: 'Shot 06 (Scene 6)', file: path.join(ASSETS_DIR, 'shot-06.jpg'), status: 'PASS', badgeText: 'PASS (V3.4A)', badgeClass: 'badge-pass', people: '1 adult', intent: 'Quiet reflective domestic pause' },
      { name: 'Shot 07 (Scene 7)', file: path.join(ASSETS_DIR, 'shot-07.jpg'), status: 'PASS', badgeText: 'PASS (HUMAN QA)', badgeClass: 'badge-pass', people: '1 adult', intent: 'Quiet domestic reflection holding bowl' },
      { name: 'Shot 08-VB1 (Scene 8 VB1)', file: path.join(ASSETS_DIR, 'shot-08-vb1.jpg'), status: 'PASS', badgeText: 'PASS (HUMAN QA)', badgeClass: 'badge-pass', people: '1 adult', intent: 'Adult seated calmly at dining table' },
      { name: 'Shot 08-VB2 (Scene 8 VB2)', file: path.join(ASSETS_DIR, 'shot-08-vb2.jpg'), status: 'PENDING_VISUAL_QA', badgeText: 'PENDING QA (Att 2)', badgeClass: 'badge-pending', people: '0 people (still life)', intent: 'Dining table surface without phones' },
      { name: 'Shot 09-VB2 (Scene 9 VB2)', file: path.join(ASSETS_DIR, 'shot-09-vb2.jpg'), status: 'PENDING_VISUAL_QA', badgeText: 'PENDING QA (Att 2)', badgeClass: 'badge-pending', people: '0 people (still life)', intent: 'Empty chairs by table in afternoon light' },
      { name: 'Shot 10 (Scene 10)', file: path.join(ASSETS_DIR, 'shot-10.jpg'), status: 'PASS', badgeText: 'PASS (HUMAN QA)', badgeClass: 'badge-pass', people: '1 adult', intent: 'Holding cup in thoughtful question pose' }
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
    <p>Full End-to-End: 11 Visual Assets (9 PASS / 2 PENDING ATTEMPT 2)</p>
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
  runSelectiveRegen().catch(err => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  });
}
