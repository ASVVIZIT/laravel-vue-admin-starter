import Cookies from 'js-cookie'
import {getLanguage} from '@/lang'
import {defineStore} from "pinia"
import defaultSettings from '../settings'

export const appStore = defineStore('app', {
  state: () => {
    return {
      sidebar: {
        opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
        withoutAnimation: true,
      },
      rightPanel: {
        opened: Cookies.get('rightPanelStatus') ? !!+Cookies.get('rightPanelStatus') : false,
        withoutAnimation: true,
      },
      device: 'desktop',
      language: getLanguage(),
      size: Cookies.get('size') || 'medium',
      cachedViews: [],
      cachedViewsDeep: [],
      settings: defaultSettings
    }
  },
  actions: {
    toggleSideBar() {
      this.$patch((state) => {
        state.sidebar.opened = !state.sidebar.opened;
        state.sidebar.withoutAnimation = false;
        if (state.sidebar.opened) {
          Cookies.set('sidebarStatus', 1);
        } else {
          Cookies.set('sidebarStatus', 0);
        }
      })
    },
    openSideBar(data) {
      this.$patch((state) => {
        Cookies.set('sidebarStatus', 1)
        state.sidebar.opened = data
      })
    },
    closeSideBar(withoutAnimation) {
      this.$patch((state) => {
        Cookies.set('sidebarStatus', 0)
        state.sidebar.opened = false
        state.sidebar.withoutAnimation = withoutAnimation;
      })
    },

    toggleRightPanel() {
      this.$patch((state) => {
          state.rightPanel.opened = !state.rightPanel.opened;
          state.rightPanel.withoutAnimation = false;
          if (state.rightPanel.opened) {
              Cookies.set('rightPanelStatus', 1);
          } else {
              Cookies.set('rightPanelStatus', 0);
          }
      })
    },
    openRightPanel(data) {
      this.$patch((state) => {
          Cookies.set('rightPanelStatus', 1)
          state.rightPanel.opened = data
      })
    },
    closeRightPanel(withoutAnimation) {
      this.$patch((state) => {
          Cookies.set('rightPanelStatus', 0)
          state.rightPanel.opened = false
          state.rightPanel.withoutAnimation = withoutAnimation;
      })
    },

    toggleDevice(device) {
      this.$patch((state) => {
        state.device = device
      })
    },
    setLanguage(language) {
      this.$patch((state) => {
        state.language = language
        Cookies.set('language', language)
      })
    },

    setSize(newSize) {
      this.$patch((state) => {
        if (!['large', 'medium', 'small'].includes(newSize)) {
          console.error('Недопустимый размер:', newSize);
          return;
        }
        state.size = newSize;
        Cookies.set('size', newSize, { expires: 7 });

        // Динамическое обновление CSS-переменной
       /* const root = document.documentElement
        const sizes = {
          large: 'var(--el-component-size-large)',
          medium: 'var(--el-component-size)',
          small: 'var(--el-component-size-small)'
        }
        root.style.setProperty('--current-el-size', sizes[newSize])*/
      })
    },

    /*keepAlive缓存*/
    addCachedView(view) {
      this.$patch((state) => {
        if (state.cachedViews.includes(view)) {
          return
        }
        state.cachedViews.push(view)
      })
    },
    delCachedView(view) {
      this.$patch((state) => {
        const index = state.cachedViews.indexOf(view)
        index > -1 && state.cachedViews.splice(index, 1)
      })
    },
    resetCachedView() {
      this.$patch((state) => {
        state.cachedViews = []
      })
    },
    /*third  keepAlive*/
    addCachedViewDeep(view) {
      this.$patch((state) => {
        if (state.cachedViewsDeep.includes(view)) {
          return
        }
        state.cachedViewsDeep.push(view)
      })
    },
    delCachedViewDeep(view) {
      this.$patch((state) => {
        const index = state.cachedViewsDeep.indexOf(view)
        index > -1 && state.cachedViewsDeep.splice(index, 1)
      })
    },
    resetCachedViewDeep() {
      this.$patch((state) => {
        state.cachedViewsDeep = []
      })
    },
    changeSetting(data) {
      this.$patch((state) => {
        state.settings = {...state.settings, ...data}
      })
    }
  }
})
