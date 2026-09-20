import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { parseHayDepVideos } from './parse-hay-dep-videos.mjs';
import { deriveSlug } from '../src/slug.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const vids = parseHayDepVideos();
const v1 = vids[0];
console.log('Video 1 Title:', v1.title);
console.log('Video 1 Part:', v1.part);

const slug = deriveSlug(v1.cleanContext);
console.log('Derived Slug:', slug);

const videosDir = path.join(ROOT, 'videos', slug);
const publicDir = path.join(ROOT, 'public', slug);
const scriptDir = path.join(videosDir, 'script');

fs.mkdirSync(scriptDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(videosDir, 'context.txt'), v1.cleanContext, 'utf-8');
fs.writeFileSync(path.join(videosDir, 'template.txt'), 'human-insight/cinematic-light', 'utf-8');
fs.writeFileSync(path.join(videosDir, 'audio.txt'), 'full', 'utf-8');

// Build script.json
// Split voiceScriptText into paragraphs
const rawParas = v1.voiceScriptText
  .split(/\n\s*\n/)
  .map(p => p.replace(/\r/g, '').trim())
  .filter(Boolean);

console.log('Paragraphs count:', rawParas.length);

const scriptItems = [];
rawParas.forEach((p, idx) => {
  if (idx === 0) {
    scriptItems.push({ text: p, type: 'hook' });
  } else if (idx === rawParas.length - 1) {
    scriptItems.push({ text: p, type: 'ending' });
  } else {
    scriptItems.push({ text: p, type: 'body' });
  }
});

const scriptData = { script: scriptItems };
const scriptPath = path.join(scriptDir, 'script.json');
fs.writeFileSync(scriptPath, JSON.stringify(scriptData, null, 2), 'utf-8');
console.log('Wrote script.json to:', scriptPath);

// Also write plan.json
const planData = {
  title: v1.title,
  hook: rawParas[0],
  segments: rawParas.slice(1, -1).map((text, i) => ({
    title: `Ý ${i + 1}`,
    content_summary: text
  })),
  ending: rawParas[rawParas.length - 1],
  estimated_duration: 75
};
fs.writeFileSync(path.join(videosDir, 'plan.json'), JSON.stringify(planData, null, 2), 'utf-8');
console.log('Wrote plan.json');
