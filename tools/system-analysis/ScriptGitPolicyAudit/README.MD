# Git Policy Audit Script

Self-owned audit tool for validating repository Git policy in one run.

Checks:

- secrets and `.env` files;
- ignored and tracked files;
- case-safety for Linux/Docker;
- tools evidence integrity;
- generated artifacts;
- lock files;
- local dumps;
- Laravel storage runtime files;
- repository hygiene;
- history pollution.

Script path:

tools/system-analysis/ScriptGitPolicyAudit/Collect-GitPolicyAudit.ps1

---

## Basic Commands

Run from the project root:
```text
.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode help

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode menu

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode audit

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode audit -SecretMode redact

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode audit -SecretMode off

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode secrets -SecretMode redact

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode secrets -SecretMode raw

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode secrets -SecretMode off

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode case-safety

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode ignore-check

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode tracked-scan

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode history-scan

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode snapshots -UpdateSnapshots

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode manifests

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode verify-manifests

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode paths
```
CI / strict gate:
```text
.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode audit -SecretMode redact -FailOnIssues
```
---

## Package Structure

tools/system-analysis/ScriptGitPolicyAudit/
Collect-GitPolicyAudit.ps1
reports/
logs/
tmp/
snapshots/

The script writes all artifacts only inside its own package folder.

### Tracked by Git

Collect-GitPolicyAudit.ps1
snapshots/
reports/
.gitkeep placeholders

### Ignored by Git

logs/ contents
tmp/ contents
cache/ contents
raw-secrets_* reports
.env files inside tools/

---

## Modes

| Mode | Description |
| --- | --- |
| `menu` | Interactive multi-level menu. Default mode if `-Mode` is omitted. |
| `help` | Shows help and copyable commands. |
| `audit` | Full policy audit. Runs ignore-check, tracked-scan, case-safety, secrets and history-scan. |
| `secrets` | Secret scan only. Checks tracked `.env`, raw secret sidecars and secret values in source files. |
| `case-safety` | Checks Linux/Docker case-sensitivity risks. |
| `ignore-check` | Validates reference ignore policy using `git check-ignore`. |
| `tracked-scan` | Inspects `git ls-files` and reports bad tracked artifacts by zone. |
| `history-scan` | Scans Git history for dangerous or unwanted paths. |
| `snapshots` | Updates baseline snapshot of tracked file list. Requires `-UpdateSnapshots`. |
| `manifests` | Generates SHA256 manifests for `snapshots/` and `reports/`. |
| `verify-manifests` | Verifies existing SHA256 manifests. |
| `paths` | Shows tool paths and current log file. |

---

## Parameters

| Parameter | Description | Default |
| --- | --- | --- |
| `-Root` | Start path for project root discovery. | `$PSScriptRoot` |
| `-Mode` | Execution mode. | `menu` |
| `-SecretMode` | Secret scan mode: `redact`, `raw`, `off`. | `redact` |
| `-OutputDir` | Report output directory. | `./reports` inside script package |
| `-LogDir` | Log output directory. | `./logs` inside script package |
| `-TempDir` | Temporary directory. | `./tmp` inside script package |
| `-SnapshotDir` | Snapshot directory. | `./snapshots` inside script package |
| `-UpdateSnapshots` | Required for `-Mode snapshots` to write a new snapshot file. | not set |
| `-SnapshotName` | Optional snapshot file name. | auto-generated |
| `-FailOnIssues` | Exit with code `1` if risks or warnings were found. | not set |

---

## Secret Modes

| Mode | Description |
| --- | --- |
| `redact` | Safe mode. Only masked values are written to normal reports, console and log. |
| `raw` | Dangerous local mode. Raw values are written to logs and ignored `raw-secrets_*.md` file. |
| `off` | Disables secret value scan. Still checks tracked `.env` files and history. |

Recommended default:

-SecretMode redact

Use `raw` only for local diagnosis.

---

## Status Values

| Status | Meaning |
| --- | --- |
| `PASS` | Check succeeded. |
| `WARN` | Potential issue or hygiene warning. Should be reviewed. |
| `FAIL` | Policy violation. Should be fixed before commit/push. |
| `INFO` | Informational result. Usually aggregate counts or non-blocking notes. |

---

## Checked Groups

| Group | Description |
| --- | --- |
| `P0` | Secrets, `.env`, private keys, raw secret sidecars, secret values in source files. |
| `P1` | Public build output, Vite hot file, `public/storage`, ChromeDriver binaries. |
| `P2` | Laravel storage runtime: logs, framework cache, sessions, views, user media, videos, keys. |
| `P3` | Caches, tests, coverage, TypeScript output, bundle analyzer output, root logs/tmp. |
| `P4` | OS and editor junk: `.DS_Store`, `Thumbs.db`, swap, backup, temp files. |
| `P5` | Local structure dumps and legacy project dumps. |
| `P6` | Tool packages: ignored transient artifacts and tracked evidence. |
| `P7` | Generated unplugin type declarations versus handwritten types. |
| `P8` | Dependency lock files trackability. |
| `CASE` | Case-sensitivity audit for Linux/Docker safety. |
| `META` | Repository metadata and integrity: `.gitignore`, `tools/.gitignore`, manifests. |

---

## P0: Secrets and Environment Files

Checks:

- tracked `.env`;
- tracked `.env.local`;
- tracked `.env.production`;
- tracked `.env.backup`;
- tracked `.env.txt`;
- tracked raw secret sidecars;
- secret values in source files;
- private keys;
- bearer tokens;
- `APP_KEY`;
- `DB_PASSWORD`;
- `REDIS_PASSWORD`;
- `MAIL_PASSWORD`;
- `REVERB_APP_SECRET`;
- `REVERB_APP_KEY`;
- quoted secret assignments.

Important:

.env must never be committed.
.env.example may be committed.
raw-secrets_* must never be committed.

---

## P1: Public Build and Frontend Output

Checks:

public/build/*
public/hot
public/storage
public/chromedriver.exe
public/chromedriver_32.exe
public/chromedriver_64.exe

Expected tracked exception:

public/build/.gitkeep

---

## P2: Laravel Storage Runtime

Checks:

storage/logs/*
storage/framework/cache/*
storage/framework/cache/data/*
storage/framework/sessions/*
storage/framework/views/*
storage/framework/testing/*
storage/app/*
storage/app/public/*
storage/Videos/*
storage/**/*.key
storage/**/*.mp4
storage/**/*.webm
storage/**/*.mov
storage/**/*.avi
storage/**/*.mkv
storage/**/*.mp3
storage/**/*.wav
storage/**/*.jpg
storage/**/*.jpeg
storage/**/*.png
storage/**/*.gif
storage/**/*.webp

Expected tracked exceptions:

storage/logs/.gitkeep
storage/framework/cache/.gitkeep
storage/framework/cache/data/.gitkeep
storage/framework/sessions/.gitkeep
storage/framework/views/.gitkeep
storage/framework/testing/.gitkeep
storage/app/.gitkeep
storage/app/public/.gitkeep
storage/Videos/.gitkeep

---

## P3: Caches, Tests, Coverage and Build Output

Checks:

.vite
node_modules/.vite
ts-out-dir
coverage
stats.html
logs
tmp
.phpunit.result.cache
.phpunit.cache
.pint.cache
.eslintcache
*.tsbuildinfo

---

## P4: OS and Editor Junk

Checks:

.DS_Store
Thumbs.db
desktop.ini
*.swp
*.swo
*~
.#*
#*#
*.bak
*.old
*.orig
*.rej
*.pid
*.tmp
*.temp

---

## P5: Local Structure Dumps and Legacy Project Dumps

Checks:

dump_structure_tree.bat
dump_structure_tree2.bat
dump_create_structure_tree.bat
dump_create_structure_tree*.bat
project_structure_tree.txt
project_structure_tree.log
project_create_structure_tree.txt
project_create_structure_tree.json
project_create_structure_tree.log
collected_dump*.txt
universal_dynamic_tables_dump.txt
versions_before.txt
project_dump*
dynamic_tables_dump*

These files are developer convenience artifacts and should not be committed.

Canonical structure tools should live under:

tools/project-structure/

---

## P6: Tool Packages Artifacts and Evidence

Ignored:

tools/**/logs/*
tools/**/tmp/*
tools/**/cache/*
tools/**/reports/raw-secrets_*
tools/**/reports/raw_secrets_*
tools/**/snapshots/raw-secrets_*
tools/**/snapshots/raw_secrets_*
tools/**/.env
tools/**/.env.*

Tracked:

tools/**/logs/.gitkeep
tools/**/tmp/.gitkeep
tools/**/cache/.gitkeep
tools/**/reports/**
tools/**/snapshots/**
tools/**/.env.example

Policy:

snapshots/ and normal reports/ are audit evidence.
logs/, tmp/ and cache/ are transient artifacts.
raw secret sidecars are never committed.

---

## P7: Generated Unplugin Types

Ignored:

types/auto-imports.d.ts
types/components.d.ts

Tracked:

types/.gitkeep
handwritten type declaration files

Examples of handwritten files that should remain trackable:

types/custom.d.ts
types/shims-vue.d.ts
types/env.d.ts

---

## P8: Dependency Lock Files

Expected trackable:

composer.lock
package-lock.json

Reason:

Lock files improve reproducibility for Docker, CI, CentOS, Debian and future Linux hosting deployments.

---

## CASE: Case-Safety Audit

Checks:

- tracked paths differing only by case;
- uppercase `resources/js/Modules` in Git index;
- lowercase `resources/js/modules` in Git index;
- uppercase `Modules` in frontend imports;
- uppercase `Modules` in `moduleDirectives.ts` glob/comments.

Typical failing examples:

resources/js/Modules/TalkStream/routes.ts
resources/js/modules/TalkStream/routes.ts

import { useTalkStreamStore } from '@/Modules/TalkStream/Stores/talkStreamStore'

import.meta.glob('../Modules/*/Directives/**/*Directive.ts')

Linux/Docker/CentOS/Debian filesystems are case-sensitive.

Windows/NTFS is usually case-insensitive, so these problems can remain hidden until deployment.

---

## META: Repository Metadata and Integrity

Checks:

.gitignore tracked
tools/.gitignore tracked
snapshots/MANIFEST.sha256 valid
reports/MANIFEST.sha256 valid

---

## Reference Ignore Policy

### Expected Ignored

.env
.env.local
.env.production
.env.txt
storage/nested/private.key
public/build/assets/app.js
public/hot
public/storage
public/chromedriver.exe
storage/logs/laravel.log
storage/framework/views/abc.php
storage/Videos/test.mp4
storage/Videos/test.webm
storage/Videos/test.mov
.vite/deps/chunk.js
ts-out-dir/index.js
coverage/index.html
stats.html
foo.tsbuildinfo
.DS_Store
Thumbs.db
foo.tmp
resources/js/components/SmartLight/dump_create_structure_tree.bat
resources/js/components/dump_structure_tree.bat
resources/js/components/project_structure_tree.txt
collected_dump_with_models_migrations.txt
universal_dynamic_tables_dump.txt
versions_before.txt
tools/modules/TalkStream/ScriptTalkStreamAudit/logs/x.log
tools/modules/TalkStream/ScriptTalkStreamAudit/tmp/x.tmp
tools/modules/TalkStream/ScriptTalkStreamAudit/reports/raw-secrets_x.md
tools/modules/TalkStream/ScriptTalkStreamAudit/.env
types/auto-imports.d.ts
types/components.d.ts

### Expected Tracked / Not Ignored

.env.example
public/build/.gitkeep
storage/Videos/.gitkeep
tools/modules/TalkStream/ScriptTalkStreamAudit/logs/.gitkeep
tools/modules/TalkStream/ScriptTalkStreamAudit/reports/evidence.md
tools/modules/TalkStream/ScriptTalkStreamAudit/snapshots/evidence.txt
types/custom.d.ts
types/.gitkeep
composer.lock
package-lock.json

---

## Output Reports

Normal audit modes write three report files:

reports/<base-name>.md
reports/<base-name>.json
reports/<base-name>.csv

Examples:

reports/GitPolicy-audit_2026-10-07_02-00-00.md
reports/GitPolicy-audit_2026-10-07_02-00-00.json
reports/GitPolicy-audit_2026-10-07_02-00-00.csv

### Report Base Names by Mode

| Mode | Report base name |
| --- | --- |
| `audit` | `GitPolicy-audit_<timestamp>` |
| `secrets` | `GitPolicy-secrets_<timestamp>_<secretmode>` |
| `case-safety` | `GitPolicy-case_<timestamp>` |
| `ignore-check` | `GitPolicy-ignore_<timestamp>` |
| `tracked-scan` | `GitPolicy-tracked_<timestamp>` |
| `history-scan` | `GitPolicy-history_<timestamp>` |
| `verify-manifests` | `GitPolicy-manifests_<timestamp>` |

### Markdown Report Contains

summary totals
group breakdown
full results table
hints for failed checks

### JSON Report Contains

machine-readable summary
grouped counters
full result objects

### CSV Report Contains

flat result rows for filtering and sorting

---

## Logs

Every run writes a log file:

logs/GitPolicy-audit_<timestamp>.log

Logs are ignored by Git.

In `SecretMode=raw`, logs may contain raw secret values.

Never commit logs.

---

## Raw Secret Sidecar

When running:

-Mode secrets -SecretMode raw

or selecting raw mode from the menu, the script may write:

reports/raw-secrets_<timestamp>.md

This file may contain raw secret values.

It is ignored by `tools/.gitignore`.

Rules:

never commit raw-secrets_*
never force-add raw-secrets_*
use raw mode only for local diagnosis
prefer redact mode for normal work

---

## Snapshots

Snapshot mode:

-Mode snapshots -UpdateSnapshots

Writes:

snapshots/GitPolicy-snapshot_<timestamp>.txt

Snapshot contains:

generated timestamp
script version
project root
tracked file count
sorted list of tracked files

Snapshots are tracked by Git as audit evidence.

Useful for comparing repository state over time.

---

## Manifests

Generate manifests:

-Mode manifests

Writes:

snapshots/MANIFEST.sha256
reports/MANIFEST.sha256

Verify manifests:

-Mode verify-manifests

Manifest format:

<sha256-hash>  <file-name>

Hashes are lowercase for `sha256sum` compatibility.

Manifests are tracked by Git.

---

## Typical Workflows

### Before Commit

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode audit -SecretMode redact

### After Tools/Reports Changes

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode manifests

### Before Push

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode audit -SecretMode redact -FailOnIssues

### Only Case-Sensitivity Check

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode case-safety

### Only Ignore Policy Validation

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode ignore-check

### Only Tracked Artifacts Scan

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode tracked-scan

### Only History Scan

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode history-scan

### Safe Secrets Check

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode secrets -SecretMode redact

### Dangerous Local Raw Secrets Diagnosis

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode secrets -SecretMode raw

### Disable Secret Value Scanning but Still Check `.env` and History

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode audit -SecretMode off

---

## How to Read Results

Example:

[FAIL] P0/SEC-ENV-TRACKED :: tracked .env* :: real .env tracked: .env
HINT: git rm --cached ; rotate secrets ; clean history

Meaning:

Group P0 failed.
A real .env file is tracked.
This is critical.
Remove from index, rotate secrets and clean history if needed.

Example:

[FAIL] CASE/CASE-MODULES-PARENT :: resources/js/Modules :: uppercase Modules still tracked: 45 files
HINT: git rm -r --cached resources/js/Modules ; git add resources/js/modules

Meaning:

Git index still tracks uppercase Modules path.
Fix by removing uppercase path from index and adding lowercase path.

Example:

[WARN] P0/SEC-RAW-SIDECAR :: reports/raw-secrets_...md :: raw sidecar written (ignored by git)
HINT: never git add -f this file

Meaning:

Raw mode produced an ignored dangerous file.
Do not commit it.

Example:

[PASS] P8/TRACK-P8 :: lock files :: no bad tracked files

Meaning:

Lock file zone has no unexpected tracked artifacts.

---

## Security Notes

The script is read-only regarding Git state.

It uses read-only Git operations such as:

git ls-files
git check-ignore
git log
git grep

It does not modify:

working tree
index
branches
remotes

However, raw secret mode writes dangerous local files.

Raw mode output must never be committed.

Never commit:

.env
.env.local
.env.production
.env.backup
storage/*.key
logs/*.log
tmp/*
cache/*
raw-secrets_*
raw_secrets_*

---

## Common Fail Reasons and Fixes

### FAIL: Real `.env` Tracked

Fix:

git rm --cached .env
git rm --cached .env.local
git rm --cached .env.production

Then rotate secrets and check history:

git --no-pager log --all --full-history -- .env

If `.env` exists in history, treat secrets as compromised and clean history.

---

### FAIL: `raw-secrets_*` Tracked

Fix:

git rm --cached tools/.../reports/raw-secrets_*.md

Ensure `tools/.gitignore` contains raw secret ignore rules.

Never force-add raw secrets.

---

### FAIL: Uppercase `Modules` Still Tracked

Fix:

git rm -r --cached resources/js/Modules
git add resources/js/modules

Commit frontend case normalization atomically.

---

### FAIL: Case-Duplicate Group

Example:

resources/js/Modules/TalkStream/routes.ts | resources/js/modules/TalkStream/routes.ts

Fix:

Keep only one canonical lowercase path in the index.
Remove the uppercase path from the index.
Add the lowercase path.

---

### FAIL: Tracked Bad Files in Tools Artifacts Zone

Fix:

Remove logs/tmp/cache/raw secrets from index.
Keep only .gitkeep placeholders.
Verify tools/.gitignore rules.

---

### FAIL: Generated Unplugin Types Tracked

Fix:

git rm --cached types/auto-imports.d.ts
git rm --cached types/components.d.ts

Ensure `.gitignore` ignores them.

Keep handwritten types tracked.

---

### WARN: Junk in History

Meaning:

Old local dumps or artifacts may exist in history.
Not always blocking.
Consider history cleanup before public hosting.

---

## CI Usage

For CI or strict local gate:

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode audit -SecretMode redact -FailOnIssues

Exit codes:

| Code | Meaning |
| --- | --- |
| `0` | No risks or warnings, or `-FailOnIssues` not used. |
| `1` | `-FailOnIssues` used and at least one risk/warning found. |

Recommended CI sequence:

1. run audit redact
2. upload reports as artifacts
3. fail pipeline on exit code 1

---

## Useful Shortcuts

Fast full safe audit:

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode audit

Fast secrets-only safe check:

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode secrets

Fast case check:

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode case-safety

Fast ignore policy check:

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode ignore-check

Regenerate evidence manifests:

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode manifests

Verify evidence manifests:

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode verify-manifests

Show current tool paths:

.\tools\system-analysis\ScriptGitPolicyAudit\Collect-GitPolicyAudit.ps1 -Mode paths

---

## Recommended Commit Group

This package belongs to:

tools/system-analysis

Recommended Git commit:

git add tools/system-analysis/ScriptGitPolicyAudit
git diff --cached --name-only | Select-String -NotMatch '^tools/'
git diff --cached --name-only | Select-String '\.log$|\.tmp$|raw-secrets_|\.env'
git commit -m "chore(tools): add GitPolicy audit package"

Before committing, ensure:

no logs are staged
no tmp files are staged
no raw-secrets files are staged
no .env files are staged
reports/snapshots are intentional evidence
