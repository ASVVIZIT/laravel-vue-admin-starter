import LoadingIndicatorInline from '@/modules/TalkStream/Components/UI/Loading/LoadingIndicatorInline.vue'
import { createLoadingDirective } from '@/modules/TalkStream/Directives/Loading/create-loading-directive'

export default createLoadingDirective(LoadingIndicatorInline, 'Directive:v-loading-talkstream-inline', 'inline', 'inline')
