import { chromium } from 'playwright';
import fs from 'node:fs';

function toDataUrl(p) {
  return 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64');
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1100 } });

const src5 = toDataUrl('public/assets/human-insight/images/video005-recovery-shot-05.jpg');

const html = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { background: #111; color: #eee; font-family: monospace; padding: 20px; margin: 0; }
  canvas { image-rendering: pixelated; border: 1px solid #666; }
</style>
</head>
<body>
<h2>Shot 05 Exact Grid (x:820..1000, y:920..1024)</h2>
<canvas id="cv5" width="180" height="104" style="width: 900px; height: 520px;"></canvas>
<script>
async function run() {
  const cv = document.getElementById('cv5');
  const ctx = cv.getContext('2d');
  const img5 = new Image();
  await new Promise(r => { img5.onload = r; img5.src = "${src5}"; });
  ctx.drawImage(img5, 820, 920, 180, 104, 0, 0, 180, 104);

  // Draw grid every 10px
  for (let x = 0; x <= 180; x += 10) {
    ctx.strokeStyle = (x % 20 === 0) ? 'yellow' : 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 104); ctx.stroke();
    if (x % 20 === 0) {
      ctx.fillStyle = 'yellow'; ctx.font = '8px monospace';
      ctx.fillText((820 + x), x + 1, 8);
    }
  }
  for (let y = 0; y <= 104; y += 10) {
    ctx.strokeStyle = (y % 20 === 0) ? 'yellow' : 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(180, y); ctx.stroke();
    if (y % 20 === 0) {
      ctx.fillStyle = 'yellow'; ctx.font = '8px monospace';
      ctx.fillText((920 + y), 2, y + 8);
    }
  }
}
run();
</script>
</body>
</html>
`;

await page.setContent(html, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'scratch/cleanup-inspection/shot-05-exact-grid.png', fullPage: true });
await browser.close();
console.log('Saved shot 05 exact grid');
