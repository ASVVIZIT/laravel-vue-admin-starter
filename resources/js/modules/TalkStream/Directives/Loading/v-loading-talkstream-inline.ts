// resources/js/modules/TalkStream/Directives/Loading/v-loading-talkstream-inline.ts

import LoadingIndicatorInline from '@/modules/TalkStream/Components/Loading/LoadingIndicatorInline.vue'
import { createLoadingDirective } from './create-loading-directive'

export default createLoadingDirective(
    LoadingIndicatorInline,
    'Directive:v-loading-talkstream-inline',
    'inline',
    'inline'
)
