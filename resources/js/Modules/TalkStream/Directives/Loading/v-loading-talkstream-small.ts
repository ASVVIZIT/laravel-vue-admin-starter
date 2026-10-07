// resources/js/modules/TalkStream/Directives/Loading/v-loading-talkstream-small.ts

import LoadingIndicatorSmall from '@/modules/TalkStream/Components/UI/Loading/LoadingIndicatorSmall.vue'
import { createLoadingDirective } from './create-loading-directive'

export default createLoadingDirective(
    LoadingIndicatorSmall,
    'Directive:v-loading-talkstream-small',
    'small',
    'overlay'
)
