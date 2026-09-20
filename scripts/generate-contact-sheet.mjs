import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const slug = 'phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu';
const videoPath = path.join(ROOT, 'videos', slug, 'video.mp4');
const outDir = path.join(ROOT, 'videos', slug, 'screenshots-v21');

if (!fs.existsSync(videoPath)) {
  console.error('Video file not found at:', videoPath);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

// 1. Extract frames every 3 seconds up to 45s + outro at 46.5s
const timestamps = [];
for (let s = 0; s <= 45; s += 3) {
  timestamps.push(s);
}
timestamps.push(46.5); // outro

console.log('Extracting individual screenshots...');
timestamps.forEach((sec) => {
  const pad = String(Math.floor(sec)).padStart(2, '0') + 's';
  const name = sec >= 46 ? 'outro.jpg' : sec === 42 ? 'question.jpg' : `${pad}.jpg`;
  const target = path.join(outDir, name);
  const cmd = `ffmpeg -y -ss ${sec} -i "${videoPath}" -frames:v 1 -q:v 2 "${target}"`;
  execSync(cmd, { stdio: 'ignore' });
  console.log(`  Saved: ${name}`);
});

// 2. Generate contact sheet tile (every 3 seconds)
console.log('Generating 3-second tiled contact sheet...');
const contactSheetPath = path.join(outDir, 'contact-sheet.jpg');
const tileCmd = `ffmpeg -y -i "${videoPath}" -vf "fps=1/3,scale=270:-1,tile=4x4" -frames:v 1 -q:v 2 "${contactSheetPath}"`;
execSync(tileCmd, { stdio: 'inherit' });
console.log('  Saved contact sheet to:', contactSheetPath);

// Also copy contact sheet to artifact/scratch directory for user inspection
const scratchDir = path.join(ROOT, 'scratch');
fs.mkdirSync(scratchDir, { recursive: true });
fs.copyFileSync(contactSheetPath, path.join(scratchDir, 'contact-sheet-v21.jpg'));
console.log('✅ Contact sheet generation complete!');
