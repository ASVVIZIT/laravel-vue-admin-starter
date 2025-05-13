<script setup>
import { inject, computed, onMounted, onUnmounted } from 'vue'
import { ACCORDION_CONTEXT } from '@constants/contextKeys'
import { useAccordionStore } from '@store/accordionStore'
import { CaretBottom, ArrowDown, Lock } from '@element-plus/icons-vue'

const props = defineProps({
  id: { type: [String, Number], required: true },
  title: { type: String, required: true },
  content: { type: [Object, String], default: null },
  props: { type: Object, default: () => ({}) },
  customClass: { type: String, required: false },
  headerStyle: { type: Object, required: false },

  // Добавить кастомизацию
  headerClass: {
    type: String,
    default: 'default-header-style'
  },

  // Анимация через пропсы
  animationDuration: {
    type: Number,
    default: 300
  }
})

// Импортируем ключ из Accordion.vue (лучше вынести в отдельный файл)
// const accordionContextKey = Symbol('accordionContext')
// Получаем контекст с правильным ключом
const accordionContext = inject(ACCORDION_CONTEXT)
console.log('[AccordionPanel] Получен контекст:', accordionContext, 'для панели ID: ', props.id)

const store = useAccordionStore()

// Регистрация панели при создании
onMounted(() => {
  console.log('Монтирование панели', props.id)
  console.log('[AccordionPanel] Монтирование', props.id)
  store.registerPanel(props.id)
})

onUnmounted(() => {
  console.log('Уничтожение панели', props.id)
  console.log('[AccordionPanel] Уничтожение', props.id)
  store.unregisterPanel(props.id)
})

const isActive = computed(() => {
  const active = store.isPanelActive(props.id)
  console.log(`[AccordionPanel] Активность ${props.id}:`, active)
  return active
})

// Обработчик клика с проверкой контекста аккордеона
const toggle = () => {
  console.log('[AccordionPanel] Клик по панели', props.id)
  //const contextExists = inject('accordionContext', false)
  //console.log('Контекст аккордеона существует:', contextExists)

  if (!accordionContext?.isAccordion) {
    console.error('AccordionPanel должен использоваться внутри Accordion!')
    return
  }

  /*    if (!accordionContext) {
          console.error('[AccordionPanel] ОШИБКА: Компонент не находится внутри Accordion!')
          return
      }*/

  console.log('[AccordionPanel] Вызов togglePanel для', props.id)
  store.togglePanel(props.id)
}

// Добавляем вычисляемое свойство для блокировки
const isClickDisabled = computed(() => {
  return ['all', 'none'].includes(store.accordionMode)
})

</script>

<template>
  <div class="panel" :class="{ 'is-active': isActive }">
    <div
        class="panel-header"
        @click="!isClickDisabled && toggle()"
        :class="{ 'disabled-click': isClickDisabled }"
    >
      <el-icon v-if="!isClickDisabled" :class="['arrow-icon toggle-arrow-left', { 'rotate': isActive }]" >
        <CaretBottom />
      </el-icon>
      <el-icon v-else class="arrow-icon">
        <Lock />
      </el-icon>
      <!-- Заголовок панели -->
      <div class="panel-header-title">{{ title }} - {{ id }}</div>
      <!-- Стрелка справа с анимацией -->
      <el-icon :class="['arrow-icon toggle-arrow-right', { 'rotate': isActive }]">
        <CaretBottom />
      </el-icon>
    </div>
    <transition name="slide">
      <div v-show="isActive" class="panel-content">
        <!-- Слот для контента с передачей данных -->
        <slot>
          <component :is="content" v-bind="props"/>
        </slot>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.panel {
  border-bottom: 1px solid #e4e7ed;
  &-header {
    padding: 2px;
    cursor: pointer;
    display: flex;
    gap: 2px;
    justify-content: space-between;
    align-items: center;
    background-color: rgb(24, 144, 255);
    transition: background-color 0.3s;

    &-title {
      font-weight: bold;
      padding: 2px;
      color: #ffffff;
      font-size: 14px;
    }

    .arrow-icon {
      color: #ffffff;
      font-size: 14px;
    }

    .toggle-arrow-left {
      margin-right: auto;
      transition: transform 0.3s;

      &.rotate {
        transform: rotate(180deg);
      }
    }
    .toggle-arrow-right {
      margin-left: auto;
      transition: transform 0.3s;

      &.rotate {
        transform: rotate(180deg);
      }
    }
    &:hover {
      background-color: rgba(86, 150, 246, 0.8);
    }
  }

  .disabled-click {
    cursor: not-allowed !important;
    opacity: 0.6;

    &:hover {
      background-color: rgba(194, 66, 66, 0.7) !important;
    }
  }

  &-content {
    padding: 2px;
    background-color: #f4f4d9;
    border: 2px solid #1890ff;
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding: 0 10px;
}
</style>
