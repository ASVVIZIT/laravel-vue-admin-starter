// resources/js/modules/TalkStream/Directives/Loading/v-loading-talkstream.ts

import LoadingIndicator from '@/modules/TalkStream/Components/UI/Loading/LoadingIndicator.vue'
import { createLoadingDirective } from './create-loading-directive'

export default createLoadingDirective(
    LoadingIndicator,
    'Directive:v-loading-talkstream',
    'default',
    'overlay'
)
