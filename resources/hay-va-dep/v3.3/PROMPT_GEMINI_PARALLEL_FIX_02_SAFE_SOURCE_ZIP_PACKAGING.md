# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — PARALLEL FIX 02
# SINGLE GOAL: SAFE SOURCE ZIP PACKAGING ONLY

## CONTEXT

We found a real packaging security issue in the latest source ZIP.

Current file:

```text
scripts/create-code-zip.ps1
```

packages the project recursively using its own `Should-Include()` rules.

The repository `.gitignore` already ignores:

```text
.env
.env.local
```

but `create-code-zip.ps1` does NOT exclude them.

Result:

```text
.env
```

was included in the generated source ZIP.

The `.env` file contains non-empty API credentials/tokens.

This round has ONE GOAL ONLY:

> Make `scripts/create-code-zip.ps1` produce a source ZIP that cannot include local secret/environment credential files.

Do not work on any other subsystem.

---

# 1. SCOPE LOCK

Allowed primary file:

```text
scripts/create-code-zip.ps1
```

You may create ONE small packaging test/verification script if useful, for example:

```text
scripts/test-code-zip-safety.ps1
```

Do NOT modify:

- subtitle alignment
- batch-engine behavior
- transcribe logic
- Story Planner
- image generation
- V3.3 style work
- Remotion
- video rendering
- TTS
- STT
- SFX
- application runtime
- `.env` contents

Do NOT print any secret/token value in terminal output, logs, reports, diffs, or your final response.

---

# 2. AUDIT BEFORE EDITING

First inspect:

```text
scripts/create-code-zip.ps1
.gitignore
.env
.env.example
```

Do NOT print `.env` contents.

Report only:

```text
.env exists: YES/NO
.env contains non-empty assignments: YES/NO
.env.example exists: YES/NO
current zip rule excludes .env: YES/NO
```

Also inspect the latest generated ZIP if present and report:

```text
.env inside ZIP: YES/NO
.env.local inside ZIP: YES/NO
.env.example inside ZIP: YES/NO
```

Do not extract or display any credential values.

---

# 3. REQUIRED PACKAGING POLICY

The source ZIP MUST exclude local environment files.

## MUST EXCLUDE

At any directory depth:

```text
.env
.env.local
.env.development
.env.production
.env.test
.env.staging
.env.*.local
```

More generally:

> Exclude any filename whose basename is `.env` or starts with `.env.`

EXCEPT the explicit safe template:

```text
.env.example
```

So:

```text
.env                  ❌
.env.local            ❌
.env.production       ❌
config/.env           ❌
apps/api/.env.test    ❌
.env.example          ✅
```

Use path/basename logic that works with both:

```text
/
\
```

Do not solve this by deleting the user's `.env`.

The local `.env` must remain untouched on disk.

---

# 4. ALSO EXCLUDE COMMON PRIVATE KEY FILES

Because this is a SOURCE ZIP helper, add a small explicit denylist for common credential/private-key files.

At any depth exclude:

```text
*.pem
*.key
id_rsa
id_rsa.pub
id_ed25519
id_ed25519.pub
credentials.json
service-account.json
service-account-key.json
```

Important:

Do NOT create a huge speculative denylist.

Keep it small and understandable.

Do NOT exclude normal application JSON files merely because they contain the word `config`.

---

# 5. PRESERVE SAFE TEMPLATE FILES

The following must remain packageable:

```text
.env.example
```

If it currently exists, verify it is included.

Do not copy values from `.env` into `.env.example`.

Do not auto-edit `.env.example` in this task unless it already contains an actual secret.

If you detect what appears to be a real secret inside `.env.example`:

- STOP packaging;
- report only the variable name, never the value;
- do not silently sanitize it.

---

# 6. IMPLEMENT A CENTRAL FORBIDDEN-PATH CHECK

Do not scatter many unrelated `if` statements if avoidable.

Create a small clear helper, for example:

```powershell
function Is-Forbidden-SecretPath($relPath) {
    $norm = $relPath.Replace('\', '/')
    $name = [System.IO.Path]::GetFileName($norm)

    if ($name -eq '.env.example') {
        return $false
    }

    if (
        $name -eq '.env' -or
        $name.StartsWith('.env.')
    ) {
        return $true
    }

    if ($name -match '\.(pem|key)$') {
        return $true
    }

    if ($name -in @(
        'id_rsa',
        'id_rsa.pub',
        'id_ed25519',
        'id_ed25519.pub',
        'credentials.json',
        'service-account.json',
        'service-account-key.json'
    )) {
        return $true
    }

    return $false
}
```

Then inside `Should-Include()`:

```powershell
if (Is-Forbidden-SecretPath $relPath) {
    return $false
}
```

You may adapt syntax to project conventions.

Keep existing exclusions intact.

---

# 7. POST-BUILD SAFETY VALIDATION

The script must not trust filtering alone.

After creating the temporary ZIP, inspect ZIP entry names BEFORE replacing the final ZIP.

Create a validator such as:

```powershell
function Assert-ZipContainsNoForbiddenEntries($zipFile) {
    ...
}
```

Required behavior:

1. Open temp ZIP.
2. Enumerate all entry paths.
3. Run the same forbidden-path policy against each entry.
4. If any forbidden entry exists:
   - close archive;
   - delete temporary ZIP;
   - throw an error;
   - DO NOT replace the previous final ZIP.

Error output may list forbidden PATHS only.

Never print file contents.

---

# 8. SAFE REPLACEMENT ORDER

Current behavior builds:

```text
tool-video-tai-nguyen.tmp.zip
```

and then replaces:

```text
tool-video-tai-nguyen.zip
```

Keep this atomic-ish flow.

Required order:

```text
build temp ZIP
→ close temp ZIP
→ validate temp ZIP
→ only if validation passes:
     delete old final ZIP
     rename temp → final
```

If validation fails:

```text
old final ZIP remains untouched
temp ZIP deleted
script exits non-zero
```

---

# 9. OPTIONAL SAFE CONTENT CHECK — ONLY ENV TEMPLATE

Do NOT scan every source file for generic keywords like `token` or `key`;
that would create too many false positives.

However, check `.env.example` if it is being packaged.

Allowed values should be obviously placeholder/empty forms such as:

```text
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
GROQ_API_KEY=
GEMINI_API_KEY=
ELEVENLABS_API_KEY=
```

or obvious placeholders:

```text
your_api_key_here
changeme
example
```

If `.env.example` contains a suspicious non-placeholder value:

- abort packaging;
- report the VARIABLE NAME only;
- never print the value.

Keep this check conservative.

---

# 10. ADD A SELF-TEST FOR PATH POLICY

Add deterministic checks.

At minimum test these cases:

```text
.env                         => FORBIDDEN
.env.local                   => FORBIDDEN
.env.production              => FORBIDDEN
config/.env                  => FORBIDDEN
apps/api/.env.test           => FORBIDDEN
nested/.env.example          => ALLOWED

private.pem                  => FORBIDDEN
keys/server.key              => FORBIDDEN
id_rsa                       => FORBIDDEN
auth/service-account.json    => FORBIDDEN

package.json                 => ALLOWED
scripts/batch-engine.mjs     => ALLOWED
```

The test must fail non-zero if any expectation is wrong.

Do not add a heavyweight testing framework.

PowerShell assertions are enough.

---

# 11. REBUILD THE ZIP

After implementation:

Run the packaging script.

Expected:

```text
tool-video-tai-nguyen.zip
```

Then inspect the ZIP entry list.

Required verification:

```text
.env                         => NOT PRESENT
.env.local                   => NOT PRESENT
any other .env.*             => NOT PRESENT
.env.example                 => PRESENT
*.pem                        => NOT PRESENT
*.key                        => NOT PRESENT
private-key filenames        => NOT PRESENT
```

Do not display contents of `.env.example`; only verify presence.

---

# 12. DO NOT TOUCH STALE QA ARTIFACTS IN THIS ROUND

There are stale QA artifacts elsewhere in the repo.

Ignore them in this task.

Do NOT:
- refresh subtitle reports;
- delete QA artifacts;
- change `scratch/v33` behavior;
- change packaging policy for QA files.

That is a separate concern.

This prompt is ONLY about secret-safe source ZIP packaging.

---

# 13. ACCEPTANCE CRITERIA

PASS only if all are true:

1. Local `.env` still exists after the task and is unchanged.
2. Generated ZIP does not contain `.env`.
3. Generated ZIP does not contain any `.env.*` except `.env.example`.
4. `.env.example` remains included.
5. Common private-key files are excluded.
6. Temp ZIP is validated before replacing final ZIP.
7. Packaging fails safely if a forbidden entry somehow appears.
8. No credential value is printed anywhere.
9. Existing non-secret packaging exclusions still work.
10. The rebuilt ZIP completes successfully.

---

# 14. FINAL REPORT

Return only:

## A. Audit Before
No secret values.

## B. Files Changed

## C. Secret Path Policy

## D. Self-Test Results

## E. ZIP Verification

Use a table:

| Entry class | Expected | Actual |
|---|---|---|
| `.env` | absent | ... |
| `.env.*` except example | absent | ... |
| `.env.example` | present | ... |
| `*.pem` | absent | ... |
| `*.key` | absent | ... |
| known private-key filenames | absent | ... |

## F. Local `.env`
Report only:

```text
still exists: YES/NO
unchanged: YES/NO
```

Never show contents.

## G. Verdict

Exactly one:

```text
PARALLEL FIX 02 — SAFE SOURCE ZIP PACKAGING — PASS
```

or:

```text
PARALLEL FIX 02 — SAFE SOURCE ZIP PACKAGING — FAIL
```

Then STOP.

Do not start Semantic Beat Splitting.
Do not start V3.3A-1.
Wait for human review.
