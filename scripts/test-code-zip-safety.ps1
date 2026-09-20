# scripts/test-code-zip-safety.ps1
# Deterministic self-test for ZIP safety and forbidden path policy

$ErrorActionPreference = "Stop"

# Dot-source functions only
. "$PSScriptRoot/create-code-zip.ps1" -FunctionsOnly

$testCases = @(
    @{ Path = ".env"; Expected = $true; Desc = ".env root" },
    @{ Path = ".env.local"; Expected = $true; Desc = ".env.local root" },
    @{ Path = ".env.production"; Expected = $true; Desc = ".env.production root" },
    @{ Path = "config/.env"; Expected = $true; Desc = "config/.env nested" },
    @{ Path = "apps/api/.env.test"; Expected = $true; Desc = "apps/api/.env.test nested" },
    @{ Path = "config\.env"; Expected = $true; Desc = "config\.env backslash" },
    @{ Path = "apps\api\.env.test"; Expected = $true; Desc = "apps\api\.env.test backslash" },
    @{ Path = "nested/.env.example"; Expected = $false; Desc = "nested/.env.example allowed" },
    @{ Path = ".env.example"; Expected = $false; Desc = ".env.example allowed" },
    @{ Path = "private.pem"; Expected = $true; Desc = "private.pem root" },
    @{ Path = "keys/server.key"; Expected = $true; Desc = "keys/server.key nested" },
    @{ Path = "id_rsa"; Expected = $true; Desc = "id_rsa root" },
    @{ Path = "auth/service-account.json"; Expected = $true; Desc = "auth/service-account.json nested" },
    @{ Path = "credentials.json"; Expected = $true; Desc = "credentials.json root" },
    @{ Path = "package.json"; Expected = $false; Desc = "package.json allowed" },
    @{ Path = "scripts/batch-engine.mjs"; Expected = $false; Desc = "scripts/batch-engine.mjs allowed" },
    # Mixed-case tests
    @{ Path = ".Env"; Expected = $true; Desc = ".Env mixed case" },
    @{ Path = ".ENV"; Expected = $true; Desc = ".ENV uppercase" },
    @{ Path = ".Env.Local"; Expected = $true; Desc = ".Env.Local mixed case" },
    @{ Path = ".ENV.production"; Expected = $true; Desc = ".ENV.production mixed case" },
    @{ Path = "nested/.Env.Test"; Expected = $true; Desc = "nested/.Env.Test mixed case" },
    @{ Path = "nested/.ENV.EXAMPLE"; Expected = $false; Desc = "nested/.ENV.EXAMPLE uppercase allowed" },
    @{ Path = "PRIVATE.PEM"; Expected = $true; Desc = "PRIVATE.PEM uppercase" },
    @{ Path = "keys/SERVER.KEY"; Expected = $true; Desc = "keys/SERVER.KEY uppercase" },
    @{ Path = "AUTH/SERVICE-ACCOUNT.JSON"; Expected = $true; Desc = "AUTH/SERVICE-ACCOUNT.JSON uppercase" }
)

$failures = 0

Write-Host "Running Path Policy Tests..."
foreach ($tc in $testCases) {
    $actual = Is-Forbidden-SecretPath $tc.Path
    if ($actual -ne $tc.Expected) {
        Write-Host "  ❌ FAIL: $($tc.Desc) - Path: '$($tc.Path)' expected Forbidden=$($tc.Expected), got $actual" -ForegroundColor Red
        $failures++
    } else {
        $status = if ($actual) { "FORBIDDEN" } else { "ALLOWED" }
        Write-Host "  ✅ PASS: $($tc.Desc) => $status" -ForegroundColor Green
    }
}

# Test post-build validation catches forbidden entry in a zip
Write-Host "`nTesting Assert-ZipContainsNoForbiddenEntries with mock forbidden entry..."
$mockZip = [System.IO.Path]::GetTempFileName() + ".zip"
try {
    $archive = [System.IO.Compression.ZipFile]::Open($mockZip, [System.IO.Compression.ZipArchiveMode]::Create)
    $entry = $archive.CreateEntry(".env")
    $writer = New-Object System.IO.StreamWriter($entry.Open())
    $writer.WriteLine("MOCK=true")
    $writer.Dispose()
    $archive.Dispose()

    $caught = $false
    try {
        Assert-ZipContainsNoForbiddenEntries $mockZip
    } catch {
        $caught = $true
    }

    if ($caught) {
        Write-Host "  ✅ PASS: Post-build validation successfully caught mock .env entry and aborted" -ForegroundColor Green
    } else {
        Write-Host "  ❌ FAIL: Post-build validation failed to reject mock .env entry" -ForegroundColor Red
        $failures++
    }
} finally {
    if (Test-Path $mockZip) { Remove-Item $mockZip -Force }
}

if ($failures -gt 0) {
    Write-Host "`nTotal Failures: $failures" -ForegroundColor Red
    exit 1
} else {
    Write-Host "`nAll $($testCases.Count + 1) safety tests PASSED successfully!" -ForegroundColor Green
    exit 0
}
