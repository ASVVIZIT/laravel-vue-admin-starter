#Requires -Version 5.1

<#
.SYNOPSIS
    Git policy audit tool package.

.DESCRIPTION
    Self-owned audit tool that validates repository Git policy in one run:
      - P0 secrets / .env / keys (tracked, history, raw sidecars)
      - P1 build / public / vite output
      - P2 laravel storage runtime (logs, media, keys)
      - P3 caches / tests / coverage / ts output
      - P4 OS / editor junk
      - P5 local structure dumps / legacy project dumps
      - P6 tools artifacts (logs/tmp/cache/raw secrets/.env) + evidence tracked
      - P7 generated unplugin types vs handwritten types
      - P8 lock files trackability
      - case-safety: duplicate paths differing only by case in the index
      - ignore-policy: reference list of must-ignore / must-track paths
      - history-scan: secrets/junk in git history

    Writes all artifacts only inside its own package folder:
        tools/system-analysis/ScriptGitPolicyAudit/
          Collect-GitPolicyAudit.ps1
          snapshots/
          reports/
          logs/
          tmp/

    Policy (inherited from tools/.gitignore):
      - snapshots/ is tracked source material;
      - normal reports/ are tracked audit evidence;
      - logs/ and tmp/ are ignored;
      - raw secret reports are ignored even though placed in reports/.

    Secret scan modes:
      redact - safe mode, only masked values go to normal reports/console/log;
      raw    - local dangerous mode, raw values go to logs and raw-secrets_*.md;
      off    - do not scan secret values (still checks .env tracked/history).

.PARAMETER Root
    Start path for project root discovery. Defaults to $PSScriptRoot.

.PARAMETER Mode
    Execution mode.

.PARAMETER SecretMode
    redact | raw | off.

.PARAMETER Repeat
    Number of repetitions for -Mode p0-p5.

.PARAMETER FailOnIssues
    Exit with code 1 if risks or warnings were found.

.NOTES
    Do not commit .env.
    Do not force-add raw-secrets_*.md files.
    This tool reads Git state only; it never modifies the working tree or index.
    This file is authoritative v1.2.1; do not patch it incrementally.
#>

param(
    [string]$Root = $PSScriptRoot,

    [ValidateSet(
        'help',
        'menu',
        'audit',
        'secrets',
        'case-safety',
        'ignore-check',
        'tracked-scan',
        'history-scan',
        'snapshots',
        'manifests',
        'verify-manifests',
        'paths',
        'p0',
        'p1',
        'p2',
        'p3',
        'p4',
        'p5',
        'p6',
        'p7',
        'p8',
        'p0-p5'
    )]
    [string]$Mode = 'help',

    [ValidateSet('redact', 'raw', 'off')]
    [string]$SecretMode = 'redact',

    [string]$OutputDir = '',
    [string]$LogDir = '',
    [string]$TempDir = '',
    [string]$SnapshotDir = '',

    [switch]$UpdateSnapshots,
    [string]$SnapshotName = '',

    [int]$Repeat = 1,

    [switch]$FailOnIssues
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

try {
    chcp 65001 | Out-Null
}
catch { }

$OutputEncoding = [System.Text.UTF8Encoding]::new()

try {
    [Console]::InputEncoding = [System.Text.UTF8Encoding]::new()
    [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
}
catch { }

$script:ToolRoot = $PSScriptRoot
$script:ScriptVersion = '1.2.1'

$script:Root = $Root
$script:SecretMode = $SecretMode
$script:UpdateSnapshots = $UpdateSnapshots
$script:SnapshotName = $SnapshotName

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

$script:StartupStamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss-fff'
$script:LogFile = Join-Path $script:LogDir "GitPolicy-audit_$($script:StartupStamp).log"

$script:ProjectRoot = ''
$script:Results = New-Object System.Collections.Generic.List[object]

$script:PassCount = 0
$script:WarningCount = 0
$script:FailCount = 0
$script:InfoCount = 0
$script:RiskCount = 0

$script:HistoryPaths = $null

function New-Stamp {
    return (Get-Date -Format 'yyyy-MM-dd_HH-mm-ss-fff')
}

function Reset-RunState {
    $script:Results.Clear()
    $script:PassCount = 0
    $script:WarningCount = 0
    $script:FailCount = 0
    $script:InfoCount = 0
    $script:RiskCount = 0
}

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

function Invoke-Git {
    param(
        [string[]]$GitArguments
    )

    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'

    try {
        $all = @()

        if (-not [string]::IsNullOrWhiteSpace($script:ProjectRoot)) {
            $all += @('-C', $script:ProjectRoot)
        }

        $all += $GitArguments

        $out = & git @all 2>&1
        $code = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $prev
    }

    $lines = New-Object System.Collections.Generic.List[string]

    foreach ($o in $out) {
        if ($null -eq $o) {
            continue
        }

        if ($o -is [System.Management.Automation.ErrorRecord]) {
            $lines.Add($o.Exception.Message)
        }
        else {
            $lines.Add([string]$o)
        }
    }

    return [pscustomobject]@{
        Lines    = $lines.ToArray()
        ExitCode = $code
    }
}

function ConvertTo-Posix {
    param(
        [string]$Path
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return ''
    }

    return ($Path -replace '\\', '/')
}

function Get-ProjectRoot {
    param(
        [string]$StartPath
    )

    $current = Get-Item -LiteralPath $StartPath

    while ($null -ne $current) {
        $hasResourcesJs = Test-Path -LiteralPath (Join-Path $current.FullName 'resources/js')
        $hasComposer = Test-Path -LiteralPath (Join-Path $current.FullName 'composer.json')
        $hasPackage = Test-Path -LiteralPath (Join-Path $current.FullName 'package.json')
        $hasGit = Test-Path -LiteralPath (Join-Path $current.FullName '.git')

        if ($hasGit -and $hasResourcesJs -and ($hasComposer -or $hasPackage)) {
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

function Add-Result {
    param(
        [string]$Group,
        [string]$Id,
        [string]$Status,
        [string]$Target,
        [string]$Message,
        [string]$Hint = ''
    )

    if ($Status -eq 'PASS') {
        $script:PassCount = $script:PassCount + 1
    }
    elseif ($Status -eq 'FAIL') {
        $script:FailCount = $script:FailCount + 1
        $script:RiskCount = $script:RiskCount + 1
    }
    elseif ($Status -eq 'WARN') {
        $script:WarningCount = $script:WarningCount + 1
    }
    else {
        $script:InfoCount = $script:InfoCount + 1
    }

    $script:Results.Add([pscustomobject]@{
        Group   = $Group
        Id      = $Id
        Status  = $Status
        Target  = $Target
        Message = $Message
        Hint    = $Hint
    })

    $color = 'Gray'

    if ($Status -eq 'PASS') {
        $color = 'Green'
    }
    elseif ($Status -eq 'FAIL') {
        $color = 'Red'
    }
    elseif ($Status -eq 'WARN') {
        $color = 'Yellow'
    }

    $line = "[$Status] $Group/$Id :: $Target :: $Message"
    Write-Host $line -ForegroundColor $color

    $logLevel = 'INFO'
    if ($Status -eq 'FAIL') {
        $logLevel = 'WARN'
    }

    Write-Log $line $logLevel

    if (-not [string]::IsNullOrWhiteSpace($Hint)) {
        $hintLine = "    HINT: $Hint"
        Write-Host $hintLine -ForegroundColor DarkGray
        Write-Log $hintLine
    }
}

function Test-PathIgnored {
    param(
        [string]$RelPath
    )

    $r = Invoke-Git -GitArguments @('check-ignore', '-v', '--no-index', $RelPath)

    $ignored = $false
    $rule = ''

    if ($r.ExitCode -eq 0 -and $r.Lines.Count -gt 0) {
        $rule = $r.Lines[0]

        $tabParts = $rule -split "`t", 2
        $meta = $tabParts[0]

        $firstColon = $meta.IndexOf(':')
        $secondColon = -1

        if ($firstColon -ge 0) {
            $secondColon = $meta.IndexOf(':', $firstColon + 1)
        }

        $patternText = $meta

        if ($secondColon -ge 0) {
            $patternText = $meta.Substring($secondColon + 1)
        }

        if (-not [string]::IsNullOrWhiteSpace($patternText) -and $patternText.StartsWith('!')) {
            $ignored = $false
        }
        else {
            $ignored = $true
        }
    }

    return [pscustomobject]@{
        Ignored = $ignored
        Rule    = $rule
    }
}

function Get-TrackedFiles {
    param(
        [string]$Prefix = ''
    )

    $gitArgs = @('ls-files')

    if (-not [string]::IsNullOrWhiteSpace($Prefix)) {
        $gitArgs += $Prefix
    }

    $r = Invoke-Git -GitArguments $gitArgs

    return @($r.Lines | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
}

$script:SecretPatterns = @(
    [pscustomobject]@{
        Name     = 'APP_KEY'
        Pattern  = '(?i)^\s*APP_KEY\s*=\s*(\S+)'
        Severity = 'Critical'
    },
    [pscustomobject]@{
        Name     = 'DB_PASSWORD'
        Pattern  = '(?i)^\s*DB_PASSWORD\s*=\s*(\S+)'
        Severity = 'Critical'
    },
    [pscustomobject]@{
        Name     = 'REDIS_PASSWORD'
        Pattern  = '(?i)^\s*REDIS_PASSWORD\s*=\s*(\S+)'
        Severity = 'High'
    },
    [pscustomobject]@{
        Name     = 'MAIL_PASSWORD'
        Pattern  = '(?i)^\s*MAIL_PASSWORD\s*=\s*(\S+)'
        Severity = 'Critical'
    },
    [pscustomobject]@{
        Name     = 'REVERB_SECRET'
        Pattern  = '(?i)^\s*REVERB_APP_SECRET\s*=\s*(\S+)'
        Severity = 'Critical'
    },
    [pscustomobject]@{
        Name     = 'REVERB_KEY'
        Pattern  = '(?i)^\s*REVERB_APP_KEY\s*=\s*(\S+)'
        Severity = 'High'
    },
    [pscustomobject]@{
        Name     = 'PRIVATE_KEY'
        Pattern  = '(?i)BEGIN\s+(RSA\s+|OPENSSH\s+)?PRIVATE\s+KEY'
        Severity = 'Critical'
    },
    [pscustomobject]@{
        Name     = 'BEARER_TOKEN'
        Pattern  = '(?i)Bearer\s+([A-Za-z0-9\-_\.]{10,})'
        Severity = 'High'
    },
    [pscustomobject]@{
        Name     = 'QUOTED_SECRET'
        Pattern  = '(?i)(?:secret|password|passwd|token|api_key|apikey)\s*[:=]\s*[''"]([^''"]{8,})[''"]'
        Severity = 'Medium'
    }
)

function Protect-SecretValue {
    param(
        [string]$Value
    )

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return '<empty>'
    }

    $t = $Value.Trim()

    if ($t.Length -le 8) {
        return '********'
    }

    return $t.Substring(0, 4) + '...' + $t.Substring($t.Length - 4)
}

function Test-PlaceholderSecretValue {
    param(
        [string]$Value
    )

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $true
    }

    $trimChars = [char[]]@('"', "'")
    $v = $Value.Trim($trimChars)

    if ([string]::IsNullOrWhiteSpace($v)) {
        return $true
    }

    if ($v -match '(?i)^(<.*>|\*+|changeme.*|example.*|dummy.*|test.*|secret.*|password.*|replace.*|redacted.*|your[-_].*|base64:<.*>)$') {
        return $true
    }

    return $false
}

$script:IgnoreReference = @(
    [pscustomobject]@{ Id = 'P0-ENV';        Group = 'P0'; Path = '.env';                              Expect = 'ignored'; Hint = '.env' },
    [pscustomobject]@{ Id = 'P0-ENV-LOCAL';  Group = 'P0'; Path = '.env.local';                        Expect = 'ignored'; Hint = '.env.*' },
    [pscustomobject]@{ Id = 'P0-ENV-PROD';   Group = 'P0'; Path = '.env.production';                   Expect = 'ignored'; Hint = '.env.*' },
    [pscustomobject]@{ Id = 'P0-ENV-TXT';    Group = 'P0'; Path = '.env.txt';                          Expect = 'ignored'; Hint = '.env.*' },
    [pscustomobject]@{ Id = 'P0-ENV-EX';     Group = 'P0'; Path = '.env.example';                      Expect = 'tracked'; Hint = '!.env.example' },
    [pscustomobject]@{ Id = 'P0-KEY-NESTED'; Group = 'P0'; Path = 'storage/nested/private.key';        Expect = 'ignored'; Hint = '/storage/**/*.key' },

    [pscustomobject]@{ Id = 'P1-BUILD';       Group = 'P1'; Path = 'public/build/assets/app.js';       Expect = 'ignored'; Hint = '/public/build/* or public/.gitignore /build/*' },
    [pscustomobject]@{ Id = 'P1-BUILD-KEEP';  Group = 'P1'; Path = 'public/build/.gitkeep';            Expect = 'tracked'; Hint = '!/public/build/.gitkeep and public/.gitignore !/build/.gitkeep' },
    [pscustomobject]@{ Id = 'P1-HOT';         Group = 'P1'; Path = 'public/hot';                       Expect = 'ignored'; Hint = '/public/hot' },
    [pscustomobject]@{ Id = 'P1-STORAGE-LNK'; Group = 'P1'; Path = 'public/storage';                   Expect = 'ignored'; Hint = '/public/storage' },
    [pscustomobject]@{ Id = 'P1-CHROME';      Group = 'P1'; Path = 'public/chromedriver.exe';          Expect = 'ignored'; Hint = '/public/chromedriver.exe' },

    [pscustomobject]@{ Id = 'P2-LOG';      Group = 'P2'; Path = 'storage/logs/laravel.log';          Expect = 'ignored'; Hint = '/storage/logs/*' },
    [pscustomobject]@{ Id = 'P2-VIEW';     Group = 'P2'; Path = 'storage/framework/views/abc.php';   Expect = 'ignored'; Hint = '/storage/framework/views/*' },
    [pscustomobject]@{ Id = 'P2-VID-MP4';  Group = 'P2'; Path = 'storage/Videos/test.mp4';           Expect = 'ignored'; Hint = '/storage/Videos/* or /storage/**/*.mp4' },
    [pscustomobject]@{ Id = 'P2-VID-WEBM'; Group = 'P2'; Path = 'storage/Videos/test.webm';          Expect = 'ignored'; Hint = '/storage/Videos/* or /storage/**/*.webm' },
    [pscustomobject]@{ Id = 'P2-VID-MOV';  Group = 'P2'; Path = 'storage/Videos/test.mov';           Expect = 'ignored'; Hint = '/storage/Videos/* or /storage/**/*.mov' },
    [pscustomobject]@{ Id = 'P2-VID-KEEP'; Group = 'P2'; Path = 'storage/Videos/.gitkeep';           Expect = 'tracked'; Hint = '!/storage/Videos/.gitkeep' },

    [pscustomobject]@{ Id = 'P3-VITE';    Group = 'P3'; Path = '.vite/deps/chunk.js';     Expect = 'ignored'; Hint = '/.vite' },
    [pscustomobject]@{ Id = 'P3-TSOUT';   Group = 'P3'; Path = 'ts-out-dir/index.js';     Expect = 'ignored'; Hint = '/ts-out-dir' },
    [pscustomobject]@{ Id = 'P3-COV';     Group = 'P3'; Path = 'coverage/index.html';     Expect = 'ignored'; Hint = '/coverage' },
    [pscustomobject]@{ Id = 'P3-STATS';   Group = 'P3'; Path = 'stats.html';              Expect = 'ignored'; Hint = '/stats.html' },
    [pscustomobject]@{ Id = 'P3-TSBUILD'; Group = 'P3'; Path = 'foo.tsbuildinfo';         Expect = 'ignored'; Hint = '*.tsbuildinfo' },

    [pscustomobject]@{ Id = 'P4-DS';     Group = 'P4'; Path = '.DS_Store'; Expect = 'ignored'; Hint = '.DS_Store' },
    [pscustomobject]@{ Id = 'P4-THUMBS'; Group = 'P4'; Path = 'Thumbs.db'; Expect = 'ignored'; Hint = 'Thumbs.db' },
    [pscustomobject]@{ Id = 'P4-TMP';    Group = 'P4'; Path = 'foo.tmp';   Expect = 'ignored'; Hint = '*.tmp' },

    [pscustomobject]@{ Id = 'P5-DUMP-CREATE'; Group = 'P5'; Path = 'resources/js/components/SmartLight/dump_create_structure_tree.bat'; Expect = 'ignored'; Hint = '**/dump_create_structure_tree.bat' },
    [pscustomobject]@{ Id = 'P5-DUMP-TREE';   Group = 'P5'; Path = 'resources/js/components/dump_structure_tree.bat';                  Expect = 'ignored'; Hint = '**/dump_structure_tree.bat' },
    [pscustomobject]@{ Id = 'P5-TREE-TXT';    Group = 'P5'; Path = 'resources/js/components/project_structure_tree.txt';               Expect = 'ignored'; Hint = '**/project_structure_tree.txt' },
    [pscustomobject]@{ Id = 'P5-COLLECTED';   Group = 'P5'; Path = 'collected_dump_with_models_migrations.txt';                        Expect = 'ignored'; Hint = '/collected_dump*.txt' },
    [pscustomobject]@{ Id = 'P5-UNIVERSAL';   Group = 'P5'; Path = 'universal_dynamic_tables_dump.txt';                                Expect = 'ignored'; Hint = '/universal_dynamic_tables_dump.txt' },
    [pscustomobject]@{ Id = 'P5-VERSIONS';    Group = 'P5'; Path = 'versions_before.txt';                                              Expect = 'ignored'; Hint = '/versions_before.txt' },

    [pscustomobject]@{ Id = 'P6-TOOLS-LOG';  Group = 'P6'; Path = 'tools/modules/TalkStream/ScriptTalkStreamAudit/logs/x.log';                  Expect = 'ignored'; Hint = '/tools/**/logs/*' },
    [pscustomobject]@{ Id = 'P6-TOOLS-TMP';  Group = 'P6'; Path = 'tools/modules/TalkStream/ScriptTalkStreamAudit/tmp/x.tmp';                   Expect = 'ignored'; Hint = '/tools/**/tmp/*' },
    [pscustomobject]@{ Id = 'P6-TOOLS-RAW';  Group = 'P6'; Path = 'tools/modules/TalkStream/ScriptTalkStreamAudit/reports/raw-secrets_x.md';    Expect = 'ignored'; Hint = '/tools/**/reports/raw-secrets_*' },
    [pscustomobject]@{ Id = 'P6-TOOLS-ENV';  Group = 'P6'; Path = 'tools/modules/TalkStream/ScriptTalkStreamAudit/.env';                        Expect = 'ignored'; Hint = '/tools/**/.env' },
    [pscustomobject]@{ Id = 'P6-TOOLS-KEEP'; Group = 'P6'; Path = 'tools/modules/TalkStream/ScriptTalkStreamAudit/logs/.gitkeep';               Expect = 'tracked'; Hint = '!/tools/**/logs/.gitkeep' },
    [pscustomobject]@{ Id = 'P6-TOOLS-REP';  Group = 'P6'; Path = 'tools/modules/TalkStream/ScriptTalkStreamAudit/reports/evidence.md';         Expect = 'tracked'; Hint = 'evidence tracked' },
    [pscustomobject]@{ Id = 'P6-TOOLS-SNAP'; Group = 'P6'; Path = 'tools/modules/TalkStream/ScriptTalkStreamAudit/snapshots/evidence.txt';      Expect = 'tracked'; Hint = 'snapshots tracked' },

    [pscustomobject]@{ Id = 'P7-AUTOIMP';    Group = 'P7'; Path = 'types/auto-imports.d.ts'; Expect = 'ignored'; Hint = '/types/auto-imports.d.ts' },
    [pscustomobject]@{ Id = 'P7-COMPONENTS'; Group = 'P7'; Path = 'types/components.d.ts';   Expect = 'ignored'; Hint = '/types/components.d.ts' },
    [pscustomobject]@{ Id = 'P7-HAND';       Group = 'P7'; Path = 'types/custom.d.ts';       Expect = 'tracked'; Hint = 'handwritten types tracked' },
    [pscustomobject]@{ Id = 'P7-KEEP';       Group = 'P7'; Path = 'types/.gitkeep';          Expect = 'tracked'; Hint = '!/types/.gitkeep' },

    [pscustomobject]@{ Id = 'P8-COMPOSER'; Group = 'P8'; Path = 'composer.lock';     Expect = 'tracked'; Hint = 'lock trackable' },
    [pscustomobject]@{ Id = 'P8-NPM';      Group = 'P8'; Path = 'package-lock.json'; Expect = 'tracked'; Hint = 'lock trackable' }
)

function Run-IgnoreCheck {
    param(
        [string]$GroupId = ''
    )

    $groupLabel = 'ALL'
    if (-not [string]::IsNullOrWhiteSpace($GroupId)) {
        $groupLabel = $GroupId
    }

    Write-Log "Run-IgnoreCheck started. Group: $groupLabel"

    $refs = $script:IgnoreReference

    if (-not [string]::IsNullOrWhiteSpace($GroupId)) {
        $refs = @($refs | Where-Object { $_.Group -eq $GroupId })
    }

    foreach ($ref in $refs) {
        $res = Test-PathIgnored -RelPath $ref.Path

        $ok = $false

        if ($ref.Expect -eq 'ignored') {
            $ok = $res.Ignored
        }
        else {
            $ok = -not $res.Ignored
        }

        if ($ok) {
            $detail = 'not ignored (as expected)'

            if ($res.Ignored) {
                $detail = "ignored by: $($res.Rule)"
            }

            Add-Result -Group $ref.Group -Id $ref.Id -Status 'PASS' -Target $ref.Path -Message $detail
        }
        else {
            $expected = 'must be TRACKED (not ignored)'
            if ($ref.Expect -eq 'ignored') {
                $expected = 'must be IGNORED'
            }

            $actual = 'but NOT ignored'
            if ($res.Ignored) {
                $actual = "but ignored by: $($res.Rule)"
            }

            Add-Result -Group $ref.Group -Id $ref.Id -Status 'FAIL' -Target $ref.Path -Message "$expected, $actual" -Hint $ref.Hint
        }
    }

    Write-Log 'Run-IgnoreCheck finished'
}

function Run-TrackedScan {
    param(
        [string]$GroupId = ''
    )

    $groupLabel = 'ALL'
    if (-not [string]::IsNullOrWhiteSpace($GroupId)) {
        $groupLabel = $GroupId
    }

    Write-Log "Run-TrackedScan started. Group: $groupLabel"

    $zones = @(
        [pscustomobject]@{
            Id        = 'P0'
            Prefix    = ''
            BadRegex  = '(^|/)\.env'
            GoodRegex = '\.env\.example$'
            Label     = 'env files'
        },
        [pscustomobject]@{
            Id        = 'P2'
            Prefix    = 'storage'
            BadRegex  = '\.log$|\.mp4$|\.webm$|\.mov$|\.avi$|\.mkv$|\.mp3$|\.wav$|\.jpg$|\.jpeg$|\.png$|\.gif$|\.webp$|\.key$'
            GoodRegex = '\.gitkeep$'
            Label     = 'storage runtime/media/keys'
        },
        [pscustomobject]@{
            Id        = 'P1'
            Prefix    = 'public/build'
            BadRegex  = '.'
            GoodRegex = '\.gitkeep$'
            Label     = 'public/build non-keep'
        },
        [pscustomobject]@{
            Id        = 'P6'
            Prefix    = 'tools'
            BadRegex  = '/logs/[^/]*\.log$|/tmp/|/cache/|raw-secrets_|raw_secrets_|(^|/)\.env'
            GoodRegex = '\.gitkeep$|\.env\.example$'
            Label     = 'tools artifacts'
        },
        [pscustomobject]@{
            Id        = 'P7'
            Prefix    = 'types'
            BadRegex  = 'auto-imports\.d\.ts$|components\.d\.ts$'
            GoodRegex = ''
            Label     = 'generated unplugin types'
        },
        [pscustomobject]@{
            Id        = 'P5'
            Prefix    = ''
            BadRegex  = 'dump_structure_tree|dump_create_structure_tree|project_structure_tree|project_create_structure_tree|collected_dump|universal_dynamic_tables_dump|project_dump|dynamic_tables_dump|versions_before\.txt$'
            GoodRegex = ''
            Label     = 'local/legacy dumps'
        }
    )

    if (-not [string]::IsNullOrWhiteSpace($GroupId)) {
        $zones = @($zones | Where-Object { $_.Id -eq $GroupId })
    }

    foreach ($z in $zones) {
        $files = @(Get-TrackedFiles -Prefix $z.Prefix)

        $bad = @($files | Where-Object {
            $_ -match $z.BadRegex -and ($z.GoodRegex -eq '' -or $_ -notmatch $z.GoodRegex)
        })

        if ($bad.Count -eq 0) {
            Add-Result -Group $z.Id -Id "TRACK-$($z.Id)" -Status 'PASS' -Target $z.Label -Message "no bad tracked files ($($files.Count) total in zone)"
        }
        else {
            $list = ($bad | Select-Object -First 20) -join ', '
            Add-Result -Group $z.Id -Id "TRACK-$($z.Id)" -Status 'FAIL' -Target $z.Label -Message "tracked bad files: $list" -Hint 'git rm --cached <file> and ensure ignore rule'
        }
    }

    if ([string]::IsNullOrWhiteSpace($GroupId)) {
        $gitignoreTracked = @(Get-TrackedFiles -Prefix '.gitignore')
        $toolsIgnoreTracked = @(Get-TrackedFiles -Prefix 'tools/.gitignore')

        if ($gitignoreTracked.Count -gt 0) {
            Add-Result -Group 'META' -Id 'TRACK-GITIGNORE' -Status 'PASS' -Target '.gitignore' -Message 'tracked'
        }
        else {
            Add-Result -Group 'META' -Id 'TRACK-GITIGNORE' -Status 'WARN' -Target '.gitignore' -Message 'not tracked' -Hint 'git add .gitignore'
        }

        if ($toolsIgnoreTracked.Count -gt 0) {
            Add-Result -Group 'META' -Id 'TRACK-TOOLS-GITIGNORE' -Status 'PASS' -Target 'tools/.gitignore' -Message 'tracked'
        }
        else {
            Add-Result -Group 'META' -Id 'TRACK-TOOLS-GITIGNORE' -Status 'WARN' -Target 'tools/.gitignore' -Message 'not tracked' -Hint 'git add tools/.gitignore'
        }
    }

    Write-Log 'Run-TrackedScan finished'
}

function Add-GrepCheck {
    param(
        [object]$Result,
        [string]$GroupId,
        [string]$Id,
        [string]$Target,
        [string]$FailMessagePrefix,
        [string]$PassMessage,
        [string]$Hint,
        [string]$MatchStatus = 'FAIL'
    )

    if ($Result.ExitCode -eq 0) {
        if ($Result.Lines.Count -gt 0) {
            $sample = ($Result.Lines | Select-Object -First 5) -join ' ; '
            Add-Result -Group $GroupId -Id $Id -Status $MatchStatus -Target $Target -Message "$($FailMessagePrefix): $sample" -Hint $Hint
        }
        else {
            Add-Result -Group $GroupId -Id $Id -Status 'PASS' -Target $Target -Message $PassMessage
        }
    }
    elseif ($Result.ExitCode -eq 1) {
        Add-Result -Group $GroupId -Id $Id -Status 'PASS' -Target $Target -Message $PassMessage
    }
    else {
        $sample = ($Result.Lines | Select-Object -First 5) -join ' ; '
        Add-Result -Group $GroupId -Id $Id -Status 'WARN' -Target $Target -Message "git grep failed with exit code $($Result.ExitCode): $sample" -Hint $Hint
    }
}

function Run-CaseSafety {
    Write-Log 'Run-CaseSafety started'

    $files = @(Get-TrackedFiles)

    $dups = $files |
        ForEach-Object {
            [pscustomobject]@{
                Lower = $_.ToLowerInvariant()
                Path  = $_
            }
        } |
        Group-Object Lower |
        Where-Object { $_.Count -gt 1 }

    if (@($dups).Count -eq 0) {
        Add-Result -Group 'CASE' -Id 'CASE-DUP' -Status 'PASS' -Target 'index' -Message 'no paths differing only by case'
    }
    else {
        foreach ($d in $dups) {
            $list = ($d.Group.Path) -join ' | '
            Add-Result -Group 'CASE' -Id 'CASE-DUP' -Status 'FAIL' -Target $d.Name -Message "case-duplicate group: $list" -Hint 'linux/docker will break; keep single canonical case in index'
        }
    }

    $upperModules = @($files | Where-Object { $_ -match '^resources/js/Modules/' })

    if ($upperModules.Count -eq 0) {
        Add-Result -Group 'CASE' -Id 'CASE-MODULES-PARENT' -Status 'PASS' -Target 'resources/js/modules' -Message 'no uppercase Modules parent in index'
    }
    else {
        Add-Result -Group 'CASE' -Id 'CASE-MODULES-PARENT' -Status 'FAIL' -Target 'resources/js/Modules' -Message "uppercase Modules still tracked: $($upperModules.Count) files" -Hint 'git rm -r --cached resources/js/Modules ; git add resources/js/modules'
    }

    $lowerModules = @($files | Where-Object { $_ -match '^resources/js/modules/' })

    if ($lowerModules.Count -gt 0) {
        Add-Result -Group 'CASE' -Id 'CASE-MODULES-LOWER' -Status 'INFO' -Target 'resources/js/modules' -Message "lowercase modules tracked: $($lowerModules.Count) files"
    }

    $upperImports = Invoke-Git -GitArguments @(
        'grep',
        '-nI',
        '-e', '@/Modules/',
        '-e', '@Modules/',
        '-e', '../Modules/',
        '--',
        'resources/js'
    )

    Add-GrepCheck `
        -Result $upperImports `
        -GroupId 'CASE' `
        -Id 'CASE-IMPORTS' `
        -Target 'resources/js imports' `
        -FailMessagePrefix 'uppercase Modules in tracked imports' `
        -PassMessage 'no uppercase Modules in tracked imports' `
        -Hint 'normalize @/Modules -> @/modules before rename commit' `
        -MatchStatus 'FAIL'

    $globCheck = Invoke-Git -GitArguments @(
        'grep',
        '-nI',
        '-e', 'Modules/',
        '-e', '../Modules',
        '--',
        'resources/js/plugins/moduleDirectives.ts'
    )

    Add-GrepCheck `
        -Result $globCheck `
        -GroupId 'CASE' `
        -Id 'CASE-GLOB' `
        -Target 'moduleDirectives.ts glob' `
        -FailMessagePrefix 'uppercase Modules in glob/comments' `
        -PassMessage 'no uppercase Modules in glob' `
        -Hint 'glob case must match real on-disk folder case' `
        -MatchStatus 'WARN'

    Write-Log 'Run-CaseSafety finished'
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

function Run-Secrets {
    Write-Log "Run-Secrets started. Mode: $($script:SecretMode)"

    if ([string]::IsNullOrWhiteSpace($script:ProjectRoot)) {
        $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root
    }

    $tracked = @(Get-TrackedFiles)

    $envTracked = @($tracked | Where-Object {
        $_ -match '(^|/)\.env' -and $_ -notmatch '\.env\.example$'
    })

    if ($envTracked.Count -eq 0) {
        Add-Result -Group 'P0' -Id 'SEC-ENV-TRACKED' -Status 'PASS' -Target 'tracked .env*' -Message 'no real .env tracked'
    }
    else {
        Add-Result -Group 'P0' -Id 'SEC-ENV-TRACKED' -Status 'FAIL' -Target 'tracked .env*' -Message "real .env tracked: $($envTracked -join ', ')" -Hint 'git rm --cached ; rotate secrets ; clean history'
    }

    $rawSidecars = @($tracked | Where-Object {
        $_ -match 'raw-secrets_|raw_secrets_'
    })

    if ($rawSidecars.Count -eq 0) {
        Add-Result -Group 'P0' -Id 'SEC-RAW-TRACKED' -Status 'PASS' -Target 'tracked raw-secrets_*' -Message 'no raw secret sidecars tracked'
    }
    else {
        Add-Result -Group 'P0' -Id 'SEC-RAW-TRACKED' -Status 'FAIL' -Target 'tracked raw-secrets_*' -Message "raw secret sidecars tracked: $($rawSidecars -join ', ')" -Hint 'git rm --cached ; never force-add'
    }

    if ($script:SecretMode -eq 'off') {
        Add-Result -Group 'P0' -Id 'SEC-VALUE-SCAN' -Status 'INFO' -Target 'secret values' -Message 'value scan disabled (SecretMode=off)'
        Write-Log 'Run-Secrets finished (value scan off)'
        return
    }

    $scanRoots = @(
        'resources/js',
        'tools',
        'config',
        'app',
        'routes',
        'tests'
    )

    $allowedExt = @(
        '.txt',
        '.md',
        '.json',
        '.csv',
        '.ts',
        '.mts',
        '.js',
        '.mjs',
        '.jsx',
        '.tsx',
        '.vue',
        '.php',
        '.ps1',
        '.yaml',
        '.yml',
        '.example'
    )

    $rawLines = New-Object System.Collections.Generic.List[string]
    $valueHits = 0

    foreach ($root in $scanRoots) {
        $abs = Join-Path $script:ProjectRoot $root

        if (-not (Test-Path -LiteralPath $abs)) {
            continue
        }

        $files = Get-ChildItem -LiteralPath $abs -Recurse -File -Force -ErrorAction SilentlyContinue |
            Where-Object {
                $allowedExt -contains $_.Extension.ToLowerInvariant() -and
                $_.FullName -notmatch '\\node_modules\\' -and
                $_.FullName -notmatch '\\vendor\\' -and
                $_.FullName -notmatch '\\public\\build\\' -and
                $_.Name -notlike 'raw-secrets_*' -and
                $_.Name -notlike 'raw_secrets_*' -and
                $_.Name -notlike '*.log'
            }

        foreach ($f in $files) {
            $rel = ConvertTo-Posix (Get-RepoRelative -Path $f.FullName -Root $script:ProjectRoot)

            try {
                $lines = @(Get-Content -LiteralPath $f.FullName -Encoding UTF8 -ErrorAction Stop)
            }
            catch {
                continue
            }

            for ($i = 0; $i -lt $lines.Count; $i++) {
                $line = $lines[$i]

                if ([string]::IsNullOrWhiteSpace($line)) {
                    continue
                }

                foreach ($p in $script:SecretPatterns) {
                    $m = [regex]::Match($line, $p.Pattern)

                    if (-not $m.Success) {
                        continue
                    }

                    $value = $m.Value

                    if ($m.Groups.Count -gt 1 -and -not [string]::IsNullOrWhiteSpace($m.Groups[1].Value)) {
                        $value = $m.Groups[1].Value
                    }

                    if (Test-PlaceholderSecretValue -Value $value) {
                        continue
                    }

                    $redacted = Protect-SecretValue $value
                    $ln = $i + 1
                    $valueHits++

                    $sev = 'WARN'
                    if ($p.Severity -eq 'Critical' -or $p.Severity -eq 'High') {
                        $sev = 'FAIL'
                    }

                    Add-Result -Group 'P0' -Id "SEC-$($p.Name)" -Status $sev -Target "$rel : $ln" -Message "possible secret $($p.Name): $redacted"

                    if ($script:SecretMode -eq 'raw') {
                        $rawLines.Add("FILE: $rel")
                        $rawLines.Add("LINE: $ln")
                        $rawLines.Add("NAME: $($p.Name)")
                        $rawLines.Add("SEVERITY: $($p.Severity)")
                        $rawLines.Add("RAW: $value")
                        $rawLines.Add('')

                        Write-Log "RAW SECRET [$($p.Name)] $rel : $ln : $value" 'WARN'
                    }
                }
            }
        }
    }

    if ($valueHits -eq 0) {
        Add-Result -Group 'P0' -Id 'SEC-VALUE-SCAN' -Status 'PASS' -Target 'secret values' -Message 'no secret-value hits in scanned sources'
    }
    else {
        Add-Result -Group 'P0' -Id 'SEC-VALUE-SCAN' -Status 'INFO' -Target 'secret values' -Message "total secret-value hits: $valueHits (see per-pattern results above)"
    }

    if ($script:SecretMode -eq 'raw' -and $rawLines.Count -gt 0) {
        $rawPath = Join-Path $script:OutputDir "raw-secrets_$(New-Stamp).md"

        $rm = New-Object System.Collections.Generic.List[string]
        $rm.Add('# RAW SECRET REPORT')
        $rm.Add('')
        $rm.Add('DANGEROUS FILE. DO NOT COMMIT.')
        $rm.Add('')
        $rm.Add("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
        $rm.Add('Secret mode: raw')
        $rm.Add('')
        $rm.Add('This file is ignored by tools/.gitignore. If you force-add it, secrets enter Git history.')
        $rm.Add('')

        foreach ($l in $rawLines) {
            $rm.Add($l)
        }

        ($rm -join "`n") | Set-Content -LiteralPath $rawPath -Encoding UTF8

        Add-Result -Group 'P0' -Id 'SEC-RAW-SIDECAR' -Status 'WARN' -Target $rawPath -Message 'raw sidecar written (ignored by git)' -Hint 'never git add -f this file'
    }

    Write-Log 'Run-Secrets finished'
}

function Get-HistoryPaths {
    if ($null -eq $script:HistoryPaths) {
        $r = Invoke-Git -GitArguments @(
            '--no-pager',
            'log',
            '--all',
            '--full-history',
            '--name-only',
            '--pretty=format:'
        )

        if ($r.ExitCode -gt 1) {
            Write-Log "git log failed: $($r.Lines -join ' ')" 'WARN'
            $script:HistoryPaths = @()
        }
        else {
            $script:HistoryPaths = @($r.Lines | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Sort-Object -Unique)
        }
    }

    return ,@($script:HistoryPaths)
}

function Run-HistoryScan {
    param(
        [string]$GroupId = ''
    )

    $groupLabel = 'ALL'
    if (-not [string]::IsNullOrWhiteSpace($GroupId)) {
        $groupLabel = $GroupId
    }

    Write-Log "Run-HistoryScan started. Group: $groupLabel"

    $paths = Get-HistoryPaths

    if ([string]::IsNullOrWhiteSpace($GroupId) -or $GroupId -eq 'P0') {
        $envHist = @($paths | Where-Object {
            $_ -match '(^|/)\.env' -and $_ -notmatch '\.env\.example$'
        })

        if ($envHist.Count -eq 0) {
            Add-Result -Group 'P0' -Id 'HIST-ENV' -Status 'PASS' -Target 'history .env*' -Message 'no real .env in history'
        }
        else {
            Add-Result -Group 'P0' -Id 'HIST-ENV' -Status 'FAIL' -Target 'history .env*' -Message "real .env in history: $($envHist -join ', ')" -Hint 'rotate secrets; clean history via git filter-repo / BFG'
        }

        $rawHist = @($paths | Where-Object {
            $_ -match 'raw-secrets_|raw_secrets_'
        })

        if ($rawHist.Count -eq 0) {
            Add-Result -Group 'P0' -Id 'HIST-RAW' -Status 'PASS' -Target 'history raw-secrets_*' -Message 'no raw secret sidecars in history'
        }
        else {
            Add-Result -Group 'P0' -Id 'HIST-RAW' -Status 'FAIL' -Target 'history raw-secrets_*' -Message "raw sidecars in history: $($rawHist -join ', ')" -Hint 'clean history; rotate exposed values'
        }
    }

    if ([string]::IsNullOrWhiteSpace($GroupId) -or $GroupId -eq 'P5') {
        $junkHist = @($paths | Where-Object {
            (
                $_ -match '/logs/|/tmp/|/cache/|storage/Videos/|dump_structure_tree|dump_create_structure_tree|project_structure_tree|project_create_structure_tree|collected_dump|universal_dynamic_tables_dump|project_dump|dynamic_tables_dump|versions_before\.txt$|vite\.config\.mts\.timestamp'
            ) -and
            (
                $_ -notmatch '\.gitkeep$|\.gitignore$'
            )
        })

        if ($junkHist.Count -eq 0) {
            Add-Result -Group 'P5' -Id 'HIST-JUNK' -Status 'PASS' -Target 'history junk' -Message 'no local junk/dumps in history'
        }
        else {
            $list = ($junkHist | Select-Object -First 20) -join ', '
            Add-Result -Group 'P5' -Id 'HIST-JUNK' -Status 'WARN' -Target 'history junk' -Message "junk in history: $list" -Hint 'acceptable if small; consider history cleanup before public hosting'
        }
    }

    Write-Log "Run-HistoryScan finished. Unique paths cached: $($paths.Count)"
}

function Run-GroupCheck {
    param(
        [string]$GroupId
    )

    if ([string]::IsNullOrWhiteSpace($script:ProjectRoot)) {
        $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root
    }

    Write-Log "Run-GroupCheck started. Group: $GroupId"

    Run-IgnoreCheck -GroupId $GroupId
    Run-TrackedScan -GroupId $GroupId

    if ($GroupId -eq 'P0') {
        Run-Secrets
        Run-HistoryScan -GroupId 'P0'
    }

    if ($GroupId -eq 'P5') {
        Run-HistoryScan -GroupId 'P5'
    }

    Write-Log "Run-GroupCheck finished. Group: $GroupId"
}

function Run-Audit {
    Write-Log 'Run-Audit started'

    $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root
    Write-Log "Project root: $script:ProjectRoot"

    Run-IgnoreCheck
    Run-TrackedScan
    Run-CaseSafety
    Run-Secrets
    Run-HistoryScan

    Write-Log 'Run-Audit finished'
}

function Run-Snapshots {
    Write-Log 'Run-Snapshots started'

    $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root

    if (-not $script:UpdateSnapshots) {
        Write-Log 'Use -UpdateSnapshots to write a new snapshot file.' 'WARN'
        return
    }

    if ([string]::IsNullOrWhiteSpace($script:SnapshotName)) {
        $script:SnapshotName = "GitPolicy-snapshot_$(New-Stamp).txt"
    }

    $snapshotPath = Join-Path $script:SnapshotDir $script:SnapshotName
    $tracked = @(Get-TrackedFiles)

    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine('GitPolicy audit snapshot')
    [void]$sb.AppendLine("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
    [void]$sb.AppendLine("Script version: $script:ScriptVersion")
    [void]$sb.AppendLine("Project root: $script:ProjectRoot")
    [void]$sb.AppendLine("Tracked files count: $($tracked.Count)")
    [void]$sb.AppendLine('')
    [void]$sb.AppendLine('=== TRACKED FILES ===')

    foreach ($t in ($tracked | Sort-Object)) {
        [void]$sb.AppendLine($t)
    }

    [System.IO.File]::WriteAllText($snapshotPath, $sb.ToString(), [System.Text.UTF8Encoding]::new($false))

    Write-Log "Snapshot written: $snapshotPath"
    Write-Log 'Run-Snapshots finished'
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
            $_.Name -notlike 'raw-secrets_*' -and
            $_.Name -notlike 'raw_secrets_*'
        } |
        Sort-Object Name

    $lines = New-Object System.Collections.Generic.List[string]

    foreach ($file in $files) {
        $hash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
        $lines.Add(('{0}  {1}' -f $hash, $file.Name))
    }

    [System.IO.File]::WriteAllLines($manifestPath, $lines.ToArray(), [System.Text.UTF8Encoding]::new($false))

    Write-Log "Manifest written: $manifestPath"
}

function Test-Sha256Manifest {
    param(
        [string]$ManifestPath
    )

    if (-not (Test-Path -LiteralPath $ManifestPath)) {
        Add-Result -Group 'META' -Id 'MANIFEST-MISSING' -Status 'WARN' -Target $ManifestPath -Message 'manifest not found' -Hint 'run -Mode manifests'
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
            $problems.Add("Bad line: $line")
            continue
        }

        $expectedHash = $parts[0]
        $fileName = $parts[1]
        $filePath = Join-Path $directory $fileName

        if (-not (Test-Path -LiteralPath $filePath)) {
            $problems.Add("Missing file: $fileName")
            continue
        }

        $actualHash = (Get-FileHash -LiteralPath $filePath -Algorithm SHA256).Hash.ToLowerInvariant()

        if ($actualHash -ne $expectedHash) {
            $problems.Add("Hash mismatch: $fileName")
        }
    }

    if ($problems.Count -eq 0) {
        Add-Result -Group 'META' -Id 'MANIFEST-OK' -Status 'PASS' -Target $ManifestPath -Message 'manifest verified ok'
    }
    else {
        foreach ($p in $problems) {
            Add-Result -Group 'META' -Id 'MANIFEST-FAIL' -Status 'FAIL' -Target $ManifestPath -Message $p -Hint 'regenerate manifests after evidence changes'
        }
    }
}

function Run-Manifests {
    Write-Log 'Run-Manifests started'

    New-Sha256Manifest -Directory $script:SnapshotDir
    New-Sha256Manifest -Directory $script:OutputDir

    Write-Log 'Run-Manifests finished'
}

function Run-VerifyManifests {
    Write-Log 'Run-VerifyManifests started'

    $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root

    Test-Sha256Manifest -ManifestPath (Join-Path $script:SnapshotDir 'MANIFEST.sha256')
    Test-Sha256Manifest -ManifestPath (Join-Path $script:OutputDir 'MANIFEST.sha256')

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

    $safeRows = @($Rows)

    if ($null -eq $Rows -or $safeRows.Count -eq 0) {
        $Markdown.Add('None.')
        return
    }

    $Markdown.Add('| ' + ($Columns -join ' | ') + ' |')
    $Markdown.Add('| ' + (($Columns | ForEach-Object { '---' }) -join ' | ') + ' |')

    foreach ($row in $safeRows) {
        $cells = New-Object System.Collections.Generic.List[string]

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
        [object[]]$Results
    )

    $csvPath = Join-Path $script:OutputDir "$BaseName.csv"
    $jsonPath = Join-Path $script:OutputDir "$BaseName.json"
    $mdPath = Join-Path $script:OutputDir "$BaseName.md"

    @($Results) | Export-Csv -LiteralPath $csvPath -NoTypeInformation -Encoding UTF8

    $summaryForJson = [ordered]@{
        generatedAt   = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
        scriptVersion = $script:ScriptVersion
        toolRoot      = (ConvertTo-Posix $script:ToolRoot)
        projectRoot   = (ConvertTo-Posix $script:ProjectRoot)
        outputDir     = (ConvertTo-Posix $script:OutputDir)
        logDir        = (ConvertTo-Posix $script:LogDir)
        snapshotDir   = (ConvertTo-Posix $script:SnapshotDir)
        secretMode    = $script:SecretMode
        totals        = $Summary.totals
        byGroup       = $Summary.byGroup
        results       = @($Results)
    }

    $summaryForJson | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $jsonPath -Encoding UTF8

    $md = New-Object System.Collections.Generic.List[string]

    $md.Add("# $BaseName")
    $md.Add('')
    $md.Add("- Generated: $($summaryForJson.generatedAt)")
    $md.Add("- Script version: $script:ScriptVersion")
    $md.Add("- Project root: ``$($summaryForJson.projectRoot)``")
    $md.Add("- Tool root: ``$($summaryForJson.toolRoot)``")
    $md.Add("- Secret mode: $($script:SecretMode)")
    $md.Add('')
    $md.Add('## Totals')
    $md.Add('')
    $md.Add('| Metric | Value |')
    $md.Add('| --- | ---: |')

    foreach ($kv in $Summary.totals.GetEnumerator()) {
        $md.Add("| $($kv.Key) | $($kv.Value) |")
    }

    $md.Add('')
    $md.Add('## By Group')
    $md.Add('')
    $md.Add('| Group | PASS | WARN | FAIL | INFO |')
    $md.Add('| --- | ---: | ---: | ---: | ---: |')

    foreach ($g in $Summary.byGroup) {
        $md.Add("| $($g.Group) | $($g.PASS) | $($g.WARN) | $($g.FAIL) | $($g.INFO) |")
    }

    Write-MarkdownSection -Markdown $md -Title 'Results' -Rows $Results -Columns @('Group', 'Id', 'Status', 'Target', 'Message', 'Hint')

    $md.Add('')
    $md.Add('## Output')
    $md.Add('')
    $md.Add("- CSV: ``$csvPath``")
    $md.Add("- JSON: ``$jsonPath``")
    $md.Add("- Markdown: ``$mdPath``")

    ($md -join "`n") | Set-Content -LiteralPath $mdPath -Encoding UTF8

    Write-Log "Report written: $mdPath"
    Write-Log "Report written: $jsonPath"
    Write-Log "Report written: $csvPath"

    return [pscustomobject]@{
        Csv  = $csvPath
        Json = $jsonPath
        Md   = $mdPath
    }
}

function Emit-Reports {
    param(
        [string]$BaseName
    )

    $byGroup = @($script:Results |
        Group-Object Group |
        ForEach-Object {
            [pscustomobject]@{
                Group = $_.Name
                PASS  = @($_.Group | Where-Object { $_.Status -eq 'PASS' }).Count
                WARN  = @($_.Group | Where-Object { $_.Status -eq 'WARN' }).Count
                FAIL  = @($_.Group | Where-Object { $_.Status -eq 'FAIL' }).Count
                INFO  = @($_.Group | Where-Object { $_.Status -eq 'INFO' }).Count
            }
        } |
        Sort-Object Group)

    $totals = [ordered]@{
        total      = $script:Results.Count
        pass       = $script:PassCount
        warn       = $script:WarningCount
        fail       = $script:FailCount
        info       = $script:InfoCount
        risks      = $script:RiskCount
        secretMode = $script:SecretMode
    }

    $summary = [ordered]@{
        totals  = $totals
        byGroup = $byGroup
    }

    Write-CommonReports -BaseName $BaseName -Summary $summary -Results $script:Results.ToArray() | Out-Null
}

function Show-Help {
    Write-Host ''
    Write-Host 'GitPolicy audit tool' -ForegroundColor Cyan
    Write-Host 'Version:' $script:ScriptVersion -ForegroundColor Gray
    Write-Host ''
    Write-Host 'Main commands:' -ForegroundColor Yellow
    Write-Host '  .\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode help'
    Write-Host '  .\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode menu'
    Write-Host '  .\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode p0-p5 -Repeat 3'
    Write-Host '  .\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode p0-p5 -Repeat 3 -SecretMode off'
    Write-Host '  .\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode audit -SecretMode redact'
    Write-Host '  .\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode case-safety'
    Write-Host '  .\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode ignore-check'
    Write-Host '  .\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode tracked-scan'
    Write-Host '  .\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode history-scan'
    Write-Host '  .\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode secrets -SecretMode redact'
    Write-Host '  .\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode snapshots -UpdateSnapshots'
    Write-Host '  .\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode manifests'
    Write-Host '  .\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode verify-manifests'
    Write-Host '  .\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode paths'
    Write-Host ''
    Write-Host 'Group modes: p0..p8, p0-p5' -ForegroundColor Yellow
    Write-Host ''
}

function Invoke-Menu {
    while ($true) {
        Write-Host ''
        Write-Host 'GitPolicy audit menu' -ForegroundColor Cyan
        Write-Host 'Version:' $script:ScriptVersion -ForegroundColor Gray
        Write-Host ''
        Write-Host '1) Full audit, secret mode redact'
        Write-Host '2) Full audit, secret mode off'
        Write-Host '3) Secrets only (sub-menu)'
        Write-Host '4) Case-safety only'
        Write-Host '5) Ignore-policy check only'
        Write-Host '6) Tracked-scan only'
        Write-Host '7) History-scan only'
        Write-Host '8) Update snapshots'
        Write-Host '9) Generate manifests'
        Write-Host '10) Verify manifests'
        Write-Host '11) Show paths'
        Write-Host '12) Help'
        Write-Host 'q) Quit'
        Write-Host ''

        $choice = Read-Host 'Choose action'

        switch ($choice) {
            '1' {
                $script:SecretMode = 'redact'
                Reset-RunState
                Run-Audit
                Emit-Reports -BaseName "GitPolicy-audit_$(New-Stamp)"
            }
            '2' {
                $script:SecretMode = 'off'
                Reset-RunState
                Run-Audit
                Emit-Reports -BaseName "GitPolicy-audit_$(New-Stamp)"
            }
            '3' {
                Invoke-SecretsSubMenu
            }
            '4' {
                Reset-RunState
                $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root
                Run-CaseSafety
                Emit-Reports -BaseName "GitPolicy-case_$(New-Stamp)"
            }
            '5' {
                Reset-RunState
                $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root
                Run-IgnoreCheck
                Emit-Reports -BaseName "GitPolicy-ignore_$(New-Stamp)"
            }
            '6' {
                Reset-RunState
                $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root
                Run-TrackedScan
                Emit-Reports -BaseName "GitPolicy-tracked_$(New-Stamp)"
            }
            '7' {
                Reset-RunState
                $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root
                Run-HistoryScan
                Emit-Reports -BaseName "GitPolicy-history_$(New-Stamp)"
            }
            '8' {
                $script:UpdateSnapshots = $true
                Run-Snapshots
            }
            '9' {
                Run-Manifests
            }
            '10' {
                Reset-RunState
                Run-VerifyManifests
                Emit-Reports -BaseName "GitPolicy-manifests_$(New-Stamp)"
            }
            '11' {
                Run-Paths
            }
            '12' {
                Show-Help
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

        Read-Host 'Press Enter to continue' | Out-Null
    }
}

function Invoke-SecretsSubMenu {
    Write-Host ''
    Write-Host 'Secrets sub-menu' -ForegroundColor Cyan
    Write-Host '  r) redact  (safe, masked values in normal reports)'
    Write-Host '  w) raw     (dangerous, raw values in logs + ignored sidecar)'
    Write-Host '  o) off     (no value scan, only .env tracked/history checks)'
    Write-Host '  q) back'
    Write-Host ''

    $sub = Read-Host 'Choose secret mode'

    switch ($sub) {
        'r' { $script:SecretMode = 'redact' }
        'w' { $script:SecretMode = 'raw' }
        'o' { $script:SecretMode = 'off' }
        'q' { return }
        'Q' { return }
        default {
            Write-Host 'Unknown, defaulting to redact.' -ForegroundColor Yellow
            $script:SecretMode = 'redact'
        }
    }

    Reset-RunState
    $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root
    Run-Secrets
    Emit-Reports -BaseName "GitPolicy-secrets_$($script:SecretMode)_$(New-Stamp)"
}

$hadIssues = $false

$overallPass = 0
$overallWarn = 0
$overallFail = 0
$overallInfo = 0
$overallRisks = 0
$overallRuns = 0

switch ($Mode) {
    'help' {
        Show-Help
    }

    'menu' {
        Invoke-Menu
    }

    'paths' {
        Run-Paths
    }

    'manifests' {
        Run-Manifests
    }

    'snapshots' {
        Run-Snapshots
    }

    'verify-manifests' {
        Reset-RunState
        Run-VerifyManifests
        Emit-Reports -BaseName "GitPolicy-manifests_$(New-Stamp)"

        if ($script:RiskCount -gt 0 -or $script:WarningCount -gt 0) {
            $hadIssues = $true
        }
    }

    'audit' {
        Reset-RunState
        Run-Audit
        Emit-Reports -BaseName "GitPolicy-audit_$(New-Stamp)"

        if ($script:RiskCount -gt 0 -or $script:WarningCount -gt 0) {
            $hadIssues = $true
        }
    }

    'secrets' {
        Reset-RunState
        $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root
        Run-Secrets
        Emit-Reports -BaseName "GitPolicy-secrets_$($script:SecretMode)_$(New-Stamp)"

        if ($script:RiskCount -gt 0 -or $script:WarningCount -gt 0) {
            $hadIssues = $true
        }
    }

    'case-safety' {
        Reset-RunState
        $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root
        Run-CaseSafety
        Emit-Reports -BaseName "GitPolicy-case_$(New-Stamp)"

        if ($script:RiskCount -gt 0 -or $script:WarningCount -gt 0) {
            $hadIssues = $true
        }
    }

    'ignore-check' {
        Reset-RunState
        $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root
        Run-IgnoreCheck
        Emit-Reports -BaseName "GitPolicy-ignore_$(New-Stamp)"

        if ($script:RiskCount -gt 0 -or $script:WarningCount -gt 0) {
            $hadIssues = $true
        }
    }

    'tracked-scan' {
        Reset-RunState
        $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root
        Run-TrackedScan
        Emit-Reports -BaseName "GitPolicy-tracked_$(New-Stamp)"

        if ($script:RiskCount -gt 0 -or $script:WarningCount -gt 0) {
            $hadIssues = $true
        }
    }

    'history-scan' {
        Reset-RunState
        $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root
        Run-HistoryScan
        Emit-Reports -BaseName "GitPolicy-history_$(New-Stamp)"

        if ($script:RiskCount -gt 0 -or $script:WarningCount -gt 0) {
            $hadIssues = $true
        }
    }

    'p0-p5' {
        if ($Repeat -lt 1) {
            $Repeat = 1
        }

        $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root

        $groups = @('P0', 'P1', 'P2', 'P3', 'P4', 'P5')

        for ($i = 1; $i -le $Repeat; $i++) {
            foreach ($g in $groups) {
                Reset-RunState

                $stamp = New-Stamp

                Run-GroupCheck -GroupId $g
                Emit-Reports -BaseName "GitPolicy-$($g.ToLower())_run$($i)_$stamp"

                $overallPass = $overallPass + $script:PassCount
                $overallWarn = $overallWarn + $script:WarningCount
                $overallFail = $overallFail + $script:FailCount
                $overallInfo = $overallInfo + $script:InfoCount
                $overallRisks = $overallRisks + $script:RiskCount
                $overallRuns = $overallRuns + 1

                if ($script:RiskCount -gt 0 -or $script:WarningCount -gt 0) {
                    $hadIssues = $true
                }
            }
        }
    }

    default {
        if ($Mode -match '^p[0-8]$') {
            $gid = $Mode.ToUpper()

            Reset-RunState
            $script:ProjectRoot = Get-ProjectRoot -StartPath $script:Root

            Run-GroupCheck -GroupId $gid
            Emit-Reports -BaseName "GitPolicy-$($Mode)_$(New-Stamp)"

            if ($script:RiskCount -gt 0 -or $script:WarningCount -gt 0) {
                $hadIssues = $true
            }
        }
        else {
            Show-Help
        }
    }
}

Write-Host ''
Write-Host 'Summary:' -ForegroundColor Cyan

if ($Mode -eq 'p0-p5') {
    Write-Host "  RUNS:  $overallRuns" -ForegroundColor Gray
    Write-Host "  PASS:  $overallPass" -ForegroundColor Green
    Write-Host "  WARN:  $overallWarn" -ForegroundColor $(if ($overallWarn -gt 0) { 'Yellow' } else { 'Green' })
    Write-Host "  FAIL:  $overallFail" -ForegroundColor $(if ($overallFail -gt 0) { 'Red' } else { 'Green' })
    Write-Host "  INFO:  $overallInfo" -ForegroundColor Gray
    Write-Host "  RISKS: $overallRisks" -ForegroundColor $(if ($overallRisks -gt 0) { 'Red' } else { 'Green' })
}
else {
    Write-Host "  PASS:  $script:PassCount" -ForegroundColor Green
    Write-Host "  WARN:  $script:WarningCount" -ForegroundColor $(if ($script:WarningCount -gt 0) { 'Yellow' } else { 'Green' })
    Write-Host "  FAIL:  $script:FailCount" -ForegroundColor $(if ($script:FailCount -gt 0) { 'Red' } else { 'Green' })
    Write-Host "  INFO:  $script:InfoCount" -ForegroundColor Gray
    Write-Host "  RISKS: $script:RiskCount" -ForegroundColor $(if ($script:RiskCount -gt 0) { 'Red' } else { 'Green' })
}

Write-Host "  Log:   $script:LogFile" -ForegroundColor Gray

if ($FailOnIssues -and $hadIssues) {
    exit 1
}
