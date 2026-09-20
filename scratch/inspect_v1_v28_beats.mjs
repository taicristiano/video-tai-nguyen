import fs from 'fs';
import path from 'path';
import { getPlanForVideo, routeSchnellBeat } from '../scripts/test-hay-dep-schnell-capability-router.mjs';

for (const vid of [1, 28]) {
  const data = getPlanForVideo(vid);
  console.log(`\n================ VIDEO ${vid} (${data.video.title}) ================`);
  for (const b of data.plan.beats) {
    const routeInfo = routeSchnellBeat({ beat: b, cast: data.cast });
    console.log(`[${b.id}] (${b.storyRole}) Route: ${routeInfo.route}`);
    console.log(`   Voice: "${b.voiceClause}"`);
    console.log(`   Intent: "${b.visualIntent}"`);
    console.log(`   Action: "${b.visualAction}"`);
    console.log(`   Members: [${(b.presentMembers || []).join(', ')}] | Strategy: ${b.assetStrategy}`);
  }
}
