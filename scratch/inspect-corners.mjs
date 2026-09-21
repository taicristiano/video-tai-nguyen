import { chromium } from 'playwright';
import fs from 'node:fs';

function toDataUrl(p) {
  return 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64');
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1100 } });

const src5 = toDataUrl('public/assets/human-insight/images/video005-recovery-shot-05.jpg');
const src15 = toDataUrl('public/assets/human-insight/images/video005-recovery-shot-15.jpg');

const html = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { background: #111; color: #eee; font-family: monospace; padding: 20px; margin: 0; }
  .container { display: flex; gap: 30px; justify-content: center; }
  .card { background: #222; padding: 15px; border-radius: 8px; border: 1px solid #444; }
  canvas { image-rendering: pixelated; border: 1px solid #666; }
</style>
</head>
<body>
<h2>Zoomed Coordinate Analysis</h2>
<div class="container">
  <div class="card">
    <h3>Shot 05 (Region x:800..1024, y:960..1024)</h3>
    <canvas id="cv5" width="224" height="64" style="width: 672px; height: 192px;"></canvas>
    <div id="info5"></div>
  </div>
  <div class="card">
    <h3>Shot 15 (Region x:900..1024, y:950..1024)</h3>
    <canvas id="cv15" width="124" height="74" style="width: 496px; height: 296px;"></canvas>
    <div id="info15"></div>
  </div>
</div>
<script>
async function analyze() {
  // Shot 05
  {
    const cv = document.getElementById('cv5');
    const ctx = cv.getContext('2d');
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = "${src5}"; });
    ctx.drawImage(img, 800, 960, 224, 64, 0, 0, 224, 64);
    
    // Grid every 10px
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= 224; x += 10) {
      ctx.strokeStyle = (x % 20 === 0) ? 'yellow' : 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 64); ctx.stroke();
      if (x % 20 === 0) {
        ctx.fillStyle = 'yellow'; ctx.font = '8px monospace';
        ctx.fillText((800 + x), x + 1, 8);
      }
    }
    for (let y = 0; y <= 64; y += 10) {
      ctx.strokeStyle = (y % 20 === 0) ? 'yellow' : 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(224, y); ctx.stroke();
      if (y % 20 === 0) {
        ctx.fillStyle = 'yellow'; ctx.font = '8px monospace';
        ctx.fillText((960 + y), 2, y + 8);
      }
    }
  }

  // Shot 15
  {
    const cv = document.getElementById('cv15');
    const ctx = cv.getContext('2d');
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = "${src15}"; });
    ctx.drawImage(img, 900, 950, 124, 74, 0, 0, 124, 74);
    
    // Grid every 10px
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= 124; x += 10) {
      ctx.strokeStyle = (x % 20 === 0) ? 'yellow' : 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 74); ctx.stroke();
      if (x % 20 === 0) {
        ctx.fillStyle = 'yellow'; ctx.font = '8px monospace';
        ctx.fillText((900 + x), x + 1, 8);
      }
    }
    for (let y = 0; y <= 74; y += 10) {
      ctx.strokeStyle = (y % 20 === 0) ? 'yellow' : 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(124, y); ctx.stroke();
      if (y % 20 === 0) {
        ctx.fillStyle = 'yellow'; ctx.font = '8px monospace';
        ctx.fillText((950 + y), 2, y + 8);
      }
    }
  }
}
analyze();
</script>
</body>
</html>
`;

await page.setContent(html, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'scratch/cleanup-inspection/zoomed-inspection.png', fullPage: true });
await browser.close();
console.log('Saved zoomed inspection');
