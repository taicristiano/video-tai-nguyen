#!/usr/bin/env bash
set -euo pipefail

node scripts/run-v36-generalization.mjs --record-qa --video video005 --shot 1 --style PASS --people PASS --semantic PASS --anatomy PASS --text PASS --reason "Clean 2D scene; one adult; semantics and anatomy acceptable; no material text pollution."
node scripts/run-v36-generalization.mjs --record-qa --video video005 --shot 2 --style PASS --people PASS --semantic PASS --anatomy PASS --text PASS --reason "Clean reflective seated pose; one adult; no material visual defect."
node scripts/run-v36-generalization.mjs --record-qa --video video005 --shot 3 --style PASS --people PASS --semantic PASS --anatomy PASS --text PASS --reason "Clean sofa-resting scene; one adult; semantics and anatomy acceptable."
node scripts/run-v36-generalization.mjs --record-qa --video video005 --shot 4 --style PASS --people PASS --semantic PASS --anatomy PASS --text PASS --reason "One adult carrying a mug in kitchen; clean anatomy and background."
node scripts/run-v36-generalization.mjs --record-qa --video video005 --shot 5 --style PASS --people PASS --semantic PASS --anatomy PASS --text PASS --reason "One adult folding blanket; clean semantic match and anatomy."
node scripts/run-v36-generalization.mjs --record-qa --video video005 --shot 6 --style PASS --people PASS --semantic PASS --anatomy PASS --text PASS --reason "One adult tidying desk; clean scene with no material text pollution."

node scripts/run-v36-generalization.mjs --record-qa --video video007 --shot 1 --style PASS --people PASS --semantic PASS --anatomy PASS --text FAIL --reason "Visible pseudo-text / fake labels on shop-display objects; fails TEXT_POLLUTION."
node scripts/run-v36-generalization.mjs --record-qa --video video007 --shot 2 --style PASS --people PASS --semantic PASS --anatomy PASS --text PASS --reason "One adult with basket in aisle; clean composition and semantics."
node scripts/run-v36-generalization.mjs --record-qa --video video007 --shot 3 --style PASS --people PASS --semantic PASS --anatomy PASS --text PASS --reason "One adult resting with tea; clean scene and anatomy."
node scripts/run-v36-generalization.mjs --record-qa --video video007 --shot 4 --style PASS --people PASS --semantic PASS --anatomy PASS --text PASS --reason "One adult examining bowl; semantic and anatomy acceptable."
node scripts/run-v36-generalization.mjs --record-qa --video video007 --shot 5 --style PASS --people FAIL --semantic PASS --anatomy PASS --text PASS --reason "Still-life contract requires zero visible people, but a partial human arm/hand is visible."
node scripts/run-v36-generalization.mjs --record-qa --video video007 --shot 6 --style PASS --people PASS --semantic PASS --anatomy PASS --text PASS --reason "One adult walking down street; clean framing and semantics."

node scripts/run-v36-generalization.mjs --record-qa --video video013 --shot 1 --style PASS --people PASS --semantic PASS --anatomy PASS --text PASS --reason "Two-person dialogue scene is clean and semantically correct."
node scripts/run-v36-generalization.mjs --record-qa --video video013 --shot 2 --style PASS --people PASS --semantic PASS --anatomy PASS --text FAIL --reason "Multiple writing-like marks / pseudo-text on wall notes and planning sheets; fails TEXT_POLLUTION."
node scripts/run-v36-generalization.mjs --record-qa --video video013 --shot 3 --style PASS --people PASS --semantic PASS --anatomy PASS --text PASS --reason "Two people seated supportively; clean visual and people contract."
node scripts/run-v36-generalization.mjs --record-qa --video video013 --shot 4 --style PASS --people PASS --semantic PASS --anatomy PASS --text PASS --reason "Two-person advice gesture scene is clean and readable."
node scripts/run-v36-generalization.mjs --record-qa --video video013 --shot 5 --style PASS --people PASS --semantic PASS --anatomy PASS --text PASS --reason "Two-person personal-story scene is clean and semantically aligned."
node scripts/run-v36-generalization.mjs --record-qa --video video013 --shot 6 --style PASS --people PASS --semantic PASS --anatomy PASS --text PASS --reason "Two people in rapport; clean style and anatomy."

node scripts/run-v36-generalization.mjs --record-qa --video video028 --shot 1 --style PASS --people PASS --semantic PASS --anatomy PASS --text PASS --reason "One adult distracted at desk; clean composition and semantics."
node scripts/run-v36-generalization.mjs --record-qa --video video028 --shot 2 --style PASS --people PASS --semantic PASS --anatomy PASS --text PASS --reason "One adult pausing by window; clean and readable."
node scripts/run-v36-generalization.mjs --record-qa --video video028 --shot 3 --style PASS --people PASS --semantic PASS --anatomy PASS --text PASS --reason "One adult writing in notebook; clean scene and anatomy."
node scripts/run-v36-generalization.mjs --record-qa --video video028 --shot 4 --style PASS --people PASS --semantic PASS --anatomy PASS --text FAIL --reason "Visible signature/watermark-like mark in lower-right plus writing-like mark on laptop edge; fails TEXT_POLLUTION."
node scripts/run-v36-generalization.mjs --record-qa --video video028 --shot 5 --style PASS --people PASS --semantic PASS --anatomy PASS --text PASS --reason "One adult pausing at keyboard; clean scene and semantics."
node scripts/run-v36-generalization.mjs --record-qa --video video028 --shot 6 --style FAIL --people PASS --semantic PASS --anatomy PASS --text PASS --reason "Embedded black letterbox/border bars at top and bottom make the asset visually unclean; fails STYLE/CLEANLINESS."
