<template>
  <div ref="container" class="universal-three-scene" :class="[`mode-${mode}`, { 'debug-enabled': enableDebug && mode !== 'minimal' }]">
    <!-- Кнопка сброса камеры (режимы basic+) -->
    <div
        v-if="showResetButton && mode !== 'minimal'"
        class="camera-reset-btn"
        @click="resetCamera"
        title="Сбросить камеру"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
      </svg>
    </div>

    <!-- Индикатор загрузки (режимы advanced+) -->
    <div v-if="isLoading && mode !== 'minimal' && mode !== 'basic'" class="scene-loading">
      <div class="loading-spinner"></div>
      <span class="loading-text">Загрузка 3D...</span>
    </div>

    <!-- Индикатор ошибки (режимы advanced+) -->
    <div v-if="loadError && mode !== 'minimal' && mode !== 'basic'" class="scene-error">
      <el-icon class="error-icon"><WarningFilled /></el-icon>
      <span class="error-text">{{ loadError }}</span>
      <el-button v-if="mode === 'full'" size="small" @click="retryInit" type="primary">Повторить</el-button>
    </div>

    <!-- Debug панель (только режим advanced/full + enableDebug) -->
    <div v-if="enableDebug && mode !== 'minimal' && mode !== 'basic'" class="scene-debug">
      <div class="debug-header">3D Status</div>
      <div class="debug-row">
        <span class="debug-label">WebGL:</span>
        <span :class="['debug-value', webGLInfo?.isSupported ? 'success' : 'error']">
                    {{ webGLInfo?.isSupported ? '✓' : '✗' }}
                </span>
      </div>
      <div v-if="webGLInfo?.isSupported" class="debug-row">
        <span class="debug-label">Качество:</span>
        <span :class="['debug-value', 'quality-' + gpuQuality]">{{ gpuQuality }}</span>
      </div>
      <div v-if="webGLInfo?.isSupported" class="debug-row">
        <span class="debug-label">GPU:</span>
        <span class="debug-value gpu-name">{{ gpuName }}</span>
      </div>
    </div>

    <!-- Слот для кастомного контента (режим minimal) -->
    <slot v-if="mode === 'minimal' && !modelComponent" name="content"></slot>

    <!-- ✅ ИСПРАВЛЕНО: Добавлена проверка isInitialized для предотвращения рендера до готовности -->
    <component
        v-if="mode === 'full' && modelComponent && isInitialized && !isDisposed"
        :is="modelComponent"
        ref="modelRef"
        :three="three"
        :scene="scene"
        :camera="camera"
        :renderer="renderer"
        :config="config"
        :data="data"
        @model-ready="onModelReady"
        @model-update="onModelUpdate"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, defineExpose, useSlots } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { WarningFilled } from '@element-plus/icons-vue';

// ✅ ИМПОРТ КОНТРОЛЛЕРА ИНИЦИАЛИЗАЦИИ
import InitializationController from '@/components/SmartLight/controllers/InitializationController.js';

// ✅ ИМПОРТ UTILS
import {
  checkWebGLSupport,
  getOptimalWebGLSettings,
  cleanupWebGL,
  handleWebGLContextLoss
} from '@/components/SmartLight/api/core/utils/coreApiWebglSupportUtils.js';

// === ПРОПСЫ ===
const props = defineProps({
  /** Режим работы: minimal, basic, advanced, full */
  mode: {
    type: String,
    default: 'basic',
    validator: (v) => ['minimal', 'basic', 'advanced', 'full'].includes(v)
  },
  /** ID устройства (для режима full) */
  deviceId: { type: String, default: null },
  /** Конфиг визуализации из store (для режима full) */
  config: { type: Object, default: null },
  /** Данные для обновления модели (для режима full) */
  data: { type: Object, default: () => ({}) },
  /** Компонент модели для режима full */
  modelComponent: { type: Object, default: null },
  /** Включить отладочную панель (режимы advanced/full) */
  enableDebug: { type: Boolean, default: false },
  /** Авто-анимация вращения (режимы basic+) */
  autoRotate: { type: Boolean, default: true },
  /** Скорость авто-вращения */
  rotateSpeed: { type: Number, default: 0.01 },
  /** Включить тени (режимы advanced/full) */
  enableShadows: { type: Boolean, default: false },
  /** Качество рендеринга (переопределение авто-определения) */
  qualityOverride: {
    type: String,
    default: null,
    validator: (v) => v === null || ['low', 'medium', 'high'].includes(v)
  }
});

// === EMITS ===
const emit = defineEmits(['ready', 'error', 'model-ready', 'model-update']);

// === СЛОТЫ ===
const slots = useSlots();

// === РЕФЫ ===
const container = ref(null);
const modelRef = ref(null);
const isLoading = ref(false);
const loadError = ref(null);
const showResetButton = ref(false);
const webGLInfo = ref(null);
const gpuQuality = ref('low');
const gpuName = ref('N/A');

// === THREE ОБЪЕКТЫ ===
const three = ref(null);
const scene = ref(null);
const camera = ref(null);
const renderer = ref(null);
const controls = ref(null);

// === ВНУТРЕННИЕ ПЕРЕМЕННЫЕ ===
let animationFrame = null;
let isInitialized = false;
// ✅ ИСПРАВЛЕНО: Флаг для предотвращения анимации после размонтирования
let isDisposed = false;
let defaultCameraPosition = null;
let defaultCameraTarget = null;

// ✅ КОНТРОЛЛЕР ИНИЦИАЛИЗАЦИИ
const initController = new InitializationController();

// === КОНСТАНТЫ ===
const CAMERA_CONFIG = {
  fov: 75,
  near: 0.1,
  far: 1000,
  defaultPosition: { x: 0, y: 0.6, z: 3.5 },
  defaultTarget: { x: 0, y: 0, z: 0 }
};

// === WEBGL ПРОВЕРКА ===
const checkWebGL = () => {
  webGLInfo.value = checkWebGLSupport();

  if (!webGLInfo.value.isSupported) {
    if (props.mode === 'advanced' || props.mode === 'full') {
      loadError.value = `WebGL не поддерживается: ${webGLInfo.value.reason}`;
      emit('error', { error: new Error(webGLInfo.value.reason) });
    }
    return false;
  }

  const settings = getOptimalWebGLSettings(webGLInfo.value);
  gpuQuality.value = props.qualityOverride || settings.quality;
  gpuName.value = webGLInfo.value.renderer?.substring(0, 30) || 'Unknown';

  console.log(`[UniversalThreeScene] WebGL: ${gpuQuality.value} quality, GPU: ${gpuName.value}`);
  return true;
};

// === ИНИЦИАЛИЗАЦИЯ (callback для контроллера) ===
const performInit = () => {
  // ✅ ИСПРАВЛЕНО: Проверка что контейнер существует и компонент не размонтирован
  if (!container.value || isInitialized || isDisposed) return;

  // ✅ ИСПРАВЛЕНО: Проверка видимости контейнера перед инициализацией
  const rect = container.value.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0 || container.value.offsetParent === null) {
    console.warn('[UniversalThreeScene] Container not visible, deferring init');
    setTimeout(() => {
      if (!isDisposed) performInit();
    }, 100);
    return;
  }

  if (props.mode === 'advanced' || props.mode === 'full') {
    if (!checkWebGL()) {
      isLoading.value = false;
      return;
    }
  }

  isLoading.value = true;
  loadError.value = null;

  try {
    three.value = THREE;
    scene.value = new THREE.Scene();
    scene.value.background = new THREE.Color(0xf5f7fa);

    const aspect = container.value.clientWidth / container.value.clientHeight || 1;
    if (aspect <= 0) throw new Error('Invalid container dimensions');

    camera.value = new THREE.PerspectiveCamera(CAMERA_CONFIG.fov, aspect, CAMERA_CONFIG.near, CAMERA_CONFIG.far);
    camera.value.position.set(CAMERA_CONFIG.defaultPosition.x, CAMERA_CONFIG.defaultPosition.y, CAMERA_CONFIG.defaultPosition.z);
    camera.value.lookAt(CAMERA_CONFIG.defaultTarget.x, CAMERA_CONFIG.defaultTarget.y, CAMERA_CONFIG.defaultTarget.z);

    defaultCameraPosition = camera.value.position.clone();
    defaultCameraTarget = new THREE.Vector3(CAMERA_CONFIG.defaultTarget.x, CAMERA_CONFIG.defaultTarget.y, CAMERA_CONFIG.defaultTarget.z);

    const rendererSettings = {
      antialias: gpuQuality.value !== 'low',
      alpha: true,
      powerPreference: gpuQuality.value === 'high' ? 'high-performance' : 'default'
    };
    renderer.value = new THREE.WebGLRenderer(rendererSettings);
    renderer.value.setSize(container.value.clientWidth, container.value.clientHeight);
    renderer.value.setPixelRatio(gpuQuality.value === 'high' ? window.devicePixelRatio : 1);

    if (props.enableShadows && (props.mode === 'advanced' || props.mode === 'full')) {
      renderer.value.shadowMap.enabled = true;
      renderer.value.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    container.value.innerHTML = '';
    container.value.appendChild(renderer.value.domElement);

    if (props.mode === 'advanced' || props.mode === 'full') {
      handleWebGLContextLoss(renderer.value.domElement, (event) => {
        console.log('[UniversalThreeScene] Context event:', event);
        if (event === 'lost') {
          isInitialized = false;
          if (props.mode === 'full') loadError.value = 'WebGL контекст потерян';
        } else if (event === 'restored') {
          loadError.value = null;
          if (!isDisposed) performInit();
        }
      });
    }

    if (props.mode !== 'minimal') {
      setupLighting();
      setupControls();
    }

    window.addEventListener('resize', onWindowResize);
    isInitialized = true;
    isLoading.value = false;
    animate();

    emit('ready', { scene: scene.value, camera: camera.value, renderer: renderer.value });
  } catch (error) {
    console.error('[UniversalThreeScene] Init error:', error);
    loadError.value = `Ошибка инициализации: ${error.message}`;
    isLoading.value = false;
    emit('error', { error });
  }
};

// === ПУБЛИЧНЫЙ МЕТОД ИНИЦИАЛИЗАЦИИ (через контроллер) ===
const init = async () => {
  if (!container.value || isDisposed) return;

  // ✅ ИСПОЛЬЗУЕМ КОНТРОЛЛЕР ДЛЯ ИНИЦИАЛИЗАЦИИ
  const result = await initController.initContainer(
      container.value,
      props.deviceId || 'unknown',
      performInit,
      {
        maxAttempts: 30,
        checkInterval: 100,
        maxCheckTime: 10000
      }
  );

  if (!result.success) {
    console.warn('[UniversalThreeScene] Init failed:', result.reason);
    if (props.mode === 'full') {
      loadError.value = `Инициализация не удалась: ${result.reason}`;
    }
  }

  return result;
};

// === НАСТРОЙКА ОСВЕЩЕНИЯ ===
const setupLighting = () => {
  if (!scene.value) return;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.value.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(3, 3, 3);
  if (props.enableShadows && (props.mode === 'advanced' || props.mode === 'full')) {
    directionalLight.castShadow = true;
  }
  scene.value.add(directionalLight);

  if (props.mode === 'advanced' || props.mode === 'full') {
    const backLight = new THREE.DirectionalLight(0xffffff, 0.6);
    backLight.position.set(-2, 1, -2);
    scene.value.add(backLight);
  }
};

// === НАСТРОЙКА КОНТРОЛОВ ===
const setupControls = () => {
  if (!camera.value || !renderer.value) return;

  controls.value = new OrbitControls(camera.value, renderer.value.domElement);
  controls.value.enableDamping = true;
  controls.value.dampingFactor = 0.05;
  controls.value.enableZoom = true;
  controls.value.autoRotate = props.autoRotate;
  controls.value.autoRotateSpeed = props.rotateSpeed * 60;
  controls.value.enablePan = false;
  controls.value.target.set(CAMERA_CONFIG.defaultTarget.x, CAMERA_CONFIG.defaultTarget.y, CAMERA_CONFIG.defaultTarget.z);
  controls.value.addEventListener('change', checkCameraChanged);
};

// === АНИМАЦИЯ ===
const animate = () => {
  // ✅ ИСПРАВЛЕНО: Не запускать анимацию если компонент размонтирован
  if (isDisposed || !scene.value || !camera.value || !renderer.value) return;

  if (controls.value) controls.value.update();
  if (props.mode === 'full' && modelRef.value?.animate) {
    modelRef.value.animate();
  }
  renderer.value.render(scene.value, camera.value);

  // ✅ ИСПРАВЛЕНО: Рекурсивный вызов только если компонент активен
  if (!isDisposed) {
    animationFrame = requestAnimationFrame(animate);
  }
};

// === ОБНОВЛЕНИЕ МОДЕЛИ ===
const updateModel = () => {
  // ✅ ИСПРАВЛЕНО: Проверка что модель существует и компонент не размонтирован
  if (props.mode !== 'full' || !modelRef.value?.updateModel || isDisposed) return;
  modelRef.value.updateModel(props.data);
};

// === СОБЫТИЯ ОТ МОДЕЛИ ===
const onModelReady = (data) => {
  // ✅ ИСПРАВЛЕНО: Проверка перед эмиссией
  if (isDisposed) return;
  console.log('[UniversalThreeScene] Model ready:', data);
  emit('model-ready', data);
};

const onModelUpdate = (data) => {
  if (isDisposed) return;
  emit('model-update', data);
};

// === КАМЕРА ===
const checkCameraChanged = () => {
  if (!defaultCameraPosition || !camera.value || isDisposed) return;
  const posChanged = Math.abs(camera.value.position.x - defaultCameraPosition.x) > 0.1 ||
      Math.abs(camera.value.position.y - defaultCameraPosition.y) > 0.1 ||
      Math.abs(camera.value.position.z - defaultCameraPosition.z) > 0.1;
  const targetChanged = controls.value && (
      Math.abs(controls.value.target.x - defaultCameraTarget.x) > 0.1 ||
      Math.abs(controls.value.target.y - defaultCameraTarget.y) > 0.1 ||
      Math.abs(controls.value.target.z - defaultCameraTarget.z) > 0.1
  );
  showResetButton.value = posChanged || targetChanged;
};

const resetCamera = () => {
  if (!camera.value || !controls.value || !defaultCameraPosition || isDisposed) return;
  camera.value.position.copy(defaultCameraPosition);
  controls.value.target.copy(defaultCameraTarget);
  controls.value.update();
  showResetButton.value = false;
};

// === RESIZE ===
const onWindowResize = () => {
  if (!container.value || !camera.value || !renderer.value || isDisposed) return;
  camera.value.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.value.updateProjectionMatrix();
  renderer.value.setSize(container.value.clientWidth, container.value.clientHeight);
};

// === ПОВТОРНАЯ ИНИЦИАЛИЗАЦИЯ ===
const retryInit = async () => {
  if (isDisposed) return;
  await cleanup();
  if (!isDisposed) {
    setTimeout(() => init(), 100);
  }
};

// === ОЧИСТКА (через контроллер) ===
const cleanup = async () => {
  // ✅ ИСПРАВЛЕНО: Установить флаг ПЕРВЫМ делом чтобы остановить анимацию
  isDisposed = true;

  // ✅ Остановить animation frame
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  // ✅ Очистить модель
  if (props.mode === 'full' && modelRef.value?.dispose) {
    modelRef.value.dispose();
  }

  // ✅ Очистить renderer
  if (renderer.value) {
    if (props.mode === 'advanced' || props.mode === 'full') {
      cleanupWebGL(renderer.value.getContext());
    }
    renderer.value.dispose();
    renderer.value.forceContextLoss?.();
    renderer.value = null;
  }

  // ✅ Очистить контейнер
  if (container.value) {
    container.value.innerHTML = '';
  }

  // ✅ Очистить сцену
  if (scene.value) {
    scene.value.traverse((object) => {
      if (object.geometry) object.geometry.dispose?.();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose?.());
        } else {
          object.material.dispose?.();
        }
      }
    });
    scene.value = null;
  }

  // ✅ Очистить контролы
  if (controls.value) {
    controls.value.removeEventListener?.('change', checkCameraChanged);
    controls.value.dispose?.();
    controls.value = null;
  }

  // ✅ Убрать слушатели
  window.removeEventListener('resize', onWindowResize);

  modelRef.value = null;
  isInitialized = false;
  showResetButton.value = false;

  // ✅ ОЧИСТКА ЧЕРЕЗ КОНТРОЛЛЕР
  if (container.value) {
    initController.cleanupContainer(container.value);
  }

  console.log('[UniversalThreeScene] Cleanup complete');
};

// === WATCH ===
watch(() => props.mode, (newMode, oldMode) => {
  if (newMode !== oldMode && isInitialized && !isDisposed) {
    cleanup();
    setTimeout(() => {
      if (!isDisposed) init();
    }, 50);
  }
});

watch(() => props.data, () => {
  if (props.mode === 'full' && !isDisposed) updateModel();
}, { deep: true });

watch(() => props.config, (newConfig) => {
  if (props.mode === 'full' && isInitialized && !isDisposed) {
    cleanup();
    setTimeout(() => {
      if (!isDisposed) init();
    }, 50);
  }
}, { deep: true });

// === LIFECYCLE ===
onMounted(async () => {
  // ✅ Сброс флага при монтировании
  isDisposed = false;

  if (props.mode === 'advanced' || props.mode === 'full') {
    await nextTick();
    if (!isDisposed) {
      await init();
    }
  } else {
    // Для minimal/basic инициализируем напрямую
    if (!isDisposed) performInit();
  }
});

onUnmounted(async () => {
  // ✅ Гарантированная очистка при размонтировании
  await cleanup();
});

// === EXPOSE ===
defineExpose({
  // Методы управления
  init,
  cleanup,
  resetCamera,
  retryInit,
  updateModel,

  // THREE объекты (для продвинутого использования)
  scene,
  camera,
  renderer,
  controls,
  three,

  // Статус
  isInitialized,
  isLoading,
  webGLInfo,
  gpuQuality,

  // ✅ МЕТОДЫ КОНТРОЛЛЕРА (для внешнего управления)
  isContainerInitialized: () => initController.isContainerInitialized(container.value),
  waitForInit: () => initController.waitForInit(container.value),
  checkContainerStatus: () => initController.checkContainerStatus(container.value)
});
</script>

<style scoped>
.universal-three-scene {
  width: 100%;
  aspect-ratio: 1 / 1;
  position: relative;
  overflow: hidden;
  padding: 2px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
}

.universal-three-scene.mode-minimal {
  padding: 0;
  border: none;
  background: transparent;
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

.debug-label { color: #909399; }
.debug-value { font-weight: 600; }
.debug-value.success { color: #67c23a; }
.debug-value.error { color: #f56c6c; }
.debug-value.quality-high { color: #67c23a; }
.debug-value.quality-medium { color: #e6a23c; }
.debug-value.quality-low { color: #f56c6c; }

.gpu-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.debug-enabled {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
