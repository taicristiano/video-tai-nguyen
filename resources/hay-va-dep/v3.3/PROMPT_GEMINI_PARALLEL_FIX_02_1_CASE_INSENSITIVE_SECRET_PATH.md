# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — PARALLEL FIX 02.1
# SINGLE GOAL: MAKE SECRET PATH MATCHING CASE-INSENSITIVE

## CONTEXT

Parallel Fix 02 successfully removed `.env` from the source ZIP.

One edge case remains in:

```text
scripts/create-code-zip.ps1
```

`Is-Forbidden-SecretPath()` currently uses:

```powershell
$name.StartsWith('.env.')
```

`.StartsWith()` is case-sensitive.

Therefore names such as:

```text
.Env.Local
.ENV.production
.env.Test
```

can bypass the `.env.*` rule.

This round fixes ONLY that case-sensitivity gap.

---

# SCOPE

Allowed:
- `scripts/create-code-zip.ps1`
- `scripts/test-code-zip-safety.ps1`

Do NOT change any other file or behavior.

Do NOT touch:
- subtitle alignment
- Story Planner
- image generation
- batch engine
- V3.3
- QA artifacts

---

# REQUIRED FIX

Normalize basename once:

```powershell
$name = [System.IO.Path]::GetFileName($norm)
$nameLower = $name.ToLowerInvariant()
```

Then perform secret filename policy using `$nameLower`.

For example:

```powershell
if ($nameLower -eq '.env.example') {
    return $false
}

if (
    $nameLower -eq '.env' -or
    $nameLower.StartsWith('.env.')
) {
    return $true
}
```

Apply the same normalized name to explicit known filenames.

Do not alter safe packaging behavior otherwise.

---

# REQUIRED TESTS

Keep all existing tests.

Add at least:

```text
.Env                         => FORBIDDEN
.ENV                         => FORBIDDEN
.Env.Local                   => FORBIDDEN
.ENV.production              => FORBIDDEN
nested/.Env.Test             => FORBIDDEN
nested/.ENV.EXAMPLE          => ALLOWED

PRIVATE.PEM                  => FORBIDDEN
keys/SERVER.KEY              => FORBIDDEN
AUTH/SERVICE-ACCOUNT.JSON    => FORBIDDEN
```

Run the full packaging safety test.

Then rebuild the ZIP and verify:

```text
.env / any case variant              => absent
.env.* / any case variant            => absent
.env.example / case-insensitive form => allowed
```

Do not print secret values.

---

# ACCEPTANCE

PASS only if:
1. all existing tests still pass;
2. all mixed-case tests pass;
3. rebuilt ZIP contains no forbidden secret entry;
4. `.env.example` remains packaged;
5. local `.env` remains unchanged.

Return:

```text
PARALLEL FIX 02.1 — CASE-INSENSITIVE SECRET PATH POLICY — PASS
```

or FAIL.

Then STOP.
