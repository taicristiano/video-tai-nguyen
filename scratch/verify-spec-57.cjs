const fs = require('fs');
const spec = JSON.parse(fs.readFileSync('videos/phan-57-2026-09-17-muoi-phut-buffer-co-the-cuu-ca-mot-hanh-trinh/spec.json', 'utf8'));

let currentFrame = 0;
let layoutCount = 1;
let lastLayout = null;

spec.scenes.forEach((scene, i) => {
  if (scene.startFrame !== currentFrame) {
    console.error(`Scene ${i} startFrame gap! Expected ${currentFrame}, got ${scene.startFrame}`);
    process.exit(1);
  }
  currentFrame += scene.durationFrames;
  
  if (scene.layout === lastLayout) {
    layoutCount++;
    if (layoutCount > 2) {
      console.error(`More than 2 consecutive layouts (${scene.layout}) at scene ${i}`);
      process.exit(1);
    }
  } else {
    layoutCount = 1;
    lastLayout = scene.layout;
  }
  
  if (scene.image && !fs.existsSync('public/' + scene.image.path)) {
    console.error(`Image missing for scene ${i}: ${scene.image.path}`);
    process.exit(1);
  }
});

if (currentFrame !== spec.totalFrames) {
  console.error(`Total frames mismatch! Expected ${spec.totalFrames}, counted ${currentFrame}`);
  process.exit(1);
}

console.log('✅ Spec verification passed completely for phan-57! Total scenes:', spec.scenes.length, 'Total frames:', spec.totalFrames);
