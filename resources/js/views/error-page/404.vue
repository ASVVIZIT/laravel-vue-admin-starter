<template>
  <div class="error-page">
    <div class="error-content">
      <div class="image-section">
        <img class="main-image" :src="image404" alt="404 Error">
        <img class="cloud cloud-left" :src="image404Cloud" alt="Cloud">
        <img class="cloud cloud-middle" :src="image404Cloud" alt="Cloud">
        <img class="cloud cloud-right" :src="image404Cloud" alt="Cloud">
      </div>

      <div class="text-section">
        <div class="oops">{{ OOPS }}</div>
        <div class="message">{{ Message }}</div>

        <div class="info">
          {{ Info }}
        </div>

        <a href="#/dashboard" class="home-button">{{BackHomeButton}}</a>

        <div class="copyright">
          {{CopyrightBy}}
          <a :href="linkGithub"
             target="_blank"
             class="github-link">
            {{ ProjectInGithub }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import image404 from '@/assets/404_images/404.png'
import image404Cloud from '@/assets/404_images/404_cloud.png'

const { t } = useI18n()

const linkGithub = 'https://github.com/asvvizit/laravel-vue-admin-starter'

const OOPS = computed(() => t('common.view404.OOPS'))
const Message = computed(() => t('common.view404.Message'))
const Info = computed(() => t('common.view404.Info'))
const CopyrightBy = computed(() => t('common.view404.CopyrightBy'))
const ProjectInGithub = computed(() => t('common.view404.ProjectInGithub'))
const BackHomeButton = computed(() => t('common.view404.buttons.backHome'))
</script>

<style scoped lang="scss">
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #fff;
  padding: 10px;
}

.error-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  max-width: 1200px;
  width: 100%;
  gap: 20px;
}

.image-section {
  position: relative;
  flex: 1;
  min-width: 500px;
  max-width: 600px;

  .main-image {
    width: 100%;
    display: block;
  }

  .cloud {
    position: absolute;
    opacity: 0;
    animation-duration: 2s;
    animation-timing-function: linear;
    animation-fill-mode: forwards;

    &.cloud-left {
      width: 80px;
      top: 17px;
      left: 220px;
      animation-name: cloudLeft;
      animation-delay: 1s;
    }

    &.cloud-middle {
      width: 46px;
      top: 10px;
      left: 420px;
      animation-name: cloudMid;
      animation-delay: 1.2s;
    }

    &.cloud-right {
      width: 62px;
      top: 100px;
      left: 500px;
      animation-name: cloudRight;
      animation-delay: 1s;
    }
  }
}

.text-section {
  flex: 1;
  min-width: 300px;
  max-width: 450px;
  padding: 20px 0;

  .oops {
    font-size: 32px;
    font-weight: bold;
    color: #1482f0;
    margin-bottom: 20px;
    opacity: 0;
    animation: slideUp 0.5s forwards;
  }

  .message {
    font-size: 20px;
    font-weight: bold;
    color: #222;
    margin-bottom: 20px;
    opacity: 0;
    animation: slideUp 0.5s 0.1s forwards;
  }

  .info {
    font-size: 15px;
    line-height: 1.6;
    color: #666;
    margin-bottom: 30px;
    opacity: 0;
    animation: slideUp 0.5s 0.2s forwards;
  }

  .home-button {
    display: inline-block;
    padding: 10px 30px;
    background: #1482f0;
    border-radius: 100px;
    color: white;
    text-decoration: none;
    font-size: 14px;
    transition: background 0.3s;
    opacity: 0;
    animation: slideUp 0.5s 0.3s forwards;

    &:hover {
      background: #0d6ecb;
    }
  }

  .copyright {
    margin-top: 30px;
    font-size: 13px;
    color: #888;
    opacity: 0;
    animation: slideUp 0.5s 0.4s forwards;

    .github-link {
      color: #1482f0;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

/* Анимации */
@keyframes cloudLeft {
  0% {
    top: 17px;
    left: 220px;
    opacity: 0;
  }
  20% {
    top: 33px;
    left: 188px;
    opacity: 1;
  }
  80% {
    top: 81px;
    left: 92px;
    opacity: 1;
  }
  100% {
    top: 97px;
    left: 60px;
    opacity: 1;
  }
}

@keyframes cloudMid {
  0% {
    top: 10px;
    left: 420px;
    opacity: 0;
  }
  20% {
    top: 40px;
    left: 360px;
    opacity: 1;
  }
  70% {
    top: 130px;
    left: 180px;
    opacity: 1;
  }
  100% {
    top: 160px;
    left: 120px;
    opacity: 1;
  }
}

@keyframes cloudRight {
  0% {
    top: 100px;
    left: 500px;
    opacity: 0;
  }
  20% {
    top: 120px;
    left: 460px;
    opacity: 1;
  }
  80% {
    top: 180px;
    left: 340px;
    opacity: 1;
  }
  100% {
    top: 200px;
    left: 300px;
    opacity: 1;
  }
}

@keyframes slideUp {
  0% {
    transform: translateY(30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Адаптивность */
@media (max-width: 992px) {
  .error-content {
    flex-direction: column;
    text-align: center;
  }

  .image-section {
    min-width: auto;
    max-width: 100%;
  }

  .home-button {
    margin: 0 auto;
  }
}
</style>
