<template>
  <div ref="container" class="three-scene-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import 'three/examples/jsm/controls/OrbitControls';
import { checkWebGLSupport, isMobileDevice } from '@/components/SmartLight/api/utils/webglSupport.js';

const container = ref(null);
let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let animationFrame = null;
let bulb = null;
let bulbLight = null;
let resizeObserver = null;

// Проверка поддержки WebGL
const webGLCheck = checkWebGLSupport();
const isMobile = isMobileDevice();

// Инициализация Three.js
const init = async () => {
  if (!webGLCheck.isSupported) return;

  // Даем время для рендеринга родительских элементов
  await nextTick();

  // Проверяем размеры контейнера
  const width = container.value.clientWidth;
  const height = container.value.clientHeight;

  // Если размеры нулевые, попробуем позже
  if (width === 0 || height === 0) {
    setTimeout(init, 100);
    return;
  }

  // Создаем сцену
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);

  // Создаем камеру
  camera = new THREE.PerspectiveCamera(
      isMobile ? 60 : 75,
      width / height,
      0.1,
      1000
  );
  camera.position.z = isMobile ? 4 : 5;

  // Создаем рендерер
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
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

  // Создаем грушевидную форму колбы
  const bulbGeometry = createBulbShape();
  const bulbMaterial = new THREE.MeshPhysicalMaterial({
    transparent: true,
    opacity: 0.8,
    transmission: 0.9,
    roughness: 0.1,
    thickness: 0.5,
    color: 0xffffff,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide
  });

  bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
  bulb.position.y = 0.5;
  bulb.castShadow = true;
  bulb.receiveShadow = true;
  scene.add(bulb);

  // Создаем источник света
  bulbLight = new THREE.PointLight(0xffffcc, 1, 10, 2);
  bulbLight.position.y = 0.5;
  bulbLight.castShadow = true;
  scene.add(bulbLight);

  // Добавляем цоколь лампочки
  const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x444440,
    roughness: 0.8,
    metalness: 0.2
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = -0.5;
  scene.add(base);

  // Добавляем управление
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.enablePan = !isMobile;

  // Обработка изменения размера
  setupResizeHandling();
};

// Создаем грушевидную форму колбы
const createBulbShape = () => {
  const points = [];
  const radius = 1;
  const height = 1.5;

  for (let i = 0; i <= 32; i++) {
    const angle = (i / 32) * Math.PI;
    const x = Math.sin(angle) * radius;
    const y = Math.cos(angle) * height;
    points.push(new THREE.Vector2(x, y));
  }

  return new THREE.LatheGeometry(points, 32);
};

// Обработка изменения размера окна
const setupResizeHandling = () => {
  const onWindowResize = () => {
    if (!container.value || !camera || !renderer) return;

    const width = container.value.clientWidth;
    const height = container.value.clientHeight;

    if (width === 0 || height === 0) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  // Создаем ResizeObserver
  resizeObserver = new ResizeObserver(onWindowResize);
  resizeObserver.observe(container.value);

  // Вызываем resize для установки правильных размеров
  setTimeout(onWindowResize, 100);
  setTimeout(onWindowResize, 300);
  setTimeout(onWindowResize, 600);
  setTimeout(onWindowResize, 1000);

  // Добавляем обработчик на глобальное окно
  window.addEventListener('resize', onWindowResize);

  return {
    cleanup: () => {
      resizeObserver.unobserve(container.value);
      resizeObserver.disconnect();
      window.removeEventListener('resize', onWindowResize);
    }
  };
};

// Анимация
const animate = () => {
  if (!renderer || !scene || !camera) return;

  animationFrame = requestAnimationFrame(animate);

  if (controls) {
    controls.update();
  }

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
};

// Инициализация при монтировании
onMounted(() => {
  if (webGLCheck.isSupported) {
    // Даем время для полного рендеринга
    setTimeout(() => {
      init();
      animate();
    }, 50);

    setTimeout(() => {
      init();
      animate();
    }, 150);

    setTimeout(() => {
      init();
      animate();
    }, 300);
  }
});

// Очистка при размонтировании
onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  cleanup();
});
</script>

<style scoped>
.three-scene-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  min-width: 80px; /* Минимальная ширина */
  min-height: 120px; /* Минимальная высота */
  background: transparent !important;
}
</style>
