import { type App } from 'vue'
import loadingTalkStream from '@/modules/TalkStream/Directives/Loading/v-loading-talkstream'
import loadingTalkStreamSmall from '@/modules/TalkStream/Directives/Loading/v-loading-talkstream-small'
import loadingTalkStreamInline from '@/modules/TalkStream/Directives/Loading/v-loading-talkstream-inline'

export default {
    install(app: App): void {
        app.directive('loading-talkstream', loadingTalkStream)
        app.directive('loading-talkstream-small', loadingTalkStreamSmall)
        app.directive('loading-talkstream-inline', loadingTalkStreamInline)
    }
}
