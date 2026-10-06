import LoadingIndicator from '@/modules/TalkStream/Components/UI/Loading/LoadingIndicator.vue'
import { createLoadingDirective } from '@/modules/TalkStream/Directives/Loading/create-loading-directive'

export default createLoadingDirective(LoadingIndicator, 'Directive:v-loading-talkstream', 'default', 'overlay')
