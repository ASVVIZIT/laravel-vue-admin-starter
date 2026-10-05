import { type App } from 'vue'
import loadingTalk from '@/modules/TalkStream/Directives/loading/v-loading-talk'
import LoadingTalkSmall from '@/modules/TalkStream/Directives/loading/v-loading-talk-small.ts'

export default {
    install(app: App): void {
        app.directive('loading-talk', loadingTalk)
        app.directive('loading-talk-small', LoadingTalkSmall)
    }
}
