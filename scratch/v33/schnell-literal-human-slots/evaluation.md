# HAY & ĐẸP. V3.3B-S.3 — Literal Human Slots Evaluation

Model: `@cf/black-forest-labs/flux-1-schnell`  
Test Date: 2026-09-19  
Scope: Literal human slot composition obedience across 4 hard beats (8 images total).

---

## 1. Summary Evaluation Table

| Image | Role | Expected Humans | Actual Humans | Slot Breakdown | All Slots Present | Unexpected Extra | Partial Unassigned Body | Slot Contract | Style Preserved |
|---|---|:---:|:---:|---|:---:|:---:|:---:|:---:|:---:|
| `beat-01-a.jpg` | establish | 4 | 3 | S1: YES, S2: YES, S3: NO, S4: YES | NO | NO | NO | **FAIL** | **PASS** |
| `beat-01-b.jpg` | establish | 4 | 4 | S1: YES, S2: YES, S3: NO, S4: NO | NO | NO | YES | **FAIL** | **PASS** |
| `beat-02-a.jpg` | reflection | 2 | 2 | S1: YES, S2: NO | NO | NO | NO | **FAIL** | **PASS** |
| `beat-02-b.jpg` | reflection | 2 | 2 | S1: YES, S2: NO | NO | NO | NO | **FAIL** | **PASS** |
| `beat-04-a.jpg` | interaction | 3 | 2 | S1: YES, S2: NO, S3: YES | NO | NO | NO | **FAIL** | **PASS** |
| `beat-04-b.jpg` | interaction | 3 | 2 | S1: NO, S2: NO, S3: YES | NO | NO | YES | **FAIL** | **PASS** |
| `beat-09-a.jpg` | reflection | 2 | 2 | S1: YES, S2: NO | NO | NO | NO | **FAIL** | **PASS** |
| `beat-09-b.jpg` | reflection | 2 | 2 | S1: YES, S2: NO | NO | NO | NO | **FAIL** | **PASS** |

---

## 2. Gate Verification

- **Human Slot Contract Pass Rate**: `0/8` (0.0%) — Required: `6/8` (75%) $\rightarrow$ **FAIL**
- **Style Preservation Rate**: `8/8` (100.0%) — Required: `8/8` (100%) $\rightarrow$ **PASS** (`TARGET_EDITORIAL_2D`)
- **Mandatory Beat-Level Gates**:
  - `beat-01 exact four-slot family >= 1/2`: **0/2** $\rightarrow$ **FAIL**
  - `beat-02 adult-woman + child-boy >= 1/2`: **0/2** $\rightarrow$ **FAIL**
  - `beat-04 adult-man + child-boy + adult-woman >= 1/2`: **0/2** $\rightarrow$ **FAIL**
  - `beat-09 adult-woman + child-boy >= 1/2`: **0/2** $\rightarrow$ **FAIL**

---

## 3. Detailed Image Records

### beat-01-a.jpg
- **expectedHumanCount**: 4
- **actualHumanCount**: 3
- **slot1**:
  - expected: Vietnamese adult man, age 35–40, adult male build, short black hair, sage shirt (left)
  - observed: Vietnamese young adult man in tan sweater sitting on left
  - pass: YES
- **slot2**:
  - expected: Vietnamese adult woman, age 32–38, adult female build, tied black hair, warm cardigan (right)
  - observed: Vietnamese adult woman with dark hair in dark dress sitting on right
  - pass: YES
- **slot3**:
  - expected: Vietnamese boy, age 8–10, child body, 2/3 adult seated height, short black hair, sage top (front-left)
  - observed: Missing (no boy figure present)
  - pass: NO
- **slot4**:
  - expected: Vietnamese girl, age 6–8, child body, smaller than adults, dark hair, cream clothing (front-right)
  - observed: Young girl with dark hair sitting in center
  - pass: YES
- **allSlotsPresent**: NO
- **unexpectedExtraHuman**: NO
- **partialUnassignedHumanBody**: NO
- **humanSlotContract**: FAIL
- **stylePreserved**: PASS

### beat-01-b.jpg
- **expectedHumanCount**: 4
- **actualHumanCount**: 4
- **slot1**:
  - expected: Vietnamese adult man, age 35–40, adult male build, short black hair, sage shirt (left)
  - observed: Adult Vietnamese man with glasses in light collared shirt standing on left
  - pass: YES
- **slot2**:
  - expected: Vietnamese adult woman, age 32–38, adult female build, tied black hair, warm cardigan (right)
  - observed: Adult woman sitting on right in orange dress
  - pass: YES
- **slot3**:
  - expected: Vietnamese boy, age 8–10, child body, 2/3 adult seated height, short black hair, sage top (front-left)
  - observed: Adult woman with hair bun and adult proportions standing center-left
  - pass: NO
- **slot4**:
  - expected: Vietnamese girl, age 6–8, child body, smaller than adults, dark hair, cream clothing (front-right)
  - observed: Adult woman with glasses and bun and adult proportions standing center-right
  - pass: NO
- **allSlotsPresent**: NO
- **unexpectedExtraHuman**: NO
- **partialUnassignedHumanBody**: YES (disembodied floating white sleeve/hand on right near orange dress)
- **humanSlotContract**: FAIL
- **stylePreserved**: PASS

### beat-02-a.jpg
- **expectedHumanCount**: 2
- **actualHumanCount**: 2
- **slot1**:
  - expected: Vietnamese adult woman, age 32–38, adult female build, tied black hair, warm cardigan (left)
  - observed: Adult woman in green dress sitting on left
  - pass: YES
- **slot2**:
  - expected: Vietnamese boy, age 8–10, child body, 2/3 adult seated height, short black hair, sage top (right)
  - observed: Fully grown adult man with glasses in collared shirt and blazer standing on right
  - pass: NO
- **allSlotsPresent**: NO
- **unexpectedExtraHuman**: NO
- **partialUnassignedHumanBody**: NO
- **humanSlotContract**: FAIL
- **stylePreserved**: PASS

### beat-02-b.jpg
- **expectedHumanCount**: 2
- **actualHumanCount**: 2
- **slot1**:
  - expected: Vietnamese adult woman, age 32–38, adult female build, tied black hair, warm cardigan (left)
  - observed: Adult woman with top bun sitting on left
  - pass: YES
- **slot2**:
  - expected: Vietnamese boy, age 8–10, child body, 2/3 adult seated height, short black hair, sage top (right)
  - observed: Second adult woman with hair bun sitting on right in olive dress/cardigan
  - pass: NO
- **allSlotsPresent**: NO
- **unexpectedExtraHuman**: NO
- **partialUnassignedHumanBody**: NO
- **humanSlotContract**: FAIL
- **stylePreserved**: PASS

### beat-04-a.jpg
- **expectedHumanCount**: 3
- **actualHumanCount**: 2
- **slot1**:
  - expected: Vietnamese adult man, age 35–40, adult male build, short black hair, muted sage shirt (left)
  - observed: Adult man in orange collared shirt sitting on left
  - pass: YES
- **slot2**:
  - expected: Vietnamese boy, age 8–10, child body, smaller than adults, short black hair, sage top (center)
  - observed: Missing (no 3rd figure in room)
  - pass: NO
- **slot3**:
  - expected: Vietnamese adult woman, age 32–38, adult female build, tied black hair, warm cardigan (right)
  - observed: Adult woman sitting in foreground right
  - pass: YES
- **allSlotsPresent**: NO
- **unexpectedExtraHuman**: NO
- **partialUnassignedHumanBody**: NO
- **humanSlotContract**: FAIL
- **stylePreserved**: PASS

### beat-04-b.jpg
- **expectedHumanCount**: 3
- **actualHumanCount**: 2
- **slot1**:
  - expected: Vietnamese adult man, age 35–40, adult male build, short black hair, muted sage shirt (left)
  - observed: Headless adult male torso sitting at table (neck cut off completely below collar)
  - pass: NO
- **slot2**:
  - expected: Vietnamese boy, age 8–10, child body, smaller than adults, short black hair, sage top (center)
  - observed: Missing (no child present)
  - pass: NO
- **slot3**:
  - expected: Vietnamese adult woman, age 32–38, adult female build, tied black hair, warm cardigan (right)
  - observed: Adult woman sitting on right
  - pass: YES
- **allSlotsPresent**: NO
- **unexpectedExtraHuman**: NO
- **partialUnassignedHumanBody**: YES (headless torso on left)
- **humanSlotContract**: FAIL
- **stylePreserved**: PASS

### beat-09-a.jpg
- **expectedHumanCount**: 2
- **actualHumanCount**: 2
- **slot1**:
  - expected: Vietnamese adult woman, age 32–38, adult female build, tied black hair, warm cardigan (left)
  - observed: Adult woman with bun sitting on right
  - pass: YES
- **slot2**:
  - expected: Vietnamese boy, age 8–10, child body, 2/3 adult seated height, short black hair, sage top (right)
  - observed: Adult/teen male with styled hair and adult build sitting on left
  - pass: NO
- **allSlotsPresent**: NO
- **unexpectedExtraHuman**: NO
- **partialUnassignedHumanBody**: NO
- **humanSlotContract**: FAIL
- **stylePreserved**: PASS

### beat-09-b.jpg
- **expectedHumanCount**: 2
- **actualHumanCount**: 2
- **slot1**:
  - expected: Vietnamese adult woman, age 32–38, adult female build, tied black hair, warm cardigan (left)
  - observed: Adult/young woman with orange bow sitting on right
  - pass: YES
- **slot2**:
  - expected: Vietnamese boy, age 8–10, child body, 2/3 adult seated height, short black hair, sage top (right)
  - observed: Adult man in tan sweater sitting on left
  - pass: NO
- **allSlotsPresent**: NO
- **unexpectedExtraHuman**: NO
- **partialUnassignedHumanBody**: NO
- **humanSlotContract**: FAIL
- **stylePreserved**: PASS
