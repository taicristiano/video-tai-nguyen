import os

with open('scripts/human-insight-image.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace duplicate CHARACTER_CASTS with reading JSON
old_casts_marker = 'export const CHARACTER_CASTS = {'
idx_start = content.find(old_casts_marker)
idx_end = content.find('export function inferCastId', idx_start)
idx_close = content.rfind('};', idx_start, idx_end) + 2

new_casts_code = """const CASTS_PATH = path.join(
  ROOT,
  'src/templates/human-insight/cinematic-light/character-casts.json',
);

export const CHARACTER_CASTS = JSON.parse(
  fs.readFileSync(CASTS_PATH, 'utf-8'),
);
"""

content = content[:idx_start] + new_casts_code + content[idx_close:]

# 2. Add CLI args in parseArgs
old_defaults = """    shotScale: '',
    composition: '',
  };"""
new_defaults = """    shotScale: '',
    composition: '',
    storyRole: '',
    action: '',
    worldId: '',
    worldLock: '',
  };"""
assert old_defaults in content, 'old_defaults not found'
content = content.replace(old_defaults, new_defaults, 1)

old_cli_branches = """    } else if (arg === '--composition') {
      args.composition = argv[++i];"""
new_cli_branches = """    } else if (arg === '--composition') {
      args.composition = argv[++i];
    } else if (arg === '--story-role') {
      args.storyRole = argv[++i];
    } else if (arg === '--action') {
      args.action = argv[++i];
    } else if (arg === '--world-id') {
      args.worldId = argv[++i];
    } else if (arg === '--world-lock') {
      args.worldLock = argv[++i];"""
assert old_cli_branches in content, 'old_cli_branches not found'
content = content.replace(old_cli_branches, new_cli_branches, 1)

# 3. Add to scene object in main
old_scene = """    visual: args.visual,
    shotScale: args.shotScale || undefined,
    composition: args.composition || undefined,
  };"""
new_scene = """    visual: args.visual,
    storyRole: args.storyRole || undefined,
    action: args.action || undefined,
    worldId: args.worldId || undefined,
    worldLock: args.worldLock || undefined,
    shotScale: args.shotScale || undefined,
    composition: args.composition || undefined,
  };"""
assert old_scene in content, 'old_scene not found'
content = content.replace(old_scene, new_scene, 1)

# 4. Replace buildPrompt and add buildCastPrompt, buildNegativeRules
old_build_prompt_start = content.find('function buildPrompt(scene, castId) {')
old_build_prompt_end = content.find('export function computeSeeds(', old_build_prompt_start)

new_prompts_code = """function buildCastPrompt(scene, castId) {
  if (castId && CHARACTER_CASTS[castId]) {
    return CHARACTER_CASTS[castId].castLockPrompt;
  }

  if (scene.character === 'male') {
    return [
      'CAST:',
      'Use one natural Vietnamese male-presenting editorial character if a person is needed.',
      'Keep age, hairstyle, wardrobe and facial design internally coherent within this scene.',
      'Do not use stick figures.',
    ].join('\\n');
  }

  if (scene.character === 'female') {
    return [
      'CAST:',
      'Use one natural Vietnamese female-presenting editorial character if a person is needed.',
      'Keep age, hairstyle, wardrobe and facial design internally coherent within this scene.',
      'Do not use stick figures.',
    ].join('\\n');
  }

  return [
    'CAST:',
    'Use natural Vietnamese editorial human characters only when the scene needs people.',
    'Do not use stick figures, diagram people, icon people, mannequins, or infographic characters.',
    'Do not add random extra people.',
  ].join('\\n');
}

function buildNegativeRules(scene) {
  const rules = [
    'NO TEXT, NO LABELS, NO LOGO, NO WATERMARK.',
    'No posed camera-facing family portrait unless explicitly requested.',
    'No random extra people.',
    'No duplicated children.',
    'No sudden glasses change.',
    'No sudden age change.',
    'No luxury showroom look.',
  ];

  if (scene.storyRole === 'detail-action') {
    rules.push(
      'The object must be actively used by a hand/person whenever possible; avoid product photography.',
    );
  }

  if (scene.storyRole === 'interaction') {
    rules.push(
      'Show visible action and reaction between people; avoid isolated portrait faces.',
    );
  }

  if (scene.storyRole === 'memory') {
    rules.push(
      'Do not invent a different family or different recurring faces.',
    );
  }

  return rules.join('\\n');
}

function buildPrompt(scene, castId) {
  const castPrompt = buildCastPrompt(scene, castId);
  const shotPrompt = buildShotPrompt(scene);

  const worldPrompt = scene.worldLock
    ? scene.worldLock
    : [
        'WORLD:',
        'Warm believable Vietnamese everyday-life environment.',
        'Ivory / warm cream, muted sage, warm wood, charcoal details.',
      ].join('\\n');

  const rolePrompt = scene.storyRole
    ? `STORY ROLE:\\n${scene.storyRole}`
    : '';

  const actionPrompt = scene.action
    ? `SPECIFIC ACTION:\\n${scene.action}`
    : '';

  const visual = scene.visual ||
    `Show one concrete everyday action that directly communicates: "${scene.text}"`;

  return [
    STYLE_PROMPT,
    castPrompt,
    worldPrompt,
    rolePrompt,
    actionPrompt,
    shotPrompt,
    `SCENE:\\n${visual}`,
    buildNegativeRules(scene),
  ].filter(Boolean).join('\\n\\n');
}

"""

content = content[:old_build_prompt_start] + new_prompts_code + content[old_build_prompt_end:]

# 5. Add storyRole, worldId, continuityGroup to appendGeneratedAsset
old_append = """    castId: scene.castId || undefined,
    reuse: false,"""
new_append = """    castId: scene.castId || undefined,
    storyRole: scene.storyRole || undefined,
    worldId: scene.worldId || undefined,
    continuityGroup: scene.continuityGroup || undefined,
    reuse: false,"""
assert old_append in content, 'old_append not found'
content = content.replace(old_append, new_append, 1)

# 6. Add continuity scoring in scoreAsset
old_score_character = """  if (
    scene.character !== 'neutral'
    && assetCharacter !== 'neutral'
    && assetCharacter !== scene.character
  ) {
    score -= 8;
    reasons.push(`character-mismatch:${assetCharacter}`);
  }"""

new_score_character = """  if (
    scene.character !== 'neutral'
    && assetCharacter !== 'neutral'
    && assetCharacter !== scene.character
  ) {
    score -= 8;
    reasons.push(`character-mismatch:${assetCharacter}`);
  }

  if (scene.castId && asset.castId) {
    if (scene.castId === asset.castId) {
      score += 20;
      reasons.push(`cast:${scene.castId}`);
    } else {
      score -= 40;
      reasons.push(`cast-mismatch:${asset.castId}`);
    }
  }

  if (scene.worldId && asset.worldId) {
    if (scene.worldId === asset.worldId) {
      score += 8;
      reasons.push(`world:${scene.worldId}`);
    } else {
      score -= 8;
      reasons.push(`world-mismatch:${asset.worldId}`);
    }
  }

  if (scene.storyRole && asset.storyRole === scene.storyRole) {
    score += 6;
    reasons.push(`story-role:${scene.storyRole}`);
  }"""

assert old_score_character in content, 'old_score_character not found'
content = content.replace(old_score_character, new_score_character, 1)

with open('scripts/human-insight-image.mjs', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated scripts/human-insight-image.mjs successfully!')
