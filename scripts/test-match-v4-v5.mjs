import { parseHayDepVideos } from './parse-hay-dep-videos.mjs';
import { matchSceneAsset } from './smart-asset-matcher.mjs';

const vids = parseHayDepVideos();
for (const idx of [3, 4]) {
  const v = vids[idx];
  console.log(`\n--- Video ${v.index}: ${v.title} ---`);
  console.log('Statement:', v.statementText);
  console.log('Visual Priorities:', v.visualPriorities);
  const paras = v.voiceScriptText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const used = new Set();
  let last = null;
  paras.forEach((p, i) => {
    const isEnding = i === paras.length - 1;
    const isHook = i === 0;
    const prio = v.visualPriorities[i % v.visualPriorities.length] || '';
    const match = matchSceneAsset(p, prio, used, last, isEnding, isHook);
    last = match.asset.id;
    console.log(`  Scene ${i + 1}: "${p.slice(0, 50)}..."`);
    console.log(`     -> [${match.asset.id}] ${match.asset.desc}`);
    console.log(`     -> Theme: ${match.theme}`);
  });
}
