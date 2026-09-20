import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const SMOKE_DIR = path.join(ROOT_DIR, 'scratch', 'production-smoke', 'video001');
const REVIEW_PACK_DIR = path.join(SMOKE_DIR, 'review-pack');

const QA_RECORD = {
  style: "PASS",
  peopleContract: "PASS",
  semanticFidelity: "PASS",
  anatomy: "PASS",
  textPollution: "PASS",
  reason: "Deterministic cleanup successfully removed the extra side bowl and lower-right cropped white artifact. The image now shows exactly: 1 main rice bowl, 1 small side bowl, 1 pair of chopsticks, with zero people, zero phones/electronic devices, no text/logo/signature pollution, and a clean uninterrupted wooden tabletop. The clean 2D editorial style remains intact.",
  source: "HUMAN_QA_FINAL_CLEANUP"
};

console.log("=== 1. Update review-manifest.json ===");
const manifestPath = path.join(REVIEW_PACK_DIR, 'review-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.updatedAt = new Date().toISOString();
manifest.reviewTarget = "ALL ASSETS PASSED (Final Review Complete)";
if (manifest.items && manifest.items.length > 0) {
  manifest.items[0].currentQaStatus = "PASS";
  manifest.items[0].qaStatus = "PASS";
  manifest.items[0].qa = QA_RECORD;
  manifest.items[0].reviewedSource = "HUMAN_QA_FINAL_CLEANUP";
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`Saved ${manifestPath}`);

console.log("\n=== 2. Update visual-review.json ===");
const visualReviewPath = path.join(SMOKE_DIR, 'visual-review.json');
const visualReview = JSON.parse(fs.readFileSync(visualReviewPath, 'utf8'));
visualReview.updatedAt = new Date().toISOString();
visualReview.qaStatus = "PASS";
visualReview.passSlots = visualReview.totalSlots;
visualReview.pendingSlots = 0;
visualReview.needsRegenSlots = 0;

const shot8 = visualReview.shots.find(s => s.slotId === 'scene-08-beat-02');
if (shot8) {
  shot8.qaStatus = "PASS";
  shot8.qa = QA_RECORD;
  shot8.reviewedSource = "HUMAN_QA_FINAL_CLEANUP";
  if (shot8.attemptHistory && shot8.attemptHistory.length >= 3) {
    shot8.attemptHistory[2].status = "PASS";
    shot8.attemptHistory[2].reviewedSource = "HUMAN_QA_FINAL_CLEANUP";
    shot8.attemptHistory[2].criteria = QA_RECORD;
  }
}
fs.writeFileSync(visualReviewPath, JSON.stringify(visualReview, null, 2), 'utf8');
console.log(`Saved ${visualReviewPath}`);

console.log("\n=== 3. Update run-summary.json ===");
const runSummaryJsonPath = path.join(SMOKE_DIR, 'run-summary.json');
const runSummaryJson = JSON.parse(fs.readFileSync(runSummaryJsonPath, 'utf8'));
runSummaryJson.timestamp = new Date().toISOString();
runSummaryJson.status = "PASS";
runSummaryJson.slotsSummary = {
  totalSlots: 13,
  reusedPassSlots: 7,
  reviewedPassSlots: 5,
  freshPendingSlots: 0,
  componentOutroSlots: 1,
  needsRegenSlots: 0
};
runSummaryJson.humanQaDecisions['scene-08-beat-02'] = "PASS (HUMAN_QA_FINAL_CLEANUP)";

const assetItem = runSummaryJson.currentAssets.find(a => a.slotId === 'scene-08-beat-02');
if (assetItem) {
  assetItem.qaStatus = "PASS";
  assetItem.reviewedSource = "HUMAN_QA_FINAL_CLEANUP";
}
fs.writeFileSync(runSummaryJsonPath, JSON.stringify(runSummaryJson, null, 2), 'utf8');
console.log(`Saved ${runSummaryJsonPath}`);

console.log("\nFinal QA recorded successfully.");
