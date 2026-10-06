import LoadingIndicatorSmall from '@/modules/TalkStream/Components/UI/Loading/LoadingIndicatorSmall.vue'
import { createLoadingDirective } from '@/modules/TalkStream/Directives/Loading/create-loading-directive'

export default createLoadingDirective(LoadingIndicatorSmall, 'Directive:v-loading-talkstream-small', 'small', 'overlay')
