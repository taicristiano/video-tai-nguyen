import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const slug = 'phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu';
const videoPath = path.join('videos', slug, 'video.mp4');
const outDir = path.join('videos', slug, 'screenshots-v32');
const qaDir = path.join('videos', slug, 'qa');

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(qaDir, { recursive: true });

// Copy video to video-v3.2.mp4
fs.copyFileSync(videoPath, path.join('videos', slug, 'video-v3.2.mp4'));

// 1. Generate 16 narrative keyframe timestamps
const timestamps = [1.0, 3.5, 6.0, 8.5, 11.0, 13.5, 16.0, 19.0, 22.0, 25.0, 28.5, 32.0, 35.5, 39.0, 43.5, 46.5];

console.log('Extracting 16 narrative keyframe screenshots...');
timestamps.forEach((sec, idx) => {
  const pad = String(idx + 1).padStart(2, '0');
  const target = path.join(outDir, `frame-${pad}-${sec}s.jpg`);
  const cmd = `ffmpeg -y -ss ${sec} -i "${videoPath}" -frames:v 1 -q:v 2 "${target}"`;
  execSync(cmd, { stdio: 'ignore' });
  console.log(`  Extracted frame ${pad} at ${sec}s`);
});

// 2. Generate 4x4 tiled contact sheet (16 frames)
const contactSheetPath = path.join(qaDir, 'v32-contact-sheet.jpg');
const tileCmd = `ffmpeg -y -i "${videoPath}" -vf "fps=1/3,scale=270:-1,tile=4x4" -frames:v 1 -q:v 2 "${contactSheetPath}"`;
execSync(tileCmd, { stdio: 'inherit' });
console.log('Contact sheet saved to:', contactSheetPath);

fs.copyFileSync(contactSheetPath, 'scratch/v32-contact-sheet.jpg');
console.log('Copied contact sheet to scratch/v32-contact-sheet.jpg');
