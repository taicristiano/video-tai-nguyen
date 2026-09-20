import { execSync } from 'child_process';

const font = 'C\\:/Windows/Fonts/arial.ttf';
const inputDir = 'scratch/reference-restoration/video001/proofs/comparison';
const outputImg = 'scratch/reference-restoration/video001/reference-vs-current-vs-restored.jpg';

const filterParts = [
  `[0:v]scale=360:640,drawtext=fontfile='${font}':text='REF 2 (ESTABLISHING)':fontcolor=yellow:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[r1]`,
  `[1:v]scale=360:640,drawtext=fontfile='${font}':text='CURRENT (STATIC 4.7s WIDE)':fontcolor=red:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[c1]`,
  `[2:v]scale=360:640,drawtext=fontfile='${font}':text='RESTORED (DYNAMIC WIDE)':fontcolor=green:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[res1]`,
  `[3:v]scale=360:640,drawtext=fontfile='${font}':text='REF 2 (BALANCED DIALOGUE)':fontcolor=yellow:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[r2]`,
  `[4:v]scale=360:640,drawtext=fontfile='${font}':text='CURRENT (LEFT-HEAVY 290px VOID)':fontcolor=red:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[c2]`,
  `[5:v]scale=360:640,drawtext=fontfile='${font}':text='RESTORED (BALANCED CLOSE)':fontcolor=green:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[res2]`,
  `[6:v]scale=360:640,drawtext=fontfile='${font}':text='REF 2 (DETAIL INSERT)':fontcolor=yellow:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[r3]`,
  `[7:v]scale=360:640,drawtext=fontfile='${font}':text='CURRENT (LEFT-HEAVY VOID)':fontcolor=red:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[c3]`,
  `[8:v]scale=360:640,drawtext=fontfile='${font}':text='RESTORED (BALANCED CENTER)':fontcolor=green:fontsize=18:x=12:y=16:box=1:boxcolor=black@0.75[res3]`,
  `[r1][c1][res1]hstack=inputs=3[row1]`,
  `[r2][c2][res2]hstack=inputs=3[row2]`,
  `[r3][c3][res3]hstack=inputs=3[row3]`,
  `[row1][row2][row3]vstack=inputs=3[out]`
];

const filter = filterParts.join(';');

const cmd = `ffmpeg -y ` +
  `-i "${inputDir}/ref_1.png" ` +
  `-i "${inputDir}/current_1.png" ` +
  `-i "${inputDir}/restored_1.png" ` +
  `-i "${inputDir}/ref_2.png" ` +
  `-i "${inputDir}/current_2.png" ` +
  `-i "${inputDir}/restored_2.png" ` +
  `-i "${inputDir}/ref_3.png" ` +
  `-i "${inputDir}/current_3.png" ` +
  `-i "${inputDir}/restored_3.png" ` +
  `-filter_complex "${filter}" -map "[out]" "${outputImg}"`;

console.log('Generating reference comparison collage...');
execSync(cmd, { stdio: 'inherit' });
console.log('Successfully generated:', outputImg);
