#Requires -Version 5.1

<#
.SYNOPSIS
    TalkStream audit tool package.

.DESCRIPTION
    Self-owned audit tool for TalkStream module.

    The script lives inside its own package folder and writes all artifacts
    only inside that folder:

        tools/modules/TalkStream/ScriptTalkStreamAudit/
          Collect-TalkStreamAudit.ps1
          snapshots/
          reports/
          logs/
          tmp/

    Policy:
      - snapshots/ is tracked source material;
      - normal reports/ are tracked audit evidence;
      - logs/ and tmp/ are ignored;
      - raw secret reports are ignored even though they are placed in reports/.

    Secret scan modes:
      redact - safe mode, only masked values go to normal reports/console/log;
      raw    - local dangerous mode, raw values go to logs and raw-secrets_*.md,
               raw-secrets_*.md is ignored by Git;
      off    - do not scan secrets.

.PARAMETER Root
    Start path for project root discovery. Defaults to $PSScriptRoot.

.PARAMETER Mode
    Execution mode:
      menu              interactive menu, default;
      audit             full module audit + secret scan according to SecretMode;
      secrets           secret scan only;
      snapshots         update snapshots;
      manifests         generate SHA256 manifests for snapshots/ and reports/;
      verify-manifests  verify existing SHA256 manifests;
      paths             show tool paths;
      help              show help.

.PARAMETER SecretMode
    Secret scan mode:
      redact  default, safe;
      raw     dangerous local mode, raw values written to ignored files;
      off     disable secret scan.

.PARAMETER OutputDir
    Report output directory. Defaults to ./reports inside the script package.

.PARAMETER LogDir
    Log output directory. Defaults to ./logs inside the script package.

.PARAMETER TempDir
    Temporary directory. Defaults to ./tmp inside the script package.

.PARAMETER SnapshotDir
    Snapshot directory. Defaults to ./snapshots inside the script package.

.PARAMETER UpdateSnapshots
    With -Mode snapshots, writes a new snapshot file.

.PARAMETER SnapshotName
    Optional snapshot file name.

.PARAMETER FailOnIssues
    Exit with code 1 if risks or warnings were found.

.PARAMETER ScanReports
    Include reports/ directory in secret scan. Disabled by default to avoid
    recursive noise from previous audit dumps.

.USAGE
    From project root:

    .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode help

    .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode menu

    .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode audit

    .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode audit -SecretMode redact

    .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode audit -SecretMode off

    .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode secrets -SecretMode redact

    .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode secrets -SecretMode raw

    .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode snapshots

    .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode manifests

    .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode verify-manifests

.EXAMPLE
    Interactive menu:

    .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1

.EXAMPLE
    Safe full audit:

    .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode audit -SecretMode redact -FailOnIssues

.EXAMPLE
    Full audit including old reports in secret scan:

    .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode audit -SecretMode redact -ScanReports

.NOTES
    Do not commit .env.
    Do not force-add raw-secrets_*.md files.
    Logs may contain raw secret values only when SecretMode=raw.
#>

param(
    [string]$Root = $PSScriptRoot,

    [ValidateSet('menu', 'audit', 'secrets', 'snapshots', 'manifests', 'verify-manifests', 'paths', 'help')]
    [string]$Mode = 'menu',

    [ValidateSet('redact', 'raw', 'off')]
    [string]$SecretMode = 'redact',

    [string]$OutputDir = '',
    [string]$LogDir = '',
    [string]$TempDir = '',
    [string]$SnapshotDir = '',

    [switch]$UpdateSnapshots,
    [string]$SnapshotName = '',

    [switch]$FailOnIssues,
    [switch]$ScanReports
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:ToolRoot = $PSScriptRoot
$script:ScriptVersion = '3.1.0'

$script:Root = $Root
$script:Mode = $Mode
$script:SecretMode = $SecretMode
$script:UpdateSnapshots = $UpdateSnapshots
$script:SnapshotName = $SnapshotName
$script:FailOnIssues = $FailOnIssues
$script:ScanReports = $ScanReports

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $script:OutputDir = Join-Path $script:ToolRoot 'reports'
}
else {
    $script:OutputDir = $OutputDir
}

if ([string]::IsNullOrWhiteSpace($LogDir)) {
    $script:LogDir = Join-Path $script:ToolRoot 'logs'
}
else {
    $script:LogDir = $LogDir
}

if ([string]::IsNullOrWhiteSpace($TempDir)) {
    $script:TempDir = Join-Path $script:ToolRoot 'tmp'
}
else {
    $script:TempDir = $TempDir
}

if ([string]::IsNullOrWhiteSpace($SnapshotDir)) {
    $script:SnapshotDir = Join-Path $script:ToolRoot 'snapshots'
}
else {
    $script:SnapshotDir = $SnapshotDir
}

New-Item -ItemType Directory -Force -Path $script:OutputDir | Out-Null
New-Item -ItemType Directory -Force -Path $script:LogDir | Out-Null
New-Item -ItemType Directory -Force -Path $script:TempDir | Out-Null
New-Item -ItemType Directory -Force -Path $script:SnapshotDir | Out-Null

$script:Timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$script:LogFile = Join-Path $script:LogDir "TalkStream-audit_$($script:Timestamp).log"

$script:ProjectRoot = ''
$script:RiskCount = 0
$script:WarningCount = 0
$script:InfoCount = 0

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = 'INFO'
    )

    $line = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [$Level] $Message"
    Write-Host $line

    if (-not [string]::IsNullOrWhiteSpace($script:LogFile)) {
        Add-Content -LiteralPath $script:LogFile -Value $line -Encoding UTF8
    }
}

function Show-Help {
    Write-Host ''
    Write-Host 'TalkStream audit tool' -ForegroundColor Cyan
    Write-Host 'Version:' $script:ScriptVersion -ForegroundColor Gray
    Write-Host ''
    Write-Host 'Copyable commands:' -ForegroundColor Yellow
    Write-Host '  .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode help'
    Write-Host '  .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode menu'
    Write-Host '  .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode audit'
    Write-Host '  .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode audit -SecretMode redact'
    Write-Host '  .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode audit -SecretMode off'
    Write-Host '  .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode audit -SecretMode redact -ScanReports'
    Write-Host '  .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode secrets -SecretMode redact'
    Write-Host '  .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode secrets -SecretMode raw'
    Write-Host '  .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode snapshots'
    Write-Host '  .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode manifests'
    Write-Host '  .\tools\modules\TalkStream\ScriptTalkStreamAudit\Collect-TalkStreamAudit.ps1 -Mode verify-manifests'
    Write-Host ''
    Write-Host 'Modes:' -ForegroundColor Yellow
    Write-Host '  menu              interactive menu'
    Write-Host '  audit             full TalkStream audit + secret scan'
    Write-Host '  secrets           secret scan only'
    Write-Host '  snapshots         update snapshots'
    Write-Host '  manifests         generate SHA256 manifests'
    Write-Host '  verify-manifests  verify SHA256 manifests'
    Write-Host '  paths             show tool paths'
    Write-Host '  help              show this help'
    Write-Host ''
    Write-Host 'Secret modes:' -ForegroundColor Yellow
    Write-Host '  redact  safe, masked values only in normal reports'
    Write-Host '  raw     dangerous, raw values in logs and ignored raw-secrets_*.md'
    Write-Host '  off     no secret scan'
    Write-Host ''
}

$script:Findings = New-Object System.Collections.Generic.List[object]

function Add-Finding {
    param(
        [string]$Severity,
        [string]$Code,
        [string]$File,
        [int]$Line = 0,
        [string]$Message,
        [string]$Details = ''
    )

    if ($Severity -eq 'Risk' -or $Severity -eq 'Critical' -or $Severity -eq 'High') {
        $script:RiskCount = $script:RiskCount + 1
    }
    elseif ($Severity -eq 'Warning' -or $Severity -eq 'Medium') {
        $script:WarningCount = $script:WarningCount + 1
    }
    else {
        $script:InfoCount = $script:InfoCount + 1
    }

    $script:Findings.Add([pscustomobject]@{
        Severity = $Severity
        Code     = $Code
        File     = $File
        Line     = $Line
        Message  = $Message
        Details  = $Details
    })

    $location = $File
    if ($Line -gt 0) {
        $location = "$File : $Line"
    }

    $level = 'INFO'
    if ($Severity -eq 'Risk' -or $Severity -eq 'Critical' -or $Severity -eq 'High') {
        $level = 'WARN'
    }

    Write-Log "[$Severity] $Code $location - $Message" $level

    if (-not [string]::IsNullOrWhiteSpace($Details)) {
        Write-Log "  Details: $Details" $level
    }
}

function ConvertTo-Posix {
    param([string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return ''
    }

    return ($Path -replace '\\', '/')
}

function Get-ProjectRoot {
    param([string]$StartPath)

    $current = Get-Item -LiteralPath $StartPath

    while ($null -ne $current) {
        $hasResourcesJs = Test-Path -LiteralPath (Join-Path $current.FullName 'resources/js')
        $hasComposer = Test-Path -LiteralPath (Join-Path $current.FullName 'composer.json')
        $hasPackage = Test-Path -LiteralPath (Join-Path $current.FullName 'package.json')

        if ($hasResourcesJs -and ($hasComposer -or $hasPackage)) {
            return $current.FullName
        }

        $parent = $current.Parent

        if ($null -eq $parent) {
            break
        }

        $current = $parent
    }

    throw "Project root not found from: $StartPath"
}

function Get-RepoRelative {
    param(
        [string]$Path,
        [string]$Root
    )

    $p = ConvertTo-Posix $Path
    $r = ConvertTo-Posix $Root

    if ($p.StartsWith($r, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $p.Substring($r.Length).TrimStart('/')
    }

    return $p
}

function Get-CaseInsensitiveDirectory {
    param(
        [string]$ParentPath,
        [string]$Name
    )

    if (-not (Test-Path -LiteralPath $ParentPath)) {
        return $null
    }

    return Get-ChildItem -LiteralPath $ParentPath -Directory -Force |
        Where-Object { $_.Name -ieq $Name } |
        Select-Object -First 1
}

function Get-StringMatches {
    param(
        [string]$Content,
        [string]$Pattern,
        [string]$GroupName
    )

    $result = New-Object System.Collections.Generic.List[string]
    $regexMatches = [regex]::Matches($Content, $Pattern)

    foreach ($match in $regexMatches) {
        $value = $match.Groups[$GroupName].Value

        if (-not [string]::IsNullOrWhiteSpace($value)) {
            $result.Add($value)
        }
    }

    return $result.ToArray()
}

function Get-LineNumber {
    param(
        [string]$Content,
        [int]$Index
    )

    if ($Index -le 0) {
        return 1
    }

    $prefix = $Content.Substring(0, $Index)
    return ($prefix -split "`n").Count
}

$script:SecretPatterns = @(
    [pscustomobject]@{
        Name     = 'APP_KEY'
        Pattern  = '(?i)^\s*APP_KEY\s*=\s*(.+)$'
        Severity = 'Critical'
    },
    [pscustomobject]@{
        Name     = 'DB_PASSWORD'
        Pattern  = '(?i)^\s*DB_PASSWORD\s*=\s*(.+)$'
        Severity = 'Critical'
    },
    [pscustomobject]@{
        Name     = 'REDIS_PASSWORD'
        Pattern  = '(?i)^\s*REDIS_PASSWORD\s*=\s*(.+)$'
        Severity = 'High'
    },
    [pscustomobject]@{
        Name     = 'MAIL_PASSWORD'
        Pattern  = '(?i)^\s*MAIL_PASSWORD\s*=\s*(.+)$'
        Severity = 'Critical'
    },
    [pscustomobject]@{
        Name     = 'REVERB_APP_SECRET'
        Pattern  = '(?i)^\s*REVERB_APP_SECRET\s*=\s*(.+)$'
        Severity = 'Critical'
    },
    [pscustomobject]@{
        Name     = 'REVERB_APP_KEY'
        Pattern  = '(?i)^\s*REVERB_APP_KEY\s*=\s*(.+)$'
        Severity = 'High'
    },
    [pscustomobject]@{
        Name     = 'PRIVATE_KEY'
        Pattern  = '(?i)BEGIN\s+(RSA\s+)?PRIVATE\s+KEY'
        Severity = 'Critical'
    },
    [pscustomobject]@{
        Name     = 'BEARER_TOKEN'
        Pattern  = '(?i)Bearer\s+([A-Za-z0-9\-_\.]{10,})'
        Severity = 'High'
    },
    [pscustomobject]@{
        Name     = 'QUOTED_SECRET_ASSIGNMENT'
        Pattern  = '(?i)(?:^|[\s,\{\(\[])(?:[''"]?)(?:secret|password|passwd|token|api_key|apikey)(?:[''"]?)\s*[:=]\s*[''"]([^''"]{8,})[''"]'
        Severity = 'Medium'
    }
)

function Protect-SecretValue {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return '<empty>'
    }

    $trimmed = $Value.Trim()

    if ($trimmed.Length -le 8) {
        return '********'
    }

    return $trimmed.Substring(0, 4) + '...' + $trimmed.Substring($trimmed.Length - 4)
}

function Get-TextFiles {
    param([string[]]$Paths)

    $allowedExtensions = @(
        '.txt', '.md', '.json', '.csv', '.log',
        '.ps1', '.ts', '.mts', '.js', '.mjs', '.jsx', '.tsx', '.vue'
    )

    $files = New-Object System.Collections.Generic.List[object]

    foreach ($path in $Paths) {
        if (-not (Test-Path -LiteralPath $path)) {
            continue
        }

        $found = Get-ChildItem -LiteralPath $path -Recurse -File -Force |
            Where-Object {
                $allowedExtensions -contains $_.Extension.ToLowerInvariant() -and
                $_.Name -notlike 'raw-secrets_*' -and
                $_.FullName -notmatch '\\node_modules\\' -and
                $_.FullName -notmatch '\\vendor\\' -and
                $_.FullName -notmatch '\\public/build\\'
            }

        foreach ($file in $found) {
            $files.Add($file)
        }
    }

    return $files.ToArray()
}

function Scan-Secrets {
    param(
        [string[]]$Paths,
        [string]$Mode = 'redact'
    )

    $records = New-Object System.Collections.Generic.List[object]
    $rawLines = New-Object System.Collections.Generic.List[string]

    if ($Mode -eq 'off') {
        return [pscustomobject]@{
            Records  = @()
            RawLines = @()
        }
    }

    $files = Get-TextFiles -Paths $Paths

    Write-Log "Secret scan started. Mode: $Mode. Files: $($files.Count)"

    foreach ($file in $files) {
        $relative = Get-RepoRelative -Path $file.FullName -Root $script:ProjectRoot

        try {
            $lines = @(Get-Content -LiteralPath $file.FullName -Encoding UTF8)
        }
        catch {
            Add-Finding `
                -Severity 'Warning' `
                -Code 'SecretScanReadError' `
                -File $relative `
                -Message "Cannot read file during secret scan: $($_.Exception.Message)"
            continue
        }

        for ($i = 0; $i -lt $lines.Count; $i++) {
            $line = $lines[$i]

            if ([string]::IsNullOrWhiteSpace($line)) {
                continue
            }

            foreach ($pattern in $script:SecretPatterns) {
                $match = [regex]::Match($line, $pattern.Pattern)

                if (-not $match.Success) {
                    continue
                }

                $value = ''

                if ($match.Groups.Count -gt 1 -and -not [string]::IsNullOrWhiteSpace($match.Groups[1].Value)) {
                    $value = $match.Groups[1].Value
                }
                else {
                    $value = $match.Value
                }

                $redacted = Protect-SecretValue $value
                $lineNumber = $i + 1

                $record = [pscustomobject]@{
                    File     = $relative
                    Line     = $lineNumber
                    Name     = $pattern.Name
                    Severity = $pattern.Severity
                    Redacted = $redacted
                    Raw      = $value
                }

                $records.Add($record)

                Add-Finding `
                    -Severity $pattern.Severity `
                    -Code "Secret_$($pattern.Name)" `
                    -File $relative `
                    -Line $lineNumber `
                    -Message "Possible secret found: $($pattern.Name)." `
                    -Details "Redacted: $redacted"

                if ($Mode -eq 'raw') {
                    $rawLines.Add("FILE: $relative")
                    $rawLines.Add("LINE: $lineNumber")
                    $rawLines.Add("NAME: $($pattern.Name)")
                    $rawLines.Add("SEVERITY: $($pattern.Severity)")
                    $rawLines.Add("RAW: $value")
                    $rawLines.Add('')

                    Write-Log "RAW SECRET FOUND [$($pattern.Name)] $relative : $lineNumber : $value" 'WARN'
                }
                else {
                    Write-Log "SECRET FOUND [$($pattern.Name)] $relative : $lineNumber : $redacted" 'WARN'
                }
            }
        }
    }

    Write-Log "Secret scan finished. Findings: $($records.Count)"

    return [pscustomobject]@{
        Records  = $records.ToArray()
        RawLines = $rawLines.ToArray()
    }
}

function New-Sha256Manifest {
    param(
        [string]$Directory,
        [string]$ManifestFileName = 'MANIFEST.sha256'
    )

    if (-not (Test-Path -LiteralPath $Directory)) {
        Write-Log "Manifest directory not found: $Directory" 'WARN'
        return
    }

    $manifestPath = Join-Path $Directory $ManifestFileName

    $files = Get-ChildItem -LiteralPath $Directory -File -Force |
        Where-Object {
            $_.Name -ne $ManifestFileName -and
            $_.Name -notlike 'raw-secrets_*'
        } |
        Sort-Object Name

    $lines = New-Object System.Collections.Generic.List[string]

    foreach ($file in $files) {
        $hash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
        $lines.Add(('{0}  {1}' -f $hash, $file.Name))
    }

    [System.IO.File]::WriteAllLines(
        $manifestPath,
        $lines.ToArray(),
        [System.Text.UTF8Encoding]::new($false)
    )

    Write-Log "Manifest written: $manifestPath"
}

function Test-Sha256Manifest {
    param(
        [string]$ManifestPath
    )

    if (-not (Test-Path -LiteralPath $ManifestPath)) {
        Write-Log "Manifest not found: $ManifestPath" 'ERROR'
        Add-Finding `
            -Severity 'Risk' `
            -Code 'ManifestMissing' `
            -File (ConvertTo-Posix $ManifestPath) `
            -Message 'Manifest file is missing.'
        return
    }

    $directory = Split-Path -LiteralPath $ManifestPath -Parent
    $problems = New-Object System.Collections.Generic.List[string]

    $lines = @(Get-Content -LiteralPath $ManifestPath -Encoding UTF8)

    foreach ($line in $lines) {
        if ([string]::IsNullOrWhiteSpace($line)) {
            continue
        }

        $parts = $line -split '\s+', 2

        if ($parts.Count -ne 2) {
            $problems.Add("Bad manifest line: $line")
            continue
        }

        $expectedHash = $parts[0]
        $fileName = $parts[1]
        $filePath = Join-Path $directory $fileName

        if (-not (Test-Path -LiteralPath $filePath)) {
            $problems.Add("Missing file: $fileName")
            continue
        }

        $actualHash = (Get-FileHash -LiteralPath $filePath -Algorithm SHA256).Hash

        if ($actualHash -ne $expectedHash) {
            $problems.Add("Hash mismatch: $fileName")
        }
    }

    if ($problems.Count -eq 0) {
        Write-Log "Manifest OK: $ManifestPath"
    }
    else {
        Write-Log "Manifest FAIL: $ManifestPath" 'ERROR'

        foreach ($problem in $problems) {
            Write-Log "  $problem" 'ERROR'
            Add-Finding `
                -Severity 'Risk' `
                -Code 'ManifestHashMismatch' `
                -File (ConvertTo-Posix $ManifestPath) `
                -Message $problem
        }
    }
}

function Get-TalkStreamModulePaths {
    $jsPath = Join-Path $script:ProjectRoot 'resources/js'
    $modulesDir = Get-CaseInsensitiveDirectory -ParentPath $jsPath -Name 'modules'

    if ($null -eq $modulesDir) {
        throw 'resources/js/modules directory not found, even case-insensitively.'
    }

    $moduleDir = Get-CaseInsensitiveDirectory -ParentPath $modulesDir.FullName -Name 'TalkStream'

    if ($null -eq $moduleDir) {
        throw 'TalkStream module directory not found.'
    }

    return [pscustomobject]@{
        JsPath          = $jsPath
        ModulesDir      = $modulesDir
        ModuleDir       = $moduleDir
        ModulesRelative = Get-RepoRelative -Path $modulesDir.FullName -Root $script:ProjectRoot
        ModuleRelative  = Get-RepoRelative -Path $moduleDir.FullName -Root $script:ProjectRoot
    }
}

function Audit-TalkStreamModule {
    $paths = Get-TalkStreamModulePaths

    Write-Log "Modules directory: $($paths.ModulesRelative)"
    Write-Log "Module directory:  $($paths.ModuleRelative)"

    if ($paths.ModulesDir.Name -cne 'modules') {
        Add-Finding `
            -Severity 'Risk' `
            -Code 'ModulesDirectoryCaseMismatch' `
            -File $paths.ModulesRelative `
            -Message "Actual modules directory is '$($paths.ModulesDir.Name)', but canonical lowercase target is 'modules'." `
            -Details 'Linux/Docker/CentOS/Debian filesystems are case-sensitive. tsconfig/jsconfig point to ./resources/js/modules/.'
    }

    if ($paths.ModuleDir.Name -cne 'TalkStream') {
        Add-Finding `
            -Severity 'Risk' `
            -Code 'TalkStreamDirectoryCaseMismatch' `
            -File $paths.ModuleRelative `
            -Message "Actual module directory is '$($paths.ModuleDir.Name)', but expected exact name is 'TalkStream'."
    }

    $codeExtensions = @('.ts', '.mts', '.js', '.mjs', '.jsx', '.tsx', '.vue')

    $files = @(
        Get-ChildItem -LiteralPath $paths.ModuleDir.FullName -Recurse -File -Force |
            Where-Object {
                $codeExtensions -contains $_.Extension.ToLowerInvariant() -and
                $_.FullName -notmatch '\\node_modules\\'
            }
    )

    Write-Log "Module files scanned: $($files.Count)"

    $inventoryByFolder = $files | ForEach-Object {
        $relative = Get-RepoRelative -Path $_.FullName -Root $paths.ModuleDir.FullName
        $parts = $relative -split '/'

        if ($parts.Count -gt 1) {
            $parts[0]
        }
        else {
            '.'
        }
    } | Group-Object | Sort-Object Name

    $importPatterns = @(
        '\bfrom\s+(?<quote>[''"])(?<spec>[^''"]+)\k<quote>',
        '\bimport\s*\(\s*(?<quote>[''"])(?<spec>[^''"]+)\k<quote>\s*\)',
        '\bimport\s+(?<quote>[''"])(?<spec>[^''"]+)\k<quote>',
        '\brequire\s*\(\s*(?<quote>[''"])(?<spec>[^''"]+)\k<quote>\s*\)'
    )

    $imports = New-Object System.Collections.Generic.List[object]
    $directiveUsage = New-Object System.Collections.Generic.List[object]
    $loadingKeys = New-Object System.Collections.Generic.List[object]
    $registeredDirectives = New-Object System.Collections.Generic.List[string]
    $configZoneKeys = New-Object System.Collections.Generic.List[string]

    foreach ($file in $files) {
        $content = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8

        if ([string]::IsNullOrWhiteSpace($content)) {
            continue
        }

        $relativeFile = Get-RepoRelative -Path $file.FullName -Root $script:ProjectRoot

        foreach ($pattern in $importPatterns) {
            $regexMatches = [regex]::Matches($content, $pattern)

            foreach ($match in $regexMatches) {
                $spec = $match.Groups['spec'].Value

                if ([string]::IsNullOrWhiteSpace($spec)) {
                    continue
                }

                $line = Get-LineNumber -Content $content -Index $match.Index
                $kind = 'package'

                if ($spec.StartsWith('./') -or $spec.StartsWith('../')) {
                    $kind = 'relative'
                }
                elseif ($spec.StartsWith('@/')) {
                    $kind = 'alias-root'
                }
                elseif ($spec.StartsWith('@modules/')) {
                    $kind = 'alias-modules'
                }
                elseif ($spec -eq '@bootstrap' -or $spec.StartsWith('@bootstrap/')) {
                    $kind = 'alias-bootstrap'
                }
                elseif ($spec -eq '@lang' -or $spec.StartsWith('@lang/')) {
                    $kind = 'alias-lang'
                }
                elseif ($spec.StartsWith('@')) {
                    $kind = 'other-alias-or-scoped-package'
                }

                $imports.Add([pscustomobject]@{
                    File = $relativeFile
                    Line = $line
                    Spec = $spec
                    Kind = $kind
                })

                if ($kind -eq 'relative') {
                    Add-Finding `
                        -Severity 'Warning' `
                        -Code 'RelativeImportInsideModule' `
                        -File $relativeFile `
                        -Line $line `
                        -Message "Relative import '$spec' is used inside TalkStream module." `
                        -Details 'Module rule: internal dependencies should grow from @/modules/TalkStream/... or @modules/TalkStream/..., not from ./ or ../.'
                }

                if ($spec -match '\.(ts|js)$') {
                    Add-Finding `
                        -Severity 'Warning' `
                        -Code 'ExtensionInInternalImport' `
                        -File $relativeFile `
                        -Line $line `
                        -Message "Import '$spec' contains explicit .ts/.js extension." `
                        -Details 'Project rule for internal imports: no .ts/.js extensions in paths.'
                }

                if ($spec -cmatch '(^|/)Modules(/|$)') {
                    Add-Finding `
                        -Severity 'Risk' `
                        -Code 'UppercaseModulesInImport' `
                        -File $relativeFile `
                        -Line $line `
                        -Message "Import '$spec' contains uppercase 'Modules' path segment." `
                        -Details 'Canonical path should be modules, not Modules, for Linux/Docker safety.'
                }
            }
        }

        $directiveMatches = [regex]::Matches(
            $content,
            '\bv-(?<directive>loading-talkstream(?:-[a-z0-9-]+)?)(?:\.(?<modifier>[a-zA-Z0-9_-]+))?'
        )

        foreach ($match in $directiveMatches) {
            $line = Get-LineNumber -Content $content -Index $match.Index

            $directiveUsage.Add([pscustomobject]@{
                File      = $relativeFile
                Line      = $line
                Directive = $match.Groups['directive'].Value
                Modifier  = $match.Groups['modifier'].Value
            })
        }

        $useLoadingValues = Get-StringMatches `
            -Content $content `
            -Pattern 'useLoading\(\s*[''"](?<key>[^''"]+)[''"]' `
            -GroupName 'key'

        foreach ($key in $useLoadingValues) {
            $loadingKeys.Add([pscustomobject]@{
                File = $relativeFile
                Type = 'useLoading'
                Key  = $key
            })
        }

        $getStateValues = Get-StringMatches `
            -Content $content `
            -Pattern 'getLoadingState\(\s*[''"](?<key>[^''"]+)[''"]' `
            -GroupName 'key'

        foreach ($key in $getStateValues) {
            $loadingKeys.Add([pscustomobject]@{
                File = $relativeFile
                Type = 'getLoadingState'
                Key  = $key
            })
        }

        $appDirectiveValues = Get-StringMatches `
            -Content $content `
            -Pattern 'app\.directive\(\s*[''"](?<name>[^''"]+)[''"]' `
            -GroupName 'name'

        foreach ($name in $appDirectiveValues) {
            $registeredDirectives.Add($name)
        }

        if ($relativeFile -match 'config/loading\.ts$') {
            $zonesMatch = [regex]::Match($content, 'zones\s*:\s*\{(?<body>[\s\S]*?)\r?\n\s*\}')

            if ($zonesMatch.Success) {
                $zoneKeys = Get-StringMatches `
                    -Content $zonesMatch.Groups['body'].Value `
                    -Pattern '(?m)^\s*(?<key>[A-Za-z0-9_]+)\s*:' `
                    -GroupName 'key'

                foreach ($key in $zoneKeys) {
                    $configZoneKeys.Add($key)
                }
            }
        }
    }

    $usedModifierNames = @($directiveUsage | Where-Object { -not [string]::IsNullOrWhiteSpace($_.Modifier) } | Select-Object -ExpandProperty Modifier | Sort-Object -Unique)
    $usedLoadingKeyNames = @($loadingKeys | Select-Object -ExpandProperty Key | Sort-Object -Unique)
    $registeredDirectiveNames = @($registeredDirectives | Sort-Object -Unique)
    $configZoneNames = @($configZoneKeys | Sort-Object -Unique)

    foreach ($modifier in $usedModifierNames) {
        if ($configZoneNames -notcontains $modifier) {
            Add-Finding `
                -Severity 'Warning' `
                -Code 'LoadingModifierWithoutConfigZone' `
                -File 'config/loading.ts' `
                -Message "Loading modifier '.$modifier' is used in templates, but zones.$modifier is not found in config/loading.ts." `
                -Details 'Either add the zone to config/loading.ts or remove the modifier if it is unused.'
        }
    }

    foreach ($key in $usedLoadingKeyNames) {
        if ($configZoneNames -notcontains $key) {
            Add-Finding `
                -Severity 'Warning' `
                -Code 'LoadingKeyWithoutConfigZone' `
                -File 'config/loading.ts' `
                -Message "useLoading/getLoadingState key '$key' is used, but zones.$key is not found in config/loading.ts."
        }
    }

    foreach ($directive in @('loading-talkstream', 'loading-talkstream-small', 'loading-talkstream-inline')) {
        if ($registeredDirectiveNames -notcontains $directive) {
            Add-Finding `
                -Severity 'Risk' `
                -Code 'ExpectedDirectiveNotRegistered' `
                -File 'Directives/Loading/loadingDirective.ts' `
                -Message "Expected directive '$directive' was not found in app.directive registrations inside TalkStream module."
        }
    }

    return [pscustomobject]@{
        Paths                = $paths
        Files                = $files
        InventoryByFolder    = @($inventoryByFolder)
        Imports              = $imports.ToArray()
        DirectiveUsage       = $directiveUsage.ToArray()
        LoadingKeys          = $loadingKeys.ToArray()
        RegisteredDirectives = $registeredDirectiveNames
        ConfigZones          = $configZoneNames
    }
}

function Write-MarkdownSection {
    param(
        [System.Collections.Generic.List[string]]$Markdown,
        [string]$Title,
        [object[]]$Rows,
        [string[]]$Columns
    )

    $Markdown.Add('')
    $Markdown.Add("## $Title")
    $Markdown.Add('')

    if ($null -eq $Rows) {
        $Markdown.Add('None.')
        return
    }

    $safeRows = @($Rows)

    if ($safeRows.Count -eq 0) {
        $Markdown.Add('None.')
        return
    }

    $header = '| ' + ($Columns -join ' | ') + ' |'
    $separator = '| ' + (($Columns | ForEach-Object { '---' }) -join ' | ') + ' |'

    $Markdown.Add($header)
    $Markdown.Add($separator)

    foreach ($row in $safeRows) {
        $cells = New-Object System.Collections.Generic.List[string]

        if ($null -eq $row) {
            foreach ($column in $Columns) {
                $cells.Add('')
            }

            $Markdown.Add('| ' + ($cells -join ' | ') + ' |')
            continue
        }

        foreach ($column in $Columns) {
            $value = $null

            if ($row -is [System.Collections.IDictionary]) {
                if ($row.Contains($column)) {
                    $value = $row[$column]
                }
            }
            else {
                $property = $row.PSObject.Properties[$column]

                if ($null -ne $property) {
                    $value = $property.Value
                }
            }

            if ($null -eq $value) {
                $value = ''
            }

            $cell = [string]$value

            # Escape characters that break Markdown tables.
            $cell = $cell.Replace('|', '&#124;')
            $cell = $cell.Replace("`r`n", '<br>')
            $cell = $cell.Replace("`n", '<br>')
            $cell = $cell.Replace("`r", '<br>')
            $cell = $cell.Replace("`t", ' ')

            $cells.Add($cell)
        }

        $Markdown.Add('| ' + ($cells -join ' | ') + ' |')
    }
}

function Write-CommonReports {
    param(
        [string]$BaseName,
        [object]$Summary,
        [object[]]$Findings,
        [object[]]$SecretRecords,
        [string[]]$RawSecretLines
    )

    $csvPath = Join-Path $script:OutputDir "$BaseName.csv"
    $jsonPath = Join-Path $script:OutputDir "$BaseName.json"
    $mdPath = Join-Path $script:OutputDir "$BaseName.md"

    @($Findings) | Export-Csv -LiteralPath $csvPath -NoTypeInformation -Encoding UTF8

    $summaryForJson = [ordered]@{
        generatedAt   = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
        scriptVersion = $script:ScriptVersion
        toolRoot      = (ConvertTo-Posix $script:ToolRoot)
        projectRoot   = (ConvertTo-Posix $script:ProjectRoot)
        outputDir     = (ConvertTo-Posix $script:OutputDir)
        logDir        = (ConvertTo-Posix $script:LogDir)
        snapshotDir   = (ConvertTo-Posix $script:SnapshotDir)
        secretMode    = $script:SecretMode
        scanReports   = [bool]$script:ScanReports
        totals        = $Summary.totals
        findings      = @($Findings)
        secretRecords = @($SecretRecords | Select-Object File, Line, Name, Severity, Redacted)
        extra         = $Summary.extra
    }

    $summaryForJson | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $jsonPath -Encoding UTF8

    $markdown = New-Object System.Collections.Generic.List[string]

    $markdown.Add("# $BaseName")
    $markdown.Add('')
    $markdown.Add("- Generated: $($summaryForJson.generatedAt)")
    $markdown.Add("- Script version: $script:ScriptVersion")
    $markdown.Add("- Tool root: ``$($summaryForJson.toolRoot)``")
    $markdown.Add("- Project root: ``$($summaryForJson.projectRoot)``")
    $markdown.Add("- Output dir: ``$($summaryForJson.outputDir)``")
    $markdown.Add("- Log dir: ``$($summaryForJson.logDir)``")
    $markdown.Add("- Snapshot dir: ``$($summaryForJson.snapshotDir)``")
    $markdown.Add("- Secret mode: $script:SecretMode")
    $markdown.Add("- Scan reports: $([bool]$script:ScanReports)")
    $markdown.Add('')
    $markdown.Add('## Totals')
    $markdown.Add('')
    $markdown.Add('| Metric | Value |')
    $markdown.Add('| --- | ---: |')

    foreach ($property in $Summary.totals.PSObject.Properties) {
        $markdown.Add("| $($property.Name) | $($property.Value) |")
    }

    Write-MarkdownSection -Markdown $markdown -Title 'Findings' -Rows $Findings -Columns @('Severity', 'Code', 'File', 'Line', 'Message', 'Details')

    if ($null -ne $SecretRecords -and $SecretRecords.Count -gt 0) {
        Write-MarkdownSection -Markdown $markdown -Title 'Secret findings redacted' -Rows $SecretRecords -Columns @('Severity', 'Name', 'File', 'Line', 'Redacted')
    }

    if ($script:SecretMode -eq 'raw' -and $null -ne $RawSecretLines -and $RawSecretLines.Count -gt 0) {
        $rawPath = Join-Path $script:OutputDir "raw-secrets_$($script:Timestamp).md"

        $rawMarkdown = New-Object System.Collections.Generic.List[string]

        $rawMarkdown.Add('# RAW SECRET REPORT')
        $rawMarkdown.Add('')
        $rawMarkdown.Add('DANGEROUS FILE. DO NOT COMMIT.')
        $rawMarkdown.Add('')
        $rawMarkdown.Add("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
        $rawMarkdown.Add('Secret mode: raw')
        $rawMarkdown.Add('')
        $rawMarkdown.Add('This file is ignored by tools/.gitignore.')
        $rawMarkdown.Add('If you force-add it, secrets will enter Git history.')
        $rawMarkdown.Add('')

        foreach ($line in $RawSecretLines) {
            $rawMarkdown.Add($line)
        }

        ($rawMarkdown -join "`n") | Set-Content -LiteralPath $rawPath -Encoding UTF8

        $markdown.Add('')
        $markdown.Add('## Raw secret sidecar')
        $markdown.Add('')
        $markdown.Add("Raw values were written to ignored file: ``$rawPath``")
        $markdown.Add('')
        $markdown.Add('Do not force-add this file to Git.')

        Write-Log "Raw secret sidecar written: $rawPath" 'WARN'
    }

    $markdown.Add('')
    $markdown.Add('## Output')
    $markdown.Add('')
    $markdown.Add("- CSV: ``$csvPath``")
    $markdown.Add("- JSON: ``$jsonPath``")
    $markdown.Add("- Markdown: ``$mdPath``")

    ($markdown -join "`n") | Set-Content -LiteralPath $mdPath -Encoding UTF8

    Write-Log "Report written: $mdPath"
    Write-Log "Report written: $jsonPath"
    Write-Log "Report written: $csvPath"

    return [pscustomobject]@{
        Csv  = $csvPath
        Json = $jsonPath
        Md   = $mdPath
    }
}

function Run-Audit {
    Write-Log 'Run-Audit started'

    $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root
    Write-Log "Project root: $script:ProjectRoot"

    $audit = Audit-TalkStreamModule

    $secretRecords = @()
    $rawSecretLines = @()

    if ($script:SecretMode -ne 'off') {
        $scanPaths = @(
            $audit.Paths.ModuleDir.FullName,
            $script:SnapshotDir
        )

        if ($script:ScanReports) {
            $scanPaths += $script:OutputDir
        }

        $secretScan = Scan-Secrets -Paths $scanPaths -Mode $script:SecretMode
        $secretRecords = $secretScan.Records
        $rawSecretLines = $secretScan.RawLines
    }

    $importSummary = @($audit.Imports | Group-Object Kind | Select-Object Name, Count | Sort-Object Count -Descending)
    $directiveSummary = @($audit.DirectiveUsage | Group-Object { "$($_.Directive)|$($_.Modifier)" } | Select-Object Name, Count | Sort-Object Name)
    $loadingKeySummary = @($audit.LoadingKeys | Group-Object { "$($_.Type)|$($_.Key)" } | Select-Object Name, Count | Sort-Object Name)
    $inventorySummary = @($audit.InventoryByFolder | Select-Object Name, Count | Sort-Object Name)

    $totals = [ordered]@{
        filesScanned         = $audit.Files.Count
        importRecords        = $audit.Imports.Count
        directiveUsages      = $audit.DirectiveUsage.Count
        loadingKeys          = $audit.LoadingKeys.Count
        registeredDirectives = $audit.RegisteredDirectives.Count
        configZones          = $audit.ConfigZones.Count
        secretFindings       = $secretRecords.Count
        risks                = $script:RiskCount
        warnings             = $script:WarningCount
        infos                = $script:InfoCount
    }

    $summary = [ordered]@{
        totals = $totals
        extra  = [ordered]@{
            modulesDirectory     = $audit.Paths.ModulesRelative
            moduleDirectory      = $audit.Paths.ModuleRelative
            inventorySummary     = $inventorySummary
            importSummary        = $importSummary
            directiveSummary     = $directiveSummary
            loadingKeySummary    = $loadingKeySummary
            registeredDirectives = $audit.RegisteredDirectives
            configZones          = $audit.ConfigZones
        }
    }

    $reportPaths = Write-CommonReports `
        -BaseName "TalkStream-audit_$($script:Timestamp)" `
        -Summary $summary `
        -Findings $script:Findings.ToArray() `
        -SecretRecords $secretRecords `
        -RawSecretLines $rawSecretLines

    Write-Log 'Run-Audit finished'

    return $reportPaths
}

function Run-SecretsOnly {
    Write-Log 'Run-SecretsOnly started'

    $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root
    Write-Log "Project root: $script:ProjectRoot"

    $paths = Get-TalkStreamModulePaths

    $scanPaths = @(
        $paths.ModuleDir.FullName,
        $script:SnapshotDir
    )

    if ($script:ScanReports) {
        $scanPaths += $script:OutputDir
    }

    $secretScan = Scan-Secrets -Paths $scanPaths -Mode $script:SecretMode
    $secretRecords = $secretScan.Records
    $rawSecretLines = $secretScan.RawLines

    $totals = [ordered]@{
        secretFindings = $secretRecords.Count
        risks          = $script:RiskCount
        warnings       = $script:WarningCount
        infos          = $script:InfoCount
        secretMode     = $script:SecretMode
        scanReports    = [bool]$script:ScanReports
    }

    $summary = [ordered]@{
        totals = $totals
        extra  = [ordered]@{
            scanPaths = @($scanPaths | ForEach-Object { Get-RepoRelative -Path $_ -Root $script:ProjectRoot })
        }
    }

    $reportPaths = Write-CommonReports `
        -BaseName "TalkStream-secrets_$($script:Timestamp)" `
        -Summary $summary `
        -Findings $script:Findings.ToArray() `
        -SecretRecords $secretRecords `
        -RawSecretLines $rawSecretLines

    Write-Log 'Run-SecretsOnly finished'

    return $reportPaths
}

function Run-Snapshots {
    Write-Log 'Run-Snapshots started'

    $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root
    $paths = Get-TalkStreamModulePaths

    if (-not $script:UpdateSnapshots) {
        Write-Log 'Use -UpdateSnapshots to write a new snapshot file.' 'WARN'
        return
    }

    if ([string]::IsNullOrWhiteSpace($script:SnapshotName)) {
        $script:SnapshotName = "TalkStream-snapshot_$($script:Timestamp).txt"
    }

    $snapshotPath = Join-Path $script:SnapshotDir $script:SnapshotName

    $codeExtensions = @('.ts', '.mts', '.js', '.mjs', '.jsx', '.tsx', '.vue')

    $files = @(
        Get-ChildItem -LiteralPath $paths.ModuleDir.FullName -Recurse -File -Force |
            Where-Object {
                $codeExtensions -contains $_.Extension.ToLowerInvariant() -and
                $_.FullName -notmatch '\\node_modules\\'
            }
    )

    $sb = New-Object System.Text.StringBuilder

    [void]$sb.AppendLine('TalkStream audit snapshot')
    [void]$sb.AppendLine("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
    [void]$sb.AppendLine("Script version: $script:ScriptVersion")
    [void]$sb.AppendLine("Project root: $script:ProjectRoot")
    [void]$sb.AppendLine("Modules directory: $($paths.ModulesRelative)")
    [void]$sb.AppendLine("Module directory: $($paths.ModuleRelative)")
    [void]$sb.AppendLine('')
    [void]$sb.AppendLine('=== FILES ===')

    foreach ($file in $files) {
        $relative = Get-RepoRelative -Path $file.FullName -Root $script:ProjectRoot

        [void]$sb.AppendLine('')
        [void]$sb.AppendLine("---------- FILE: $relative ----------")

        try {
            $content = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
            [void]$sb.AppendLine($content)
        }
        catch {
            [void]$sb.AppendLine("READ_ERROR: $($_.Exception.Message)")
        }
    }

    [System.IO.File]::WriteAllText(
        $snapshotPath,
        $sb.ToString(),
        [System.Text.UTF8Encoding]::new($false)
    )

    Write-Log "Snapshot written: $snapshotPath"
    Write-Log 'Run-Snapshots finished'
}

function Run-Manifests {
    Write-Log 'Run-Manifests started'

    New-Sha256Manifest -Directory $script:SnapshotDir
    New-Sha256Manifest -Directory $script:OutputDir

    Write-Log 'Run-Manifests finished'
}

function Run-VerifyManifests {
    Write-Log 'Run-VerifyManifests started'

    $snapshotManifest = Join-Path $script:SnapshotDir 'MANIFEST.sha256'
    $reportManifest = Join-Path $script:OutputDir 'MANIFEST.sha256'

    Test-Sha256Manifest -ManifestPath $snapshotManifest
    Test-Sha256Manifest -ManifestPath $reportManifest

    Write-Log 'Run-VerifyManifests finished'
}

function Run-Paths {
    if ([string]::IsNullOrWhiteSpace($script:ProjectRoot)) {
        try {
            $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root
        }
        catch {
            $script:ProjectRoot = '<not found>'
        }
    }

    Write-Host ''
    Write-Host 'Tool paths:' -ForegroundColor Cyan
    Write-Host "  Script version : $script:ScriptVersion"
    Write-Host "  Tool root      : $script:ToolRoot"
    Write-Host "  Project root   : $script:ProjectRoot"
    Write-Host "  Snapshot dir   : $script:SnapshotDir"
    Write-Host "  Report dir     : $script:OutputDir"
    Write-Host "  Log dir        : $script:LogDir"
    Write-Host "  Temp dir       : $script:TempDir"
    Write-Host "  Current log    : $script:LogFile"
    Write-Host ''
}

function Invoke-Menu {
    while ($true) {
        Write-Host ''
        Write-Host 'TalkStream audit menu' -ForegroundColor Cyan
        Write-Host 'Version:' $script:ScriptVersion -ForegroundColor Gray
        Write-Host ''
        Write-Host '1) Full audit, secret mode redact'
        Write-Host '2) Full audit, secret mode off'
        Write-Host '3) Secrets only, redact'
        Write-Host '4) Secrets only, raw local ignored file'
        Write-Host '5) Update snapshots'
        Write-Host '6) Generate manifests'
        Write-Host '7) Verify manifests'
        Write-Host '8) Show paths'
        Write-Host '9) Help'
        Write-Host '10) Full audit, secret mode redact, include reports scan'
        Write-Host 'q) Quit'
        Write-Host ''

        $choice = Read-Host 'Choose action'

        switch ($choice) {
            '1' {
                $script:SecretMode = 'redact'
                $script:ScanReports = $false
                Run-Audit | Out-Null
            }
            '2' {
                $script:SecretMode = 'off'
                $script:ScanReports = $false
                Run-Audit | Out-Null
            }
            '3' {
                $script:SecretMode = 'redact'
                $script:ScanReports = $false
                Run-SecretsOnly | Out-Null
            }
            '4' {
                $script:SecretMode = 'raw'
                $script:ScanReports = $false
                Run-SecretsOnly | Out-Null
            }
            '5' {
                $script:UpdateSnapshots = $true
                Run-Snapshots
            }
            '6' {
                Run-Manifests
            }
            '7' {
                Run-VerifyManifests
            }
            '8' {
                Run-Paths
            }
            '9' {
                Show-Help
            }
            '10' {
                $script:SecretMode = 'redact'
                $script:ScanReports = $true
                Run-Audit | Out-Null
            }
            'q' {
                return
            }
            'Q' {
                return
            }
            default {
                Write-Host 'Unknown choice.' -ForegroundColor Yellow
            }
        }

        Read-Host 'Press Enter to continue'
    }
}

switch ($script:Mode) {
    'help' {
        Show-Help
    }
    'menu' {
        Invoke-Menu
    }
    'audit' {
        Run-Audit | Out-Null
    }
    'secrets' {
        Run-SecretsOnly | Out-Null
    }
    'snapshots' {
        Run-Snapshots
    }
    'manifests' {
        Run-Manifests
    }
    'verify-manifests' {
        Run-VerifyManifests
    }
    'paths' {
        Run-Paths
    }
}

Write-Host ''
Write-Host 'Summary:' -ForegroundColor Cyan
Write-Host "  Risks:    $script:RiskCount" -ForegroundColor $(if ($script:RiskCount -gt 0) { 'Red' } else { 'Green' })
Write-Host "  Warnings: $script:WarningCount" -ForegroundColor $(if ($script:WarningCount -gt 0) { 'Yellow' } else { 'Green' })
Write-Host "  Infos:    $script:InfoCount" -ForegroundColor Gray
Write-Host "  Log:      $script:LogFile" -ForegroundColor Gray

if ($script:FailOnIssues -and ($script:RiskCount -gt 0 -or $script:WarningCount -gt 0)) {
    exit 1
}
