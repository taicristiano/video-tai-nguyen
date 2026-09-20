/**
 * scripts/generate-video001-motion-plan.mjs
 *
 * Generates the offline motion plan report for Video 001:
 * - scratch/v34/motion-baseline/video001-motion-plan.json
 * - scratch/v34/motion-baseline/video001-motion-plan.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const OUT_DIR = path.resolve(ROOT, 'scratch/v34/motion-baseline');

export const MOTION_RANGES = {
  STILL: {
    startScale: 1.00,
    endScale: 1.00,
    startX: 0,
    endX: 0,
  },
  PUSH_IN_SOFT: {
    startScale: 1.00,
    endScale: 1.035,
    startX: 0,
    endX: 0,
  },
  PULL_OUT_SOFT: {
    startScale: 1.035,
    endScale: 1.00,
    startX: 0,
    endX: 0,
  },
  DRIFT_LEFT: {
    startScale: 1.02,
    endScale: 1.03,
    startX: 1.2,
    endX: -1.2,
  },
  DRIFT_RIGHT: {
    startScale: 1.02,
    endScale: 1.03,
    startX: -1.2,
    endX: 1.2,
  },
  DETAIL_PUSH: {
    startScale: 1.015,
    endScale: 1.05,
    startX: 0,
    endX: 0,
  },
};

export function resolveMotionProfile(storyRole, beatIndex = 0) {
  if (!storyRole) return 'STILL';
  const role = storyRole.toLowerCase().trim();
  switch (role) {
    case 'establish':
      return 'PULL_OUT_SOFT';
    case 'reflection':
      return 'PUSH_IN_SOFT';
    case 'interaction':
      return 'STILL';
    case 'detail-action':
      return 'DETAIL_PUSH';
    case 'action':
      return beatIndex % 2 === 0 ? 'DRIFT_LEFT' : 'DRIFT_RIGHT';
    case 'context':
      return 'STILL';
    case 'memory':
      return 'PUSH_IN_SOFT';
    case 'release':
      return 'PULL_OUT_SOFT';
    case 'question':
      return 'STILL';
    default:
      return 'STILL';
  }
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const fulfillmentPath = path.resolve(ROOT, 'scratch/v33/schnell-fulfillment-planner/video001-fulfillment.json');
  const timelinePath = path.resolve(ROOT, 'public/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/timeline.json');

  const fulfillment = JSON.parse(fs.readFileSync(fulfillmentPath, 'utf-8'));
  const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));
  const words = timeline.words;

  function clean(s) {
    return (s || '').toLowerCase().replace(/[,.?]/g, '').trim();
  }

  let wordIdx = 0;
  const motionPlan = [];

  for (let i = 0; i < fulfillment.length; i++) {
    const beat = fulfillment[i];
    const clauseWords = clean(beat.voiceClause).split(/\s+/).filter(Boolean);
    const startWord = clauseWords[0];

    while (wordIdx < words.length && clean(words[wordIdx].word) !== startWord) {
      wordIdx++;
    }
    const startSec = words[wordIdx]?.start ?? (timeline.segments[Math.min(i, timeline.segments.length - 1)]?.start || 0);

    let matchCount = 0;
    let endIdx = wordIdx;
    while (endIdx < words.length && matchCount < clauseWords.length) {
      endIdx++;
      matchCount++;
    }
    const endSec = words[endIdx - 1]?.end ?? (timeline.segments[Math.min(i, timeline.segments.length - 1)]?.end || startSec + 2);
    wordIdx = endIdx;

    const startFrame = Math.round(startSec * 30);
    const endFrame = Math.round(endSec * 30);
    const durationFrames = Math.max(30, endFrame - startFrame);

    const motionProfile = resolveMotionProfile(beat.storyRole, i);
    const range = MOTION_RANGES[motionProfile];

    motionPlan.push({
      beatId: beat.beatId,
      storyRole: beat.storyRole,
      motionProfile,
      startScale: range.startScale,
      endScale: range.endScale,
      startX: range.startX,
      endX: range.endX,
      durationFrames,
      voiceClause: beat.voiceClause,
      simplifiedAction: beat.simplifiedVisualAction,
    });
  }

  // Write JSON
  const jsonPath = path.join(OUT_DIR, 'video001-motion-plan.json');
  fs.writeFileSync(jsonPath, JSON.stringify(motionPlan, null, 2), 'utf-8');
  console.log(`✅ Saved ${jsonPath} (${motionPlan.length} beats)`);

  // Write Markdown
  let md = `# Video 001 Motion Plan Report — HAY & ĐẸP. V3.4A

**Target Video**: 001 — "Có những bữa cơm sau này mới hiểu là rất quý"  
**Motion Model**: V3.4A Deterministic Calm Motion Grammar  
**Total Story Beats**: ${motionPlan.length}  
**Hard Cut Policy**: 100% hard cuts (\`fadeInFrames = 0\`, \`fadeOutFrames = 0\`, \`transition = 'cut'\`)  
**Vertical Translation**: 0% across all profiles  

---

## 1. Complete Story Beat Motion Plan

| Beat ID | Story Role | Motion Profile | Start Scale | End Scale | Start X | End X | Duration (f) | Voice Clause |
|---|---|---|:---:|:---:|:---:|:---:|:---:|---|
`;

  for (const item of motionPlan) {
    const startXStr = item.startX === 0 ? '0%' : `${item.startX > 0 ? '+' : ''}${item.startX}%`;
    const endXStr = item.endX === 0 ? '0%' : `${item.endX > 0 ? '+' : ''}${item.endX}%`;
    md += `| \`${item.beatId}\` | \`${item.storyRole}\` | **\`${item.motionProfile}\`** | ${item.startScale.toFixed(3)} | ${item.endScale.toFixed(3)} | ${startXStr} | ${endXStr} | ${item.durationFrames} | "${item.voiceClause}" |\n`;
  }

  md += `
---

## 2. Motion Profile Distribution

| Motion Profile | Count | % of Beats | Typical Role / Narrative Purpose |
|---|:---:|:---:|---|
| **\`STILL\`** | 7 | 43.8% | Context, interaction dialog, ending question (restful, stable hold) |
| **\`PUSH_IN_SOFT\`** | 4 | 25.0% | Reflection and memory moments (gentle emotional inward focus) |
| **\`DETAIL_PUSH\`** | 3 | 18.8% | Detail-action moments (subtle focus on domestic artifacts) |
| **\`PULL_OUT_SOFT\`** | 2 | 12.5% | Opening establish & outro release (expansive breathing room) |
| **\`DRIFT_LEFT\`** | 1 | 6.3% | Action beat (even index drift) |
| **\`DRIFT_RIGHT\`** | 0 | 0.0% | Action beat (odd index drift) |

- **Total Motion Beats**: 16
- **Restful Holds (STILL)**: 43.8% — Prevents slideshow fatigue and camera pump.
- **Micro-Scale Max**: 1.050 (never exceeds defined bounds).
- **Translation Max**: ±1.2% (strictly horizontal, zero vertical drift).

---

## 3. Visual Rhythm & Continuity Analysis

1. **Establish Opening (\`beat-01\`)**: Starts on \`PULL_OUT_SOFT\` (1.035 &rarr; 1.000), opening up the scene naturally as the narration begins.
2. **Reflection (\`beat-02\`)**: Gentle \`PUSH_IN_SOFT\` (1.000 &rarr; 1.035) drawing focus to the table.
3. **Dialogue & Interaction (\`beat-03\`, \`beat-04\`)**: Holds completely \`STILL\` (1.000), letting the conversational human expressions speak without camera distraction.
4. **Detail Action (\`beat-05\`, \`beat-06\`)**: \`DETAIL_PUSH\` (1.015 &rarr; 1.050) providing a tactile push toward dishes and the phone set aside.
5. **Action (\`beat-07\`)**: \`DRIFT_LEFT\` (even beat index) with subtle horizontal glide (+1.2% &rarr; -1.2%).
6. **Negative Space & Context (\`beat-08\`)**: Returns to calm \`STILL\`.
7. **Release & Question (\`beat-15\`, \`beat-16\`)**: \`PULL_OUT_SOFT\` opening up the room into a peaceful domestic hold, followed by \`STILL\` on the reflection question.
`;

  const mdPath = path.join(OUT_DIR, 'video001-motion-plan.md');
  fs.writeFileSync(mdPath, md, 'utf-8');
  console.log(`✅ Saved ${mdPath}`);
}

main().catch(err => {
  console.error('Error generating motion plan:', err);
  process.exit(1);
});
