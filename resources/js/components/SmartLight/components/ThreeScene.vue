<template>
  <div class="three-scene-container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { checkWebGLSupport, initWhenReady } from '@components/SmartLight/api/utils/webglSupport.js';

const props = defineProps({
  deviceId: {
    type: String,
    required: true
  },
  voltage: {
    type: Number,
    default: 3.7
  },
  criticalVoltage: {
    type: Number,
    default: 3.2
  }
});

const container = ref(null);
let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let battery = null;
let batteryFill = null;
let batteryCritical = null;
let batteryCap = null;
let batteryMark = null;
let animationFrame = null;

const webGLCheck = checkWebGLSupport();
const webGLSupported = webGLCheck.isSupported;

// Вычисляем прогресс батареи
const batteryProgress = computed(() => {
  const minVoltage = 2.5;
  const maxVoltage = 4.3;
  return Math.min(100, Math.max(0,
      ((props.voltage - minVoltage) / (maxVoltage - minVoltage)) * 100
  ));
});

// Цвета и эффекты
const batteryColor = computed(() => {
  if (props.voltage < 2.7) return '#f56c6c';
  if (props.voltage < 3.0) return '#e6a23c';
  return '#67c23a';
});

// Создаем цилиндрическую модель аккумулятора
const createBatteryModel = () => {
  // Параметры для аккумулятора 18650
  const diameter = 18;
  const height = 65;
  const aspectRatio = diameter / height;

  // Создаем цилиндрическую форму
  const batteryGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 32);

  // Создаем материалы
  const batteryMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f7fa,
    roughness: 0.8,
    metalness: 0.2
  });

  // Создаем модель аккумулятора
  battery = new THREE.Mesh(batteryGeometry, batteryMaterial);
  battery.rotation.x = Math.PI / 2;
  scene.add(battery);

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

  batteryFill = new THREE.Mesh(fillGeometry, fillMaterial);
  batteryFill.position.z = -0.1;
  scene.add(batteryFill);

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

  batteryCritical = new THREE.Mesh(criticalGeometry, criticalMaterial);
  batteryCritical.position.z = -0.1;
  scene.add(batteryCritical);

  // Добавляем колпачок аккумулятора
  const capGeometry = new THREE.CylinderGeometry(0.55, 0.5, 0.1, 32);
  const capMaterial = new THREE.MeshStandardMaterial({
    color: 0xffa640,
    roughness: 0.5,
    metalness: 0.8
  });

  batteryCap = new THREE.Mesh(capGeometry, capMaterial);
  batteryCap.position.y = 2;
  scene.add(batteryCap);

  // Создаем отметку критического уровня
  const markGeometry = new THREE.BoxGeometry(0.5, 0.02, 0.05);
  const markMaterial = new THREE.MeshBasicMaterial({
    color: 0xe6a23c,
    transparent: true,
    opacity: 0.8
  });

  batteryMark = new THREE.Mesh(markGeometry, markMaterial);
  batteryMark.position.y = calculateCriticalPosition();
  scene.add(batteryMark);
};

// Расчет позиции критического уровня
const calculateCriticalPosition = () => {
  const minVoltage = 2.5;
  const maxVoltage = 4.3;
  const criticalVoltage = 3.2;

  const voltageRange = maxVoltage - minVoltage;
  return ((criticalVoltage - minVoltage) / voltageRange) * 4 - 2;
};

// Обновление заполнения
const updateFill = () => {
  if (!batteryFill || !batteryCritical) return;

  const normalHeight = batteryProgress.value - criticalProgress.value;

  // Обновляем нормальное заполнение
  batteryFill.scale.set(1, normalHeight / 100, 1);
  batteryFill.position.y = (normalHeight / 100) * 2 - 2;

  // Обновляем критическое заполнение
  batteryCritical.scale.set(1, criticalProgress.value / 100, 1);
  batteryCritical.position.y = (criticalProgress.value / 100) * 2 - 2;

  // Обновляем отметку критического уровня
  batteryMark.position.y = calculateCriticalPosition();
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

// Инициализация сцены
const init = () => {
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

  // Создаем модель аккумулятора
  createBatteryModel();

  // Добавляем управление
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Обработка изменения размера
  window.addEventListener('resize', onWindowResize);
};

// Инициализация при монтировании
onMounted(() => {
  if (webGLSupported) {
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
watch(() => props.voltage, updateFill);
watch(() => props.criticalVoltage, updateFill);
</script>

<style scoped>
.three-scene-container {
  width: 100%;
  height: 100%;
  min-width: 80px;
  min-height: 50px;
  position: relative;
  overflow: hidden;
}
</style>
