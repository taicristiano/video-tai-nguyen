# HAY & ĐẸP. V3.3B-S.2 — Schnell People Contract Evaluation

Model: `@cf/black-forest-labs/flux-1-schnell`  
Test Date: 2026-09-19  
Scope: People contract obedience under style-first prompt geometry across 4 hard beats (8 images total).

---

## 1. Summary Evaluation Table

| Image | Story Role | Expected Count | Visible Count | Requested Members | Missing Members | Extra / Partial Parts | People Contract | Style Preserved |
|---|---|:---:|:---:|---|---|---|:---:|:---:|
| `beat-01-a.jpg` | establish | 4 | 4 | father, mother, boy, girl | none | none | **PASS** | **PASS** |
| `beat-01-b.jpg` | establish | 4 | 2 | father, mother, boy, girl | father, boy | 1 severed pair of legs under table | **FAIL** | **PASS** |
| `beat-02-a.jpg` | reflection | 2 | 2 | mother, boy | boy | 1 adult man (father figure) | **FAIL** | **PASS** |
| `beat-02-b.jpg` | reflection | 2 | 2 | mother, boy | boy | 1 adult man (collared shirt) | **FAIL** | **PASS** |
| `beat-04-a.jpg` | interaction | 3 | 2 | boy, father, mother | boy | 1 severed pair of legs beside sofa | **FAIL** | **PASS** |
| `beat-04-b.jpg` | interaction | 3 | 2 | boy, father, mother | 1 member | none | **FAIL** | **PASS** |
| `beat-09-a.jpg` | reflection | 2 | 2 | mother, boy | boy | 1 adult man (orange tunic) | **FAIL** | **PASS** |
| `beat-09-b.jpg` | reflection | 2 | 2 | mother, boy | boy | 1 adult man (glasses) | **FAIL** | **PASS** |

---

## 2. Gate Verification

- **People Contract Pass Rate**: `1/8` PASS (Required: `7/8` PASS) $\rightarrow$ **FAIL**
- **Style Preservation Rate**: `8/8` PASS (Required: `8/8` PASS) $\rightarrow$ **PASS** (100% `TARGET_EDITORIAL_2D`)
- **beat-01 Exact 4 People ($\ge$ 1/2)**: `1/2` PASS (`beat-01-a.jpg`) $\rightarrow$ **PASS**
- **beat-04 Exact 3 People ($\ge$ 1/2)**: `0/2` PASS (`beat-04-a.jpg` had 2 + severed legs, `beat-04-b.jpg` had 2) $\rightarrow$ **FAIL**

---

## 3. Detailed Image Records

### beat-01-a.jpg
- **expectedCount**: 4
- **actualVisibleCount**: 4
- **requestedMembers**: father, mother, boy, girl
- **missingRequestedMembers**: none
- **extraVisiblePeople**: none
- **partialUnrequestedHumanParts**: none
- **peopleContract**: PASS
- **stylePreserved**: PASS
- **Analysis**: Four distinct individuals are clearly visible around the dining table (adult man foreground left, adult woman foreground right, girl center left, second youth center right). Clear editorial 2D illustration on warm paper with visible contour lines and matte fills.

### beat-01-b.jpg
- **expectedCount**: 4
- **actualVisibleCount**: 2
- **requestedMembers**: father, mother, boy, girl
- **missingRequestedMembers**: father, boy
- **extraVisiblePeople**: none
- **partialUnrequestedHumanParts**: 1 disembodied pair of legs in dark trousers with brown shoes sitting under the coffee table with no torso, head, or arms.
- **peopleContract**: FAIL
- **stylePreserved**: PASS
- **Analysis**: Only 2 complete figures are visible (woman sitting on couch right, youth sitting on couch left). A third pair of legs appears under the table without an upper body. Father and boy figures are not present.

### beat-02-a.jpg
- **expectedCount**: 2
- **actualVisibleCount**: 2
- **requestedMembers**: mother, boy
- **missingRequestedMembers**: boy
- **extraVisiblePeople**: adult man
- **partialUnrequestedHumanParts**: none
- **peopleContract**: FAIL
- **stylePreserved**: PASS
- **Analysis**: Exactly 2 people are rendered, but the model generated an adult middle-aged couple (adult man with mature facial wrinkles on left, adult woman on right) instead of a mother and school-age boy. Contract required visible people to be ONLY mother and boy.

### beat-02-b.jpg
- **expectedCount**: 2
- **actualVisibleCount**: 2
- **requestedMembers**: mother, boy
- **missingRequestedMembers**: boy
- **extraVisiblePeople**: adult man
- **partialUnrequestedHumanParts**: none
- **peopleContract**: FAIL
- **stylePreserved**: PASS
- **Analysis**: Exactly 2 people are rendered, but the model generated a young adult couple (adult man in collared shirt on left, adult woman on right) rather than mother and school-age boy.

### beat-04-a.jpg
- **expectedCount**: 3
- **actualVisibleCount**: 2
- **requestedMembers**: boy, father, mother
- **missingRequestedMembers**: boy
- **extraVisiblePeople**: none
- **partialUnrequestedHumanParts**: 1 severed pair of legs in dark trousers with white shoes standing beside the sofa without an upper torso, arms, or head.
- **peopleContract**: FAIL
- **stylePreserved**: PASS
- **Analysis**: Two complete adult figures are visible (adult woman in sage suit, adult man in orange blazer). Instead of a visible 3rd person (schoolboy), a severed pair of standing trousers/legs is rendered.

### beat-04-b.jpg
- **expectedCount**: 3
- **actualVisibleCount**: 2
- **requestedMembers**: boy, father, mother
- **missingRequestedMembers**: 1 member (no 3rd person present)
- **extraVisiblePeople**: none
- **partialUnrequestedHumanParts**: none
- **peopleContract**: FAIL
- **stylePreserved**: PASS
- **Analysis**: Exactly 2 people are in the room standing opposite each other (woman in green dress, man in brown suit). The third requested person (boy) is completely absent.

### beat-09-a.jpg
- **expectedCount**: 2
- **actualVisibleCount**: 2
- **requestedMembers**: mother, boy
- **missingRequestedMembers**: boy
- **extraVisiblePeople**: adult man
- **partialUnrequestedHumanParts**: none
- **peopleContract**: FAIL
- **stylePreserved**: PASS
- **Analysis**: Exactly 2 people are visible, but they are an adult man in an orange shirt and an adult woman in a white dress sitting at a round table. The requested schoolboy was replaced by an adult male.

### beat-09-b.jpg
- **expectedCount**: 2
- **actualVisibleCount**: 2
- **requestedMembers**: mother, boy
- **missingRequestedMembers**: boy
- **extraVisiblePeople**: adult man
- **partialUnrequestedHumanParts**: none
- **peopleContract**: FAIL
- **stylePreserved**: PASS
- **Analysis**: Exactly 2 people are visible sitting on the sofa, but they are an adult man with glasses in an orange sweater and an adult woman in a green dress with a bun. The requested schoolboy was replaced by an adult male.
