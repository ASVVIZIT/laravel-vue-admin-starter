git rev-parse --show-toplevel
git branch --show-current
git status --branch --short

git diff --stat
git diff --name-status

git diff --cached --stat
git diff --cached --name-status
git diff --cached --summary

git show --stat HEAD
git show --name-status HEAD

git ls-files | Where-Object { $_ -match '^\.env' -and $_ -notmatch '\.env\.example$' }
git ls-files | Select-String 'raw-secrets_|raw_secrets_|/logs/|/tmp/|/cache/|dump_structure_tree|project_structure_tree'

git diff --cached --name-only | Where-Object { $_ -match '^\.env' -and $_ -notmatch '\.env\.example$' }
git diff --cached --name-only | Select-String 'raw-secrets_|raw_secrets_|/logs/|/tmp/|/cache/|dump_structure_tree|project_structure_tree'

git show --name-only --pretty=format: HEAD | Where-Object { $_ -match '^\.env' -and $_ -notmatch '\.env\.example$' }
git show --name-only --pretty=format: HEAD | Select-String 'raw-secrets_|raw_secrets_|/logs/|/tmp/|/cache/|dump_structure_tree|project_structure_tree'

git check-ignore -v --no-index .env
git check-ignore -v --no-index .env.example
git check-ignore -v --no-index resources/js/components/project_structure_tree.txt
git check-ignore -v --no-index tools/modules/TalkStream/ScriptTalkStreamAudit/logs/test.log
git check-ignore -v --no-index tools/modules/TalkStream/ScriptTalkStreamAudit/tmp/test.tmp
git check-ignore -v --no-index tools/modules/TalkStream/ScriptTalkStreamAudit/reports/raw-secrets_test.md
git check-ignore -v --no-index tools/modules/TalkStream/ScriptTalkStreamAudit/snapshots/test.txt
git check-ignore -v --no-index tools/modules/TalkStream/ScriptTalkStreamAudit/reports/TalkStream-audit_test.md

git ls-files | Select-String '^resources/js/Modules/' -CaseSensitive
git ls-files | Select-String '/TalkStream/(Components|Composables|Directives|Services|Stores|Subscriptions|Talks)/' -CaseSensitive

git ls-files |
  ForEach-Object {
    [pscustomobject]@{
      Lower = $_.ToLowerInvariant()
      Path  = $_
    }
  } |
  Group-Object Lower |
  Where-Object { $_.Count -gt 1 } |
  ForEach-Object { $_.Group.Path }