import LoadingIndicator from '@/modules/TalkStream/Components/UI/LoadingIndicator.vue'
import { createLoadingDirective } from '@/modules/TalkStream/Directives/loading/create-loading-directive'

export default createLoadingDirective(LoadingIndicator, 'Directive:v-loader')
