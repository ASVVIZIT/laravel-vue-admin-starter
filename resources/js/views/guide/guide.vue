<template>
  <div class="app-container">
    <aside>
      Страница с руководством полезна для некоторых пользователей, которые впервые вошли в проект. Вы можете кратко ознакомить
      их с возможностями проекта. Демонстрация основана на
      <a href="https://github.com/kamranahmedse/driver.js" target="_blank">driver.js.</a>
    </aside>
    <div class="guide-buttons">
      <el-button
          :size="store.size"
          type="primary"
          @click.prevent.stop="showElementTips()">
        <i class="bi-question"></i>
        Руководство по элементам
      </el-button>
      <el-button
          :size="store.size"
          type="success"
          @click.prevent.stop="showRouteTips()">
        <i class="bi-map-location"></i>
        Навигация по системе
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useRouter } from 'vue-router'
import { appStore } from '@/store/app'
const store = appStore()
import { ElNotification } from 'element-plus'
import elementSteps from './steps/elements'
import generateRouteSteps from './steps/routes'
import {
  filterStepsByExistingElements,
  waitForElement
} from '@/utils/dom'

const router = useRouter()

// Базовая конфигурация драйвера
const driverConfig = {
  animate: true,
  opacity: 0.75,
  padding: 10,
  allowClose: true,
  overlayClickNext: false,
  popoverClass: 'driverjs-theme',
  closeBtnText: 'Закрыть',
  nextBtnText: 'Вперед —›',
  prevBtnText: '‹— Назад',
  doneBtnText: 'Готово',
  showProgress: true,
  onPopoverRender: (popover, { config, state }) => {
    const firstButton = document.createElement("button")
    firstButton.innerText = "В начало"
    popover.footerButtons.appendChild(firstButton)
    firstButton.addEventListener("click", () => driverObj.drive(0))
  }
}

// Инициализация драйвера
const driverObj = driver({
  ...driverConfig,
  onNextClick: (element, step) => handleStepChange(step, 'next'),
  onPrevClick: (element, step) => handleStepChange(step, 'prev'),
  onCloseClick: () => driverObj.destroy()
})

// Обработчик изменения шагов
const handleStepChange = (step, direction) => {
  if (step.route) {
    router.push(step.route).then(() => {
      setTimeout(() => driverObj[direction === 'next' ? 'moveNext' : 'movePrevious'](), 300)
    })
  } else {
    driverObj[direction === 'next' ? 'moveNext' : 'movePrevious']()
  }
}

// Показ руководства по элементам
const showElementTips = async () => {
  try {
    // Ожидаем появления динамических элементов
    await waitForElement('#tags-view-container', 2000)

    const filteredSteps = filterStepsByExistingElements(elementSteps)

    if (filteredSteps.length === 0) {
      ElNotification({
        title: 'Обучение недоступно',
        message: 'Не найдены элементы для показа руководства',
        type: 'warning',
        duration: 5000
      })
      return
    }

    driverObj.setSteps(filteredSteps)
    driverObj.drive()
  } catch (error) {
    console.error('Ошибка при показе руководства:', error)
  }
}

// Показ навигации по маршрутам
const showRouteTips = () => {
  try {
    const routeSteps = generateRouteSteps(router)
    console.log('routeSteps ', routeSteps)
    if (routeSteps.length === 0) {
      ElNotification({
        title: 'Навигация недоступна',
        message: 'Маршруты для обучения не настроены',
        type: 'warning',
        duration: 5000
      })
      return
    }

    driverObj.setSteps(routeSteps)
    driverObj.drive()
  } catch (error) {
    console.error('Ошибка при навигации:', error)
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.guide-buttons {
  margin-top: 30px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;

  .el-button {
    max-width: 200px;
  }

}

@media (max-width: 768px) {
  .guide-buttons {
    align-items: anchor-center;
    flex-direction: column;
  }
}
</style>
