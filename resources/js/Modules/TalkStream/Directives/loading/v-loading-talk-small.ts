import LoadingIndicatorSmall from '@/modules/TalkStream/Components/UI/LoadingIndicatorSmall.vue'
import { createLoadingDirective } from '@/modules/TalkStream/Directives/loading/create-loading-directive'

export default createLoadingDirective(LoadingIndicatorSmall, 'Directive:v-loader-small')
