<template>
  <div id="screenfull" class="pl-1 pr-1 mtPx-2" >
      <icon :class-name="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" class="nav-svg-icon" @click="click"/>
  </div>
</template>

<script setup>
import screenFull from 'screenfull'
import { onMounted, onUnmounted, reactive, toRefs } from 'vue'
import { ElMessage } from 'element-plus'

const resData = reactive({
  isFullscreen: false
})

onMounted(() => {
  init()
})
onUnmounted(() => {
  destroy()
})

const click = () => {
  if (!screenFull.isEnabled) {
    ElMessage({
      message: 'you browser can not work',
      type: 'warning'
    })
    return false
  }
  screenFull.toggle()
}
const change = () => {
  resData.isFullscreen = screenFull.isFullscreen
    console.log(resData.isFullscreen)
}
const init = () => {
  if (screenFull.isEnabled) {
    screenFull.on('change', change)
  }
}
const destroy = () => {
  if (screenFull.enabled) {
    screenFull.off('change', change)
  }
}

let { isFullscreen } = toRefs(resData)
</script>

<style lang="scss">
.nav-svg-icon {
  font-size: 18px;
  color: #5a5e66;
  margin-top: 4px;
}
</style>
