$path = "src/main.js"
$lines = Get-Content $path

$output = @()
$skip = $false
$braceLevel = 0
$seenTrust = $false
$seenPin = $false

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]

    # Detect trustDevice
    if ($line -match "async function trustDevice") {
        if (-not $seenTrust) {
            $seenTrust = $true
        } else {
            $skip = $true
            $braceLevel = 0
            continue
        }
    }

    # Detect sha256pin
    if ($line -match "async function sha256pin") {
        if (-not $seenPin) {
            $seenPin = $true
        } else {
            $skip = $true
            $braceLevel = 0
            continue
        }
    }

    if ($skip) {
        $braceLevel += ($line -split "{").Length - 1
        $braceLevel -= ($line -split "}").Length - 1

        if ($braceLevel -le 0 -and $line -match "}") {
            $skip = $false
        }

        continue
    }

    $output += $line
}

Set-Content $path $output -Encoding UTF8
Write-Host "✅ Duplicate functions removed successfully."
