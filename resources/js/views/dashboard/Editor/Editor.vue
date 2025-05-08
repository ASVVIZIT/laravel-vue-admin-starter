<template>
  <div class="dashboard-editor-container">
    <div class="clearfix">
      <pan-thumb :image="avatar" style="float: left">
        Your roles:
        <span v-for="item in roles" :key="item" class="pan-info-roles">{{ item }}</span>
      </pan-thumb>
      <github-corner style="position: absolute; top: 0px; border: 0; right: 0" />
      <div class="info-container">
        <span class="display_name">{{ name }}</span>
        <span style="font-size: 20px; padding-top: 20px; display: inline-block">Editor's Dashboard</span>
      </div>
    </div>
    <div class="emptyGif">
      <img :src="yierGif" style="width: 50%;float: left;transform: rotateY(180deg);" />
      <img :src="bubuGif" style="width: 50%; float: right" />
    </div>
  </div>
</template>

<script setup>
// Components
// Импорт компонентов / Component imports
import PanThumb from '@/views/dashboard/PanThumb'
import GithubCorner from '@/views/dashboard/GithubCorner'

// Vue reactivity utilities
// Импорт реактивных утилит Vue
import { ref } from 'vue'

// Pinia store utilities
// Импорт утилит хранилища Pinia
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'

// Initialize user store
// Инициализация хранилища пользователя
const userStore = useUserStore()

// Destructure reactive store properties using storeToRefs
// Деструктуризация реактивных свойств хранилища с помощью storeToRefs
const { name, avatar, roles } = storeToRefs(userStore)

// Image references using ref()
// Ссылки на изображения с использованием ref()
const yierGif = ref('https://cdn.laravel-vue-admin.eu.org/static/images/blog/yier.gif')
const bubuGif = ref('https://cdn.laravel-vue-admin.eu.org/static/images/blog/bubu.gif')
</script>

<style lang="scss">
.emptyGif {
  display: block;
  width: 45%;
  margin: 0 auto;
  max-height: 400px;
}

.dashboard-editor-container {
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
