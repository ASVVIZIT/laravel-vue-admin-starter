import LoadingIndicatorInline from '@/modules/TalkStream/Components/UI/LoadingIndicatorInline.vue'
import { createLoadingDirective } from '@/modules/TalkStream/Directives/loading/create-loading-directive'

export default createLoadingDirective(LoadingIndicatorInline, 'Directive:v-loading-talkstream-inline', 'inline', 'inline')
