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
<h2>Refined Cleanup Test 2 (Full Coverage)</h2>
<div class="container">
  <div class="card">
    <h3>Shot 05 Cleaned (x:800..1024, y:920..1024)</h3>
    <canvas id="cv5_after" width="224" height="104" style="width: 672px; height: 312px;"></canvas>
  </div>
  <div class="card">
    <h3>Shot 15 Cleaned (x:880..1024, y:930..1024)</h3>
    <canvas id="cv15_after" width="144" height="94" style="width: 576px; height: 376px;"></canvas>
  </div>
</div>
<script>
async function run() {
  // --- Shot 05 ---
  {
    const img5 = new Image();
    await new Promise(r => { img5.onload = r; img5.src = "${src5}"; });

    const fullCv = document.createElement('canvas');
    fullCv.width = 1024;
    fullCv.height = 1024;
    const ctx = fullCv.getContext('2d');
    ctx.drawImage(img5, 0, 0);

    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;

    // Artifact region: x: 824..1012, y: 983..1024
    for (let x = 824; x <= 1012; x++) {
      // Sample clean line from y=980..982
      const cleanY = (x > 980) ? 979 : (980 + (x % 3));
      const srcIdx = (cleanY * 1024 + x) * 4;
      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];

      for (let y = 983; y < 1024; y++) {
        const destIdx = (y * 1024 + x) * 4;
        const dy = (y - 983);
        const vShift = Math.floor(dy / 25);
        data[destIdx] = Math.min(255, r + vShift);
        data[destIdx + 1] = Math.min(255, g + vShift);
        data[destIdx + 2] = Math.min(255, b + vShift);
        data[destIdx + 3] = 255;
      }
    }

    // Apply 2px feather on the top border (y=983, 984) and side borders
    for (let x = 824; x <= 1012; x++) {
      // y = 983: 50% blend with original
      const idx = (983 * 1024 + x) * 4;
      const origIdx = (982 * 1024 + x) * 4;
      data[idx] = Math.round((data[origIdx] + data[idx]) / 2);
      data[idx + 1] = Math.round((data[origIdx + 1] + data[idx + 1]) / 2);
      data[idx + 2] = Math.round((data[origIdx + 2] + data[idx + 2]) / 2);
    }

    ctx.putImageData(imgData, 0, 0);

    const cvAfter = document.getElementById('cv5_after');
    const ctxA = cvAfter.getContext('2d');
    ctxA.drawImage(fullCv, 800, 920, 224, 104, 0, 0, 224, 104);
  }

  // --- Shot 15 ---
  {
    const img15 = new Image();
    await new Promise(r => { img15.onload = r; img15.src = "${src15}"; });

    const fullCv = document.createElement('canvas');
    fullCv.width = 1024;
    fullCv.height = 1024;
    const ctx = fullCv.getContext('2d');
    ctx.drawImage(img15, 0, 0);

    // Box for HA*P: x: 924..986, y: 964..1008 (w: 62, h: 44)
    // Clean source patch from left: x: 860..922, y: 964..1008
    const patchCanvas = document.createElement('canvas');
    patchCanvas.width = 62;
    patchCanvas.height = 44;
    const pctx = patchCanvas.getContext('2d');
    pctx.drawImage(img15, 860, 964, 62, 44, 0, 0, 62, 44);

    ctx.save();
    ctx.drawImage(patchCanvas, 924, 964);
    ctx.restore();

    const cvAfter = document.getElementById('cv15_after');
    const ctxA = cvAfter.getContext('2d');
    ctxA.drawImage(fullCv, 880, 930, 144, 94, 0, 0, 144, 94);
  }
}
run();
</script>
</body>
</html>
`;

await page.setContent(html, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'scratch/cleanup-inspection/refined-cleanup-result-2.png', fullPage: true });
await browser.close();
console.log('Saved refined cleanup result 2');
