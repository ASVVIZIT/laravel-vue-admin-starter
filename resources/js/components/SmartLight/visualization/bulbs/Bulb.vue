<template>
  <div
      class="light-bulb"
      :class="statusClass"
      :device-id="deviceId"
  >
    <!-- 3D визуализация, если поддерживается -->
    <div v-if="webGLSupported && show3D" class="bulb-3d-container">
      <div class="three-scene-container" ref="container"></div>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';
import { checkWebGLSupport, initWhenReady } from '@/components/SmartLight/api/utils/webglSupport.js';

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
let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let bulb = null;
let filament = null;
let bulbLight = null;
let animationFrame = null;

const store = useSmartLightStore();
const webGLCheck = checkWebGLSupport();
const webGLSupported = webGLCheck.isSupported;

// Получаем данные устройства
const device = computed(() => store.getDevice(props.deviceId));
const status = computed(() => device.value?.status || 'OFF');
const intensity = computed(() => device.value?.intensity || 100);

// Вычисляем класс состояния
const statusClass = computed(() => {
  return `bulb-status-${status.value.toLowerCase()}`;
});

// Вычисляем интенсивность свечения
const glowIntensity = computed(() => {
  if (status.value === 'OFF') return 0;
  if (status.value === 'SLEEPING') return 0.3 * (intensity.value / 100);
  return 0.8 * (intensity.value / 100);
});

const glowGradient = computed(() => {
  if (status.value === 'OFF') return 'none';
  if (status.value === 'SLEEPING') {
    return 'radial-gradient(circle, rgba(255, 165, 0, 0.8) 0%, rgba(255, 140, 0, 0) 40%, rgba(255, 180, 80, 0) 70%)';
  }
  return 'radial-gradient(circle, rgba(255, 220, 150, 0.9) 0%, rgba(255, 200, 100, 0) 40%, rgba(255, 180, 80, 0) 70%)';
});

// Создаем 3D-модель лампочки
const createBulbModel = () => {
  // Создаем сферу для лампочки
  const bulbGeometry = new THREE.SphereGeometry(0.5, 32, 32);

  // Создаем материалы
  const bulbMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });

  bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
  bulb.position.z = 0;
  scene.add(bulb);

  // Создаем нить накаливания
  const filamentGeometry = new THREE.TorusGeometry(0.1, 0.05, 16, 32, Math.PI * 0.8);
  const filamentMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 0.8
  });

  filament = new THREE.Mesh(filamentGeometry, filamentMaterial);
  filament.rotation.x = Math.PI / 2;
  filament.position.y = 0.2;
  scene.add(filament);

  // Создаем свет
  bulbLight = new THREE.PointLight(0xffffcc, 1, 10);
  bulbLight.position.copy(bulb.position);
  scene.add(bulbLight);
};

// Обновляем 3D-модель при изменении статуса или интенсивности
const updateBulbStatus = () => {
  if (!bulb || !filament || !bulbLight) return;

  // Обновляем интенсивность свечения
  if (status.value === 'OFF') {
    bulbLight.intensity = 0;
    filament.material.emissiveIntensity = 0;
  } else {
    bulbLight.intensity = 1 * (intensity.value / 100);
    filament.material.emissiveIntensity = 0.8 * (intensity.value / 100);
  }

  // Обновляем цвет в зависимости от статуса
  if (status.value === 'SLEEPING') {
    filament.material.color.set(0xff9800);
    bulbLight.color.set(0xff9800);
  } else {
    filament.material.color.set(0xffff00);
    bulbLight.color.set(0xffffcc);
  }
};

// Обработка изменения размера окна
const onWindowResize = () => {
  if (!container.value || !camera || !renderer) return;

  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
};

// Анимация
const animate = () => {
  animationFrame = requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

// Очистка ресурсов
const cleanup = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
    renderer = null;
  }

  if (container.value && container.value.firstChild) {
    container.value.removeChild(container.value.firstChild);
  }

  if (scene) {
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    scene = null;
  }

  if (controls) {
    controls.dispose();
    controls = null;
  }

  window.removeEventListener('resize', onWindowResize);
};

// Инициализация 3D-сцены
const init = () => {
  if (!webGLSupported) return;

  // Создаем сцену
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f7fa);

  // Создаем камеру
  camera = new THREE.PerspectiveCamera(
      75,
      container.value.clientWidth / container.value.clientHeight,
      0.1,
      1000
  );
  camera.position.z = 5;

  // Создаем рендерер
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;

  // Добавляем в DOM
  container.value.appendChild(renderer.domElement);

  // Добавляем освещение
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Создаем модель лампочки
  createBulbModel();

  // Добавляем управление
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.5;
  controls.zoomSpeed = 1.0;

  // Обработка изменения размера
  window.addEventListener('resize', onWindowResize);
};

// Инициализация при монтировании
onMounted(() => {
  if (webGLSupported && props.show3D) {
    // Инициализируем с проверкой готовности контейнера
    const { ready } = initWhenReady(container.value, init);

    ready.then(isReady => {
      if (isReady) {
        animate();
      }
    });
  }
});

// Очистка при размонтировании
onUnmounted(() => {
  cleanup();
});

// Следим за изменениями
watch(status, updateBulbStatus);
watch(intensity, updateBulbStatus);
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
  background: radial-gradient(circle, rgba(255, 255, 100, 0.9) 0%, rgba(255, 200, 100, 0) 70%);
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

/* Стили для состояния OFF */
.bulb-status-off .bulb-glass-inner {
  background: linear-gradient(135deg, #e6e6e6 0%, #d1d1d1 100%);
  box-shadow: none;
}

.bulb-status-off .bulb-filament-inner {
  background: linear-gradient(to top, #666 0%, #333 100%);
  box-shadow: none;
}

.bulb-status-off .bulb-glow {
  opacity: 0;
}

/* Стили для состояния SLEEPING */
.bulb-status-sleeping .bulb-glass-inner {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
}

.bulb-status-sleeping .bulb-filament-inner {
  background: linear-gradient(to top, #ff9800 0%, #ffcc99 100%);
  box-shadow: 0 0 15px #ff9800;
}

.bulb-status-sleeping .bulb-glow {
  background: radial-gradient(circle, rgba(255, 165, 0, 0.8) 0%, rgba(255, 140, 0, 0) 70%);
  box-shadow:
      0 0 30px 15px rgba(255, 165, 0, 0.7),
      0 0 60px 30px rgba(255, 165, 0, 0.4);
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

.bulb-status-on .bulb-filament-inner,
.bulb-status-sleeping .bulb-filament-inner {
  animation: filament-glow 2s infinite alternate;
}
</style>
