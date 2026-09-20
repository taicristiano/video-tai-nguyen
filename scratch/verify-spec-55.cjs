const fs = require('fs');
const spec = JSON.parse(fs.readFileSync('videos/phan-55-2026-09-17-he-thong-giat-do-tot-la-he-thong-minh-chiu-dung/spec.json', 'utf8'));

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

console.log('✅ Spec verification passed completely for phan-55! Total scenes:', spec.scenes.length, 'Total frames:', spec.totalFrames);
