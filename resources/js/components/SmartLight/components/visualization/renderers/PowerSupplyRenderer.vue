<template>
  <div class="power-supply-renderer" :style="{ width, height }">
    <!-- CSS-визуализация как fallback -->
    <div v-if="!webGLSupported || !show3D" class="power-supply-css-container">
      <div class="power-supply-icon" :class="`power-type-${supplyType}`">
        <div class="power-icon-body">
          <template v-if="supplyType === 'standard'">
            <div class="plug-prongs">
              <div class="prong"></div>
              <div class="prong"></div>
            </div>
            <div class="plug-body"></div>
          </template>
          <template v-else-if="supplyType === 'solar'">
            <div class="solar-panel">
              <div class="panel-grid">
                <div v-for="i in 9" :key="i" class="panel-cell"></div>
              </div>
            </div>
            <div class="solar-rays">
              <div v-for="i in 5" :key="i" class="ray" :style="{ transform: `rotate(${(i-1) * 30 - 60}deg)` }"></div>
            </div>
          </template>
          <template v-else-if="supplyType === 'grid'">
            <div class="grid-tower">
              <div class="tower-body"></div>
              <div class="tower-lines">
                <div class="line"></div>
                <div class="line"></div>
                <div class="line"></div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="power-supply-info">
        <div class="supply-name">{{ supplyName }}</div>
        <div class="supply-category">{{ supplyCategory }}</div>
        <div class="supply-status" :class="`status-${statusClass}`">
          {{ statusText }}
        </div>
      </div>

      <div class="power-parameters">
        <div class="parameter-row">
          <span class="parameter-label">Напряжение:</span>
          <span class="parameter-value">{{ voltageRange.min }} - {{ voltageRange.max }} В</span>
        </div>
        <div class="parameter-row">
          <span class="parameter-label">Ток:</span>
          <span class="parameter-value">{{ currentRange.min }} - {{ currentRange.max }} мА</span>
        </div>
        <div class="parameter-row" v-if="efficiency">
          <span class="parameter-label">Эффективность:</span>
          <span class="parameter-value">{{ efficiency }}%</span>
        </div>
      </div>
    </div>

    <!-- 3D визуализация -->
    <div v-else-if="webGLSupported && show3D" class="power-supply-3d-container">
      <div class="three-scene-container" ref="container" :style="{ visibility: containerVisible ? 'visible' : 'hidden' }"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useSmartlightStore } from '@components/SmartLight/stores/index.js';
import {
  checkWebGLSupport,
  checkContainerReady
} from '@components/SmartLight/api/core/utils/coreApiWebglSupportUtils.js';

const props = defineProps({
  deviceId: { type: String, required: true },
  supplyId: { type: String, default: 'standard' },
  width: { type: String, default: '100%' },
  height: { type: String, default: '100%' },
  show3D: { type: Boolean, default: false }
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

const device = computed(() => store.deviceGetDevice(props.deviceId));
const powerSupply = computed(() => store.typesGetPowerSupplyById(props.supplyId));
const supplyType = computed(() => powerSupply.value?.category || 'standard');
const supplyName = computed(() => powerSupply.value?.name || 'Стандартный источник');
const supplyCategory = computed(() => powerSupply.value?.category || 'standard');
const voltageRange = computed(() => powerSupply.value?.voltageRange || { min: 2.5, max: 4.3 });
const currentRange = computed(() => powerSupply.value?.currentRange || { min: 0, max: 1000 });
const efficiency = computed(() => powerSupply.value?.efficiency || null);

const statusClass = computed(() => {
  if (!device.value) return 'unknown';
  const voltage = device.value.voltage || 3.7;
  if (voltage < voltageRange.value.min) return 'low';
  if (voltage > voltageRange.value.max) return 'high';
  return 'normal';
});

const statusText = computed(() => {
  const status = statusClass.value;
  if (status === 'low') return 'Низкое напряжение';
  if (status === 'high') return 'Высокое напряжение';
  return 'Нормальный режим';
});

const createPowerSupplyModel = () => {
  if (typeof THREE === 'undefined' || !scene) return;

  if (supplyType.value === 'solar') {
    createSolarPanelModel();
  } else if (supplyType.value === 'grid') {
    createGridTowerModel();
  } else {
    createStandardPlugModel();
  }
};

const createSolarPanelModel = () => {
  const panelGeometry = new THREE.BoxGeometry(2, 0.1, 1.5);
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a237e,
    roughness: 0.3,
    metalness: 0.7
  });
  const panel = new THREE.Mesh(panelGeometry, panelMaterial);
  panel.rotation.x = Math.PI / 6;
  scene.add(panel);
};

const createGridTowerModel = () => {
  const towerGeometry = new THREE.CylinderGeometry(0.1, 0.2, 2, 8);
  const towerMaterial = new THREE.MeshStandardMaterial({
    color: 0x607d8b,
    roughness: 0.5,
    metalness: 0.5
  });
  const tower = new THREE.Mesh(towerGeometry, towerMaterial);
  scene.add(tower);
};

const createStandardPlugModel = () => {
  const plugGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.3);
  const plugMaterial = new THREE.MeshStandardMaterial({
    color: 0x2196f3,
    roughness: 0.4,
    metalness: 0.3
  });
  const plug = new THREE.Mesh(plugGeometry, plugMaterial);
  scene.add(plug);
};

const onWindowResize = () => {
  if (!container.value || !camera || !renderer) return;
  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
};

const animate = () => {
  if (!containerVisible.value) return;
  animationFrame = requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

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
  window.removeEventListener('resize', onWindowResize);
  containerVisible.value = false;
  initialized = false;
};

const checkContainerVisibility = () => {
  if (!container.value) {
    containerVisible.value = false;
    return false;
  }
  const rect = container.value.getBoundingClientRect();
  const style = getComputedStyle(container.value);
  const isVisible = (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.top < window.innerHeight &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
  );
  containerVisible.value = isVisible;
  return isVisible;
};

const init = () => {
  if (!webGLSupported) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f7fa);

  camera = new THREE.PerspectiveCamera(
      75,
      container.value.clientWidth / container.value.clientHeight,
      0.1,
      1000
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;

  container.value.appendChild(renderer.domElement);
  containerVisible.value = true;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  createPowerSupplyModel();

  window.addEventListener('resize', onWindowResize);
  animate();
  initialized = true;
};

onMounted(() => {
  setTimeout(() => {
    if (webGLSupported && props.show3D) {
      setTimeout(() => {
        checkContainerVisibility();
        if (containerVisible.value) {
          init();
        }
      }, 500);
    }
  }, 100);
});

onUnmounted(() => {
  cleanup();
});

watch(() => props.show3D, (newShow3D, oldShow3D) => {
  if (webGLSupported && newShow3D && !oldShow3D) {
    setTimeout(() => {
      checkContainerVisibility();
      if (containerVisible.value) init();
    }, 300);
  } else if (webGLSupported && !newShow3D && oldShow3D) {
    cleanup();
    initialized = false;
  }
});
</script>

<style scoped>
.power-supply-renderer {
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 100px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.power-supply-css-container {
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.power-supply-3d-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.three-scene-container {
  width: 100%;
  height: 100%;
  min-width: 80px;
  min-height: 80px;
  position: relative;
  overflow: hidden;
  visibility: hidden;
}

/* Иконка источника питания */
.power-supply-icon {
  width: 80px;
  height: 80px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.power-icon-body {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Стандартная вилка */
.plug-prongs {
  position: absolute;
  bottom: 0;
  display: flex;
  gap: 10px;
}

.prong {
  width: 8px;
  height: 20px;
  background: linear-gradient(to bottom, #ffc107, #ff9800);
  border-radius: 2px;
}

.plug-body {
  position: absolute;
  top: 10px;
  width: 40px;
  height: 30px;
  background: linear-gradient(to bottom, #2196f3, #1976d2);
  border-radius: 4px;
}

/* Солнечная панель */
.solar-panel {
  width: 60px;
  height: 40px;
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  border-radius: 4px;
  position: relative;
  transform: rotateX(30deg);
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  padding: 4px;
  width: 100%;
  height: 100%;
}

.panel-cell {
  background: linear-gradient(135deg, #3949ab 0%, #5c6bc0 100%);
  border-radius: 2px;
}

.solar-rays {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 40px;
}

.ray {
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 20px;
  background: linear-gradient(to bottom, #ffeb3b, #ffc107);
  transform-origin: top center;
  opacity: 0.6;
}

/* Сетевая вышка */
.grid-tower {
  position: relative;
  width: 40px;
  height: 60px;
}

.tower-body {
  width: 10px;
  height: 100%;
  background: linear-gradient(to bottom, #607d8b, #455a64);
  margin: 0 auto;
  border-radius: 2px;
}

.tower-lines {
  position: absolute;
  top: 10px;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.line {
  width: 100%;
  height: 2px;
  background: #333333;
}

/* Информация о источнике питания */
.power-supply-info {
  text-align: center;
  width: 100%;
}

.supply-name {
  font-size: 1rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 0.25rem;
}

.supply-category {
  font-size: 0.75rem;
  color: #909399;
  text-transform: capitalize;
  margin-bottom: 0.5rem;
}

.supply-status {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.status-normal {
  background: #f0f9eb;
  color: #67c23a;
}

.status-low {
  background: #fef0f0;
  color: #f56c6c;
}

.status-high {
  background: #fdf6ec;
  color: #e6a23c;
}

.status-unknown {
  background: #f5f7fa;
  color: #909399;
}

/* Параметры питания */
.power-parameters {
  width: 100%;
  background: #f5f7fa;
  border-radius: 4px;
  padding: 0.75rem;
}

.parameter-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #606266;
  margin-bottom: 0.25rem;
}

.parameter-row:last-child {
  margin-bottom: 0;
}

.parameter-label {
  font-weight: 500;
}

.parameter-value {
  font-weight: 600;
  color: #409eff;
}

/* Типы источников питания */
.power-type-standard .plug-body {
  background: linear-gradient(to bottom, #2196f3, #1976d2);
}

.power-type-solar .solar-panel {
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
}

.power-type-grid .tower-body {
  background: linear-gradient(to bottom, #607d8b, #455a64);
}
</style>
