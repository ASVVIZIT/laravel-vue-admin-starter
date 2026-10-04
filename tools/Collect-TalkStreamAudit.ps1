<#
.SYNOPSIS
    Аудит TalkStream v3: прогресс-бар, живая статистика, кастомная метка (Label).
.DESCRIPTION
    Секции отчёта:
      1. Дерево файлов фронтенд- и бэкенд-частей модуля
      2. FRONTEND  — полные исходники
      3. BACKEND   — контроллеры / события / модели / сервисы
      4. INFRA     — channels.php, api.php, BroadcastServiceProvider, broadcasting.php, talkstream.php
      5. MIGRATIONS— миграции talk/message/friend/call
      6. ПРОВЕРКИ  — Requests / Resources / Policies / Services / config
      7. ИТОГИ     — статистика по секциям + список отсутствующих файлов
.PARAMETER Root
    Корень проекта (по умолчанию FenixPortal)
.PARAMETER Label
    Опциональная метка для имени файла (например: "Level_1", "Phase_Config"). Добавляется в имя перед датой.
.PARAMETER OutFile
    Полный путь к файлу (если не указан, генерируется автоматически в tools/reports/)
.PARAMETER NoPause
    Не ждать Enter в конце (для CI/автоматизации)
.EXAMPLE
    powershell -ExecutionPolicy Bypass -File tools\Collect-TalkStreamAudit.ps1 -Label "Level_1"
.EXAMPLE
    .\Collect-TalkStreamAudit.ps1 -Label "Phase_Frontend_Core"
#>
[CmdletBinding()]
param(
    [string]$Root    = "W:\OpenServer\domains\Laravel\Other\FenixPortal",
    [string]$Label   = "",
    [string]$OutFile = "",
    [switch]$NoPause
)

$ErrorActionPreference = "Stop"
$sw0 = Get-Date

# ========== ПАПКА ОТЧЁТОВ ==========
$reportDir = Join-Path $Root "tools\reports"
if (-not (Test-Path $reportDir)) { New-Item -ItemType Directory -Path $reportDir -Force | Out-Null }

# ========== ФОРМИРОВАНИЕ ИМЕНИ ФАЙЛА ==========
if (-not $OutFile) {
    $stamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $safeLabel = if ($Label) { ($Label -replace '\s+', '_') + "_" } else { "" }
    $OutFile = Join-Path $reportDir ("TALKSTREAM_AUDIT_" + $safeLabel + $stamp + ".txt")
}

# ========== СЧЁТЧИКИ ==========
$script:stats = @{ Added = 0; Missing = 0; Lines = 0; Bytes = 0 }
$script:secStats = [ordered]@{}
$script:missingList = @()
$script:currentSection = $null

$sectionTitles = [ordered]@{
    FRONTEND   = "2. FRONTEND: полные исходники модуля"
    BACKEND    = "3. BACKEND: контроллеры / события / модели / сервисы"
    INFRA      = "4. ИНФРАСТРУКТУРА"
    MIGRATIONS = "5. МИГРАЦИИ TALKSTREAM"
}

$sw = [System.IO.StreamWriter]::new($OutFile, $false, [System.Text.UTF8Encoding]::new($true))

function Write-Line([string]$t = "") { $sw.WriteLine($t) }
function Write-Banner([string]$t) {
    Write-Line ""; Write-Line ("#" * 100); Write-Line ("#####  " + $t); Write-Line ("#" * 100)
}

function Open-Section([string]$key) {
    if ($script:currentSection -and $script:secStats.Contains($script:currentSection)) {
        $p = $script:secStats[$script:currentSection]
        Write-Host ("   ✔ {0,-12} файлов: {1,3} | строк: {2,6} | {3,8} КБ | нет: {4}" -f `
            $script:currentSection, $p.Files, $p.Lines, [math]::Round($p.Bytes / 1KB, 1), $p.Missing) -ForegroundColor DarkGray
    }
    $script:currentSection = $key
    if (-not $script:secStats.Contains($key)) {
        $script:secStats[$key] = @{ Files = 0; Lines = 0; Bytes = 0; Missing = 0 }
    }
    Write-Host ""
    Write-Host ("→ " + $sectionTitles[$key]) -ForegroundColor Cyan
    Write-Banner $sectionTitles[$key]
}

function Add-FileToReport([string]$absPath) {
    $rel = $absPath.Replace($Root, "").TrimStart("\")
    $sec = $script:secStats[$script:currentSection]
    if (Test-Path $absPath -PathType Leaf) {
        $item  = Get-Item $absPath
        $lines = @(Get-Content $absPath -Encoding UTF8)
        Write-Banner $rel
        $lines | ForEach-Object { $sw.WriteLine($_) }
        $sec.Files++;  $sec.Lines += $lines.Count;  $sec.Bytes += $item.Length
        $script:stats.Added++; $script:stats.Lines += $lines.Count; $script:stats.Bytes += $item.Length
    }
    else {
        Write-Banner ("!!! НЕ НАЙДЕН: " + $rel)
        $sec.Missing++; $script:stats.Missing++; $script:missingList += $rel
    }
}

# ========== ШАПКА ОТЧЁТА ==========
Write-Line ("=" * 100); Write-Line "TALKSTREAM AUDIT DUMP (v3)"
Write-Line ("Дата : " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
Write-Line ("Root : " + $Root)
if ($Label) { Write-Line ("Label: " + $Label) }
try { $phpVer = (php -v 2>$null | Select-Object -First 1) } catch { $phpVer = "n/a" }
Write-Line ("PHP  : " + $phpVer)
Write-Line ("=" * 100)

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║   TALKSTREAM AUDIT v3 — сбор отчёта          ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Magenta

# ========== СЕКЦИЯ 1: ДЕРЕВО ==========
Write-Host ""
Write-Host ("→ 1. СТРУКТУРА МОДУЛЯ (дерево)") -ForegroundColor Cyan
Write-Banner "1. СТРУКТУРА МОДУЛЯ (дерево)"

$feRoot = Join-Path $Root "resources\js\Modules\TalkStream"
$beDirs = @(
    (Join-Path $Root "app\Http\Controllers\TalkStream"),
    (Join-Path $Root "app\Events\TalkStream"),
    (Join-Path $Root "app\Models\TalkStream"),
    (Join-Path $Root "app\Services\TalkStream")
)

Write-Line "--- FRONTEND: resources/js/Modules/TalkStream ---"
if (Test-Path $feRoot) {
    $base = $feRoot.Split("\").Count
    Get-ChildItem $feRoot -Recurse | Sort-Object FullName | ForEach-Object {
        $d = $_.FullName.Split("\").Count - $base
        $n = if ($_.PSIsContainer) { "[" + $_.Name + "]" } else { $_.Name }
        Write-Line (("  " * $d) + $n)
    }
} else { Write-Line "[НЕ НАЙДЕН] $feRoot" }
foreach ($d in $beDirs) {
    Write-Line ""; Write-Line ("--- BACKEND: " + $d.Replace($Root, "").TrimStart("\") + " ---")
    if (Test-Path $d) { Get-ChildItem $d -Recurse -File | Sort-Object Name | ForEach-Object { Write-Line ("  " + $_.Name) } }
    else { Write-Line "  [каталог отсутствует]" }
}

# ========== СБОР СПИСКА ЗАДАЧ ==========
$jobs = New-Object System.Collections.Generic.List[object]
if (Test-Path $feRoot) {
    Get-ChildItem $feRoot -Recurse -File | Sort-Object FullName | ForEach-Object {
        $jobs.Add([pscustomobject]@{ Section = "FRONTEND"; Path = $_.FullName }) }
}
foreach ($d in $beDirs) {
    if (Test-Path $d) {
        Get-ChildItem $d -Recurse -File | Sort-Object FullName | ForEach-Object {
            $jobs.Add([pscustomobject]@{ Section = "BACKEND"; Path = $_.FullName }) }
    }
}
@("routes\channels.php", "routes\api.php", "app\Providers\BroadcastServiceProvider.php",
  "config\broadcasting.php", "config\talkstream.php") | ForEach-Object {
    $jobs.Add([pscustomobject]@{ Section = "INFRA"; Path = (Join-Path $Root $_) })
}
Get-ChildItem (Join-Path $Root "database\migrations") -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match "talk|message|friend|call" } | Sort-Object Name | ForEach-Object {
        $jobs.Add([pscustomobject]@{ Section = "MIGRATIONS"; Path = $_.FullName })
    }

$total = $jobs.Count

# ========== СЕКЦИИ 2–5: ОБРАБОТКА С ПРОГРЕСС-БАРОМ ==========
$lastSec = $null
for ($i = 0; $i -lt $total; $i++) {
    $job = $jobs[$i]
    $rel = $job.Path.Replace($Root, "").TrimStart("\")

    Write-Progress -Activity "Аудит TalkStream: сбор файлов в отчёт" `
        -Status ("[{0}/{1}]  {2}" -f ($i + 1), $total, $rel) `
        -PercentComplete ([math]::Floor(($i * 100) / [math]::Max($total, 1)))

    if ($job.Section -ne $lastSec) { Open-Section $job.Section; $lastSec = $job.Section }
    Add-FileToReport $job.Path
}
Write-Progress -Activity "Аудит TalkStream: сбор файлов в отчёт" -Completed
if ($script:currentSection) {
    $p = $script:secStats[$script:currentSection]
    Write-Host ("   ✔ {0,-12} файлов: {1,3} | строк: {2,6} | {3,8} КБ | нет: {4}" -f `
        $script:currentSection, $p.Files, $p.Lines, [math]::Round($p.Bytes / 1KB, 1), $p.Missing) -ForegroundColor DarkGray
}

# ========== СЕКЦИЯ 6: ПРОВЕРКИ ==========
Write-Host ""
Write-Host ("→ 6. ПРОВЕРКИ наличия") -ForegroundColor Cyan
Write-Banner "6. ПРОВЕРКИ: Requests / Resources / Policies / Config / Services"
$checkResults = @()
foreach ($c in @("app\Http\Requests\TalkStream", "app\Http\Resources\TalkStream", "app\Policies",
                 "app\Services\TalkStream", "config\talkstream.php")) {
    $p = Join-Path $Root $c
    $ok = Test-Path $p
    $checkResults += [pscustomobject]@{ Path = $c; Exists = $ok }
    Write-Line ("[ " + $(if ($ok) { "ДА" } else { "НЕТ" }) + " ]  " + $c)
    Write-Host ("   [ " + $(if ($ok) { "ДА " } else { "НЕТ" }) + " ]  " + $c) -ForegroundColor $(if ($ok) { "Green" } else { "Yellow" })
    if ($ok -and (Test-Path $p -PathType Container)) {
        Get-ChildItem $p -Recurse -File | ForEach-Object {
            Write-Line ("         - " + $_.Name); Write-Host ("         - " + $_.Name) -ForegroundColor DarkGray
        }
    }
}

# ========== СЕКЦИЯ 7: ИТОГИ (в файл) ==========
$elapsed = ((Get-Date) - $sw0).TotalSeconds
Write-Banner "7. ИТОГИ АУДИТА"
Write-Line ("{0,-14} {1,7} {2,9} {3,10} {4,9}" -f "Секция", "Файлов", "Строк", "КБ", "Нет")
foreach ($k in $script:secStats.Keys) {
    $s = $script:secStats[$k]
    Write-Line ("{0,-14} {1,7} {2,9} {3,10} {4,9}" -f $k, $s.Files, $s.Lines, [math]::Round($s.Bytes / 1KB, 1), $s.Missing)
}
Write-Line ("-" * 55)
Write-Line ("{0,-14} {1,7} {2,9} {3,10}" -f "ИТОГО", $script:stats.Added, $script:stats.Lines, [math]::Round($script:stats.Bytes / 1KB, 1))
Write-Line ("Отсутствует файлов: " + $script:stats.Missing)
if ($script:missingList.Count) { $script:missingList | ForEach-Object { Write-Line ("   - " + $_) } }
Write-Line ("Время сбора: {0:N1} с" -f $elapsed)
$sw.Close()

# ========== LATEST-КОПИЯ ==========
$latest = Join-Path $reportDir "TALKSTREAM_AUDIT_LATEST.txt"
Copy-Item $OutFile $latest -Force

# ========== ИТОГОВАЯ ТАБЛИЦА В КОНСОЛИ ==========
Write-Host ""
Write-Host ("=" * 78) -ForegroundColor Cyan
Write-Host " ИТОГИ АУДИТА" -ForegroundColor Cyan
Write-Host ("=" * 78) -ForegroundColor Cyan
Write-Host (" {0,-14} {1,7} {2,9} {3,10} {4,9}" -f "Секция", "Файлов", "Строк", "КБ", "Нет") -ForegroundColor Gray
foreach ($k in $script:secStats.Keys) {
    $s = $script:secStats[$k]
    Write-Host (" {0,-14} {1,7} {2,9} {3,10} {4,9}" -f $k, $s.Files, $s.Lines, [math]::Round($s.Bytes / 1KB, 1), $s.Missing)
}
Write-Host ("-" * 78) -ForegroundColor Gray
Write-Host (" {0,-14} {1,7} {2,9} {3,10} КБ" -f "ИТОГО", $script:stats.Added, $script:stats.Lines, [math]::Round($script:stats.Bytes / 1KB, 1)) -ForegroundColor Green
if ($script:missingList.Count) {
    Write-Host (" Отсутствуют файлы ({0}):" -f $script:missingList.Count) -ForegroundColor Yellow
    $script:missingList | ForEach-Object { Write-Host ("   - " + $_) -ForegroundColor Yellow }
}
Write-Host (" Метка : " + $(if($Label){$Label}else{"(нет)"})) -ForegroundColor Magenta
Write-Host (" Время : {0:N1} с" -f $elapsed) -ForegroundColor Gray
Write-Host (" Отчёт : " + $OutFile) -ForegroundColor Green
Write-Host (" Latest: " + $latest) -ForegroundColor Cyan
Write-Host ("=" * 78) -ForegroundColor Cyan

if (-not $NoPause) { Read-Host "`nНажмите Enter для выхода" }
