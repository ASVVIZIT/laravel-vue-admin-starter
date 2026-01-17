<template>
  <BaseBulb
      :status="status"
      :intensity="intensity"
      :device-id="deviceId"
      :show-3d="show3D"
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
          <!-- Светодиодная плата -->
          <div class="led-board">
            <div class="led-dots">
              <div v-for="i in 8" :key="i" class="led-dot"></div>
            </div>
          </div>
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
  </BaseBulb>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import BaseBulb from './BaseBulb.vue';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';
import { checkWebGLSupport, initWhenReady } from '@/components/SmartLight/api/utils/webglSupport.js';

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: value => ['ON', 'OFF', 'SLEEPING', 'FULL_ON'].includes(value)
  },
  intensity: {
    type: Number,
    default: 100
  },
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
let ledBoard = null;
let bulbLight = null;
let animationFrame = null;

const store = useSmartLightStore();
const webGLCheck = checkWebGLSupport();
const webGLSupported = webGLCheck.isSupported;

// Вычисляем интенсивность свечения
const glowIntensity = computed(() => {
  if (props.status === 'OFF') return 0;
  if (props.status === 'SLEEPING') return 0.3 * (props.intensity / 100);
  return 0.8 * (props.intensity / 100);
});

const glowGradient = computed(() => {
  if (props.status === 'OFF') return 'none';
  if (props.status === 'SLEEPING') {
    return 'radial-gradient(circle, rgba(144, 255, 255, 0.8) 0%, rgba(144, 200, 200, 0) 40%, rgba(144, 180, 180, 0) 70%)';
  }
  return 'radial-gradient(circle, rgba(144, 220, 255, 0.9) 0%, rgba(144, 200, 255, 0) 40%, rgba(144, 180, 255, 0) 70%)';
});

// Создаем 3D-модель LED лампочки
const createBulbModel = () => {
  // Создаем цилиндр для корпуса лампочки
  const bulbGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.8, 32);
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
  bulb.rotation.x = Math.PI / 2;
  scene.add(bulb);

  // Создаем плату со светодиодами
  const boardGeometry = new THREE.PlaneGeometry(0.7, 0.1);
  const boardMaterial = new THREE.MeshBasicMaterial({
    color: 0x333333,
    side: THREE.DoubleSide
  });

  ledBoard = new THREE.Mesh(boardGeometry, boardMaterial);
  ledBoard.position.z = 0.3;
  scene.add(ledBoard);

  // Создаем свет
  bulbLight = new THREE.PointLight(0x90e0ff, 1, 10);
  bulbLight.position.z = 0.3;
  scene.add(bulbLight);
};

// Обновляем 3D-модель при изменении статуса или интенсивности
const updateBulbStatus = () => {
  if (!bulb || !ledBoard || !bulbLight) return;

  // Обновляем интенсивность свечения
  if (props.status === 'OFF') {
    bulbLight.intensity = 0;
  } else {
    bulbLight.intensity = 1 * (props.intensity / 100);
  }

  // Обновляем цвет в зависимости от статуса
  if (props.status === 'SLEEPING') {
    bulbLight.color.set(0x90c0e0);
  } else {
    bulbLight.color.set(0x90e0ff);
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
watch(() => props.status, updateBulbStatus);
watch(() => props.intensity, updateBulbStatus);
watch(() => props.show3D, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    if (newVal && webGLSupported) {
      init();
      animate();
    } else {
      cleanup();
    }
  }
});
</script>

<style scoped>
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
  background: linear-gradient(135deg, #e0f7ff 0%, #ffffff 100%);
  box-shadow:
      0 0 5px 1px rgba(255, 255, 255, 0.7) inset,
      0 0 15px rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
}

/* Светодиодная плата */
.led-board {
  width: 100%;
  height: 25%;
  position: absolute;
  top: 70%;
  background: #333;
  border-radius: 4px;
}

.led-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 4px;
}

.led-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #90e0ff;
  box-shadow: 0 0 8px #90e0ff;
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
</style>
