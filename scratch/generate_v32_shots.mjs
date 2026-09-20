import fs from 'node:fs';
import path from 'node:path';

const env = fs.readFileSync('.env', 'utf-8');
let accountId = '', token = '';
env.split('\n').forEach(l => {
  if (l.startsWith('CLOUDFLARE_ACCOUNT_ID=')) accountId = l.split('=')[1].trim();
  if (l.startsWith('CLOUDFLARE_API_TOKEN=')) token = l.split('=')[1].trim();
});

const model = '@cf/black-forest-labs/flux-1-schnell';
const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

async function genImage(prompt, outPath) {
  console.log(`Generating ${path.basename(outPath)}...`);
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
  console.log(`  Done: ${outPath} (${(fs.statSync(outPath).size/1024).toFixed(1)} KB)`);
}

const STYLE = 'Warm editorial illustration in Japanese slice-of-life domestic style. Soft warm ivory background, gentle sepia and graphite linework, clean flat colors with soft watercolor shading, warm golden pendant lamp light. High aesthetic, calm, peaceful. NO text, NO letters, NO words, NO writing, NO labels, NO signature, NO watermark, NO logo, NO glasses.';

const shots = [
  {
    name: 'shot-03-father-arrives-home',
    prompt: `${STYLE}
A warm dining room moment. Vietnamese father (34, neat short black hair, sage overshirt over cream t-shirt, clean-shaven, kind tired smile) has just arrived home and sat down at the small wooden dining table. His dark leather work messenger bag is placed neatly beside his chair on the floor. Mother (32, dark hair in low bun, beige cardigan) and young son (7, short black hair) turn to look at him with joyful, welcoming smiles. Simple dinner bowls and chopsticks are ready on the wooden table. The last family member has arrived, complete family presence.`
  },
  {
    name: 'shot-04-child-telling-story',
    prompt: `${STYLE}
Intimate dining table interaction. A young 7-year-old Vietnamese boy with messy black fringe is animatedly telling an amusing story, gesturing with his hand while holding his rice bowl. His father (34, sage overshirt) and mother (32, low bun, beige cardigan) lean forward slightly, genuinely listening with warm affectionate smiles and eye contact. Little sister (5, cute bob haircut) smiles happily. Steaming bowls of rice and simple dishes in foreground. Warm emotional connection between parents and children.`
  },
  {
    name: 'shot-08-family-dinner-routine',
    prompt: `${STYLE}
A quiet, very ordinary domestic moment during family dinner. Mother (32, dark hair in low bun, beige cardigan) gently wipes the cheek of her little 5-year-old daughter with a soft cloth napkin across the small wooden table. Father (34, sage overshirt) and 7-year-old son continue eating naturally with chopsticks, passing a small ceramic bowl of soup. Unstaged, peaceful, tender everyday family habit, no drama, warm domestic harmony.`
  },
  {
    name: 'shot-09-evening-dinner-prep',
    prompt: `${STYLE}
Everyday evening dinner preparation routine in a cozy Vietnamese apartment. Father (34, sage overshirt) is carefully placing a steaming bowl of home-cooked soup onto the wooden dining table. Mother (32, beige cardigan) is walking in from the kitchen with rice bowls, smiling. The little daughter (5) is standing on tiptoes helping set bamboo chopsticks on the table. Warm golden light from the hanging lamp, inviting home life repeating on ordinary days.`
  },
  {
    name: 'shot-11-phone-on-side-table',
    prompt: `${STYLE}
In the foreground side corner, a black smartphone rests silently face-down on a side wooden shelf away from the dining table. Across the room under the warm pendant light, the Vietnamese family of four (father, mother, son, daughter) is happily gathered around the wooden dining table, eating dinner and making eye contact, completely engaged with each other, with zero phones on the table. Clean composition showing intentional presence.`
  },
  {
    name: 'shot-13-quiet-table-after-dinner',
    prompt: `${STYLE}
A quiet, poignant still-life of the family dining table late in the evening just after dinner. Four empty ceramic rice bowls with chopsticks laid neatly across them, four wooden dining chairs slightly pulled back. A single warm golden pendant hanging lamp glows softly above, casting an amber light over the wooden table surface. Peaceful, quiet evening air, evocative nostalgia and deep warmth of a cherished family dinner that just concluded. NO people, clean elegant domestic memory.`
  },
  {
    name: 'shot-14-question-cozy-dining',
    prompt: `${STYLE}
A serene and cozy corner of a warm home dining room. A clean wooden table under a soft hanging amber lamp, a gentle ceramic teapot and a pair of simple teacups, soft warm shadows, spacious and tranquil composition. Warm nostalgic atmosphere, inviting quiet reflection about cherished family meals.`
  }
];

const outDir = 'videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/qa/v32_candidates';
fs.mkdirSync(outDir, { recursive: true });

async function main() {
  for (const s of shots) {
    const p1 = path.join(outDir, `${s.name}-a.jpg`);
    const p2 = path.join(outDir, `${s.name}-b.jpg`);
    if (!fs.existsSync(p1)) await genImage(s.prompt, p1);
    if (!fs.existsSync(p2)) await genImage(s.prompt, p2);
  }
  console.log('All candidates generated successfully!');
}

main().catch(console.error);
