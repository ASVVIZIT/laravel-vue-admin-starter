# TalkStream-audit_2026-10-06_22-46-14

- Generated: 2026-10-06 22:46:36
- Script version: 3.1.0
- Tool root: `W:/OpenServer/domains/Laravel/Other/FenixPortal/tools/modules/TalkStream/ScriptTalkStreamAudit`
- Project root: `W:/OpenServer/domains/Laravel/Other/FenixPortal`
- Output dir: `W:/OpenServer/domains/Laravel/Other/FenixPortal/tools/modules/TalkStream/ScriptTalkStreamAudit/reports`
- Log dir: `W:/OpenServer/domains/Laravel/Other/FenixPortal/tools/modules/TalkStream/ScriptTalkStreamAudit/logs`
- Snapshot dir: `W:/OpenServer/domains/Laravel/Other/FenixPortal/tools/modules/TalkStream/ScriptTalkStreamAudit/snapshots`
- Secret mode: off
- Scan reports: False

## Totals

| Metric | Value |
| --- | ---: |
| Count | 10 |
| IsReadOnly | False |
| Keys | filesScanned importRecords directiveUsages loadingKeys registeredDirectives configZones secretFindings risks warnings infos |
| Values | 45 146 8 2 3 7 0 2 3 0 |
| IsFixedSize | False |
| SyncRoot | System.Object |
| IsSynchronized | False |

## Findings

| Severity | Code | File | Line | Message | Details |
| --- | --- | --- | --- | --- | --- |
| Risk | ModulesDirectoryCaseMismatch | resources/js/Modules | 0 | Actual modules directory is 'Modules', but canonical lowercase target is 'modules'. | Linux/Docker/CentOS/Debian filesystems are case-sensitive. tsconfig/jsconfig point to ./resources/js/modules/. |
| Warning | RelativeImportInsideModule | resources/js/Modules/TalkStream/api/talkstream.ts | 2 | Relative import '../types' is used inside TalkStream module. | Module rule: internal dependencies should grow from @/modules/TalkStream/... or @modules/TalkStream/..., not from ./ or ../. |
| Risk | UppercaseModulesInImport | resources/js/Modules/TalkStream/Components/ConnectionStatus.vue | 2 | Import '@/Modules/TalkStream/Stores/talkStreamStore' contains uppercase 'Modules' path segment. | Canonical path should be modules, not Modules, for Linux/Docker safety. |
| Warning | RelativeImportInsideModule | resources/js/Modules/TalkStream/Components/MessageList.vue | 8 | Relative import './MessageItem.vue' is used inside TalkStream module. | Module rule: internal dependencies should grow from @/modules/TalkStream/... or @modules/TalkStream/..., not from ./ or ../. |
| Warning | ExtensionInInternalImport | resources/js/Modules/TalkStream/Talks/Contacts.vue | 44 | Import '@modules/TalkStream/Subscriptions/friendshipEventsHandler.js' contains explicit .ts/.js extension. | Project rule for internal imports: no .ts/.js extensions in paths. |

## Output

- CSV: `W:\OpenServer\domains\Laravel\Other\FenixPortal\tools\modules\TalkStream\ScriptTalkStreamAudit\reports\TalkStream-audit_2026-10-06_22-46-14.csv`
- JSON: `W:\OpenServer\domains\Laravel\Other\FenixPortal\tools\modules\TalkStream\ScriptTalkStreamAudit\reports\TalkStream-audit_2026-10-06_22-46-14.json`
- Markdown: `W:\OpenServer\domains\Laravel\Other\FenixPortal\tools\modules\TalkStream\ScriptTalkStreamAudit\reports\TalkStream-audit_2026-10-06_22-46-14.md`
