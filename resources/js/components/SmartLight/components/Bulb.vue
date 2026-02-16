<template>
  <div
      class="light-bulb"
      :class="statusClass"
      :device-id="deviceId"
  >
    <!-- 3D визуализация, если поддерживается -->
    <div v-if="webGLSupported && show3D" class="bulb-3d-container">
      <div class="three-scene-container" ref="container" :style="{ visibility: containerVisible ? 'visible' : 'hidden' }"></div>
    </div>

    <!-- CSS-визуализация как fallback -->
    <div v-if="!webGLSupported || !show3D" class="css-bulb-container">
      <!-- Стеклянная колба -->
      <div class="bulb-glass">
        <div class="bulb-glass-inner">
          <!-- Нить накаливания -->
          <div class="bulb-filament-container">
            <div class="bulb-filament-support">
              <div class="bulb-filament-support-inner"></div>
            </div>
            <div class="bulb-filament">
              <div class="bulb-filament-inner"></div>
            </div>
          </div>

          <!-- Свечение -->
          <div class="bulb-glow" :style="{
            opacity: glowIntensity,
            background: glowGradient
          }"></div>
        </div>
      </div>

      <!-- Цоколь лампочки -->
      <div class="bulb-base">
        <div class="bulb-base-inner">
          <!-- Контактный штырь -->
          <div class="bulb-contact"></div>
        </div>
      </div>

      <!-- Резьба цоколя -->
      <div class="bulb-threading"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useSmartlightStore } from '@/components/SmartLight/stores/smartLightStore.js';
import { logDebug, checkWebGLSupport, isContainerReady } from '@components/SmartLight/api/utils/webglSupport.js';

const props = defineProps({
  deviceId: {
    type: String,
    required: true
  },
  show3D: {
    type: Boolean,
    default: true
  }
});

const container = ref(null);
const store = useSmartlightStore();
const webGLCheck = checkWebGLSupport();
const webGLSupported = webGLCheck.isSupported;
const containerVisible = ref(true);

logDebug('Bulb', 'Компонент создан', {
  deviceId: props.deviceId,
  show3D: props.show3D,
  webGLSupported
});

// Получаем данные устройства
const device = computed(() => {
  const dev = store.getDevice(props.deviceId);
  logDebug('Bulb', 'Получение устройства', {
    deviceId: props.deviceId,
    device: dev
  });
  return dev;
});

const status = computed(() => {
  const statusValue = device.value?.status || 'OFF';
  logDebug('Bulb', 'Получение статуса', {
    deviceId: props.deviceId,
    status: statusValue
  });
  return statusValue;
});

const intensity = computed(() => {
  const intensityValue = device.value?.intensity || 100;
  logDebug('Bulb', 'Получение интенсивности', {
    deviceId: props.deviceId,
    intensity: intensityValue
  });
  return intensityValue;
});

// Вычисляем класс состояния
const statusClass = computed(() => {
  const classValue = `bulb-status-${status.value.toLowerCase()}`;
  logDebug('Bulb', 'Вычисление класса статуса', {
    deviceId: props.deviceId,
    status: status.value,
    class: classValue
  });
  return classValue;
});

// Вычисляем интенсивность свечения
const glowIntensity = computed(() => {
  let intensityValue;
  if (status.value === 'OFF') intensityValue = 0;
  else if (status.value === 'SLEEPING') intensityValue = 0.3 * (intensity.value / 100);
  else intensityValue = 0.8 * (intensity.value / 100);

  logDebug('Bulb', 'Вычисление интенсивности свечения', {
    deviceId: props.deviceId,
    status: status.value,
    intensity: intensity.value,
    glowIntensity: intensityValue
  });

  return intensityValue;
});

const glowGradient = computed(() => {
  let gradient;
  if (status.value === 'OFF') {
    gradient = 'none';
  } else if (status.value === 'SLEEPING') {
    gradient = 'radial-gradient(circle, rgba(255, 165, 0, 0.8) 0%, rgba(255, 140, 0, 0) 40%, rgba(255, 180, 80, 0) 70%)';
  } else {
    gradient = 'radial-gradient(circle, rgba(255, 220, 150, 0.9) 0%, rgba(255, 200, 100, 0) 40%, rgba(255, 180, 80, 0) 70%)';
  }

  logDebug('Bulb', 'Вычисление градиента свечения', {
    deviceId: props.deviceId,
    status: status.value,
    gradient
  });

  return gradient;
});

// Инициализация при монтировании
onMounted(() => {
  logDebug('Bulb', 'Компонент смонтирован', { deviceId: props.deviceId });

  // Даем время для полной загрузки
  setTimeout(() => {
    logDebug('Bulb', 'Проверка контейнера после монтирования', {
      deviceId: props.deviceId,
      containerReady: container.value ? isContainerReady(container.value) : false
    });

    if (webGLSupported && props.show3D) {
      // Даем время на отображение
      setTimeout(() => {
        // Проверяем видимость
        if (checkContainerReady(container.value)) {
          logDebug('Bulb', 'Контейнер виден, инициализируем 3D', { deviceId: props.deviceId });
        } else {
          logDebug('Bulb', 'Контейнер не виден, откладываем инициализацию', { deviceId: props.deviceId });

          // Добавляем MutationObserver для отслеживания видимости
          const tabPane = container.value?.closest('.el-tab-pane');
          if (tabPane) {
            logDebug('Bulb', 'Наблюдение за видимостью вкладки', { deviceId: props.deviceId });

            const observer = new MutationObserver((mutations) => {
              for (const mutation of mutations) {
                if (mutation.type === 'attributes' &&
                    (mutation.attributeName === 'style' ||
                        mutation.attributeName === 'class' ||
                        mutation.attributeName === 'hidden')) {
                  if (checkContainerReady(container.value)) {
                    logDebug('Bulb', 'Контейнер стал виден через MutationObserver', { deviceId: props.deviceId });
                    observer.disconnect();
                  }
                }
              }
            });

            observer.observe(tabPane, {
              attributes: true,
              attributeFilter: ['style', 'class', 'hidden'],
              subtree: false
            });
          }

          // Даем время для полного отображения
          let frameCheck = 0;
          const maxFrameChecks = 30;
          const frameCheckInterval = setInterval(() => {
            frameCheck++;
            if (checkContainerReady(container.value)) {
              logDebug('Bulb', 'Контейнер стал виден при проверке кадра', {
                deviceId: props.deviceId,
                frameCheck
              });
              init();
              clearInterval(frameCheckInterval);
            } else if (frameCheck >= maxFrameChecks) {
              clearInterval(frameCheckInterval);
            }
          }, 100);
        }
      }, 500);
    }
  }, 100);
});

// Очистка при размонтировании
onUnmounted(() => {
  logDebug('Bulb', 'Компонент размонтирован', { deviceId: props.deviceId });
});

// Следим за изменениями
watch(status, (newValue, oldValue) => {
  logDebug('Bulb', 'Статус изменился', {
    deviceId: props.deviceId,
    oldValue,
    newValue
  });
});
watch(intensity, (newValue, oldValue) => {
  logDebug('Bulb', 'Интенсивность изменилась', {
    deviceId: props.deviceId,
    oldValue,
    newValue
  });
});
</script>

<style scoped>
.light-bulb {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bulb-3d-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.three-scene-container {
  width: 100%;
  height: 100%;
  min-width: 80px;
  min-height: 120px;
  position: relative;
  overflow: hidden;
  visibility: hidden;
}

.css-bulb-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Стеклянная колба */
.bulb-glass {
  width: 100%;
  height: 70%;
  position: relative;
  display: flex;
  justify-content: center;
  border-radius: 50% 50% 0 0;
}

.bulb-glass-inner {
  width: 100%;
  height: 100%;
  border-radius: 50% 50% 0 0;
  background: linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%);
  box-shadow:
      0 0 5px 1px rgba(255, 255, 255, 0.7) inset,
      0 0 15px rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
}

/* Нить накаливания */
.bulb-filament-container {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 30%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.bulb-filament-support {
  width: 100%;
  height: 20%;
  border-radius: 4px;
  background: linear-gradient(to bottom, #888, #333);
}

.bulb-filament-support-inner {
  width: 100%;
  height: 40%;
  background: linear-gradient(to bottom, #aaa, #666);
  border-radius: 2px;
}

.bulb-filament {
  width: 100%;
  height: 20%;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  position: relative;
}

.bulb-filament-inner {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, #ffcc00 0%, #ffffff 100%);
  border-radius: 4px;
  box-shadow: 0 0 15px #ffcc00;
  animation: filament-glow 2s infinite alternate;
}

/* Свечение */
.bulb-glow {
  position: absolute;
  width: 90%;
  height: 80%;
  border-radius: 50% 50% 0 0;
  top: 5%;
  left: 5%;
  z-index: 1;
  box-shadow:
      0 0 30px 15px rgba(255, 255, 100, 0.8),
      0 0 60px 30px rgba(255, 255, 100, 0.5);
  transition: opacity 0.5s ease;
}

/* Цоколь лампочки */
.bulb-base {
  width: 70%;
  height: 25%;
  border-radius: 0 0 4px 4px;
  background: linear-gradient(to bottom, #444, #222);
  position: relative;
  top: -1px;
}

.bulb-base-inner {
  width: 100%;
  height: 70%;
  background: linear-gradient(to bottom, #555, #333);
  border-radius: 0 0 2px 2px;
  position: relative;
  top: 5%;
}

.bulb-contact {
  width: 30%;
  height: 40%;
  background: #e6a23c;
  border-radius: 50%;
  position: absolute;
  bottom: 10%;
  left: 35%;
  box-shadow: 0 0 3px 1px #ffcc00;
}

/* Резьба цоколя */
.bulb-threading {
  width: 80%;
  height: 10%;
  background: linear-gradient(to right,
  #333 20%,
  #555 20%, #555 40%,
  #333 40%, #333 60%,
  #555 60%, #555 80%,
  #333 80%);
  border-radius: 0 0 2px 2px;
  position: absolute;
  bottom: 0;
}

/* Анимация свечения */
@keyframes filament-glow {
  0% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

.bulb-status-on .bulb-filament-inner {
  animation: filament-glow 2s infinite alternate;
}
</style>
