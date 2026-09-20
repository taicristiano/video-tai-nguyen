import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const outputPath = path.join(ROOT, 'public/assets/human-insight/brand/outro-9-16.png');
const thumbPath = path.join(ROOT, 'resources/hay-va-dep/HAY_DEP_ALL_READY_COMPLETE/HAY_DEP_ALL_MEDIA_READY/05_THUMBNAILS/Thumbnail_Template_1280x720_READY.jpg');
const logoPath = path.join(ROOT, 'resources/hay-va-dep/HAY_DEP_ALL_READY_COMPLETE/HAY_DEP_ALL_MEDIA_READY/01_LOGO_AVATAR/Logo_Full_HAY_DEP_Transparent_READY.png');

console.log('Generating clean 9:16 outro artwork at:', outputPath);

// 1. Base ivory canvas: 1080x1920 (#F6F1E8)
// 2. Desk scene: crop text-free zone (x=530, y=0, w=750, h=720) from Thumbnail_Template_1280x720_READY.jpg
// 3. Scale desk scene to 1080:1036, place at bottom (y=884)
// 4. Smoothly feather the top 240px of desk scene with geq alpha gradient into #F6F1E8
// 5. Center Logo_Full_HAY_DEP_Transparent_READY.png (scaled to 860px) at y=540
const filter = [
  'color=c=#F6F1E8:s=1080x1920[base]',
  '[0:v]crop=750:720:530:0,scale=1080:1036,format=yuva420p,geq=lum=\'lum(X,Y)\':cb=\'cb(X,Y)\':cr=\'cr(X,Y)\':a=\'if(lt(Y,260),255*(Y/260),255)\'[desk]',
  '[base][desk]overlay=0:884[comp1]',
  '[1:v]scale=860:-1[logo]',
  '[comp1][logo]overlay=(W-w)/2:520[v]'
].join(';');

const cmd = `ffmpeg -y -i "${thumbPath}" -i "${logoPath}" -filter_complex "${filter}" -map "[v]" -vframes 1 "${outputPath}"`;

console.log('Running ffmpeg command...');
execSync(cmd, { stdio: 'inherit' });
console.log('Finished generating clean outro-9-16.png!');
