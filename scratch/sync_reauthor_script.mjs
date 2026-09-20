import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const slug = 'phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu';
const specPath = path.join(ROOT, 'videos', slug, 'spec.json');
const currentSpec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));

const fileContent = `import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const slug = '${slug}';
const specDir = path.join(ROOT, 'videos', slug);

// V3.1.1 Production-locked spec for Video 001
const spec = ${JSON.stringify(currentSpec, null, 2)};

fs.mkdirSync(specDir, { recursive: true });
fs.writeFileSync(path.join(specDir, 'spec.json'), JSON.stringify(spec, null, 2) + '\\n');
console.log('Successfully written synchronized V3.1.1 spec.json for Video 001');
`;

fs.writeFileSync(path.join(ROOT, 'scripts/reauthor-video001-spec.mjs'), fileContent, 'utf-8');
console.log('Synchronized scripts/reauthor-video001-spec.mjs with canonical spec.json');
