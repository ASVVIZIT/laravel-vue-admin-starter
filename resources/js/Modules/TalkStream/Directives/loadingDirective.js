// directives/loadingDirective
import loadingTalk from '@/modules/TalkStream/Directives/loading/v-loading-talk'
import LoadingTalkSmall from '@/modules/TalkStream/Directives/loading/v-loading-talk-small'

export default {
    install(app) {
       app.directive('loading-talk',loadingTalk)
       app.directive('loading-talk-small',LoadingTalkSmall)
    }
}
