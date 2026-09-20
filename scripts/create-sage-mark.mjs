import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const inputPath = path.join(ROOT, 'public/assets/human-insight/brand/hay-dep-mark.png');
const outputPath = path.join(ROOT, 'public/assets/human-insight/brand/hay-dep-mark-sage.png');

console.log('Reading:', inputPath);
const raw = execSync(`ffmpeg -i "${inputPath}" -vframes 1 -f rawvideo -pix_fmt rgba -`, { maxBuffer: 10 * 1024 * 1024 });
const out = Buffer.from(raw);

// Color: Dark sage #465B49 -> R=70, G=91, B=73
for (let i = 0; i < out.length; i += 4) {
  out[i] = 70;     // R
  out[i + 1] = 91; // G
  out[i + 2] = 73; // B
  // Alpha at out[i+3] remains unchanged
}

const ff = spawn('ffmpeg', [
  '-y',
  '-f', 'rawvideo',
  '-pix_fmt', 'rgba',
  '-s', '512x512',
  '-i', 'pipe:0',
  outputPath
], { stdio: ['pipe', 'inherit', 'inherit'] });

ff.stdin.write(out);
ff.stdin.end();

ff.on('close', (code) => {
  if (code === 0) {
    console.log('Successfully created:', outputPath);
  } else {
    console.error('ffmpeg failed with code:', code);
  }
});
