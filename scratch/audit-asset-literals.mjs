import fs from 'node:fs';

const files = [
  'src/templates/human-insight/cinematic-light/Layout.tsx',
  'src/templates/human-insight/cinematic-light/ImageScene.tsx',
  'src/templates/human-insight/cinematic-light/OutroCard.tsx',
  'src/templates/human-insight/cinematic-light/brandTypographyTokens.ts',
  'src/templates/human-insight/cinematic-light/tokens.ts',
  'src/VideoContent.tsx',
  'src/Video.tsx',
  'src/Root.tsx',
  'scripts/build-production-render-spec.mjs',
  'scripts/production-spec-adapter.mjs',
  'scripts/package-production.mjs',
  'scripts/make-changes-zip.mjs',
];

const pattern = /['"](assets\/[^'"]+)['"]/g;
let total = 0;
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, 'utf8');
  let match;
  const found = [];
  while ((match = pattern.exec(content)) !== null) {
    found.push(match[1]);
  }
  if (found.length > 0) {
    console.log(f, found);
    total += found.length;
  }
}
console.log(`Total hardcoded asset literals found: ${total}`);
