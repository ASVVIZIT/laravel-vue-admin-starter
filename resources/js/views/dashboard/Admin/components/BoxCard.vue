<template>
  <el-card class="box-card-component" style="margin-left:8px;">
    <div slot="header" class="box-card-header">
      <img src="https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200">
    </div>
    <div style="position:relative;">
      <pan-thumb :image="avatar" class="panThumb"/>
      <div class="mallki-text">
        Laravel Vue Admin Starter
      </div>
      <div style="padding-top:35px;" class="progress-item">
        <span>Laravel</span>
        <el-progress :percentage="70"/>
      </div>
      <div class="progress-item">
        <span>Vue</span>
        <el-progress :percentage="18"/>
      </div>
      <div class="progress-item">
        <span>JavaScript</span>
        <el-progress :percentage="12"/>
      </div>
      <div class="progress-item">
        <span>HTML &amp; CSS</span>
        <el-progress :percentage="100" status="success"/>
      </div>
    </div>
  </el-card>
</template>

<script>
import PanThumb from '@components/PanThumb/index.vue'
import {computed, reactive, toRefs} from "vue"
import {userStore} from "@store/user"

export default {
  components: {PanThumb},
  setup() {
    const useUserStore = userStore()
    const resData = reactive({
      name: computed(() => {
        return useUserStore.name
      }),
      avatar: computed(() => {
        return useUserStore.avatar
      }),
      roles: computed(() => {
        return useUserStore.roles
      }),
    })

    return {
      ...toRefs((resData))
    }
  },
};
</script>

<style rel="stylesheet/scss" lang="scss">
.box-card-component {
  .el-card__header {
    padding: 0px !important;
  }
}
</style>
<style rel="stylesheet/scss" lang="scss" scoped>
.box-card-component {
  .box-card-header {
    position: relative;
    height: 220px;

    img {
      width: 100%;
      height: 100%;
      transition: all 0.2s linear;

      &:hover {
        transform: scale(1.1, 1.1);
        filter: contrast(130%);
      }
    }
  }

  .mallki-text {
    position: absolute;
    top: 0px;
    right: 0px;
    font-size: 20px;
    font-weight: bold;
  }

  .panThumb {
    z-index: 100;
    height: 70px !important;
    width: 70px !important;
    position: absolute !important;
    top: -45px;
    left: 0px;
    border: 5px solid #ffffff;
    background-color: #fff;
    margin: auto;
    box-shadow: none !important;

    :deep(.pan-info) {
      box-shadow: none !important;
    }
  }

  .progress-item {
    margin-bottom: 10px;
    font-size: 14px;
  }

  @media only screen and (max-width: 1510px) {
    .mallki-text {
      display: none;
    }
  }
}
</style>
