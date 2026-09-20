import { execSync } from 'child_process';

const font = 'C\\:/Windows/Fonts/arial.ttf';
const inputDir = 'scratch/reference-restoration/video001/proofs/runtime';
const outputImg = 'scratch/reference-restoration/video001/motion-proof-runtime.jpg';

// Scale each frame to 360x640. 3 columns = 1080 width, 4 rows = 2560 height.
const filterParts = [
  // Row 1: 5.0–7.0s (Adult serving rice)
  `[0:v]scale=360:640,drawtext=fontfile='${font}':text='INT 1 (5.0s) START':fontcolor=white:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[r1_s]`,
  `[1:v]scale=360:640,drawtext=fontfile='${font}':text='INT 1 (6.0s) MID':fontcolor=yellow:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[r1_m]`,
  `[2:v]scale=360:640,drawtext=fontfile='${font}':text='INT 1 (7.0s) END':fontcolor=green:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[r1_e]`,

  // Row 2: 19.2–21.8s (Arriving home / action)
  `[3:v]scale=360:640,drawtext=fontfile='${font}':text='INT 2 (19.2s) START':fontcolor=white:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[r2_s]`,
  `[4:v]scale=360:640,drawtext=fontfile='${font}':text='INT 2 (20.5s) MID':fontcolor=yellow:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[r2_m]`,
  `[5:v]scale=360:640,drawtext=fontfile='${font}':text='INT 2 (21.8s) END':fontcolor=green:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[r2_e]`,

  // Row 3: 26.0–29.0s (Reflective adult holding bowl)
  `[6:v]scale=360:640,drawtext=fontfile='${font}':text='INT 3 (26.0s) START':fontcolor=white:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[r3_s]`,
  `[7:v]scale=360:640,drawtext=fontfile='${font}':text='INT 3 (27.5s) MID':fontcolor=yellow:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[r3_m]`,
  `[8:v]scale=360:640,drawtext=fontfile='${font}':text='INT 3 (29.0s) END':fontcolor=green:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[r3_e]`,

  // Row 4: 43.0–45.0s (Question scene)
  `[9:v]scale=360:640,drawtext=fontfile='${font}':text='INT 4 (43.0s) START':fontcolor=white:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[r4_s]`,
  `[10:v]scale=360:640,drawtext=fontfile='${font}':text='INT 4 (44.0s) MID':fontcolor=yellow:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[r4_m]`,
  `[11:v]scale=360:640,drawtext=fontfile='${font}':text='INT 4 (45.0s) END':fontcolor=green:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[r4_e]`,

  `[r1_s][r1_m][r1_e]hstack=inputs=3[row1]`,
  `[r2_s][r2_m][r2_e]hstack=inputs=3[row2]`,
  `[r3_s][r3_m][r3_e]hstack=inputs=3[row3]`,
  `[r4_s][r4_m][r4_e]hstack=inputs=3[row4]`,
  `[row1][row2][row3][row4]vstack=inputs=4[out]`
];

const filter = filterParts.join(';');

const cmd = `ffmpeg -y ` +
  `-i "${inputDir}/int1_start.png" ` +
  `-i "${inputDir}/int1_mid.png" ` +
  `-i "${inputDir}/int1_end.png" ` +
  `-i "${inputDir}/int2_start.png" ` +
  `-i "${inputDir}/int2_mid.png" ` +
  `-i "${inputDir}/int2_end.png" ` +
  `-i "${inputDir}/int3_start.png" ` +
  `-i "${inputDir}/int3_mid.png" ` +
  `-i "${inputDir}/int3_end.png" ` +
  `-i "${inputDir}/int4_start.png" ` +
  `-i "${inputDir}/int4_mid.png" ` +
  `-i "${inputDir}/int4_end.png" ` +
  `-filter_complex "${filter}" -map "[out]" "${outputImg}"`;

console.log('Generating motion-proof-runtime.jpg...');
execSync(cmd, { stdio: 'inherit' });
console.log('Successfully created:', outputImg);
