<template>
  <div
      ref="container"
      class="universal-three-scene"
      :class="[`mode-${mode}`, { 'debug-enabled': effectiveDebug }]"
  >
    <!-- Debug overlay (Ctrl+Click) -->
    <div v-if="effectiveDebug && showDebugOverlay" class="debug-overlay" @click.stop>
      <div class="debug-header">🔍 3D</div>
      <div class="debug-row"><span>mode:</span><span>{{ mode }}</span></div>
      <div class="debug-row"><span>model:</span><span>{{ hasModel ? '✓' : '✗' }}</span></div>
      <div class="debug-row"><span>init:</span><span>{{ isInitialized ? '✓' : '⏳' }}</span></div>
      <el-button size="small" @click="forceRetry" type="primary" class="debug-btn" :disabled="isInitRunning">🔄</el-button>
    </div>

    <!-- Reset camera button -->
    <div v-if="showResetButton && mode !== 'minimal'" class="camera-reset-btn" @click="resetCamera" title="Сброс">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
      </svg>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading && mode !== 'minimal' && mode !== 'basic'" class="scene-loading">
      <div class="loading-spinner"></div>
      <span class="loading-text">{{ initStatusText }}</span>
    </div>

    <!-- Error state -->
    <div v-if="loadError && mode !== 'minimal' && mode !== 'basic'" class="scene-error">
      <el-icon class="error-icon"><WarningFilled /></el-icon>
      <span class="error-text">{{ loadError }}</span>
      <el-button size="small" @click="forceRetry" type="primary" class="error-btn" :disabled="isInitRunning">🔄</el-button>
    </div>

    <!-- Debug panel -->
    <div v-if="effectiveDebug && mode !== 'minimal' && mode !== 'basic'" class="scene-debug">
      <div class="debug-row"><span>GL:</span><span :class="webGLInfo?.isSupported ? 'ok' : 'err'">{{ webGLInfo?.isSupported ? '✓' : '✗' }}</span></div>
      <div v-if="webGLInfo?.isSupported" class="debug-row"><span>Q:</span><span>{{ gpuQuality }}</span></div>
    </div>

    <!-- Slot for minimal mode -->
    <slot v-if="mode === 'minimal' && !hasModel" name="content"></slot>

    <!-- ✅ MODEL CONTAINER: Always present when mode=full, visibility via CSS -->
    <div
        v-if="mode === 'full'"
        ref="modelContainer"
        class="model-container"
        :style="{ display: shouldRenderModel ? 'block' : 'none' }"
    >
      <!-- ✅ MODEL COMPONENT: v-show (not v-if) + no isRecovering guard -->
      <component
          :is="modelComponent"
          :key="modelKey"
          v-show="scene && camera && renderer"
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

      <!-- Loading indicator -->
      <div v-if="!isModelLoaded && hasModel && hasConfig && !modelLoadTimeout" class="model-loading">
        <span>🧊 Loading... ({{ modelLoadTime }}s)</span>
      </div>

      <!-- Timeout fallback -->
      <div v-if="modelLoadTimeout && !isModelLoaded" class="model-fallback" @click="forceRetry">
        <span>❌ Timeout — click to retry</span>
      </div>

      <!-- Dev fallback: test cube if nothing renders -->
      <div v-if="isDevMode && !isModelLoaded && isInitialized" class="dev-fallback">
        <span>🧪 Dev: Scene ready, waiting for model</span>
      </div>
    </div>

    <!-- Placeholder when not rendering model -->
    <div v-else-if="mode === 'full' && !shouldRenderModel" class="model-placeholder">
      <div class="placeholder-icon">🧊</div>
      <div class="placeholder-text">
        <div v-if="!hasModel">no model</div>
        <div v-else-if="!hasConfig">no config</div>
        <div v-else-if="!isInitialized && !initTimeout">{{ initStatusText || 'init...' }}</div>
        <div v-else-if="initTimeout">timeout</div>
        <div v-else-if="isDisposed">disposed</div>
      </div>
      <el-button size="small" @click="forceRetry" type="info" class="retry-btn" v-if="!isDisposed" :disabled="isInitRunning">🔄</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, markRaw, computed, onMounted, onUnmounted, watch, nextTick, defineExpose } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { WarningFilled } from '@element-plus/icons-vue'
import InitializationController from '@/components/SmartLight/controllers/InitializationController.js'
import {
  checkWebGLSupport,
  getOptimalWebGLSettings,
  cleanupWebGL,
  handleWebGLContextLoss
} from '@/components/SmartLight/api/core/utils/coreApiWebglSupportUtils.js'
import { useInterfaceStore } from '@/components/SmartLight/stores/smartlight/interfaceStore.js'
import {
  registerRenderer,
  isRecovering as isGlobalRecovering,
  canCreateContext,
  markContextActive
} from '@/components/SmartLight/api/core/utils/coreWebglContextManagerUtils.js'

// ============================================================================
// ПРОПСЫ
// ============================================================================
const props = defineProps({
  mode: {
    type: String,
    default: 'basic',
    validator: (v) => ['minimal', 'basic', 'advanced', 'full'].includes(v)
  },
  deviceId: { type: String, default: null },
  config: { type: Object, default: null },
  data: { type: Object, default: () => ({}) },
  modelComponent: { type: [Object, Function], default: null },
  enableDebug: { type: Boolean, default: false },
  autoRotate: { type: Boolean, default: true },
  rotateSpeed: { type: Number, default: 0.01 },
  enableShadows: { type: Boolean, default: false },
  qualityOverride: {
    type: String,
    default: null,
    validator: (v) => v === null || ['low', 'medium', 'high'].includes(v)
  }
})

const emit = defineEmits(['ready', 'error', 'model-ready', 'model-update'])
const interfaceStore = useInterfaceStore()

// ============================================================================
// РЕФЫ СОСТОЯНИЯ
// ============================================================================
const container = ref(null)
const modelContainer = ref(null)
const modelRef = ref(null)
const isLoading = ref(false)
const loadError = ref(null)
const initTimeout = ref(false)
const initStatusText = ref('')
const showResetButton = ref(false)
const webGLInfo = ref(null)
const gpuQuality = ref('low')
const gpuName = ref('N/A')
const isMounting = ref(false)
const isInitRunning = ref(false)
const isAnimating = ref(false)
const showDebugOverlay = ref(false)
const isModelLoaded = ref(false)
const modelLoadTime = ref(0)
const modelError = ref(null)
const modelLoadStart = ref(0)
const modelLoadTimeout = ref(false)

// ============================================================================
// THREE.JS ОБЪЕКТЫ (shallowRef + markRaw для избежания прокси)
// ============================================================================
const three = shallowRef(null)
const scene = shallowRef(null)
const camera = shallowRef(null)
const renderer = shallowRef(null)
const controls = shallowRef(null)

// ============================================================================
// ВНУТРЕННИЕ ПЕРЕМЕННЫЕ
// ============================================================================
let animationFrame = null
let isInitialized = false
let isDisposed = false
let defaultCameraPosition = null
let defaultCameraTarget = null
let isLogging = false
let resizeObserver = null
let lastConfigHash = ''
let modelLoadTimer = null
let cleanupRenderer = null
let retryCount = 0
let testCube = null
const MAX_RETRIES = 3
const initController = new InitializationController()
const isDevMode = process.env.NODE_ENV === 'development'

// ============================================================================
// COMPUTED
// ============================================================================
const hasModel = computed(() => !!props.modelComponent)
const hasConfig = computed(() => !!props.config)
const effectiveDebug = computed(() => props.enableDebug || showDebugOverlay.value)
const modelKey = computed(() => `model-${props.deviceId}-${props.config?.id || 'no-id'}-${props.mode}`)

const shouldRenderModel = computed(() =>
    props.mode === 'full' &&
    hasModel.value &&
    hasConfig.value &&
    !isDisposed &&
    !isMounting.value &&
    container.value
)

// ✅ GUARD: модель монтируется когда сцена готова (БЕЗ isRecovering!)
const isReadyForModel = computed(() =>
    isInitialized &&
    !isDisposed &&
    scene.value?.add &&
    camera.value &&
    renderer.value?.render &&
    modelContainer.value?.isConnected
)

const CAMERA_CONFIG = {
  fov: 75,
  near: 0.1,
  far: 1000,
  defaultPosition: { x: 0, y: 0.6, z: 3.5 },
  defaultTarget: { x: 0, y: 0, z: 0 }
}

// ============================================================================
// ЛОГИРОВАНИЕ
// ============================================================================
const logToPanel = (component, message, data = null) => {
  if (isLogging) return
  try {
    isLogging = true
    const keywords = ['error', 'timeout', 'success', 'init', 'step', 'mount', 'recover', 'model', 'context']
    if (keywords.some((k) => message.toLowerCase().includes(k))) {
      const logData = data && Object.keys(data).length > 0 ? data : null
      if (logData) {
        console.log(`[${component}] ${message}`, logData)
      } else {
        console.log(`[${component}] ${message}`)
      }
      interfaceStore.addLogStore({
        component,
        message,
        data: logData,
        level: message.toLowerCase().includes('error') ? 'error' : 'info'
      })
    }
  } finally {
    isLogging = false
  }
}

// ============================================================================
// ТАЙМЕРЫ ЗАГРУЗКИ МОДЕЛИ
// ============================================================================
const startModelLoadTimer = () => {
  modelLoadStart.value = Date.now()
  modelLoadTime.value = 0
  modelLoadTimeout.value = false
  modelError.value = null

  if (modelLoadTimer) clearInterval(modelLoadTimer)
  modelLoadTimer = setInterval(() => {
    modelLoadTime.value = Math.round((Date.now() - modelLoadStart.value) / 1000)
  }, 1000)

  setTimeout(() => {
    if (!isModelLoaded.value && hasModel.value) {
      modelLoadTimeout.value = true
      logToPanel('UniversalThreeScene', 'Model load timeout', {
        deviceId: props.deviceId,
        loadTime: modelLoadTime.value,
        isModelLoaded: isModelLoaded.value,
        modelRef: !!modelRef.value
      })
    }
    if (modelLoadTimer) clearInterval(modelLoadTimer)
  }, 15000)
}

const stopModelLoadTimer = () => {
  if (modelLoadTimer) {
    clearInterval(modelLoadTimer)
    modelLoadTimer = null
  }
}

// ============================================================================
// ОБРАБОТЧИКИ МОДЕЛИ
// ============================================================================
const onModelReady = (d) => {
  isModelLoaded.value = true
  stopModelLoadTimer()
  logToPanel('UniversalThreeScene', 'Model ready', { loadTime: modelLoadTime.value })
  if (!isDisposed) emit('model-ready', d)
}

const onModelUpdate = (d) => {
  if (!isDisposed) emit('model-update', d)
}

// ============================================================================
// МЕТОДЫ
// ============================================================================
const startResizeObserver = () => {
  if (!container.value || resizeObserver) return
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0 && !isInitialized && !isDisposed && props.mode === 'full') {
        logToPanel('UniversalThreeScene', 'Container resized', { size: `${entry.contentRect.width}x${entry.contentRect.height}` })
        performInit()
      }
    }
  })
  resizeObserver.observe(container.value)
}

const checkWebGL = () => {
  initStatusText.value = 'Checking WebGL...'
  webGLInfo.value = checkWebGLSupport()
  if (!webGLInfo.value.isSupported) {
    logToPanel('UniversalThreeScene', 'WebGL not supported', { reason: webGLInfo.value.reason })
    if (props.mode === 'advanced' || props.mode === 'full') {
      loadError.value = `WebGL: ${webGLInfo.value.reason}`
    }
    return false
  }
  const settings = getOptimalWebGLSettings(webGLInfo.value)
  gpuQuality.value = props.qualityOverride || settings.quality
  gpuName.value = webGLInfo.value.renderer?.substring(0, 20) || 'Unknown'
  initStatusText.value = `WebGL OK (${gpuQuality.value})`
  return true
}

const addTestCube = () => {
  if (!isDevMode || !scene.value) return
  try {
    const geo = new THREE.BoxGeometry(0.5, 0.5, 0.5)
    const mat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x004400, metalness: 0.3, roughness: 0.4 })
    testCube = new THREE.Mesh(geo, mat)
    testCube.position.set(0, 0, 0)
    testCube.userData.isTestCube = true
    scene.value.add(testCube)
    console.log('[UniversalThreeScene] ✅ Test cube added (dev mode)')
  } catch (e) {
    console.warn('[UniversalThreeScene] Test cube error:', e)
  }
}

const removeTestCube = () => {
  if (!scene.value || !testCube) return
  try {
    scene.value.remove(testCube)
    testCube.geometry?.dispose?.()
    testCube.material?.dispose?.()
    testCube = null
    console.log('[UniversalThreeScene] ✅ Test cube removed')
  } catch (e) {
    console.warn('[UniversalThreeScene] Test cube cleanup error:', e)
  }
}

const performInit = () => {
  // 🛡️ Проверка лимита контекстов
  if (!canCreateContext()) {
    logToPanel('UniversalThreeScene', 'Context limit reached, skipping init')
    loadError.value = 'Too many 3D scenes active'
    isLoading.value = false
    isInitRunning.value = false
    return
  }

  if (!container.value || isInitialized || isDisposed || isInitRunning.value) return
  isInitRunning.value = true
  initStatusText.value = 'Allocating...'

  try {
    const w = container.value.clientWidth || container.value.getBoundingClientRect().width
    const h = container.value.clientHeight || container.value.getBoundingClientRect().height
    if (w <= 0 || h <= 0) {
      initStatusText.value = 'Waiting...'
      startResizeObserver()
      isInitRunning.value = false
      return
    }
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    if ((props.mode === 'advanced' || props.mode === 'full') && !checkWebGL()) {
      isInitRunning.value = false
      return
    }

    isLoading.value = true
    loadError.value = null
    initTimeout.value = false

    const timeoutId = setTimeout(() => {
      if (!isInitialized && !isDisposed) {
        initTimeout.value = true
        loadError.value = 'Timeout'
        isLoading.value = false
        isInitRunning.value = false
      }
    }, 10000)

    // 🌑 THREE.JS ИНИЦИАЛИЗАЦИЯ
    three.value = markRaw(THREE)

    scene.value = markRaw(new THREE.Scene())
    scene.value.background = markRaw(new THREE.Color(0x111118))
    scene.value.fog = markRaw(new THREE.Fog(0x111118, 8, 25))

    const aspect = w / h
    camera.value = markRaw(new THREE.PerspectiveCamera(CAMERA_CONFIG.fov, aspect, CAMERA_CONFIG.near, CAMERA_CONFIG.far))
    camera.value.position.set(CAMERA_CONFIG.defaultPosition.x, CAMERA_CONFIG.defaultPosition.y, CAMERA_CONFIG.defaultPosition.z)
    camera.value.lookAt(CAMERA_CONFIG.defaultTarget.x, CAMERA_CONFIG.defaultTarget.y, CAMERA_CONFIG.defaultTarget.z)
    defaultCameraPosition = camera.value.position.clone()
    defaultCameraTarget = markRaw(new THREE.Vector3(CAMERA_CONFIG.defaultTarget.x, CAMERA_CONFIG.defaultTarget.y, CAMERA_CONFIG.defaultTarget.z))

    renderer.value = markRaw(new THREE.WebGLRenderer({
      antialias: gpuQuality.value !== 'low',
      alpha: true,
      powerPreference: gpuQuality.value === 'high' ? 'high-performance' : 'default',
      preserveDrawingBuffer: false
    }))
    renderer.value.toneMapping = THREE.ACESFilmicToneMapping
    renderer.value.toneMappingExposure = 1.2
    renderer.value.setSize(w, h)
    renderer.value.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    if (props.enableShadows && (props.mode === 'advanced' || props.mode === 'full')) {
      renderer.value.shadowMap.enabled = true
      renderer.value.shadowMap.type = THREE.PCFSoftShadowMap
    }

    // 🖼️ ВСТАВКА CANVAS В DOM
    if (container.value?.isConnected) {
      const oldCanvas = container.value.querySelector('canvas')
      if (oldCanvas?.parentNode === container.value) {
        container.value.removeChild(oldCanvas)
      }
      container.value.appendChild(renderer.value.domElement)
    } else {
      clearTimeout(timeoutId)
      isInitRunning.value = false
      return
    }

    // 💡 ОСВЕЩЕНИЕ
    if (props.mode !== 'minimal') {
      setupLighting()
      setupControls()
    }

    // 🧪 ТЕСТОВЫЙ КУБ В РЕЖИМЕ РАЗРАБОТКИ
    if (isDevMode) {
      addTestCube()
    }

    // 🌍 РЕГИСТРАЦИЯ В ГЛОБАЛЬНОМ МЕНЕДЖЕРЕ
    if (props.mode === 'advanced' || props.mode === 'full') {
      cleanupRenderer = registerRenderer(renderer.value, props.deviceId, {
        onContextLost: (r, id) => {
          logToPanel('UniversalThreeScene', 'Context lost', { deviceId: id })
          isAnimating.value = false
          if (animationFrame) {
            cancelAnimationFrame(animationFrame)
            animationFrame = null
          }
          loadError.value = 'Context lost - retrying...'
          // 🔄 Автоматический ретрай через 500мс
          setTimeout(() => {
            if (!isDisposed && !isInitialized) {
              retryCount++
              if (retryCount <= MAX_RETRIES) {
                logToPanel('UniversalThreeScene', `Retry ${retryCount}/${MAX_RETRIES}`)
                performInit()
              }
            }
          }, 500)
        },
        onContextRestored: (r, id) => {
          logToPanel('UniversalThreeScene', 'Context restored', { deviceId: id })
          loadError.value = null
          retryCount = 0
        },
        onCleanup: () => {
          if (renderer.value) {
            try { cleanupWebGL(renderer.value.getContext()) } catch (e) {}
          }
        }
      })

      // Дублирующая подписка для совместимости
      handleWebGLContextLoss(renderer.value.domElement, (event) => {
        if (event === 'lost') {
          isInitialized = false
          if (props.mode === 'full') loadError.value = 'Context lost'
        } else if (event === 'restored' && !isDisposed && !isInitRunning.value) {
          loadError.value = null
          setTimeout(() => { if (!isDisposed) performInit() }, 300)
        }
      })
    }

    window.addEventListener('resize', onWindowResize)

    isInitialized = true
    isLoading.value = false
    initTimeout.value = false
    isInitRunning.value = false
    clearTimeout(timeoutId)
    isAnimating.value = true
    retryCount = 0

    // 🚀 ЗАПУСК
    if (hasModel.value) {
      startModelLoadTimer()
      logToPanel('UniversalThreeScene', 'Waiting for model', { isAsync: typeof props.modelComponent === 'function' })
    }

    animate()
    emit('ready', { scene: scene.value, camera: camera.value, renderer: renderer.value })
    logToPanel('UniversalThreeScene', 'Init SUCCESS', { deviceId: props.deviceId, quality: gpuQuality.value })

  } catch (error) {
    logToPanel('UniversalThreeScene', 'Init ERROR', { error: error.message })
    loadError.value = `Init error: ${error.message}`
    isLoading.value = false
    isInitRunning.value = false

    // 🔄 RETRY LOGIC
    if (retryCount < MAX_RETRIES && error.message?.includes('context')) {
      retryCount++
      const delay = Math.min(1000 * Math.pow(2, retryCount), 5000)
      logToPanel('UniversalThreeScene', `Retrying init (${retryCount}/${MAX_RETRIES}) in ${delay}ms`)
      setTimeout(() => {
        if (!isDisposed && !isInitialized) performInit()
      }, delay)
    } else {
      emit('error', { error })
    }
  }
}

const animate = () => {
  if (!isAnimating.value || isDisposed || !scene.value || !camera.value || !renderer.value) return

  // 🛡️ Обновляем timestamp для менеджера
  if (renderer.value) markContextActive(renderer.value)

  if (controls.value) controls.value.update()
  if (props.mode === 'full' && modelRef.value?.animate) modelRef.value.animate()
  renderer.value.render(scene.value, camera.value)

  if (!isDisposed) animationFrame = requestAnimationFrame(animate)
}

const setupLighting = () => {
  if (!scene.value) return
  scene.value.add(markRaw(new THREE.AmbientLight(0xffffff, 0.6)))
  const dir = markRaw(new THREE.DirectionalLight(0xffffff, 1.2))
  dir.position.set(3, 3, 3)
  if (props.enableShadows && (props.mode === 'advanced' || props.mode === 'full')) {
    dir.castShadow = true
  }
  scene.value.add(dir)
  scene.value.add(markRaw(new THREE.PointLight(0xffaa44, 0.5, 10)))
}

const setupControls = () => {
  if (!camera.value || !renderer.value) return
  controls.value = markRaw(new OrbitControls(camera.value, renderer.value.domElement))
  controls.value.enableDamping = true
  controls.value.dampingFactor = 0.05
  controls.value.enableZoom = true
  controls.value.autoRotate = props.autoRotate
  controls.value.autoRotateSpeed = props.rotateSpeed * 8
  controls.value.enablePan = false
  controls.value.target.copy(defaultCameraTarget)
  controls.value.addEventListener('change', checkCameraChanged)
}

const updateModel = () => {
  if (props.mode !== 'full' || !modelRef.value?.updateModel || isDisposed) return
  modelRef.value.updateModel(props.data)
}

const checkCameraChanged = () => {
  if (!defaultCameraPosition || !camera.value || isDisposed) return
  const pc = camera.value.position
  const dt = defaultCameraTarget
  if (
      Math.abs(pc.x - defaultCameraPosition.x) > 0.1 ||
      Math.abs(pc.y - defaultCameraPosition.y) > 0.1 ||
      Math.abs(pc.z - defaultCameraPosition.z) > 0.1
  ) {
    showResetButton.value = true
    return
  }
  if (
      controls.value &&
      (Math.abs(controls.value.target.x - dt.x) > 0.1 ||
          Math.abs(controls.value.target.y - dt.y) > 0.1 ||
          Math.abs(controls.value.target.z - dt.z) > 0.1)
  ) {
    showResetButton.value = true
  }
}

const resetCamera = () => {
  if (!camera.value || !controls.value || !defaultCameraPosition || isDisposed) return
  camera.value.position.copy(defaultCameraPosition)
  controls.value.target.copy(defaultCameraTarget)
  controls.value.update()
  showResetButton.value = false
}

const onWindowResize = () => {
  if (!container.value || !camera.value || !renderer.value || isDisposed) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight
  if (w > 0 && h > 0) {
    camera.value.aspect = w / h
    camera.value.updateProjectionMatrix()
    renderer.value.setSize(w, h)
  }
}

// ============================================================================
// 🗑️ АГРЕССИВНАЯ ОЧИСТКА
// ============================================================================
const cleanup = async () => {
  logToPanel('UniversalThreeScene', 'Cleanup started')

  stopModelLoadTimer()
  isAnimating.value = false

  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }

  isDisposed = true
  isInitRunning.value = false
  isMounting.value = false

  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  // 🗑️ ОЧИСТКА ЧЕРЕЗ МЕНЕДЖЕР
  if (cleanupRenderer && typeof cleanupRenderer === 'function') {
    try { cleanupRenderer() } catch (e) {}
    cleanupRenderer = null
  }

  // 🗑️ УДАЛЕНИЕ ТЕСТОВОГО КУБА
  if (isDevMode) removeTestCube()

  // 🗑️ АГРЕССИВНОЕ ОСВОБОЖДЕНИЕ THREE.JS
  if (renderer.value) {
    try {
      if (props.mode === 'advanced' || props.mode === 'full') {
        cleanupWebGL(renderer.value.getContext())
      }
      // 🗑️ УДАЛЯЕМ CANVAS ИЗ ДОМ ПЕРЕД dispose()
      if (renderer.value.domElement?.parentNode) {
        renderer.value.domElement.parentNode.removeChild(renderer.value.domElement)
      }
      renderer.value.dispose()
      renderer.value.forceContextLoss?.()
    } catch (e) {
      console.warn('Renderer cleanup error', e)
    }
    renderer.value = null
  }

  if (scene.value) {
    try {
      scene.value.traverse((o) => {
        if (o.geometry) o.geometry.dispose?.()
        if (o.material) {
          if (Array.isArray(o.material)) {
            o.material.forEach((m) => m.dispose?.())
          } else {
            o.material.dispose?.()
          }
        }
      })
    } catch (e) {}
    scene.value = null
  }

  if (controls.value) {
    try {
      controls.value.removeEventListener?.('change', checkCameraChanged)
      controls.value.dispose?.()
    } catch (e) {}
    controls.value = null
  }

  camera.value = null
  three.value = null
  modelRef.value = null

  try { window.removeEventListener('resize', onWindowResize) } catch (e) {}

  // 🗑️ ФИНАЛЬНАЯ ОЧИСТКА DOM
  if (container.value?.isConnected) {
    const c = container.value.querySelector('canvas')
    if (c?.parentNode === container.value) c.remove()
  }

  isInitialized = false
  loadError.value = null
  initTimeout.value = false
  initStatusText.value = ''
  showResetButton.value = false

  if (container.value) {
    try { initController.cleanupContainerController(container.value) } catch (e) {}
  }

  logToPanel('UniversalThreeScene', 'Cleanup complete')
}

const forceRetry = async () => {
  if (isInitRunning.value) return
  logToPanel('UniversalThreeScene', 'Force retry', { mode: props.mode })
  retryCount = 0
  await cleanup()
  await nextTick()
  if (!isDisposed) performInit()
}

// ============================================================================
// WATCH
// ============================================================================
watch(() => props.mode, async (newMode, oldMode) => {
  if (newMode !== oldMode && !isDisposed) {
    logToPanel('UniversalThreeScene', 'Mode changed', { from: oldMode, to: newMode })
    if (isInitialized) {
      await cleanup()
      isInitialized = false
      isModelLoaded.value = false
      if (newMode === 'full') {
        await nextTick()
        performInit()
      }
    } else if (newMode === 'full') {
      performInit()
    }
  }
})

watch(() => props.data, () => {
  if (props.mode === 'full' && isInitialized && !isDisposed) {
    updateModel()
  }
}, { deep: true })

watch(() => props.config, async (newConfig) => {
  if (!newConfig) return
  const newHash = JSON.stringify(newConfig)
  if (newHash === lastConfigHash) return
  lastConfigHash = newHash
  if (props.mode === 'full' && isInitialized && !isDisposed) {
    logToPanel('UniversalThreeScene', 'Config updated, restarting')
    await cleanup()
    isInitialized = false
    isModelLoaded.value = false
    await nextTick()
    if (!isDisposed) performInit()
  }
}, { deep: true })

// ============================================================================
// LIFECYCLE
// ============================================================================
const handleDebugToggle = (event) => {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault()
    showDebugOverlay.value = !showDebugOverlay.value
    logToPanel('UniversalThreeScene', 'Debug toggled', { visible: showDebugOverlay.value })
  }
}

onMounted(async () => {
  isDisposed = false
  isInitRunning.value = false
  isAnimating.value = false
  isModelLoaded.value = false
  modelError.value = null
  retryCount = 0

  if (container.value) {
    container.value.addEventListener('click', handleDebugToggle)
  }

  logToPanel('UniversalThreeScene', 'Mounted', { mode: props.mode })

  if (props.mode === 'full') {
    await nextTick()
    // 🛡️ Небольшая задержка чтобы браузер успел обработать DOM
    setTimeout(() => {
      if (!isDisposed && !isInitialized) performInit()
    }, 50)
  }
})

onUnmounted(async () => {
  if (container.value) {
    container.value.removeEventListener('click', handleDebugToggle)
  }
  // 🛡️ Даём браузеру 100мс на освобождение контекста перед очисткой
  await new Promise((resolve) => setTimeout(resolve, 100))
  await cleanup()
})

// ============================================================================
// EXPOSE
// ============================================================================
defineExpose({
  init: performInit,
  cleanup,
  resetCamera,
  forceRetry,
  updateModel,
  scene,
  camera,
  renderer,
  controls,
  three,
  isInitialized,
  isLoading,
  webGLInfo,
  gpuQuality,
  isModelLoaded,
  modelLoadTime,
  modelError
})
</script>

<style scoped>
.universal-three-scene {
  width: 100%;
  aspect-ratio: 1 / 1;
  position: relative;
  overflow: hidden;
  padding: 1px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: linear-gradient(145deg, #111118 0%, #0a0a0f 100%);
  font-size: 7px;
}

.universal-three-scene.mode-minimal {
  padding: 0;
  border: none;
  background: transparent;
}

.camera-reset-btn {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 999;
  transition: all 0.15s ease;
}

.camera-reset-btn:hover {
  background: rgba(64, 158, 255, 0.9);
  border-color: #409eff;
}

.scene-loading,
.scene-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(17, 17, 24, 0.95);
  z-index: 100;
  gap: 4px;
  font-size: 8px;
  color: #fff;
}

.scene-error {
  background: rgba(245, 108, 108, 0.15);
  color: #f56c6c;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #374151;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-icon {
  font-size: 16px;
}

.error-btn,
.retry-btn,
.debug-btn {
  padding: 2px 4px !important;
  height: 18px !important;
  font-size: 7px !important;
  min-width: 18px !important;
}

.scene-debug {
  position: absolute;
  top: 2px;
  left: 2px;
  background: rgba(0, 0, 0, 0.8);
  padding: 2px 4px;
  border-radius: 3px;
  z-index: 99;
  font-size: 7px;
  color: #fff;
  min-width: 65px;
  width: 65px;
}

.debug-row {
  display: flex;
  justify-content: space-between;
  gap: 4px;
}

.ok { color: #67c23a; }
.err { color: #f56c6c; }

.debug-overlay {
  position: absolute;
  top: 2px;
  left: 2px;
  background: rgba(30, 30, 40, 0.95);
  padding: 2px 4px;
  border-radius: 3px;
  z-index: 1000;
  font-size: 7px;
  color: #fff;
  min-width: 120px;
  border: 1px solid #409eff;
  cursor: default;
}

.debug-overlay .debug-header {
  font-weight: 700;
  color: #409eff;
  margin-bottom: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 1px;
}

.debug-overlay .debug-row {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  margin-bottom: 1px;
}

.model-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.model-loading,
.model-fallback,
.dev-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(17, 17, 24, 0.9);
  color: #9ca3af;
  font-size: 8px;
  z-index: 60;
  cursor: pointer;
}

.model-fallback:hover,
.dev-fallback:hover {
  background: rgba(17, 17, 24, 0.95);
  color: #fff;
}

.model-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(17, 17, 24, 0.95);
  z-index: 50;
  gap: 2px;
  color: #6b7280;
  text-align: center;
}

.placeholder-icon {
  font-size: 16px;
  opacity: 0.6;
}

.placeholder-text {
  line-height: 1.2;
}

.placeholder-hint {
  font-size: 6px;
  color: #4b5563;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.debug-enabled {
  border-color: #409eff;
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.3);
}
</style>
