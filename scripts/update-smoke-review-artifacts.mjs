import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const ROOT_DIR = process.cwd();
const SMOKE_DIR = path.join(ROOT_DIR, 'scratch', 'production-smoke', 'video001');
const ASSETS_DIR = path.join(SMOKE_DIR, 'assets');
const REVIEW_PACK_DIR = path.join(SMOKE_DIR, 'review-pack');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function main() {
  console.log('=== Step 1: Update review-manifest.json ===');
  const manifestPath = path.join(REVIEW_PACK_DIR, 'review-manifest.json');
  const manifest = {
    test: "HAY & ĐẸP. Production Smoke Test 01 (video001)",
    reviewTarget: "1 FINAL REGENERATED & CLEANED ATTEMPT-3 ASSET",
    updatedAt: new Date().toISOString(),
    model: "@cf/black-forest-labs/flux-1-schnell",
    items: [
      {
        slot: "scene-08-beat-02",
        exportedFile: "scratch/production-smoke/video001/review-pack/scene-08-beat-02.jpg",
        sourceAssetPath: "scratch/production-smoke/video001/assets/shot-08-vb2.jpg",
        frameRange: {
          startFrame: 956,
          endFrame: 1058,
          durationFrames: 102,
          timeSeconds: "31.87s - 35.26s"
        },
        voiceNarrativeClause: "và điện thoại không nằm giữa bàn.",
        semanticIntent: "Top-down close detail of a simple warm wooden dining table prepared for a quiet home meal. EXACTLY 3 objects: 1 rice bowl, 1 small side bowl, 1 pair of chopsticks. Rest of tabletop completely empty uninterrupted wood. ABSOLUTELY NO PHONES/DEVICES.",
        peopleContract: "0 people",
        currentQaStatus: "PENDING_VISUAL_QA",
        qaStatus: "PENDING_VISUAL_QA",
        qa: null,
        cleanupMethod: "deterministic-raster",
        cleanupNote: "Deterministic raster restoration applied: removed extraneous upper small bowl via row-wise wood grain interpolation in Plank 1; removed lower-right cropped paper stack via tiled continuous wood grain and feathered masking. Tabletop now features exactly 3 tableware objects (1 main rice bowl, 1 side bowl, 1 pair of chopsticks) on plain uninterrupted wood with zero devices.",
        attempt: 3,
        priorFailures: [
          {
            attempt: 1,
            failReason: "Smartphone visible at upper-left table edge."
          },
          {
            attempt: 2,
            failReason: "Smartphone still clearly visible on tabletop."
          },
          {
            attempt: 3,
            failReason: "Semantic failure: 2 small side bowls instead of exactly 1; cropped white paper stack at lower-right edge."
          }
        ]
      }
    ]
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Saved ${manifestPath}`);

  console.log('\n=== Step 2: Update visual-review.json ===');
  const visualReviewPath = path.join(SMOKE_DIR, 'visual-review.json');
  const visualReview = JSON.parse(fs.readFileSync(visualReviewPath, 'utf8'));
  visualReview.updatedAt = new Date().toISOString();
  
  const shot8 = visualReview.shots.find(s => s.slotId === 'scene-08-beat-02');
  if (shot8) {
    shot8.sizeBytes = fs.statSync(path.join(ASSETS_DIR, 'shot-08-vb2.jpg')).size;
    shot8.qaStatus = "PENDING_VISUAL_QA";
    shot8.qa = null;
    shot8.cleanupMethod = "deterministic-raster";
    shot8.cleanupNote = "Deterministic raster restoration: removed extra upper bowl and cropped paper stack to achieve exactly 3 tabletop objects on plain uninterrupted wood.";
    shot8.attemptHistory = [
      {
        attempt: 1,
        status: "FAIL",
        failReason: "The authored semantic contract explicitly requires the dining tabletop to be completely free of electronic devices, but a smartphone is clearly visible at the upper-left of the image.",
        archivedFile: "scratch/production-smoke/video001/archive/scene-08-beat-02-att1.jpg"
      },
      {
        attempt: 2,
        status: "FAIL",
        failReason: "Attempt 2 still contains a clearly visible smartphone on the tabletop. The authored semantic contract requires a completely phone-free / electronics-free dining surface.",
        archivedFile: "scratch/production-smoke/video001/archive/scene-08-beat-02-att2.jpg"
      },
      {
        attempt: 3,
        status: "PENDING_VISUAL_QA",
        machineIntegrity: "PASS",
        cleanupMethod: "deterministic-raster",
        archivedBeforeCleanup: "scratch/production-smoke/video001/archive/scene-08-beat-02-att3-before-cleanup.jpg"
      }
    ];
  }
  fs.writeFileSync(visualReviewPath, JSON.stringify(visualReview, null, 2), 'utf8');
  console.log(`Saved ${visualReviewPath}`);

  console.log('\n=== Step 3: Update run-summary.json ===');
  const runSummaryJsonPath = path.join(SMOKE_DIR, 'run-summary.json');
  const runSummaryJson = JSON.parse(fs.readFileSync(runSummaryJsonPath, 'utf8'));
  runSummaryJson.timestamp = new Date().toISOString();
  runSummaryJson.humanQaDecisions['scene-08-beat-02'] = "PENDING_VISUAL_QA (Attempt 3 — Deterministic Raster Cleanup)";
  const assetItem = runSummaryJson.currentAssets.find(a => a.slotId === 'scene-08-beat-02');
  if (assetItem) {
    assetItem.qaStatus = "PENDING_VISUAL_QA";
    assetItem.reviewedSource = null;
    assetItem.cleanupMethod = "deterministic-raster";
  }
  fs.writeFileSync(runSummaryJsonPath, JSON.stringify(runSummaryJson, null, 2), 'utf8');
  console.log(`Saved ${runSummaryJsonPath}`);

  console.log('\n=== Step 4: Update run-summary.md ===');
  const runSummaryMdPath = path.join(SMOKE_DIR, 'run-summary.md');
  const runSummaryMd = `# HAY & ĐẸP. Production Smoke Test 01 — Run Summary

**Video Key:** \`video001\`  
**Title:** Có những bữa cơm sau này mới hiểu là rất quý  
**Canonical Spec:** \`videos/phan-1-2026-09-19-co-nhung-bua-com-sau-nay-moi-hieu/spec.json\` (1442 frames, ~48.07s @ 30fps)  
**Image Model:** \`@cf/black-forest-labs/flux-1-schnell\` ONLY  
**Current Status:** **\`PENDING_VISUAL_QA\`** (1 remaining asset awaiting final human review)

---

## 1. Asset Plan Execution & QA Status

- **Total Production Slots:** 13
- **Passed Slots:** 12 slots (8 Reused + 4 Fresh Human-Approved)
  - \`scene-01\` (Hook): \`assets/shot-01.jpg\` — **PASS** (\`V3.4A_HUMAN_REVIEW\`)
  - \`scene-02\` (Body): \`assets/shot-02.jpg\` — **PASS** (\`V3.4A_HUMAN_REVIEW\`)
  - \`scene-03\` (Body): \`assets/shot-03.jpg\` — **PASS** (\`V3.4A_HUMAN_REVIEW\`)
  - \`scene-04\` (Body): \`assets/shot-04.jpg\` — **PASS** (\`V3.4A_HUMAN_REVIEW\`)
  - \`scene-05\` (Body): \`assets/shot-05.jpg\` — **PASS** (\`V3.4A_HUMAN_REVIEW\`)
  - \`scene-06\` (Body): \`assets/shot-06.jpg\` — **PASS** (\`V3.4A_HUMAN_REVIEW\`)
  - \`scene-07\` (Body): \`assets/shot-07.jpg\` — **PASS** (\`HUMAN_QA_ATTEMPT_1\`)
  - \`scene-08-beat-01\` (Body): \`assets/shot-08-vb1.jpg\` — **PASS** (\`HUMAN_QA_ATTEMPT_1\`)
  - \`scene-09-beat-01\` (Memory Echo): \`assets/shot-01.jpg\` — **PASS** (\`V3.4A_HUMAN_REVIEW\`)
  - \`scene-09-beat-02\` (Body): \`assets/shot-09-vb2.jpg\` — **PASS** (\`HUMAN_QA_ATTEMPT_2\`)
    - *Human QA Reason:* Clean 2D editorial interior with zero people, two empty chairs, simple dining table, plain ceramic cup, warm afternoon atmosphere, and no calendar/pseudo-text/writing-like marks.
  - \`scene-10\` (Question): \`assets/shot-10.jpg\` — **PASS** (\`HUMAN_QA_ATTEMPT_1\`)
  - \`scene-11\` (Outro): \`<OutroCard />\` component — **PASS** (\`LOCKED_BRAND_ASSET\`)
- **Cleaned Slot Awaiting Human Review:** 1 slot
  - \`scene-08-beat-02\`: \`assets/shot-08-vb2.jpg\` (${fs.statSync(path.join(ASSETS_DIR, 'shot-08-vb2.jpg')).size} bytes) — **PENDING_VISUAL_QA** (Attempt 3 — Deterministic Raster Cleanup)
    - *Attempt 1 Fail:* Semantic failure (phone visible at upper-left table edge). Archived: \`archive/scene-08-beat-02-att1.jpg\`.
    - *Attempt 2 Fail:* Semantic failure (smartphone still visible on tabletop). Archived: \`archive/scene-08-beat-02-att2.jpg\`.
    - *Attempt 3 Raw Fail:* Semantic failure (2 small side bowls instead of exactly 1; cropped white paper stack at lower-right edge). Archived: \`archive/scene-08-beat-02-att3-before-cleanup.jpg\`.
    - *Deterministic Raster Cleanup:* Applied 100% deterministic local restoration (zero Cloudflare/AI calls):
      1. Removed extraneous upper small bowl in Plank 1 via row-wise horizontal interpolation.
      2. Removed cropped white paper stack in lower right corner via tiled clean column 700 wood grain and anti-aliased feathered polygon mask.
      3. Preserved top-down 2D illustrated style, exact colors, lighting, bowl linework, and restored plain uninterrupted wood surface.
      4. Result: EXACTLY 3 visible tabletop objects (1 main rice bowl, 1 side bowl, 1 pair of chopsticks) on phone-free table.
      5. Machine integrity: PASS (1024x1024, valid JPEG). \`qa = null\`.

---

## 2. Review Artifacts

- **Attempt 3 Single-Card Review Contact Sheet:**
  [\`scratch/production-smoke/video001/review-pack/pending-1-contact-sheet.jpg\`](file:///g:/Project/tool-gen-video-299/tool-video-tai-nguyen/scratch/production-smoke/video001/review-pack/pending-1-contact-sheet.jpg)
- **Updated Full Video Contact Sheet (All 11 visual assets, Unclipped):**
  [\`scratch/production-smoke/video001/production-contact-sheet-full.jpg\`](file:///g:/Project/tool-gen-video-299/tool-video-tai-nguyen/scratch/production-smoke/video001/production-contact-sheet-full.jpg)
- **Standalone Exported Asset:**
  [\`scratch/production-smoke/video001/review-pack/scene-08-beat-02.jpg\`](file:///g:/Project/tool-gen-video-299/tool-video-tai-nguyen/scratch/production-smoke/video001/review-pack/scene-08-beat-02.jpg)
- **Review Manifest:**
  [\`scratch/production-smoke/video001/review-pack/review-manifest.json\`](file:///g:/Project/tool-gen-video-299/tool-video-tai-nguyen/scratch/production-smoke/video001/review-pack/review-manifest.json)
- **Archived Previous Attempts:**
  - \`scratch/production-smoke/video001/archive/scene-08-beat-02-att1.jpg\`
  - \`scratch/production-smoke/video001/archive/scene-08-beat-02-att2.jpg\`
  - \`scratch/production-smoke/video001/archive/scene-08-beat-02-att3-before-cleanup.jpg\`

---

## 3. Production Rule Compliance

- **Deterministic Cleanup Only:** Zero Cloudflare / zero image generation calls used.
- **No Fake PASS:** Cleaned asset remains strictly in \`PENDING_VISUAL_QA\` (\`qa: null\`).
- **Render Gate:** Final MP4 rendering remains paused pending human visual QA decision on \`scene-08-beat-02\`.
- **No Attempt 4:** Baseline locked for final human review.
`;
  fs.writeFileSync(runSummaryMdPath, runSummaryMd, 'utf8');
  console.log(`Saved ${runSummaryMdPath}`);

  console.log('\n=== Step 5: Render pending-1-contact-sheet.jpg via Playwright ===');
  await renderPending1ContactSheet();

  console.log('\n=== Step 6: Render production-contact-sheet-full.jpg via Playwright ===');
  await renderUpdatedFullContactSheet();

  console.log('\nAll review artifacts updated and re-rendered successfully.');
}

async function renderPending1ContactSheet() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1100, height: 1250 });

    const imagePath = path.join(REVIEW_PACK_DIR, 'scene-08-beat-02.jpg');
    const sizeBytes = fs.statSync(imagePath).size;
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
    .cleanup-box {
      background: #F0FDF4;
      border-left: 4px solid #22C55E;
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 13px;
      color: #166534;
      margin-top: 10px;
      line-height: 1.5;
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
    <p>Targeted Cleanup: scene-08-beat-02 (Deterministic Raster Cleanup) | Model: @cf/black-forest-labs/flux-1-schnell</p>
  </div>
  <div class="card-container">
    <div class="card">
      <div class="img-container">
        <img src="${imgBase64}" />
      </div>
      <div class="info">
        <div class="info-top">
          <span class="slot-id">scene-08-beat-02 (Attempt 3 — Cleaned)</span>
          <span class="badge">PENDING VISUAL QA</span>
        </div>
        <div class="voice-quote">"và điện thoại không nằm giữa bàn."</div>
        <div class="meta-row"><span class="meta-label">Timing:</span> Frames 956–1058 (102f | 31.87s–35.26s)</div>
        <div class="meta-row"><span class="meta-label">People Contract:</span> <strong>0 people</strong> (strictly zero hands, arms, body parts)</div>
        <div class="meta-row"><span class="meta-label">Semantic Intent:</span> Top-down close detail of a simple warm wooden dining table prepared for a quiet home meal. EXACTLY 3 objects: 1 rice bowl, 1 small side bowl, 1 pair of chopsticks. Rest of tabletop completely empty uninterrupted wood. ZERO ELECTRONIC DEVICES.</div>
        <div class="meta-row"><span class="meta-label">File Size:</span> ${sizeBytes} bytes (Machine integrity: PASS)</div>
        <div class="cleanup-box">
          <strong>Deterministic Raster Cleanup Applied:</strong><br>
          • <strong>Action 1 (Upper Bowl Removed):</strong> Interpolated clean wood grain across Plank 1 (y: 76..343, x: 615..945) seamlessly removing extra small bowl.<br>
          • <strong>Action 2 (White Paper Removed):</strong> Replaced cropped paper artifact in bottom-right corner with continuous wood grain and horizontal divider/grain lines via feathered masking.<br>
          • <strong>Final State:</strong> Tabletop contains EXACTLY 3 tableware objects (1 main rice bowl, 1 side bowl, 1 pair of chopsticks) on plain uninterrupted wood.
        </div>
        <div class="history-box">
          <strong>Prior Failures:</strong><br>
          • <strong>Attempt 1:</strong> Smartphone visible at upper-left table edge.<br>
          • <strong>Attempt 2:</strong> Smartphone still clearly visible on tabletop.<br>
          • <strong>Attempt 3 (Raw):</strong> Smartphone removed, but semantic fail due to 2 side bowls and cropped paper artifact.
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

    await page.setContent(html, { waitUntil: 'load' });
    const outputPath = path.join(REVIEW_PACK_DIR, 'pending-1-contact-sheet.jpg');
    await page.screenshot({ path: outputPath, type: 'jpeg', quality: 92, fullPage: true });
    console.log(`   Saved pending-1-contact-sheet.jpg (${fs.statSync(outputPath).size} bytes)`);
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
      { name: 'Shot 08-VB2 (Scene 8 VB2)', file: path.join(ASSETS_DIR, 'shot-08-vb2.jpg'), badgeText: 'PENDING QA (Att 3 Cleaned)', badgeClass: 'badge-pending', people: '0 people (still life)', intent: 'Dining table surface without phones' },
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
    <p>Full End-to-End: 11 Visual Assets (10 PASS / 1 PENDING ATTEMPT 3 CLEANED)</p>
  </div>
  <div class="grid">
    ${cardsHtml}
  </div>
</body>
</html>`;

    await page.setContent(html, { waitUntil: 'load' });
    const fullOutputPath = path.join(SMOKE_DIR, 'production-contact-sheet-full.jpg');
    await page.screenshot({ path: fullOutputPath, type: 'jpeg', quality: 92, fullPage: true });
    console.log(`   Saved updated production-contact-sheet-full.jpg (${fs.statSync(fullOutputPath).size} bytes)`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Execution error:', err);
  process.exit(1);
});
