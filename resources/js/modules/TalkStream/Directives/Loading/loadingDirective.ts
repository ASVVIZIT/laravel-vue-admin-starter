// resources/js/modules/TalkStream/Directives/Loading/loadingDirective.ts

import type { App } from 'vue'

import loadingTalkStream from './v-loading-talkstream'
import loadingTalkStreamSmall from './v-loading-talkstream-small'
import loadingTalkStreamInline from './v-loading-talkstream-inline'

export default {
    install(app: App): void {
        app.directive('loading-talkstream', loadingTalkStream)
        app.directive('loading-talkstream-small', loadingTalkStreamSmall)
        app.directive('loading-talkstream-inline', loadingTalkStreamInline)
    }
}
