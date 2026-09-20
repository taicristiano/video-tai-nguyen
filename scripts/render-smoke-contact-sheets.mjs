/**
 * scripts/render-smoke-contact-sheets.mjs
 * Renders:
 * 1. scratch/production-smoke/video001/production-contact-sheet-full.jpg (All 11 assets, unclipped)
 * 2. scratch/production-smoke/video001/review-pack/pending-5-contact-sheet.jpg (5 pending assets, large inspection view)
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
const REVIEW_PACK_DIR = path.join(SMOKE_DIR, 'review-pack');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function renderFullContactSheet(browser) {
  const cards = [
    {
      slotName: 'scene-01',
      sceneBeat: 'Scene 1 & Scene 9 (VB1)',
      people: 'Family dinner (parents + child)',
      intent: 'Establishing simple family dinner at wooden table',
      badgeText: 'PASS (V3.4A)',
      badgeClass: 'badge-pass',
      file: path.join(ASSETS_DIR, 'shot-01.jpg')
    },
    {
      slotName: 'scene-02',
      sceneBeat: 'Scene 2',
      people: '1 visible adult',
      intent: 'Serving rice quietly at dining table',
      badgeText: 'PASS (V3.4A)',
      badgeClass: 'badge-pass',
      file: path.join(ASSETS_DIR, 'shot-02.jpg')
    },
    {
      slotName: 'scene-03',
      sceneBeat: 'Scene 3',
      people: 'Parent and child',
      intent: 'Talking and reconnecting at dining table',
      badgeText: 'PASS (V3.4A)',
      badgeClass: 'badge-pass',
      file: path.join(ASSETS_DIR, 'shot-03.jpg')
    },
    {
      slotName: 'scene-04',
      sceneBeat: 'Scene 4',
      people: '1 person',
      intent: 'Placing phone deliberately aside on shelf',
      badgeText: 'PASS (V3.4A)',
      badgeClass: 'badge-pass',
      file: path.join(ASSETS_DIR, 'shot-04.jpg')
    },
    {
      slotName: 'scene-05',
      sceneBeat: 'Scene 5',
      people: 'Family arriving',
      intent: 'Returning home after school and work',
      badgeText: 'PASS (V3.4A)',
      badgeClass: 'badge-pass',
      file: path.join(ASSETS_DIR, 'shot-05.jpg')
    },
    {
      slotName: 'scene-06',
      sceneBeat: 'Scene 6',
      people: '1 visible adult',
      intent: 'Quiet reflective domestic pause',
      badgeText: 'PASS (V3.4A)',
      badgeClass: 'badge-pass',
      file: path.join(ASSETS_DIR, 'shot-06.jpg')
    },
    {
      slotName: 'scene-07',
      sceneBeat: 'Scene 7',
      people: '1 visible adult',
      intent: 'Quiet domestic reflection holding ceramic bowl',
      badgeText: 'PENDING QA',
      badgeClass: 'badge-pending',
      file: path.join(ASSETS_DIR, 'shot-07.jpg')
    },
    {
      slotName: 'scene-08-beat-01',
      sceneBeat: 'Scene 8 (Beat 1)',
      people: '1 visible adult',
      intent: 'Adult seated calmly at wooden dining table',
      badgeText: 'PENDING QA',
      badgeClass: 'badge-pending',
      file: path.join(ASSETS_DIR, 'shot-08-vb1.jpg')
    },
    {
      slotName: 'scene-08-beat-02',
      sceneBeat: 'Scene 8 (Beat 2)',
      people: '0 people (still life)',
      intent: 'Dining table setting without any phones',
      badgeText: 'PENDING QA',
      badgeClass: 'badge-pending',
      file: path.join(ASSETS_DIR, 'shot-08-vb2.jpg')
    },
    {
      slotName: 'scene-09-beat-02',
      sceneBeat: 'Scene 9 (Beat 2)',
      people: '0 people (still life / interior)',
      intent: 'Empty chairs by table in soft afternoon light',
      badgeText: 'PENDING QA',
      badgeClass: 'badge-pending',
      file: path.join(ASSETS_DIR, 'shot-09-vb2.jpg')
    },
    {
      slotName: 'scene-10',
      sceneBeat: 'Scene 10',
      people: '1 visible adult',
      intent: 'Holding cup in thoughtful question pose',
      badgeText: 'PENDING QA',
      badgeClass: 'badge-pending',
      file: path.join(ASSETS_DIR, 'shot-10.jpg')
    }
  ];

  const cardsHtml = cards.map(item => {
    const data = fs.readFileSync(item.file);
    const src = `data:image/jpeg;base64,${data.toString('base64')}`;

    return `
      <div class="card">
        <div class="img-container">
          <img src="${src}" />
        </div>
        <div class="caption">
          <div class="caption-header">
            <span class="slot-name">${escapeHtml(item.slotName)}</span>
            <span class="badge ${item.badgeClass}">${escapeHtml(item.badgeText)}</span>
          </div>
          <div class="caption-scene">${escapeHtml(item.sceneBeat)}</div>
          <div class="caption-people" title="${escapeHtml(item.people)}">👤 ${escapeHtml(item.people)}</div>
          <div class="caption-intent" title="${escapeHtml(item.intent)}">🎯 ${escapeHtml(item.intent)}</div>
        </div>
      </div>
    `;
  }).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 36px 40px 60px 40px;
      background: #F6F1E8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #302D28;
    }
    .header {
      margin-bottom: 28px;
      text-align: center;
    }
    h1 {
      margin: 0 0 6px 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: #24201C;
    }
    p {
      margin: 0;
      font-size: 15px;
      color: rgba(48, 45, 40, 0.72);
    }
    .meta-bar {
      margin-top: 10px;
      display: inline-flex;
      gap: 16px;
      font-size: 13px;
      color: #6B655D;
      background: rgba(255, 255, 255, 0.6);
      padding: 6px 16px;
      border-radius: 20px;
      border: 1px solid rgba(48, 45, 40, 0.08);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      max-width: 1460px;
      margin: 0 auto;
    }
    .card {
      background: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 18px rgba(48, 45, 40, 0.08);
      border: 1px solid rgba(48, 45, 40, 0.08);
      display: flex;
      flex-direction: column;
    }
    .img-container {
      width: 100%;
      aspect-ratio: 1 / 1;
      background: #FAF7F2;
      overflow: hidden;
    }
    .img-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .caption {
      padding: 12px 14px 14px 14px;
      background: #FFFCF7;
      border-top: 1px solid rgba(48, 45, 40, 0.06);
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .caption-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2px;
    }
    .slot-name {
      font-size: 14px;
      font-weight: 700;
      color: #24201C;
    }
    .badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      letter-spacing: 0.03em;
    }
    .badge-pass {
      background: #DCFCE7;
      color: #166534;
      border: 1px solid #BBF7D0;
    }
    .badge-pending {
      background: #FEF3C7;
      color: #92400E;
      border: 1px solid #FDE68A;
    }
    .caption-scene {
      font-size: 11px;
      font-weight: 600;
      color: #8A7055;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .caption-people {
      font-size: 12px;
      font-weight: 600;
      color: #38342F;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .caption-intent {
      font-size: 11.5px;
      color: rgba(48, 45, 40, 0.72);
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>HAY & ĐẸP. Production Smoke Test 01 — Full Contact Sheet</h1>
    <p>Có những bữa cơm sau này mới hiểu là rất quý (VIDEO001 — Full 1442-frame Timeline)</p>
    <div class="meta-bar">
      <span>11 Visual Assets (6 Reused PASS + 5 Fresh PENDING)</span>
      <span>•</span>
      <span>Model: FLUX.1 Schnell</span>
      <span>•</span>
      <span>No Vertical Clipping</span>
    </div>
  </div>
  <div class="grid">
    ${cardsHtml}
  </div>
</body>
</html>`;

  const outPath = path.join(SMOKE_DIR, 'production-contact-sheet-full.jpg');
  console.log('Rendering full contact sheet (all 11 assets)...');
  const page = await browser.newPage();
  try {
    await page.setViewportSize({ width: 1540, height: 1600 });
    await page.setContent(html, { waitUntil: 'load' });
    await page.screenshot({
      path: outPath,
      type: 'jpeg',
      quality: 92,
      fullPage: true
    });
    console.log(`✅ Saved production-contact-sheet-full.jpg (${fs.statSync(outPath).size} bytes)`);
  } finally {
    await page.close();
  }
}

async function renderPending5ContactSheet(browser) {
  const pendingCards = [
    {
      slot: 'scene-07',
      fileName: 'scene-07.jpg',
      sceneBeat: 'Scene 07 (Frames 773–871 | ~25.8s–29.0s)',
      narrative: 'Nhưng chính vì nhỏ, chúng có cơ hội xuất hiện trong những ngày thật.',
      people: '1 visible adult',
      intent: 'One adult in a quiet, serene domestic pause holding a plain ceramic bowl.',
      checklist: 'Anatomy (hands/limbs) • Style (clean 2D matte) • Text Pollution (no marks on wall/counter/bowl)',
      file: path.join(REVIEW_PACK_DIR, 'scene-07.jpg')
    },
    {
      slot: 'scene-08-beat-01',
      fileName: 'scene-08-beat-01.jpg',
      sceneBeat: 'Scene 08 Beat 1 (Frames 871–956 | ~29.0s–31.9s)',
      narrative: 'Tuần này, thử giữ lại ít nhất một bữa ăn mà mọi người ngồi cùng nhau...',
      people: '1 visible adult',
      intent: 'Adult seated comfortably at wooden dining table with rice bowl and chopsticks in calm anticipation.',
      checklist: 'Anatomy (seated posture, face, hands) • Clean Surface (solid wood table, no phones) • Zero Text',
      file: path.join(REVIEW_PACK_DIR, 'scene-08-beat-01.jpg')
    },
    {
      slot: 'scene-08-beat-02',
      fileName: 'scene-08-beat-02.jpg',
      sceneBeat: 'Scene 08 Beat 2 (Frames 956–1058 | ~31.9s–35.3s)',
      narrative: '...và điện thoại không nằm giữa bàn.',
      people: '0 people (STILL LIFE)',
      intent: 'Close detail view of clean wooden dining table with simple bowls & chopsticks; table completely phone-free.',
      checklist: 'Zero People Contract • Phone Absence (no phones/screens) • Clean Surfaces (no text/logos)',
      file: path.join(REVIEW_PACK_DIR, 'scene-08-beat-02.jpg')
    },
    {
      slot: 'scene-09-beat-02',
      fileName: 'scene-09-beat-02.jpg',
      sceneBeat: 'Scene 09 Beat 2 (Frames 1136–1261 | ~37.9s–42.0s)',
      narrative: 'Đến khi lịch mỗi người khác đi, ta mới biết chúng từng đẹp đến mức nào.',
      people: '0 people (STILL LIFE / INTERIOR)',
      intent: 'Poignant domestic after-moment: two empty wooden chairs by dining table in soft afternoon light after a meal.',
      checklist: 'Zero People Contract • Text Pollution (check wall sheets/calendars for pseudo-text) • Lived-in Calm',
      file: path.join(REVIEW_PACK_DIR, 'scene-09-beat-02.jpg')
    },
    {
      slot: 'scene-10',
      fileName: 'scene-10.jpg',
      sceneBeat: 'Scene 10 (Frames 1261–1382 | ~42.0s–46.1s)',
      narrative: 'Nhà bạn có bữa ăn nào dù món rất đơn giản nhưng vẫn nhớ lâu không?',
      people: '1 visible adult',
      intent: 'One adult holding warm cup at table in thoughtful, reflective question posture.',
      checklist: 'Anatomy (hands holding cup, 5 fingers) • Subtle Expression • Clean Mug & Tabletop (no logos)',
      file: path.join(REVIEW_PACK_DIR, 'scene-10.jpg')
    }
  ];

  const cardsHtml = pendingCards.map((item, idx) => {
    const data = fs.readFileSync(item.file);
    const src = `data:image/jpeg;base64,${data.toString('base64')}`;

    return `
      <div class="card">
        <div class="card-header">
          <div class="header-left">
            <span class="item-num">#${idx + 1}</span>
            <span class="slot-title">${escapeHtml(item.slot)}</span>
            <span class="file-name">${escapeHtml(item.fileName)}</span>
          </div>
          <span class="badge-pending">PENDING VISUAL QA</span>
        </div>
        <div class="img-container">
          <img src="${src}" />
        </div>
        <div class="card-body">
          <div class="scene-timing">${escapeHtml(item.sceneBeat)}</div>
          <div class="clause">“${escapeHtml(item.narrative)}”</div>
          <div class="meta-row">
            <span class="meta-label">People Contract:</span>
            <span class="meta-value">${escapeHtml(item.people)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Semantic Intent:</span>
            <span class="meta-value">${escapeHtml(item.intent)}</span>
          </div>
          <div class="checklist">
            <span class="checklist-label">Review Checklist:</span>
            <span class="checklist-text">${escapeHtml(item.checklist)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 40px 48px 60px 48px;
      background: #F4EFE6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #2D2824;
    }
    .header {
      margin-bottom: 32px;
      text-align: center;
    }
    h1 {
      margin: 0 0 8px 0;
      font-size: 30px;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: #201C18;
    }
    p {
      margin: 0;
      font-size: 16px;
      color: rgba(45, 40, 36, 0.72);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 32px;
      max-width: 1720px;
      margin: 0 auto;
    }
    .card {
      background: #FFFFFF;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 6px 24px rgba(45, 40, 36, 0.09);
      border: 1px solid rgba(45, 40, 36, 0.08);
      display: flex;
      flex-direction: column;
    }
    .card-header {
      padding: 14px 20px;
      background: #FAF6EF;
      border-bottom: 1px solid rgba(45, 40, 36, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .item-num {
      font-size: 13px;
      font-weight: 800;
      background: #E8DFD0;
      color: #5A4E40;
      padding: 2px 8px;
      border-radius: 6px;
    }
    .slot-title {
      font-size: 17px;
      font-weight: 700;
      color: #201C18;
    }
    .file-name {
      font-size: 13px;
      color: #827768;
      font-family: monospace;
    }
    .badge-pending {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 6px;
      background: #FEF3C7;
      color: #92400E;
      border: 1px solid #FDE68A;
      letter-spacing: 0.03em;
    }
    .img-container {
      width: 100%;
      aspect-ratio: 1 / 1;
      background: #FDFBF7;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .img-container img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
    .card-body {
      padding: 18px 22px;
      background: #FFFFFF;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .scene-timing {
      font-size: 12px;
      font-weight: 700;
      color: #967852;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .clause {
      font-size: 14px;
      font-style: italic;
      color: #38322C;
      margin-bottom: 2px;
    }
    .meta-row {
      display: flex;
      gap: 8px;
      font-size: 13.5px;
      line-height: 1.4;
    }
    .meta-label {
      font-weight: 700;
      color: #4A423B;
      min-width: 115px;
      flex-shrink: 0;
    }
    .meta-value {
      color: #2D2824;
    }
    .checklist {
      margin-top: 6px;
      padding: 10px 14px;
      background: #F8F5EE;
      border-radius: 8px;
      border-left: 3px solid #C49748;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .checklist-label {
      font-size: 11.5px;
      font-weight: 800;
      color: #7A5B22;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .checklist-text {
      font-size: 12.5px;
      color: #423B33;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>HAY & ĐẸP. Production Smoke Test 01 — Focused 5-Asset Human Review</h1>
    <p>High-Resolution Inspection Sheet for Fresh Assets • FLUX.1 Schnell • Unclipped 1:1 Presentation</p>
  </div>
  <div class="grid">
    ${cardsHtml}
  </div>
</body>
</html>`;

  const outPath = path.join(REVIEW_PACK_DIR, 'pending-5-contact-sheet.jpg');
  console.log('Rendering pending-5 contact sheet (large inspection view)...');
  const page = await browser.newPage();
  try {
    await page.setViewportSize({ width: 1840, height: 2600 });
    await page.setContent(html, { waitUntil: 'load' });
    await page.screenshot({
      path: outPath,
      type: 'jpeg',
      quality: 92,
      fullPage: true
    });
    console.log(`✅ Saved pending-5-contact-sheet.jpg (${fs.statSync(outPath).size} bytes)`);
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('Starting contact sheet rendering via Playwright...');
  const browser = await chromium.launch({ headless: true });
  try {
    await renderFullContactSheet(browser);
    await renderPending5ContactSheet(browser);
  } finally {
    await browser.close();
  }
  console.log('All contact sheets successfully rendered.');
}

main().catch(err => {
  console.error('Fatal render error:', err);
  process.exit(1);
});
