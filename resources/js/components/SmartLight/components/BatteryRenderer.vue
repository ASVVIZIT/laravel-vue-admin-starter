<template>
  <div class="battery-renderer" :style="{ width: width, height: height }">
    <!-- CSS-визуализация как fallback -->
    <div class="battery-css-container" v-if="!webGLSupported || !show3D">
      <div class="battery-container">
        <div class="battery">
          <div
              class="battery-normal"
              :style="{
              width: batteryNormalProgress + '%',
              backgroundColor: batteryColor
            }"
          ></div>
          <div
              class="battery-critical"
              :style="{
              width: batteryCriticalProgress + '%',
              backgroundColor: criticalColor
            }"
          >
            <div class="battery-critical-pattern"></div>
          </div>
          <div class="battery-mark critical-threshold" :style="{ left: criticalThresholdPosition + '%' }"></div>
          <div class="battery-mark current-level" :style="{ left: currentLevelPosition + '%' }"></div>
          <div class="battery-cap"></div>
          <div class="battery-plus">+</div>
          <div class="battery-minus">-</div>
        </div>
        <div class="battery-levels">
          <span class="battery-level" :style="{ left: '0%' }">{{ formattedMinVoltage }} В</span>
          <span class="battery-level" :style="{ left: criticalThresholdPosition + '%' }">{{ formattedCriticalThreshold }} В</span>
          <span class="battery-level" :style="{ left: '100%' }">{{ formattedMaxVoltage }} В</span>
        </div>
      </div>
      <div class="battery-info-container">
        <div class="battery-type-info">
          <span class="battery-type-label">Тип:</span>
          <span class="battery-type-value">{{ batteryTypeName }}</span>
        </div>
        <div class="voltage-value">{{ formattedVoltage }}</div>
      </div>
    </div>

    <!-- 3D визуализация -->
    <div class="battery-3d-container" v-else-if="webGLSupported && show3D">
      <div class="three-scene-container" ref="container" :style="{ visibility: containerVisible ? 'visible' : 'hidden' }"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useSmartlightStore } from '@/components/SmartLight/stores/smartLightStore.js';
import {
  checkWebGLSupport,
  initWhenReady,
  logDebug,
  isContainerReady,
  isFullyVisible
} from '@components/SmartLight/api/utils/webglSupport.js';
import {
  calculateMinVoltage,
  calculateMaxVoltage,
  calculateCriticalVoltage,
  calculateCriticalThresholdPosition,
  calculateBatteryNormalProgress,
  calculateBatteryCriticalProgress,
  calculateCurrentLevelPosition
} from '@/components/SmartLight/utils/deviceUtils.js';

const props = defineProps({
  deviceId: {
    type: String,
    required: true
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '100%'
  },
  show3D: {
    type: Boolean,
    default: false
  }
});

const container = ref(null);
let scene = null;
let camera = null;
let renderer = null;
let animationFrame = null;
let initialized = false;
let containerVisible = ref(false);

const store = useSmartlightStore();
const webGLCheck = checkWebGLSupport();
const webGLSupported = webGLCheck.isSupported;

logDebug('BatteryRenderer', 'Компонент создан', {
  deviceId: props.deviceId,
  webGLSupported,
  show3D: props.show3D
});

// Получаем данные устройства
const device = computed(() => {
  const dev = store.getDevice(props.deviceId);
  logDebug('BatteryRenderer', 'Получение устройства', {
    deviceId: props.deviceId,
    device: dev
  });
  return dev;
});
const voltage = computed(() => {
  const volt = device.value?.voltage || 3.7;
  logDebug('BatteryRenderer', 'Получение напряжения', {
    deviceId: props.deviceId,
    voltage: volt
  });
  return volt;
});

// Вычисляем позицию критического порога в процентах
const criticalThresholdPosition = computed(() => {
  if (!device.value) return 0;
  return calculateCriticalThresholdPosition(device.value);
});

// Нормальный прогресс (от критического порога до max)
const batteryNormalProgress = computed(() => {
  if (!device.value) return 0;
  return calculateBatteryNormalProgress(device.value);
});

// Критический прогресс (от min до критического порога)
const batteryCriticalProgress = computed(() => {
  if (!device.value) return 0;
  return calculateBatteryCriticalProgress(device.value);
});

// Позиция текущего уровня
const currentLevelPosition = computed(() => {
  if (!device.value) return 0;
  return calculateCurrentLevelPosition(device.value);
});

// Цвет критического уровня
const criticalColor = computed(() => {
  if (!device.value) return '#ffcccb';
  return store.deviceCriticalColor(props.deviceId);
});

// Цвет нормального уровня
const batteryColor = computed(() => {
  if (!device.value) return '#67c23a';
  return store.deviceBatteryColor(props.deviceId);
});

// Отформатированное значение критического напряжения
const formattedCriticalThreshold = computed(() => {
  if (!device.value) return '3.00';
  return calculateCriticalVoltage(props.deviceId).toFixed(2);
});

// Минимальное напряжение
const formattedMinVoltage = computed(() => {
  if (!device.value) return '2.5';
  return calculateMinVoltage(props.deviceId).toFixed(1);
});

// Максимальное напряжение
const formattedMaxVoltage = computed(() => {
  if (!device.value) return '4.3';
  return calculateMaxVoltage(props.deviceId).toFixed(1);
});

// Отформатированное значение напряжения
const formattedVoltage = computed(() => {
  if (!device.value) return '3.70 В';
  return voltage.value.toFixed(2) + ' В';
});

// Название типа аккумулятора
const batteryTypeName = computed(() => {
  if (!device.value) return 'Нормальный режим';

  const voltageValue = voltage.value;
  let name;
  if (voltageValue < 3.0) name = 'Критический режим';
  else if (voltageValue < 3.4) name = 'Внимание';
  else name = 'Нормальный режим';

  logDebug('BatteryRenderer', 'Определение типа аккумулятора', {
    deviceId: props.deviceId,
    voltage: voltageValue,
    name
  });

  return name;
});

// Создаем 3D-модель аккумулятора
const createBatteryModel = () => {
  logDebug('BatteryRenderer', 'Создание 3D модели', { deviceId: props.deviceId });

  try {
    // Проверяем, что THREE загружен
    if (typeof THREE === 'undefined') {
      logDebug('BatteryRenderer', 'THREE не определен', { deviceId: props.deviceId });
      return;
    }

    // Проверяем, что сцена существует
    if (!scene) {
      logDebug('BatteryRenderer', 'Сцена не инициализирована', { deviceId: props.deviceId });
      return;
    }

    // Параметры для аккумулятора
    const minVoltage = store.calculateGroupMinVoltage(props.deviceId);
    const maxVoltage = store.calculateGroupMaxVoltage(props.deviceId);
    const criticalVoltage = store.calculateGroupCriticalVoltage(props.deviceId);

    logDebug('BatteryRenderer', 'Параметры аккумулятора для 3D', {
      deviceId: props.deviceId,
      minVoltage,
      maxVoltage,
      criticalVoltage
    });

    // Создаем цилиндрическую форму
    const batteryGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 32);

    // Создаем материалы
    const batteryMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f7fa,
      roughness: 0.8,
      metalness: 0.2
    });

    // Создаем модель аккумулятора
    const battery = new THREE.Mesh(batteryGeometry, batteryMaterial);
    battery.rotation.x = Math.PI / 2;
    scene.add(battery);
    logDebug('BatteryRenderer', 'Базовая модель добавлена в сцену', { deviceId: props.deviceId });

    // Создаем заполнение для нормального уровня
    const fillGeometry = new THREE.CylinderGeometry(0.45, 0.45, 3.9, 32);
    const fillMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x67c23a,
      transparent: true,
      opacity: 0.7,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 1.0
    });

    const batteryFill = new THREE.Mesh(fillGeometry, fillMaterial);
    batteryFill.position.z = -0.1;
    scene.add(batteryFill);
    logDebug('BatteryRenderer', 'Модель нормального уровня добавлена', { deviceId: props.deviceId });

    // Создаем заполнение для критического уровня
    const criticalGeometry = new THREE.CylinderGeometry(0.45, 0.45, 3.9, 32);
    const criticalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf56c6c,
      transparent: true,
      opacity: 0.7,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 1.0,
      wireframe: false
    });

    const batteryCritical = new THREE.Mesh(criticalGeometry, criticalMaterial);
    batteryCritical.position.z = -0.1;
    scene.add(batteryCritical);
    logDebug('BatteryRenderer', 'Модель критического уровня добавлена', { deviceId: props.deviceId });

    // Добавляем колпачок аккумулятора
    const capGeometry = new THREE.CylinderGeometry(0.55, 0.5, 0.1, 32);
    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0xffa640,
      roughness: 0.5,
      metalness: 0.8
    });

    const batteryCap = new THREE.Mesh(capGeometry, capMaterial);
    batteryCap.position.y = 2;
    scene.add(batteryCap);
    logDebug('BatteryRenderer', 'Колпачок аккумулятора добавлен', { deviceId: props.deviceId });

    // Создаем отметку критического уровня
    const markGeometry = new THREE.BoxGeometry(0.5, 0.02, 0.05);
    const markMaterial = new THREE.MeshBasicMaterial({
      color: 0xe6a23c,
      transparent: true,
      opacity: 0.8
    });

    const batteryMark = new THREE.Mesh(markGeometry, markMaterial);
    batteryMark.position.y = calculateCriticalPosition();
    scene.add(batteryMark);
    logDebug('BatteryRenderer', 'Отметка критического уровня добавлена', { deviceId: props.deviceId });
  } catch (e) {
    logDebug('BatteryRenderer', 'Ошибка создания 3D модели', {
      deviceId: props.deviceId,
      error: e.message
    });
    console.error('Ошибка создания 3D модели:', e);
  }
};

// Расчет позиции критического уровня
const calculateCriticalPosition = () => {
  const min = store.calculateGroupMinVoltage(props.deviceId);
  const max = store.calculateGroupMaxVoltage(props.deviceId);
  const critical = store.calculateGroupCriticalVoltage(props.deviceId);

  const voltageRange = max - min;
  const position = ((critical - min) / voltageRange) * 4 - 2;

  logDebug('BatteryRenderer', 'Расчет позиции критического уровня', {
    deviceId: props.deviceId,
    min,
    max,
    critical,
    position
  });

  return position;
};

// Обработка изменения размера окна
const onWindowResize = () => {
  logDebug('BatteryRenderer', 'Изменение размера окна', { deviceId: props.deviceId });

  if (!container.value || !camera || !renderer) {
    logDebug('BatteryRenderer', 'Пропущено изменение размера', {
      deviceId: props.deviceId,
      container: !!container.value,
      camera: !!camera,
      renderer: !!renderer
    });
    return;
  }

  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
};

// Анимация
const animate = () => {
  if (!containerVisible.value) {
    logDebug('BatteryRenderer', 'Контейнер невидим, остановка анимации', { deviceId: props.deviceId });
    return;
  }

  animationFrame = requestAnimationFrame(animate);

  try {
    renderer.render(scene, camera);
  } catch (e) {
    logDebug('BatteryRenderer', 'Ошибка рендеринга', {
      deviceId: props.deviceId,
      error: e.message
    });
    console.error('Ошибка рендеринга:', e);
  }
};

// Очистка ресурсов
const cleanup = () => {
  logDebug('BatteryRenderer', 'Очистка ресурсов', { deviceId: props.deviceId });

  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
    logDebug('BatteryRenderer', 'Анимационный фрейм отменен', { deviceId: props.deviceId });
  }

  if (renderer) {
    logDebug('BatteryRenderer', 'Очистка рендерера', { deviceId: props.deviceId });
    renderer.dispose();
    renderer.forceContextLoss();
    renderer = null;
  }

  if (container.value && container.value.firstChild) {
    logDebug('BatteryRenderer', 'Удаление DOM элемента', { deviceId: props.deviceId });
    container.value.removeChild(container.value.firstChild);
  }

  if (scene) {
    logDebug('BatteryRenderer', 'Очистка сцены', { deviceId: props.deviceId });
    scene.traverse((object) => {
      if (object.geometry) {
        logDebug('BatteryRenderer', 'Освобождение геометрии', {
          deviceId: props.deviceId,
          geometry: object.geometry.type
        });
        object.geometry.dispose();
      }
      if (object.material) {
        logDebug('BatteryRenderer', 'Освобождение материала', {
          deviceId: props.deviceId,
          material: Array.isArray(object.material) ? 'Array' : object.material.type
        });
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    scene = null;
  }

  window.removeEventListener('resize', onWindowResize);
  containerVisible.value = false;
  initialized = false;
};

// Проверка видимости контейнера
const checkContainerVisibility = () => {
  if (!container.value) {
    containerVisible.value = false;
    return false;
  }

  const rect = container.value.getBoundingClientRect();
  const style = getComputedStyle(container.value);

  // Проверяем, что контейнер виден
  const isVisible = (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.top < window.innerHeight &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
  );

  logDebug('BatteryRenderer', 'Проверка видимости контейнера', {
    deviceId: props.deviceId,
    width: rect.width,
    height: rect.height,
    top: rect.top,
    bottom: rect.bottom,
    display: style.display,
    visibility: style.visibility,
    opacity: style.opacity,
    isVisible
  });

  containerVisible.value = isVisible;
  return isVisible;
};

// Инициализация 3D-сцены
const init = () => {
  logDebug('BatteryRenderer', 'Инициализация 3D-сцены', { deviceId: props.deviceId });

  if (!webGLSupported) {
    logDebug('BatteryRenderer', 'WebGL не поддерживается', {
      deviceId: props.deviceId,
      reason: webGLCheck.reason
    });
    return;
  }

  try {
    // Создаем сцену
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f7fa);
    logDebug('BatteryRenderer', 'Сцена создана', { deviceId: props.deviceId });

    // Создаем камеру
    camera = new THREE.PerspectiveCamera(
        75,
        container.value.clientWidth / container.value.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 5;
    logDebug('BatteryRenderer', 'Камера создана', {
      deviceId: props.deviceId,
      aspect: container.value.clientWidth / container.value.clientHeight
    });

    // Создаем рендерер
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(container.value.clientWidth, container.value.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    logDebug('BatteryRenderer', 'Рендерер инициализирован', {
      deviceId: props.deviceId,
      width: container.value.clientWidth,
      height: container.value.clientHeight
    });

    // Добавляем в DOM
    container.value.appendChild(renderer.domElement);
    logDebug('BatteryRenderer', 'DOM элемент добавлен', { deviceId: props.deviceId });
    containerVisible.value = true;

    // Добавляем освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    logDebug('BatteryRenderer', 'Амбиентный свет добавлен', { deviceId: props.deviceId });

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    logDebug('BatteryRenderer', 'Направленный свет добавлен', { deviceId: props.deviceId });

    // Создаем модель аккумулятора
    createBatteryModel();

    // Обработка изменения размера
    window.addEventListener('resize', onWindowResize);
    logDebug('BatteryRenderer', 'Обработчик ресайза добавлен', { deviceId: props.deviceId });

    // Запускаем анимацию
    animate();
    initialized = true;

    logDebug('BatteryRenderer', 'Инициализация 3D завершена успешно', { deviceId: props.deviceId });
  } catch (e) {
    logDebug('BatteryRenderer', 'Ошибка инициализации 3D', {
      deviceId: props.deviceId,
      error: e.message,
      stack: e.stack
    });
    console.error('Ошибка инициализации 3D:', e);
  }
};

// Принудительная инициализация
const forceInit = () => {
  logDebug('BatteryRenderer', 'Принудительная инициализация', { deviceId: props.deviceId });

  // Даем время для полного отображения
  setTimeout(() => {
    if (checkContainerReady(container.value)) {
      containerVisible.value = true;
      init();
    } else {
      logDebug('BatteryRenderer', 'Контейнер имеет нулевые размеры', {
        deviceId: props.deviceId,
        rect: container.value ? container.value.getBoundingClientRect() : null
      });

      // Повторная проверка через 500 мс
      setTimeout(() => {
        if (checkContainerReady(container.value)) {
          containerVisible.value = true;
          init();
        }
      }, 500);
    }
  }, 100);
};

// Инициализация при монтировании
onMounted(() => {
  logDebug('BatteryRenderer', 'Компонент смонтирован', { deviceId: props.deviceId });

  // Даем время для полной загрузки
  setTimeout(() => {
    logDebug('BatteryRenderer', 'Проверка контейнера после монтирования', {
      deviceId: props.deviceId,
      containerReady: container.value ? checkContainerReady(container.value) : false
    });

    if (webGLSupported && props.show3D) {
      // Даем время на отображение
      setTimeout(() => {
        checkContainerVisibility();
        if (containerVisible.value) {
          logDebug('BatteryRenderer', 'Контейнер виден, инициализируем', {
            deviceId: props.deviceId
          });
          init();
        } else {
          logDebug('BatteryRenderer', 'Контейнер не виден, откладываем инициализацию', {
            deviceId: props.deviceId
          });

          // Добавляем MutationObserver для отслеживания видимости
          const tabPane = container.value?.closest('.el-tab-pane');
          if (tabPane) {
            logDebug('BatteryRenderer', 'Наблюдение за вкладкой', {
              deviceId: props.deviceId
            });

            const observer = new MutationObserver(() => {
              checkContainerVisibility();
              if (containerVisible.value && !initialized) {
                logDebug('BatteryRenderer', 'Контейнер стал виден через MutationObserver', {
                  deviceId: props.deviceId
                });
                init();
                observer.disconnect();
              }
            });

            observer.observe(tabPane, {
              attributes: true,
              attributeFilter: ['class', 'style', 'hidden'],
              subtree: false
            });
          }

          // Даем время для полного отображения
          let frameCheck = 0;
          const maxFrameChecks = 30;
          const frameCheckInterval = setInterval(() => {
            frameCheck++;
            checkContainerVisibility();
            if (containerVisible.value && !initialized) {
              logDebug('BatteryRenderer', 'Контейнер стал виден при проверке кадра', {
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
  logDebug('BatteryRenderer', 'Компонент размонтирован', { deviceId: props.deviceId });
  cleanup();
});

// Следим за переключением режима
watch(() => props.show3D, (newShow3D, oldShow3D) => {
  logDebug('BatteryRenderer', 'Режим отображения изменился', {
    deviceId: props.deviceId,
    oldShow3D,
    newShow3D,
    webGLSupported
  });

  if (webGLSupported && newShow3D && !oldShow3D) {
    logDebug('BatteryRenderer', 'Переключение на 3D-режим', {
      deviceId: props.deviceId
    });

    // Даем время на отображение
    setTimeout(() => {
      checkContainerVisibility();
      if (containerVisible.value) {
        init();
      } else {
        // Повторная проверка через 500 мс
        setTimeout(() => {
          checkContainerVisibility();
          if (containerVisible.value) {
            init();
          }
        }, 500);
      }
    }, 300);
  } else if (webGLSupported && !newShow3D && oldShow3D) {
    logDebug('BatteryRenderer', 'Переключение на 2D-режим', {
      deviceId: props.deviceId
    });
    cleanup();
    initialized = false;
  }
});

// Следим за изменениями в сторе
watch(() => store.devices, (newDevices, oldDevices) => {
  logDebug('BatteryRenderer', 'Изменение списка устройств', {
    deviceId: props.deviceId,
    newDevicesCount: newDevices.length,
    oldDevicesCount: oldDevices ? oldDevices.length : 0
  });

  const device = newDevices.find(d => d.device_id === props.deviceId);
  if (device) {
    logDebug('BatteryRenderer', 'Обновление данных устройства', {
      deviceId: props.deviceId,
      device
    });
    // Устройство будет обновлено через computed свойства
  }
}, { deep: true });

// Экспортируем метод для принудительной инициализации
defineExpose({
  forceInit
});
</script>

<style scoped>
.battery-renderer {
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 50px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.battery-css-container {
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.battery-3d-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.three-scene-container {
  width: 100%;
  height: 100%;
  min-width: 80px;
  min-height: 50px;
  position: relative;
  overflow: hidden;
  visibility: hidden;
}

.battery-container {
  position: relative;
  height: 40px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.battery {
  position: relative;
  width: 100%;
  height: 30px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #f5f7fa;
  overflow: hidden;
  box-sizing: border-box;
}

.battery-normal {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #67c23a 0%, #95d97b 100%);
  transition: width 0.3s ease, background-color 0.3s ease;
}

.battery-critical {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #f56c6c 0%, #ff9999 100%);
  overflow: hidden;
}

.battery-critical-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 3px,
      rgba(255, 255, 255, 0.3) 3px,
      rgba(255, 255, 255, 0.3) 6px
  );
}

.battery-mark {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 1px;
  background-color: #e6a23c;
  z-index: 10;
}

.battery-mark.critical-threshold {
  border-left: 1px dashed #e6a23c;
}

.battery-mark.current-level {
  border-left: 1px solid #409eff;
}

.battery-cap {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 1px;
  height: 4px;
  background: #409eff;
  border-radius: 1px;
}

.battery-plus {
  position: absolute;
  top: 50%;
  left: -10px;
  transform: translateY(-50%);
  font-weight: bold;
  color: #409eff;
  font-size: 0.8rem;
  z-index: 10;
}

.battery-minus {
  position: absolute;
  top: 50%;
  right: -10px;
  transform: translateY(-50%);
  font-weight: bold;
  color: #409eff;
  font-size: 0.8rem;
  z-index: 10;
}

.battery-levels {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: 1px;
  font-size: 0.7rem;
  color: #909399;
  width: 100%;
}

.battery-level {
  position: absolute;
  font-size: 0.7rem;
  color: #909399;
}

.battery-info-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  width: 100%;
}

.battery-type-info {
  position: relative;
  display: flex;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #606266;
  width: 100%;
}

.battery-type-label {
  font-weight: bold;
}

.voltage-value {
  text-align: center;
  font-weight: bold;
  color: #409eff;
  font-size: 0.85rem;
  margin-top: 0.2rem;
  line-height: 1.2;
}
</style>
