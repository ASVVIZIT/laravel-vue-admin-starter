<template>
  <div class="dashboard-default-container">
    <div class="clearfix">
      <pan-thumb :image="avatar" style="float: left">
        Your roles:
        <span v-for="item in roles" :key="item" class="pan-info-roles">{{ item }}</span>
      </pan-thumb>
      <div class="info-container">
        <span class="display_name">{{ name }}</span>
        <span style="font-size: 20px; padding-top: 20px; display: inline-block">Tester's Dashboard</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import PanThumb from '@/views/dashboard/PanThumb'
import { computed } from 'vue'
import { userStore } from '@/store/userStore'

const useUserStore = userStore()
const name = computed(() => {
  return useUserStore.name
})
const avatar = computed(() => {
  return useUserStore.avatar
})
const roles = computed(() => {
  return useUserStore.roles
})
</script>

<style lang="scss">
.emptyGif {
  display: block;
  width: 45%;
  margin: 0 auto;
  max-height: 400px;
}

.dashboard-default-container {
  background-color: #e3e3e3;
  min-height: 100vh;
  padding: 50px 60px 0;
  .pan-info-roles {
    font-size: 12px;
    font-weight: 700;
    color: #333;
    display: block;
  }
  .info-container {
    position: relative;
    margin-left: 190px;
    height: 150px;
    line-height: 200px;
    .display_name {
      font-size: 48px;
      line-height: 48px;
      color: #212121;
      position: absolute;
      top: 25px;
    }
  }
}
</style>
