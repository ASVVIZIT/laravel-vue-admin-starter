<template>
  <div class="app-container">
    <div class="errPage-container">
      <el-button :icon="ArrowLeft" class="pan-back-btn" @click="back">
        {{ BackButton }}
      </el-button>
      <el-row>
        <el-col :span="12">
          <h1 class="text-jumbo text-ginormous">
            {{ OOPS }}
          </h1>
          <h2>{{ Permission }}</h2>
          <h5>{{ MessageAdmin }}</h5>
          <ul class="list-unstyled">
            <li>{{CanGo}}</li>
            <li class="link-type">
              <router-link to="/dashboard">
               {{RouteDashboard}}
              </router-link>
            </li>
            <li class="link-type">
              <a :href="JustLookingAroundHref">{{ JustLookingAround }}</a>
            </li>
            <li><a href="#" @click.prevent="dialogVisible = true">{{ ShowPicture }}</a></li>
          </ul>
        </el-col>
        <el-col :span="12">
          <img :src="gifImage" width="313" height="428" alt="Girl has dropped her ice cream.">
        </el-col>
      </el-row>
      <el-dialog v-model="dialogVisible" :title="CasualLook">
        <img :src="jpgImage" class="pan-img" alt="Auth">
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft } from '@element-plus/icons-vue'
import noAuthGif from '@/assets/401_images/401.gif'
import noAuthJpg from '@/assets/401_images/401.jpg'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const dialogVisible = ref(false)
const gifImage = noAuthGif
const jpgImage = noAuthJpg

const BackButton = computed(() => t('common.view401.buttons.back'))
const CanGo = computed(() => t('common.view401.CanGo'))
const RouteDashboard = computed(() => t('route.Dashboard'))
const OOPS = computed(() => t('common.view401.OOPS'))
const Permission = computed(() => t('common.view401.Permission'))
const MessageAdmin = computed(() => t('common.view401.MessageAdmin'))
const JustLookingAroundHref = computed(() => t('common.view401.JustLookingAroundHref'))
const JustLookingAround = computed(() => t('common.view401.JustLookingAround'))
const ShowPicture = computed(() => t('common.view401.ShowPicture'))
const CasualLook = computed(() => t('common.view401.CasualLook'))

const back = () => {
  if (route.query.noGoBack) {
    router.push({ path: '/dashboard' })
  } else {
    router.go(-1)
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.errPage-container {
  width: 800px;
  max-width: 100%;
  margin: 100px auto;
  .pan-back-btn {
    background: #008489;
    color: #fff;
    border: none!important;
  }
  .pan-gif {
    margin: 0 auto;
    display: block;
  }
  .pan-img {
    display: block;
    margin: 0 auto;
    width: 100%;
  }
  .text-jumbo {
    font-size: 60px;
    font-weight: 700;
    color: #484848;
  }
  .list-unstyled {
    font-size: 14px;
    li {
      padding-bottom: 5px;
    }
    a {
      color: #008489;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
