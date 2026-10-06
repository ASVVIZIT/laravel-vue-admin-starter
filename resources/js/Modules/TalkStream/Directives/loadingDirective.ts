import { type App } from 'vue'
import loadingTalkstream from '@/modules/TalkStream/Directives/loading/v-loading-talkstream'
import loadingTalkstreamSmall from '@/modules/TalkStream/Directives/loading/v-loading-talkstream-small'
import loadingTalkstreamInline from '@/modules/TalkStream/Directives/loading/v-loading-talkstream-inline'

export default {
    install(app: App): void {
        app.directive('loading-talkstream', loadingTalkstream)
        app.directive('loading-talkstream-small', loadingTalkstreamSmall)
        app.directive('loading-talkstream-inline', loadingTalkstreamInline)
    }
}
