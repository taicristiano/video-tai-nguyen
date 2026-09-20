param(
    [switch]$FunctionsOnly
)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Is-Forbidden-SecretPath($relPath) {
    $norm = $relPath.Replace('\', '/')
    $name = [System.IO.Path]::GetFileName($norm)
    $nameLower = $name.ToLowerInvariant()

    # Preserve explicit safe template
    if ($nameLower -eq '.env.example') {
        return $false
    }

    # Exclude any .env or .env.* at any depth (case-insensitive)
    if ($nameLower -eq '.env' -or $nameLower.StartsWith('.env.')) {
        return $true
    }

    # Exclude common private-key and certificate files
    if ($nameLower -match '\.(pem|key)$') {
        return $true
    }

    # Exclude common credential / private-key filenames
    if ($nameLower -in @(
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

function Assert-EnvExampleSafe($filePath) {
    if (-not (Test-Path $filePath)) { return }
    $lines = Get-Content $filePath
    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed.StartsWith('#')) { continue }
        $parts = $trimmed.Split('=', 2)
        if ($parts.Count -eq 2) {
            $key = $parts[0].Trim()
            $val = $parts[1].Trim()
            if ($val -ne '') {
                $isSafe = $false
                # Allow standard non-secret configuration options
                if ($key -in @('ASPECT_RATIO', 'THEME', 'SHOW_SUBTITLES', 'STT_LANGUAGE', 'GROQ_STT_MODEL', 'GEMINI_TTS_VOICE', 'ELEVENLABS_VOICE_ID')) {
                    $isSafe = $true
                } elseif ($val -match '^(your_.*|changeme|example|placeholder|todo)$') {
                    $isSafe = $true
                }
                if (-not $isSafe) {
                    Write-Error "SUSPICIOUS VALUE in .env.example for key: $key. Packaging aborted."
                    exit 1
                }
            }
        }
    }
}

function Assert-ZipContainsNoForbiddenEntries($zipFilePath) {
    $archive = [System.IO.Compression.ZipFile]::OpenRead($zipFilePath)
    $forbiddenEntries = @()
    $hasEnvExample = $false

    try {
        foreach ($entry in $archive.Entries) {
            $entryPath = $entry.FullName
            if (Is-Forbidden-SecretPath $entryPath) {
                $forbiddenEntries += $entryPath
            }
            $name = [System.IO.Path]::GetFileName($entryPath.Replace('\', '/'))
            if ($name.ToLowerInvariant() -eq '.env.example') {
                $hasEnvExample = $true
            }
        }
    } finally {
        $archive.Dispose()
    }

    if ($forbiddenEntries.Count -gt 0) {
        Write-Error "CRITICAL SECURITY ERROR: Package contains forbidden secret entries:"
        foreach ($f in $forbiddenEntries) {
            Write-Error "  - $f"
        }
        throw "Packaging aborted: forbidden secret entries detected in ZIP."
    }

    if (-not $hasEnvExample) {
        Write-Warning "Notice: .env.example was not found in packaged ZIP entries."
    }
}

function Should-Include($relPath) {
    $norm = $relPath.Replace('\', '/')

    # Priority 1: Check forbidden secret paths
    if (Is-Forbidden-SecretPath $relPath) {
        return $false
    }
    
    # Exclude root/temporary/build folders and heavy media assets
    if ($norm -match '^scratch/(?!v3[34]/)') { return $false }
    if ($norm -match '^(node_modules|\.git|videos|tmp|load-templates)/') { return $false }
    if ($norm -match '^resources/(tai-nguyen|nep|video-references|hay-va-dep/HAY_DEP_ALL_READY_COMPLETE)/') { return $false }
    if ($norm -match '^public/[^/]+/.*(voice\.mp3|video\.mp4)$') { return $false }
    if ($norm -match '^public/assets/[^/]+/music/') { return $false }
    if ($norm -match '^public/assets/[^/]+/images/') { return $false }
    if ($norm -match '\.(zip|rar|mp4|avi|mov)$') { return $false }
    if ($norm -eq 'tool-video-tai-nguyen.zip') { return $false }
    if ($norm -eq 'tool-video-tai-nguyen.tmp.zip') { return $false }
    if ($norm -eq 'test.mp3') { return $false }

    return $true
}

if ($FunctionsOnly) {
    return
}

$root = Resolve-Path .
$zipPath = Join-Path $root "tool-video-tai-nguyen.zip"
$tempZip = Join-Path $root "tool-video-tai-nguyen.tmp.zip"

# Pre-check .env.example
$envExamplePath = Join-Path $root ".env.example"
Assert-EnvExampleSafe $envExamplePath

# Build temporary zip
if (Test-Path $tempZip) { Remove-Item $tempZip -Force }

$archive = [System.IO.Compression.ZipFile]::Open($tempZip, [System.IO.Compression.ZipArchiveMode]::Create)
$count = 0

try {
    Get-ChildItem -Path $root -Recurse -File | ForEach-Object {
        $fullPath = $_.FullName
        $relPath = $fullPath.Substring($root.Path.Length).TrimStart('\', '/')
        if (Should-Include $relPath) {
            $entryName = $relPath.Replace('\', '/')
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $fullPath, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
            $count++
        }
    }
} finally {
    $archive.Dispose()
}

# Post-build safety validation on temporary zip
try {
    Assert-ZipContainsNoForbiddenEntries $tempZip
} catch {
    # If validation fails: old final ZIP remains untouched, temp ZIP deleted, script exits non-zero
    if (Test-Path $tempZip) { Remove-Item $tempZip -Force }
    Write-Error "Safety validation failed: $_"
    exit 1
}

# Safe replacement order: only replace final ZIP after validation succeeds
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Move-Item $tempZip $zipPath -Force

$zipItem = Get-Item $zipPath
Write-Host "Successfully packaged $count files into $zipPath ($([math]::Round($zipItem.Length / 1MB, 2)) MB)"
