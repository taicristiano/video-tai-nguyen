import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { parseHumanInsightContent } from '../src/templates/human-insight/cinematic-light/contentParserRuntime.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

export function parseHayDepVideos() {
  const filePath = path.join(ROOT, 'resources', 'hay-va-dep', 'HAY_DEP_100_VIDEO_TRAMAI_PROMPTS_ORDERED.md');
  const raw = fs.readFileSync(filePath, 'utf-8');

  // Split by "# VIDEO "
  const sections = raw.split(/^# VIDEO\s+/m);
  const videos = [];

  for (let i = 1; i < sections.length; i++) {
    const sec = sections[i];
    const headerLine = sec.split('\n')[0].trim();
    // headerLine like: "001 — Có những bữa cơm sau này mới hiểu là rất quý"
    const headerMatch = headerLine.match(/^(\d+)\s*[-—]\s*(.*)$/);
    const videoIndex = headerMatch ? parseInt(headerMatch[1], 10) : i;
    const rawTitle = headerMatch ? headerMatch[2].trim() : '';

    // Extract prompt block inside ```text ... ```
    const promptMatch = sec.match(/```text\r?\n([\s\S]*?)\r?\n```/);
    if (!promptMatch) {
      console.warn(`Warning: No prompt block found for video ${videoIndex}`);
      continue;
    }

    const fullPrompt = promptMatch[1].trim();
    const cleanContext = fullPrompt.replace(/^\/gen-video[^\n]*\n+/i, '').trim();

    // Category info from markdown section header (e.g., **Nhóm nội dung:** Gia đình & tình thân)
    const catMatch = sec.match(/\*\*Nhóm nội dung:\*\*\s*([^\r\n]+)/i);
    const category = catMatch ? catMatch[1].trim() : '';

    // Parse via canonical content parser SSOT
    const parsed = parseHumanInsightContent(cleanContext, {
      index: videoIndex,
      rawTitle,
      category,
    });

    videos.push({
      index: videoIndex,
      part: parsed.part || String(videoIndex),
      rawTitle,
      title: parsed.title || rawTitle,
      series: parsed.series,
      category,
      fullPrompt,
      cleanContext,
      voiceScriptText: parsed.canonicalVoice,
      statementText: parsed.statementText,
      finalQuestionText: parsed.finalQuestionText,
      visualPriorities: parsed.visualSemantics,
      durationPreference: parsed.durationPreference,
    });
  }

  return videos;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const vids = parseHayDepVideos();
  console.log(`Parsed ${vids.length} videos from HAY & ĐẸP catalog.`);
  if (vids.length > 0) {
    console.log('Video 1:', {
      index: vids[0].index,
      part: vids[0].part,
      title: vids[0].title,
      series: vids[0].series,
      category: vids[0].category,
      statement: vids[0].statementText,
      voiceLength: vids[0].voiceScriptText.length,
      visualPrioritiesCount: vids[0].visualPriorities.length,
    });
    console.log('Video 100:', {
      index: vids[99].index,
      part: vids[99].part,
      title: vids[99].title,
      series: vids[99].series,
      category: vids[99].category,
      statement: vids[99].statementText,
      voiceLength: vids[99].voiceScriptText.length,
      visualPrioritiesCount: vids[99].visualPriorities.length,
    });
  }
}
