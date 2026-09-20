import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const manifestPath = path.join(ROOT, 'public', 'assets', 'human-insight', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const assets = manifest.assets;

/**
 * Curated pools of high-quality assets for HAY & ĐẸP. / human-insight themes
 */
export const THEME_POOLS = {
  // Bàn làm việc, góc làm việc, reset bàn, máy tính, học tập yên tĩnh
  desk_workspace: [
    'life-workday-coding-01',        // cozy_hand_drawn_home_office.png
    'remote_work_desk_sketch.png',   // life-work-call-client-01
    'life-learning-online-course-01',// cozy_pencil_sketch_online_study_scene.png
    'thoughtful_office_workspace_sketch.png',
    'sketchbook_progress_a_cozy_study_journey.png',
    'quiet-reading-home-01',
    'life-growth-start-again-01'     // 146_start_again.png
  ],

  // Căn phòng, dọn dẹp, lối đi, quét nhà, lau dọn, sắp xếp đồ
  home_declutter_room: [
    'cleaning-home-01',              // A person tidies living room with broom & box
    'life-home-cleaning-living-room-01', // 116_cleaning_living_room.png
    'life-home-sweeping-room-01',    // 073_sweeping_living_room.png
    'decluttering-room-01',          // decluttering room
    'life-home-folding-laundry-01',  // 101_folding_laundry.png
    'waking-up-routine-01',          // Opens curtains, morning light enters
    'moving-home-01',                // Moving boxes into clean room
    'watering-plants-01',            // Watering plants on balcony
    'washing-dishes-01'              // Washing dishes
  ],

  // Bếp, rửa bát, cốc nước, dọn bếp
  kitchen_dishes: [
    'washing-dishes-01',
    'cooking-dinner-01',
    'life-home-cleaning-living-room-01'
  ],

  // Gập chăn, giường ngủ, phòng ngủ
  bed_folding_blanket: [
    'life-home-folding-laundry-01',  // 101_folding_laundry.png
    'sleep-routine-01',
    'waking-up-routine-01'
  ],

  // Bữa ăn, gia đình, bữa tối, quây quần, ăn cơm
  family_dinner_meal: [
    'family-dinner-connection-01',   // Family eating warm meal together at dining table
    'warm_family_conversation_at_home.png',
    'cozy_parent_child_block_play.png', // life-family-play-with-child-01
    'cooking-dinner-01',
    '065_group_dinner_friends.png'
  ],

  // Cuộc gọi, gọi điện, video call, hỏi thăm, điện thoại
  phone_call_connect: [
    'life-family-video-call-parents-01', // cozy_video_call_with_elderly_parents.png
    'life-social-evening-phone-call-01', // 130_evening_phone_call.png
    'life-family-call-check-in-01',       // 194_calling_family.png
    'life-social-reconnecting-video-call-01', // 066_reconnecting_video_call.png
    'job-offer-call-01'
  ],

  // Đi bộ, dạo bộ, công viên, cuối tuần, tản bộ
  walking_park_outdoor: [
    'life-health-evening-walk-01',   // 193_evening_walk_after_dinner.png
    'life-health-park-walk-01',       // 080_park_walk.png
    'walking-and-talking-01',        // Two friends walking thoughtfully in quiet park
    'life-social-friends-walk-together-01', // 062_friends_walk_together.png
    'life-health-morning-sun-walk-01',// 098_morning_sun_walk.png
    'evening-walk-01'
  ],

  // Mệt mỏi, cạn năng lượng, kiệt sức, áp lực
  tired_fatigue_overwhelmed: [
    'cf-da-bao-gio-tat-bao-602aa827-2', // Tired person on bed looking up
    'night-study-01',                   // Tired at desk late night
    'sleep-routine-01',                 // Puts phone away, turns off lamp
    'overwhelmed_by_notifications.png', // Too many calls & messages
    'cf-do-ly-ca-phe-nguoi-11654080',   // Cold coffee cup, self-doubt
    'life-selfcare-put-phone-away-01',  // 149_put_phone_away.png
    'recovering-energy-01',
    'resting-sick-day-01'
  ],

  // Khoảng thở, kết luận yên, bình yên, hoàng hôn, suy ngẫm
  peaceful_sunset_reflection: [
    'life-reflection-watch-sunset-01',  // 137_watching_sunset.png
    'gratitude-simple-life-01',         // Warm drink on balcony sunrise
    'life-reflection-alone-in-park-01', // 132_thinking_on_park_bench.png
    'life-commute-bus-window-01',       // peaceful_commute_by_the_window.png
    'quiet-reading-home-01',
    'rainy-day-window-01'
  ],

  // Tiền bạc, mua sắm, giá tiền, giảm giá, chi tiêu
  finance_shopping_buy: [
    'shopping-impulse-01',
    'saving-for-goal-01',
    'financial-planning-01',
    'payday-budget-01',
    'home-investment-04',
    'paying-bills-01',
    'life-finance-online-transfer-01' // 084_online_money_transfer.png
  ],

  // Đi lại, xe buýt, xuống xe, tàu, commute
  commute_bus_transit: [
    'life-commute-bus-window-01',
    'waiting_at_the_city_crosswalk.png',
    'morning_commute_to_the_office.png',
    '110_checking_essentials_before_leaving.png'
  ],

  // Bạn bè, kết nối, trò chuyện, cà phê, đồng hành
  friends_social_presence: [
    '061_friends_coffee_chat.png',
    '068_laughing_with_friends.png',
    'walking-and-talking-01',
    'warm_family_conversation_at_home.png',
    'team-support-01'
  ],

  // Bắt đầu lại, trang mới, bước nhỏ, thói quen nhỏ
  start_again_habit: [
    'life-growth-start-again-01',      // 146_start_again.png
    'small-habit-progress-01',
    'sketchbook_progress_a_cozy_study_journey.png',
    'planting-community-tree-01'
  ]
};

// Normalize text for matching
function normalizeText(txt) {
  return (txt || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

/**
 * Detect the theme intent of a scene text and its visual priority
 */
function detectTheme(sceneText, visualPriority, isEnding, isHook) {
  const norm = normalizeText(`${sceneText} ${visualPriority || ''}`);

  if (isEnding || norm.includes('ket luan yen') || norm.includes('khoang tho') || norm.includes('hoang hon') || norm.includes('nhe hon')) {
    return 'peaceful_sunset_reflection';
  }

  // Kitchen / cup / dishes
  if (norm.includes('bep') || norm.includes('coc') || norm.includes('ly') || norm.includes('rua bat') || norm.includes('chen dia')) {
    return 'kitchen_dishes';
  }

  // Blanket / folding / bed
  if (norm.includes('chan') || norm.includes('gap chan') || norm.includes('giuong')) {
    return 'bed_folding_blanket';
  }

  // Commute / bus / transit
  if (norm.includes('xe buyt') || norm.includes('xuong xe') || norm.includes('di lam') || norm.includes('tram xe')) {
    return 'commute_bus_transit';
  }

  if (norm.includes('bua toi') || norm.includes('an com') || norm.includes('an toi') || norm.includes('bua an') || norm.includes('gia dinh')) {
    return 'family_dinner_meal';
  }

  if (norm.includes('cuoc goi') || norm.includes('dien thoai') || norm.includes('goi dien') || norm.includes('video call') || norm.includes('hoi tham')) {
    return 'phone_call_connect';
  }

  if (norm.includes('di bo') || norm.includes('dao bo') || norm.includes('cong vien') || norm.includes('cuoi tuan') || norm.includes('tan bo')) {
    return 'walking_park_outdoor';
  }

  if (norm.includes('chiec ban') || norm.includes('ban lam viec') || norm.includes('mat ban') || norm.includes('reset ban') || norm.includes('goc ban') || norm.includes('don mat ban')) {
    return 'desk_workspace';
  }

  if (norm.includes('loi di') || norm.includes('do tam') || norm.includes('cho co dinh') || norm.includes('don dep') || norm.includes('quet nha') || norm.includes('goc vuong') || norm.includes('can phong') || norm.includes('phong de song') || norm.includes('don nha')) {
    return 'home_declutter_room';
  }

  if (norm.includes('met') || norm.includes('can nang luong') || norm.includes('kiet suc') || norm.includes('ap luc') || norm.includes('kho chiu') || norm.includes('qua tai')) {
    return 'tired_fatigue_overwhelmed';
  }

  if (norm.includes('mua') || norm.includes('gia tien') || norm.includes('giam gia') || norm.includes('mon do') || norm.includes('tiet kiem') || norm.includes('chi tieu')) {
    return 'finance_shopping_buy';
  }

  if (norm.includes('ban be') || norm.includes('tro chuyen') || norm.includes('co mat') || norm.includes('gan ket') || norm.includes('moi quan he')) {
    return 'friends_social_presence';
  }

  if (norm.includes('thu nghiem') || norm.includes('bat dau lai') || norm.includes('ngay mai') || norm.includes('thoi quen') || norm.includes('lap lai') || norm.includes('timer 10 phut')) {
    return 'start_again_habit';
  }

  return isHook ? 'home_declutter_room' : 'peaceful_sunset_reflection';
}

/**
 * Resolve an asset object given an assetId or filename
 */
function resolveAsset(idOrPath) {
  return assets.find(a => a.id === idOrPath || a.path.endsWith(idOrPath) || a.path.includes(idOrPath));
}

/**
 * Select the best asset for a scene
 */
export function matchSceneAsset(sceneText, visualPriority, usedAssetIds, lastAssetId, isEnding = false, isHook = false) {
  const theme = detectTheme(sceneText, visualPriority, isEnding, isHook);
  const pool = THEME_POOLS[theme] || THEME_POOLS.peaceful_sunset_reflection;

  // Try to find an unused asset in the target pool
  for (const idOrPath of pool) {
    const asset = resolveAsset(idOrPath);
    if (asset && asset.id !== lastAssetId && !usedAssetIds.has(asset.id)) {
      usedAssetIds.add(asset.id);
      return { asset, theme, reason: `Matched theme: ${theme}` };
    }
  }

  // If all used in pool, pick any from pool that is not lastAssetId
  for (const idOrPath of pool) {
    const asset = resolveAsset(idOrPath);
    if (asset && asset.id !== lastAssetId) {
      usedAssetIds.add(asset.id);
      return { asset, theme, reason: `Reused from theme: ${theme}` };
    }
  }

  // Fallback to peaceful reflection
  const fallback = resolveAsset('gratitude-simple-life-01') || assets[0];
  usedAssetIds.add(fallback.id);
  return { asset: fallback, theme: 'fallback', reason: 'Fallback tranquil asset' };
}
