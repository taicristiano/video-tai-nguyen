import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
const model = '@cf/black-forest-labs/flux-1-schnell';
const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

async function genImage(prompt, outPath) {
  console.log(`Generating image for ${outPath}...`);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudflare error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const base64 = data.result?.image;
  if (!base64) throw new Error('No image returned');
  fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
  console.log(`Saved to ${outPath}`);
}

const STYLE = "Warm editorial illustration in Japanese slice-of-life domestic style. Soft warm ivory background, gentle sepia and graphite linework, clean flat colors with soft watercolor shading, warm golden pendant lamp light. High aesthetic, calm, peaceful. NO text, NO labels, NO watermark, NO logo, NO glasses.";

const prompt12 = `${STYLE}
A happy young Vietnamese family of four having dinner together around a small warm wooden dining table.
Father is a handsome 34-year-old Vietnamese man with neat short black hair, clean-shaven, gentle kind smile, wearing a sage green overshirt, NO GLASSES.
Mother is a graceful 32-year-old Vietnamese woman with dark hair tied in a low elegant bun, soft facial features, gentle loving smile, wearing a warm beige cardigan, NO GLASSES.
Their 7-year-old son with short messy black fringe is smiling happily with chopsticks and a rice bowl.
Their 5-year-old little daughter with neat bangs and cute hair bun is smiling happily beside her mother.
On the table are simple home dishes, steaming bowls of white rice, warm ceramic cups.
A warm pendant hanging lamp casts soft golden light above. Beautiful domestic harmony and nostalgic family memory.`;

const prompt13_mother = `${STYLE}
Close-up emotional portrait of a graceful 32-year-old Vietnamese mother with dark hair styled in an elegant low bun with soft loose wisps around her face.
Gentle warm brown almond eyes, soft peach blush on cheeks, a tender wistful grateful smile, peaceful expression.
Wearing a soft warm beige knit cardigan.
Looking slightly off-camera with heartfelt nostalgia and gratitude, remembering cherished family dinner moments.
Soft warm domestic evening light, clean ivory cream background, intimate and touching.`;

async function run() {
  const outDir = 'videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/qa/tmp_candidates';
  fs.mkdirSync(outDir, { recursive: true });

  await genImage(prompt12, path.join(outDir, 'shot12_cand1.jpg'));
  await genImage(prompt12, path.join(outDir, 'shot12_cand2.jpg'));
  await genImage(prompt13_mother, path.join(outDir, 'shot13_cand_mother1.jpg'));
  await genImage(prompt13_mother, path.join(outDir, 'shot13_cand_mother2.jpg'));
}

run().catch(console.error);
