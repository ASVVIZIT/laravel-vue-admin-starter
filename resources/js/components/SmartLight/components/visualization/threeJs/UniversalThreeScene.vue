<template>
  <div ref="container" class="three-scene-container">
    <!-- Кнопка сброса камеры -->
    <div
        v-show="showResetButton"
        class="camera-reset-btn"
        @click="resetCamera"
        title="Сбросить камеру"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
      </svg>
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="isLoading" class="scene-loading">
      <div class="loading-spinner"></div>
      <span class="loading-text">Загрузка 3D...</span>
    </div>

    <!-- Индикатор ошибки -->
    <div v-if="loadError" class="scene-error">
      <el-icon class="error-icon"><WarningFilled /></el-icon>
      <span class="error-text">{{ loadError }}</span>
      <el-button size="small" @click="retryInit" type="primary">Повторить</el-button>
    </div>

    <!-- Индикатор WebGL статуса (DEBUG) -->
    <div v-if="showDebugInfo" class="scene-debug">
      <div class="debug-header">3D Status</div>
      <div class="debug-row">
        <span class="debug-label">WebGL:</span>
        <span :class="['debug-value', webGLSupport?.isSupported ? 'success' : 'error']">
                    {{ webGLSupport?.isSupported ? '✓' : '✗' }}
                </span>
      </div>
      <div class="debug-row">
        <span class="debug-label">ThreeJS:</span>
        <span :class="['debug-value', threeJSAvailable ? 'success' : 'error']">
                    {{ threeJSAvailable ? '✓' : '✗' }}
                </span>
      </div>
      <div class="debug-row">
        <span class="debug-label">Качество:</span>
        <span :class="['debug-value', 'quality-' + webGLSettings?.quality]">
                    {{ webGLSettings?.quality || 'N/A' }}
                </span>
      </div>
      <div class="debug-row">
        <span class="debug-label">GPU:</span>
        <span class="debug-value gpu-name">{{ gpuName }}</span>
      </div>
      <div v-if="capabilityWarnings.length > 0" class="debug-warnings">
        <div v-for="(warning, idx) in capabilityWarnings" :key="idx" class="debug-warning">
          ⚠ {{ warning }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
import * as THREE from 'three';  // ✅ ЕДИНСТВЕННЫЙ ИМПОРТ THREE В ПРОЕКТЕ!
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { WarningFilled } from '@element-plus/icons-vue';
import {
  checkWebGLSupport,
  checkThreeJSSupport,
  checkContainerReady,
  isElementVisible,
  initWhenReady,
  getOptimalWebGLSettings,
  check3DCapability,
  cleanupWebGL,
  handleWebGLContextLoss
} from '@/components/SmartLight/api/core/utils/coreApiWebglSupportUtils.js';

const props = defineProps({
  deviceId: {
    type: String,
    required: true
  },
  modelComponent: {
    type: Object,
    required: true
  },
  voltage: {
    type: Number,
    default: 3.7
  },
  criticalVoltage: {
    type: Number,
    default: 3.2
  },
  status: {
    type: String,
    default: 'OFF'
  },
  intensity: {
    type: Number,
    default: 100
  },
  show3D: {
    type: Boolean,
    default: true
  },
  showDebugInfo: {
    type: Boolean,
    default: false
  }
});

const container = ref(null);
const showResetButton = ref(false);
const modelInstance = ref(null);
const isLoading = ref(false);
const loadError = ref(null);
const webGLSupport = ref(null);
const threeJSAvailable = ref(false);
const webGLSettings = ref(null);
const capabilityWarnings = ref([]);
const gpuName = ref('N/A');

let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let animationFrame = null;
let isInitialized = false;
let defaultCameraPosition = null;
let defaultCameraTarget = null;

const CAMERA_Z = 3.5;
const CAMERA_Y = 0.6;

// === ПОЛНАЯ ПРОВЕРКА WEBGL + THREEJS ===
const checkWebGL = () => {
  // 1. Проверка WebGL
  webGLSupport.value = checkWebGLSupport();
  console.log('[BaseScene] WebGL Support:', webGLSupport.value);

  // 2. Проверка ThreeJS (через импорт в этом модуле)
  threeJSAvailable.value = true; // Если мы здесь, THREE импортирован
  console.log('[BaseScene] ThreeJS: Available via module import');

  // 3. Проверка возможности 3D рендеринга
  const capability = check3DCapability(webGLSupport.value, { isSupported: threeJSAvailable.value });
  capabilityWarnings.value = capability.warnings;

  // 4. Получаем оптимальные настройки
  webGLSettings.value = getOptimalWebGLSettings(webGLSupport.value);
  console.log('[BaseScene] WebGL Settings:', webGLSettings.value);

  // 5. Информация о GPU
  gpuName.value = webGLSupport.value?.renderer?.substring(0, 30) || 'Unknown';

  // 6. Определяем можно ли рендерить
  if (!webGLSupport.value.isSupported) {
    loadError.value = `WebGL не поддерживается: ${webGLSupport.value.reason}`;
    return false;
  }

  // 7. Предупреждения для низкого качества
  if (capabilityWarnings.value.length > 0) {
    console.warn('[BaseScene] Capability warnings:', capabilityWarnings.value);
  }

  return capability.canRender3D;
};

// === ИНИЦИАЛИЗАЦИЯ ===
const init = () => {
  if (!container.value || isInitialized) return;

  isLoading.value = true;
  loadError.value = null;

  if (!checkWebGL()) {
    isLoading.value = false;
    return;
  }

  try {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f7fa);

    camera = new THREE.PerspectiveCamera(
        75,
        container.value.clientWidth / container.value.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, CAMERA_Y, CAMERA_Z);
    camera.lookAt(0, 0, 0);

    defaultCameraPosition = camera.position.clone();
    defaultCameraTarget = new THREE.Vector3(0, 0, 0);

    // ✅ НАСТРОЙКИ РЕНДЕРЕРА ПО ВОЗМОЖНОСТЯМ GPU
    renderer = new THREE.WebGLRenderer({
      antialias: webGLSettings.value.antialias,
      alpha: true,
      powerPreference: webGLSettings.value.quality === 'high' ? 'high-performance' : 'default'
    });
    renderer.setSize(container.value.clientWidth, container.value.clientHeight);
    renderer.setPixelRatio(webGLSettings.value.pixelRatio);

    if (webGLSettings.value.shadowMap) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    container.value.innerHTML = '';
    container.value.appendChild(renderer.domElement);

    // ✅ ОБРАБОТКА ПОТЕРИ КОНТЕКСТА
    handleWebGLContextLoss(renderer.domElement, (event) => {
      console.log('[BaseScene] Context event:', event);
      if (event === 'lost') {
        isInitialized = false;
        loadError.value = 'WebGL контекст потерян';
      } else if (event === 'restored') {
        loadError.value = null;
        init();
      }
    });

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(3, 3, 3);
    if (webGLSettings.value.shadowMap) {
      directionalLight.castShadow = true;
    }
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.6);
    backLight.position.set(-2, 1, -2);
    scene.add(backLight);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 3;
    controls.enablePan = false;
    controls.target.set(0, 0, 0);

    controls.addEventListener('change', checkCameraChanged);
    window.addEventListener('resize', onWindowResize);

    createModel();
    isInitialized = true;
    isLoading.value = false;
    animate();
  } catch (error) {
    console.error('[BaseScene] Init error:', error);
    loadError.value = `Ошибка инициализации: ${error.message}`;
    isLoading.value = false;
  }
};

// === СОЗДАНИЕ МОДЕЛИ (ПЕРЕДАЁМ THREE В КОМПОНЕНТ) ===
const createModel = () => {
  if (!scene || !props.modelComponent) return;

  try {
    // ✅ ПЕРЕДАЁМ THREE + scene В МОДЕЛЬ
    modelInstance.value = new props.modelComponent({
      THREE,  // ← Передаём THREE объект
      scene,
      voltage: props.voltage,
      criticalVoltage: props.criticalVoltage,
      status: props.status,
      intensity: props.intensity
    });
    console.log('[BaseScene] Model created:', modelInstance.value);
  } catch (error) {
    console.error('[BaseScene] Create model error:', error);
    loadError.value = `Ошибка создания модели: ${error.message}`;
  }
};

// === АНИМАЦИЯ ===
const animate = () => {
  animationFrame = requestAnimationFrame(animate);
  if (scene && camera && renderer) {
    if (modelInstance.value?.animate) {
      modelInstance.value.animate();
    }
    controls.update();
    renderer.render(scene, camera);
  }
};

// === ОБНОВЛЕНИЕ МОДЕЛИ ===
const updateModel = () => {
  if (modelInstance.value?.update) {
    modelInstance.value.update({
      voltage: props.voltage,
      criticalVoltage: props.criticalVoltage,
      status: props.status,
      intensity: props.intensity
    });
  }
};

// === ПОВТОРНАЯ ИНИЦИАЛИЗАЦИЯ ===
const retryInit = () => {
  cleanup();
  setTimeout(() => init(), 100);
};

// === ОЧИСТКА ===
const cleanup = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  if (modelInstance.value?.dispose) {
    modelInstance.value.dispose();
  }

  if (renderer) {
    cleanupWebGL(renderer.getContext());
    renderer.dispose();
    renderer.forceContextLoss();
    renderer = null;
  }

  if (container.value) {
    container.value.innerHTML = '';
  }

  if (scene) {
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    scene = null;
  }

  if (controls) {
    controls.removeEventListener('change', checkCameraChanged);
    controls.dispose();
    controls = null;
  }

  window.removeEventListener('resize', onWindowResize);
  modelInstance.value = null;
  isInitialized = false;
  showResetButton.value = false;
};

// === КАМЕРА ===
const checkCameraChanged = () => {
  if (!defaultCameraPosition || !camera) return;

  const posChanged =
      Math.abs(camera.position.x - defaultCameraPosition.x) > 0.1 ||
      Math.abs(camera.position.y - defaultCameraPosition.y) > 0.1 ||
      Math.abs(camera.position.z - defaultCameraPosition.z) > 0.1;

  const targetChanged = controls && (
      Math.abs(controls.target.x - defaultCameraTarget.x) > 0.1 ||
      Math.abs(controls.target.y - defaultCameraTarget.y) > 0.1 ||
      Math.abs(controls.target.z - defaultCameraTarget.z) > 0.1
  );

  showResetButton.value = posChanged || targetChanged;
};

const resetCamera = () => {
  if (!camera || !controls || !defaultCameraPosition) return;
  camera.position.copy(defaultCameraPosition);
  controls.target.copy(defaultCameraTarget);
  controls.update();
  showResetButton.value = false;
};

const onWindowResize = () => {
  if (!container.value || !camera || !renderer) return;
  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
};

// === WATCH ===
watch(() => props.show3D, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    init();
  } else if (!newVal && oldVal) {
    cleanup();
  }
}, { immediate: true });

watch(() => [props.voltage, props.status, props.intensity], () => {
  updateModel();
}, { deep: true });

watch(() => props.modelComponent, () => {
  if (isInitialized) {
    cleanup();
    setTimeout(() => init(), 50);
  }
});

// === LIFECYCLE ===
onMounted(() => {
  if (props.show3D) {
    nextTick(() => {
      initWhenReady(container.value, init, 30)
          .then((result) => {
            if (!result.success) {
              console.warn('[BaseScene] Init failed:', result.reason);
              loadError.value = `Инициализация не удалась: ${result.reason}`;
            }
          });
    });
  }
});

onUnmounted(() => {
  cleanup();
});

defineExpose({
  init,
  cleanup,
  resetCamera,
  scene,
  camera,
  renderer,
  webGLSupport,
  webGLSettings,
  capabilityWarnings
});
</script>

<style scoped>
.three-scene-container {
  width: 100%;
  aspect-ratio: 1 / 1;
  position: relative;
  overflow: hidden;
  padding: 2px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
}

.camera-reset-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  background: linear-gradient(145deg, rgba(0, 0, 0, 0.75) 0%, rgba(20, 20, 20, 0.85) 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 999;
  transition: all 0.2s ease;
}

.camera-reset-btn:hover {
  background: linear-gradient(145deg, rgba(64, 158, 255, 0.95) 0%, rgba(50, 140, 240, 0.9) 100%);
  border-color: #409eff;
  transform: scale(1.08);
}

.camera-reset-btn:active {
  transform: scale(0.95);
}

.scene-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 100;
  gap: 10px;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #e4e7ed;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 12px;
  color: #606266;
}

.scene-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(254, 240, 240, 0.95);
  z-index: 100;
  gap: 8px;
}

.error-icon {
  font-size: 32px;
  color: #f56c6c;
}

.error-text {
  font-size: 12px;
  color: #f56c6c;
  text-align: center;
  padding: 0 10px;
}

.scene-debug {
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.85);
  padding: 8px 10px;
  border-radius: 4px;
  z-index: 99;
  font-size: 10px;
  color: #fff;
  min-width: 150px;
}

.debug-header {
  font-size: 11px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 4px;
}

.debug-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 3px;
}

.debug-row:last-child {
  margin-bottom: 0;
}

.debug-label {
  color: #909399;
}

.debug-value {
  font-weight: 600;
}

.debug-value.success {
  color: #67c23a;
}

.debug-value.error {
  color: #f56c6c;
}

.debug-value.quality-high {
  color: #67c23a;
}

.debug-value.quality-medium {
  color: #e6a23c;
}

.debug-value.quality-low {
  color: #f56c6c;
}

.gpu-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.debug-warnings {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.debug-warning {
  color: #e6a23c;
  font-size: 9px;
  margin-top: 2px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
