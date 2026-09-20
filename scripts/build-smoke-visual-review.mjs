/**
 * scripts/build-smoke-visual-review.mjs
 * Builds visual-review.json and renders production-contact-sheet.jpg
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const SMOKE_DIR = path.join(ROOT, 'scratch', 'production-smoke', 'video001');
const ASSETS_DIR = path.join(SMOKE_DIR, 'assets');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function run() {
  const raw = fs.readFileSync(path.join(SMOKE_DIR, 'asset-plan.json'), 'utf8').replace(/^\uFEFF/, '');
  const assetPlan = JSON.parse(raw);

  const reviewShots = assetPlan.slots.map(slot => {
    const isReused = slot.action === 'REUSE_VALIDATED';
    const isOutro = slot.action === 'COMPONENT_OUTRO';
    const assetPath = path.join(ASSETS_DIR, path.basename(slot.targetAsset));
    const sizeBytes = fs.existsSync(assetPath) ? fs.statSync(assetPath).size : 0;

    let qaStatus = 'PENDING_VISUAL_QA';
    let qa = null;
    let reviewedSource = null;

    if (isReused) {
      qaStatus = 'PASS';
      reviewedSource = 'V3.4A_HUMAN_REVIEW';
      qa = {
        style: 'PASS',
        peopleContract: 'PASS',
        semanticFidelity: 'PASS',
        anatomy: 'PASS',
        textPollution: 'PASS',
        overall: 'PASS',
        source: 'V3.4A_HUMAN_REVIEW'
      };
    } else if (isOutro) {
      qaStatus = 'PASS';
      reviewedSource = 'LOCKED_BRAND_ASSET';
      qa = {
        style: 'PASS',
        peopleContract: 'PASS',
        semanticFidelity: 'PASS',
        anatomy: 'PASS',
        textPollution: 'PASS',
        overall: 'PASS',
        source: 'LOCKED_BRAND_ASSET'
      };
    }

    return {
      slotId: slot.slotId,
      sceneIndex: slot.sceneIndex,
      beatIndex: slot.beatIndex,
      file: slot.targetAsset,
      fullAssetPath: assetPath,
      voice: slot.voiceText,
      visualIntent: slot.visualIntent,
      peopleContract: slot.peopleContract,
      shortIntent: slot.action === 'REUSE_VALIDATED' ? `Scene ${slot.sceneIndex} (Reused V3.4A)` : slot.slotId,
      sizeBytes,
      qaStatus,
      qa,
      reviewedSource,
      action: slot.action
    };
  });

  const visualReview = {
    videoKey: 'video001',
    slug: 'phan-1-2026-09-19-co-nhung-bua-com-sau-nay-moi-hieu',
    title: 'Có những bữa cơm sau này mới hiểu là rất quý',
    qaStatus: reviewShots.some(s => s.qaStatus === 'PENDING_VISUAL_QA') ? 'PENDING_VISUAL_QA' : 'PASS',
    updatedAt: new Date().toISOString(),
    totalSlots: reviewShots.length,
    passSlots: reviewShots.filter(s => s.qaStatus === 'PASS').length,
    pendingSlots: reviewShots.filter(s => s.qaStatus === 'PENDING_VISUAL_QA').length,
    shots: reviewShots
  };

  fs.writeFileSync(path.join(SMOKE_DIR, 'visual-review.json'), JSON.stringify(visualReview, null, 2), 'utf8');
  console.log('Created visual-review.json. Overall status:', visualReview.qaStatus);

  // Render contact sheet of all visual assets
  const contactSheetCards = [
    { name: 'Shot 01 (Scene 1 & 9-VB1)', file: path.join(ASSETS_DIR, 'shot-01.jpg'), status: 'PASS', source: 'V3.4A', people: 'Family dinner', intent: 'Establishing family dinner at wooden table' },
    { name: 'Shot 02 (Scene 2)', file: path.join(ASSETS_DIR, 'shot-02.jpg'), status: 'PASS', source: 'V3.4A', people: '1 adult', intent: 'Serving rice quietly at dining table' },
    { name: 'Shot 03 (Scene 3)', file: path.join(ASSETS_DIR, 'shot-03.jpg'), status: 'PASS', source: 'V3.4A', people: 'Parent & child', intent: 'Parent and child talking at table' },
    { name: 'Shot 04 (Scene 4)', file: path.join(ASSETS_DIR, 'shot-04.jpg'), status: 'PASS', source: 'V3.4A', people: '1 person', intent: 'Placing phone aside deliberately' },
    { name: 'Shot 05 (Scene 5)', file: path.join(ASSETS_DIR, 'shot-05.jpg'), status: 'PASS', source: 'V3.4A', people: 'Family arriving', intent: 'Returning home after school and work' },
    { name: 'Shot 06 (Scene 6)', file: path.join(ASSETS_DIR, 'shot-06.jpg'), status: 'PASS', source: 'V3.4A', people: '1 adult', intent: 'Quiet reflective domestic pause' },
    { name: 'Shot 07 (Scene 7)', file: path.join(ASSETS_DIR, 'shot-07.jpg'), status: 'PENDING_VISUAL_QA', source: null, people: '1 adult', intent: 'Quiet domestic reflection holding bowl' },
    { name: 'Shot 08-VB1 (Scene 8 VB1)', file: path.join(ASSETS_DIR, 'shot-08-vb1.jpg'), status: 'PENDING_VISUAL_QA', source: null, people: '1 adult', intent: 'Adult seated calmly at dining table' },
    { name: 'Shot 08-VB2 (Scene 8 VB2)', file: path.join(ASSETS_DIR, 'shot-08-vb2.jpg'), status: 'PENDING_VISUAL_QA', source: null, people: '0 people (still life)', intent: 'Dining table surface without phones' },
    { name: 'Shot 09-VB2 (Scene 9 VB2)', file: path.join(ASSETS_DIR, 'shot-09-vb2.jpg'), status: 'PENDING_VISUAL_QA', source: null, people: '0 people (still life)', intent: 'Empty chairs by table in afternoon light' },
    { name: 'Shot 10 (Scene 10)', file: path.join(ASSETS_DIR, 'shot-10.jpg'), status: 'PENDING_VISUAL_QA', source: null, people: '1 adult', intent: 'Holding cup in thoughtful question pose' }
  ];

  const cardsHtml = contactSheetCards.map(item => {
    const data = fs.readFileSync(item.file);
    const src = `data:image/jpeg;base64,${data.toString('base64')}`;
    const isPass = item.status === 'PASS';
    const badgeText = isPass ? 'PASS (V3.4A)' : 'PENDING QA';
    const badgeClass = isPass ? 'badge-pass' : 'badge-pending';

    return `
      <div class="card">
        <img src="${src}" />
        <div class="caption">
          <div class="caption-header">
            <span class="shot-title">${escapeHtml(item.name)}</span>
            <span class="badge ${badgeClass}">${badgeText}</span>
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
      max-width: 1400px;
      margin: 0 auto;
    }
    .card {
      background: #FFFFFF;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(48, 45, 40, 0.08);
      border: 1px solid rgba(48, 45, 40, 0.06);
    }
    .card img {
      width: 100%;
      aspect-ratio: 1 / 1;
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
      font-size: 13px;
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
    <h1>HAY & ĐẸP. Production Smoke Test 01 — VIDEO001</h1>
    <p>Có những bữa cơm sau này mới hiểu là rất quý (Full End-to-End: 11 Visual Assets)</p>
  </div>
  <div class="grid">
    ${cardsHtml}
  </div>
</body>
</html>`;

  const contactSheetPath = path.join(SMOKE_DIR, 'production-contact-sheet.jpg');
  console.log('Rendering production contact sheet via Playwright...');
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1460, height: 1100 });
    await page.setContent(html, { waitUntil: 'load' });
    await page.screenshot({ path: contactSheetPath, type: 'jpeg', quality: 90 });
    console.log(`Saved production-contact-sheet.jpg (${fs.statSync(contactSheetPath).size} bytes) to ${contactSheetPath}`);
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('Fatal error building visual review:', err);
  process.exit(1);
});
