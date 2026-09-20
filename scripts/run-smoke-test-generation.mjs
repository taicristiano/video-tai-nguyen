/**
 * scripts/run-smoke-test-generation.mjs
 * Generates the 5 fresh assets for Production Smoke Test 01 (video001)
 * Model: @cf/black-forest-labs/flux-1-schnell ONLY
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  callCloudflareSchnell,
  checkMachineIntegrity,
  createContactSheet,
  MODEL_ID,
} from './run-v36-generalization.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const SMOKE_DIR = path.join(ROOT, 'scratch', 'production-smoke', 'video001');
const ASSETS_DIR = path.join(SMOKE_DIR, 'assets');
const CANDIDATES_DIR = path.join(SMOKE_DIR, 'candidates');
const PUBLIC_DIR = path.join(ROOT, 'public', 'scratch', 'production-smoke', 'video001');

fs.mkdirSync(ASSETS_DIR, { recursive: true });
fs.mkdirSync(CANDIDATES_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

const FRESH_TARGETS = [
  {
    slotId: 'scene-07',
    file: 'shot-07.jpg',
    shotIndex: 7,
    title: 'Scene 07: Reflection in daily life',
    voice: 'Nhưng chính vì nhỏ, chúng có cơ hội xuất hiện trong những ngày thật.',
    peopleContract: '1 visible adult',
    shortIntent: 'Quiet domestic reflection holding ceramic bowl',
    prompt: `CLEAN FLAT 2D CARTOON EDITORIAL ILLUSTRATION ONLY.
Hand-drawn magazine editorial illustration on warm paper.
Clearly illustrated, strictly non-photorealistic.

SCENE:
Exactly one visible adult in a warm, quiet domestic moment at home.
The adult pauses peacefully near a simple wooden kitchen counter or table, holding a plain ceramic bowl or resting one hand calmly on the table.
Gentle contemplative expression, serene posture.

PALETTE:
Warm ivory and cream wall background.
Muted sage green clothing.
Warm medium wood furniture.
Charcoal sepia contour linework.
Restrained terracotta accent.
Low saturation, completely matte.

CLEAN SURFACE RULE:
Every wall, counter, bowl, and object is completely plain.
NO words.
NO letters.
NO numbers.
NO symbols.
NO pseudo-text.
NO labels.
NO signs.
NO brand logos.
NO artist signature.
NO watermark.

HARD EXCLUSIONS:
No photorealism, no realistic skin, no photographic lighting, no 3D render, no anime, no extra people, no missing or distorted fingers.
Full-frame clean illustration, no borders, no letterbox.`
  },
  {
    slotId: 'scene-08-beat-01',
    file: 'shot-08-vb1.jpg',
    shotIndex: 8,
    title: 'Scene 08 Beat 1: Keeping a meal together',
    voice: 'Tuần này, thử giữ lại ít nhất một bữa ăn',
    peopleContract: '1 visible adult',
    shortIntent: 'Adult seated calmly at wooden dining table',
    prompt: `CLEAN FLAT 2D CARTOON EDITORIAL ILLUSTRATION ONLY.
Hand-drawn magazine editorial illustration on warm paper.
Clearly illustrated, strictly non-photorealistic.

SCENE:
Exactly one visible adult seated comfortably at a warm wooden dining table at home.
On the table is a simple plain ceramic bowl of rice and a pair of plain wooden chopsticks.
The adult sits quietly in peaceful expectation of a shared meal.
Warm, serene, grounded domestic mood.

PALETTE:
Warm ivory and cream background.
Muted sage clothing.
Warm medium wood table and chair.
Charcoal sepia linework.
Small terracotta accent.
Matte, low saturation.

CLEAN SURFACE RULE:
Plates and bowls are completely plain ceramics.
Table is plain solid wood with natural grain lines.
NO phones.
NO screens.
NO text.
NO letters.
NO numbers.
NO symbols.
NO pseudo-writing.
NO logo.
NO signature.
NO watermark.

HARD EXCLUSIONS:
No photorealism, no photographic lighting, no 3D render, no extra people, no distorted limbs.
Full-frame illustration, no black bars, no frame.`
  },
  {
    slotId: 'scene-08-beat-02',
    file: 'shot-08-vb2.jpg',
    shotIndex: 9,
    title: 'Scene 08 Beat 2: Phone kept away from table',
    voice: 'và điện thoại không nằm giữa bàn.',
    peopleContract: '0 people (still life)',
    shortIntent: 'Dining table surface without any phones',
    prompt: `CLEAN FLAT 2D CARTOON EDITORIAL ILLUSTRATION ONLY.
Hand-drawn editorial still-life illustration on warm paper.
Clearly illustrated, strictly non-photorealistic.

STILL LIFE ONLY. ZERO PEOPLE:
No people, no hands, no faces, no human body parts visible.

SCENE:
A close detail view of a clean wooden dining table surface prepared for a home meal.
On the tabletop rests a single plain ceramic rice bowl, a small side dish, and a pair of plain wooden chopsticks resting neatly on a wooden chopstick rest.
The tabletop is completely free of electronic devices:
NO smartphone, NO phone, NO screen, NO gadget.
A simple, peaceful, unplugged table setting.

PALETTE:
Warm ivory and cream background.
Warm medium wood tabletop with soft grain.
Muted sage and terracotta glazed plain ceramics.
Charcoal sepia linework.
Low saturation, completely matte.

HARD EXCLUSIONS:
NO phones anywhere in the image.
NO text, NO letters, NO numbers, NO symbols, NO labels, NO brand logos, NO signature, NO watermark.
No photorealism, no 3D render, no glossy reflection.
Full-frame clean illustration, no borders.`
  },
  {
    slotId: 'scene-09-beat-02',
    file: 'shot-09-vb2.jpg',
    shotIndex: 11,
    title: 'Scene 09 Beat 2: Quiet room after changing schedules',
    voice: 'Đến khi lịch mỗi người khác đi, ta mới biết chúng từng đẹp đến mức nào.',
    peopleContract: '0 people (still life / interior)',
    shortIntent: 'Empty chairs by dining table in afternoon light',
    prompt: `CLEAN FLAT 2D CARTOON EDITORIAL ILLUSTRATION ONLY.
Hand-drawn magazine editorial illustration on warm paper.
Clearly illustrated, strictly non-photorealistic.

STILL LIFE / INTERIOR ONLY. ZERO PEOPLE:
No people, no human figures, no silhouettes, no faces, no hands.

SCENE:
A quiet, poignant after-moment in a warm domestic dining room.
Two empty wooden chairs stand by a simple wooden dining table in soft, warm afternoon light.
On the table is an empty ceramic cup and a neatly folded cloth napkin, showing peaceful human traces after a meal.
Quiet, contemplative, nostalgic atmosphere of shifting time.

PALETTE:
Warm ivory and cream walls.
Warm medium wood furniture.
Soft muted sage accents.
Gentle charcoal and sepia linework.
Low saturation, matte paper texture.

CLEAN SURFACE RULE:
Walls and furniture are completely plain.
NO wall calendars, NO posters, NO writing, NO letters, NO numbers, NO symbols, NO brand logos, NO signature, NO watermark.

HARD EXCLUSIONS:
No photorealism, no photographic render, no 3D CGI, no people, no text pollution.
Full-frame illustration, no black bars.`
  },
  {
    slotId: 'scene-10',
    file: 'shot-10.jpg',
    shotIndex: 12,
    title: 'Scene 10: Contemplative question',
    voice: 'Nhà bạn có bữa ăn nào dù món rất đơn giản nhưng vẫn nhớ lâu không?',
    peopleContract: '1 visible adult',
    shortIntent: '1 adult holding cup in thoughtful question pose',
    prompt: `CLEAN FLAT 2D CARTOON EDITORIAL ILLUSTRATION ONLY.
Hand-drawn magazine editorial illustration on warm paper.
Clearly illustrated, strictly non-photorealistic.

SCENE:
Exactly one visible adult seated at a simple wooden table at home.
The adult holds a warm ceramic mug or cup with both hands, looking slightly aside with a gentle, reflective, nostalgic smile.
Contemplative, heartfelt mood connecting with a fond memory of a simple meal.

PALETTE:
Warm ivory and cream background.
Muted sage clothing.
Warm medium wood tabletop.
Charcoal sepia linework.
Restrained warm amber accent.
Low saturation, completely matte.

CLEAN SURFACE RULE:
Cup and tabletop are completely plain.
NO words.
NO letters.
NO numbers.
NO symbols.
NO pseudo-text.
NO logos.
NO signature.
NO watermark.

HARD EXCLUSIONS:
No photorealism, no photographic lighting, no 3D render, no extra people, no distorted hands, normal 5-finger hands.
Full-frame clean illustration, no borders.`
  }
];

export async function runGeneration() {
  console.log('=== HAY & ĐẸP. PRODUCTION SMOKE TEST 01 ASSET GENERATION ===');
  console.log(`Model: ${MODEL_ID}`);
  console.log(`Targets: ${FRESH_TARGETS.length} fresh production slots\n`);

  for (const target of FRESH_TARGETS) {
    const targetAssetPath = path.join(ASSETS_DIR, target.file);
    const targetPublicPath = path.join(PUBLIC_DIR, target.file);

    if (fs.existsSync(targetAssetPath)) {
      const existingBuf = fs.readFileSync(targetAssetPath);
      const integrity = checkMachineIntegrity(existingBuf);
      if (integrity.ok) {
        console.log(`[EXISTS] ${target.slotId} (${target.file}): ${existingBuf.length} bytes. Skipping generation.`);
        if (!fs.existsSync(targetPublicPath)) {
          fs.copyFileSync(targetAssetPath, targetPublicPath);
        }
        continue;
      }
    }

    console.log(`[GENERATING] ${target.slotId} (${target.file})...`);
    let selected = false;
    let attempt = 1;
    const maxAttempts = 3;

    while (!selected && attempt <= maxAttempts) {
      console.log(`  Calling Cloudflare FLUX.1 Schnell [Attempt ${attempt}/${maxAttempts}]...`);
      let imageBuf;
      try {
        imageBuf = await callCloudflareSchnell(target.prompt);
      } catch (err) {
        if (err.httpStatus === 429) {
          console.error(`  [PAUSED_QUOTA] Cloudflare HTTP 429 encountered on ${target.slotId} attempt ${attempt}.`);
          const quotaErr = new Error(`PAUSED_QUOTA on ${target.slotId}`);
          quotaErr.code = 'PAUSED_QUOTA';
          throw quotaErr;
        }
        console.error(`  Generation error: ${err.message}`);
        throw err;
      }

      const candidateFile = path.join(CANDIDATES_DIR, `${target.slotId}-att${attempt}.jpg`);
      fs.writeFileSync(candidateFile, imageBuf);

      const integrity = checkMachineIntegrity(imageBuf);
      if (integrity.ok) {
        fs.copyFileSync(candidateFile, targetAssetPath);
        fs.copyFileSync(candidateFile, targetPublicPath);
        console.log(`  ✅ ${target.slotId} [Attempt ${attempt}]: Machine integrity PASS (${imageBuf.length} bytes). Awaiting visual review.`);
        selected = true;
      } else {
        console.warn(`  ❌ ${target.slotId} [Attempt ${attempt}]: Machine integrity FAIL - ${integrity.reason}`);
        attempt++;
      }
    }

    if (!selected) {
      throw new Error(`BLOCKED_ASSET: ${target.slotId} failed machine integrity after ${maxAttempts} attempts.`);
    }
  }

  console.log('\nAll 5 fresh assets generated and verified for machine integrity.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runGeneration().catch(err => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  });
}
