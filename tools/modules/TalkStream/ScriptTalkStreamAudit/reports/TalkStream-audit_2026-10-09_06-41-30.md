# TalkStream-audit_2026-10-09_06-41-30

- Generated: 2026-10-09 06:42:28
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
| Values | 53 158 13 3 3 0 0 0 15 0 |
| IsFixedSize | False |
| SyncRoot | System.Object |
| IsSynchronized | False |

## Findings

| Severity | Code | File | Line | Message | Details |
| --- | --- | --- | --- | --- | --- |
| Warning | RelativeImportInsideModule | resources/js/modules/TalkStream/Api/talkStreamApi.ts | 2 | Relative import '../Types' is used inside TalkStream module. | Module rule: internal dependencies should grow from @/modules/TalkStream/... or @modules/TalkStream/..., not from ./ or ../. |
| Warning | ExtensionInInternalImport | resources/js/modules/TalkStream/Components/Messages/MessageItem.vue | 70 | Import '@/store/userStore.js' contains explicit .ts/.js extension. | Project rule for internal imports: no .ts/.js extensions in paths. |
| Warning | RelativeImportInsideModule | resources/js/modules/TalkStream/Directives/Loading/loadingDirective.ts | 5 | Relative import './v-loading-talkstream' is used inside TalkStream module. | Module rule: internal dependencies should grow from @/modules/TalkStream/... or @modules/TalkStream/..., not from ./ or ../. |
| Warning | RelativeImportInsideModule | resources/js/modules/TalkStream/Directives/Loading/loadingDirective.ts | 6 | Relative import './v-loading-talkstream-small' is used inside TalkStream module. | Module rule: internal dependencies should grow from @/modules/TalkStream/... or @modules/TalkStream/..., not from ./ or ../. |
| Warning | RelativeImportInsideModule | resources/js/modules/TalkStream/Directives/Loading/loadingDirective.ts | 7 | Relative import './v-loading-talkstream-inline' is used inside TalkStream module. | Module rule: internal dependencies should grow from @/modules/TalkStream/... or @modules/TalkStream/..., not from ./ or ../. |
| Warning | RelativeImportInsideModule | resources/js/modules/TalkStream/Directives/Loading/v-loading-talkstream-inline.ts | 4 | Relative import './create-loading-directive' is used inside TalkStream module. | Module rule: internal dependencies should grow from @/modules/TalkStream/... or @modules/TalkStream/..., not from ./ or ../. |
| Warning | RelativeImportInsideModule | resources/js/modules/TalkStream/Directives/Loading/v-loading-talkstream-small.ts | 4 | Relative import './create-loading-directive' is used inside TalkStream module. | Module rule: internal dependencies should grow from @/modules/TalkStream/... or @modules/TalkStream/..., not from ./ or ../. |
| Warning | RelativeImportInsideModule | resources/js/modules/TalkStream/Directives/Loading/v-loading-talkstream.ts | 4 | Relative import './create-loading-directive' is used inside TalkStream module. | Module rule: internal dependencies should grow from @/modules/TalkStream/... or @modules/TalkStream/..., not from ./ or ../. |
| Warning | LoadingModifierWithoutConfigZone | config/loading.ts | 0 | Loading modifier '.contacts' is used in templates, but zones.contacts is not found in config/loading.ts. | Either add the zone to config/loading.ts or remove the modifier if it is unused. |
| Warning | LoadingModifierWithoutConfigZone | config/loading.ts | 0 | Loading modifier '.history' is used in templates, but zones.history is not found in config/loading.ts. | Either add the zone to config/loading.ts or remove the modifier if it is unused. |
| Warning | LoadingModifierWithoutConfigZone | config/loading.ts | 0 | Loading modifier '.sender' is used in templates, but zones.sender is not found in config/loading.ts. | Either add the zone to config/loading.ts or remove the modifier if it is unused. |
| Warning | LoadingModifierWithoutConfigZone | config/loading.ts | 0 | Loading modifier '.ts' is used in templates, but zones.ts is not found in config/loading.ts. | Either add the zone to config/loading.ts or remove the modifier if it is unused. |
| Warning | LoadingKeyWithoutConfigZone | config/loading.ts | 0 | useLoading/getLoadingState key 'contacts' is used, but zones.contacts is not found in config/loading.ts. |  |
| Warning | LoadingKeyWithoutConfigZone | config/loading.ts | 0 | useLoading/getLoadingState key 'history' is used, but zones.history is not found in config/loading.ts. |  |
| Warning | LoadingKeyWithoutConfigZone | config/loading.ts | 0 | useLoading/getLoadingState key 'sender' is used, but zones.sender is not found in config/loading.ts. |  |

## Output

- CSV: `W:\OpenServer\domains\Laravel\Other\FenixPortal\tools\modules\TalkStream\ScriptTalkStreamAudit\reports\TalkStream-audit_2026-10-09_06-41-30.csv`
- JSON: `W:\OpenServer\domains\Laravel\Other\FenixPortal\tools\modules\TalkStream\ScriptTalkStreamAudit\reports\TalkStream-audit_2026-10-09_06-41-30.json`
- Markdown: `W:\OpenServer\domains\Laravel\Other\FenixPortal\tools\modules\TalkStream\ScriptTalkStreamAudit\reports\TalkStream-audit_2026-10-09_06-41-30.md`
