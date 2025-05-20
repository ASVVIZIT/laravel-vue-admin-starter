const { body } = document
const WIDTH = 992
import { appStore } from '@/store/app'
export default function () {
  const useAppStore = appStore()
  const $_isMobile = () => {
    const rect = body.getBoundingClientRect()
    return rect.width - 1 < WIDTH
  }
  const $_resizeHandler = () => {
    if (!document.hidden && !useAppStore.isSidebarLocked) {
      const isMobile = $_isMobile()
      if (isMobile) {
        // console.log('closeSideBar')
        /*此处只做根据window尺寸关闭sideBar功能*/

        useAppStore.openSideBar(false)
        //useAppStore.openRightPanel(false)
      } else {
        useAppStore.openSideBar(true)
       // useAppStore.openRightPanel(true)
      }
    }
  }
  onBeforeMount(() => {
    window.addEventListener('resize', $_resizeHandler)
  })
  onMounted(() => {
    if (!document.hidden && !useAppStore.isSidebarLocked) {
      const isMobile = $_isMobile()
      if (isMobile) {
        useAppStore.openSideBar(false)
        //useAppStore.openRightPanel(false)
      } else {
        useAppStore.openSideBar(true)
        // useAppStore.openRightPanel(true)
      }
    }
  })
  onBeforeUnmount(() => {
    if (!useAppStore.isSidebarLocked) {
      const isMobile = $_isMobile()
      useAppStore.openSideBar(!isMobile)
    }
    window.removeEventListener('resize', $_resizeHandler)
  })
}
