<template>
  <div ref="container" class="battery-base-three" :style="{ width, height }"></div>
</template>

<script setup>
import { ref, shallowRef, markRaw, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  three: Object,
  scene: Object,
  camera: Object,
  renderer: Object,
  visualConfig: Object,
  specs: Object,
  voltage: Number,
  status: String,
  width: { type: String, default: '100%' },
  height: { type: String, default: '100%' }
})

const emit = defineEmits(['model-ready', 'model-update'])
const container = ref(null)
const mesh = shallowRef(null)
const fillMesh = shallowRef(null)
const animationId = shallowRef(null)

// === ИНИЦИАЛИЗАЦИЯ ===
const initModel = () => {
  if (!props.scene || !container.value) return

  const cfg = props.visualConfig || {}
  const type = cfg.type || 'battery-cylindrical'
  const geoCfg = cfg.geometry || {}
  const matCfg = cfg.materials || {}

  const group = new THREE.Group()

  // Геометрия
  let bodyGeo, fillGeo
  if (type.includes('box')) {
    bodyGeo = new THREE.BoxGeometry(geoCfg.w || 2.5, geoCfg.h || 0.4, geoCfg.d || 1.5)
    fillGeo = new THREE.BoxGeometry((geoCfg.w || 2.5) * 0.9, (geoCfg.h || 0.4) * 0.9, (geoCfg.d || 1.5) * 0.9)
  } else {
    bodyGeo = new THREE.CylinderGeometry(geoCfg.r || 0.5, geoCfg.r || 0.5, geoCfg.h || 4.0, geoCfg.seg || 32)
    fillGeo = new THREE.CylinderGeometry((geoCfg.r || 0.5) * 0.95, (geoCfg.r || 0.5) * 0.95, geoCfg.h || 4.0, geoCfg.seg || 32)
  }

  // Материалы
  const bodyMat = new THREE.MeshStandardMaterial({
    color: matCfg.body?.color || 0xffffff,
    transparent: matCfg.body?.transparent || false,
    opacity: matCfg.body?.opacity || 0.2,
    roughness: matCfg.body?.roughness || 0.5,
    metalness: matCfg.body?.metalness || 0.1
  })

  const fillMat = new THREE.MeshStandardMaterial({
    color: matCfg.fill?.color || 0x67c23a,
    transparent: true,
    opacity: matCfg.fill?.opacity || 0.9
  })

  // Меши
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
  fillMesh.value = new THREE.Mesh(fillGeo, fillMat)

  // Позиционирование заполнения (снизу вверх)
  fillMesh.value.position.y = type.includes('box')
      ? -(geoCfg.h || 0.4) / 2
      : -(geoCfg.h || 4.0) / 2

  group.add(bodyMesh)
  group.add(fillMesh.value)
  mesh.value = markRaw(group)

  // Масштаб и анимация
  if (cfg.animation?.rotate) {
    mesh.value.rotation.y = Math.random() * Math.PI
  }

  props.scene.add(mesh.value)
  updateFill()
  emit('model-ready', { type: cfg.type })
}

// === ОБНОВЛЕНИЕ ЗАПОЛНЕНИЯ ===
const updateFill = () => {
  if (!fillMesh.value || !props.visualConfig) return

  const cfg = props.visualConfig || {}
  const specs = props.specs || {}
  const status = props.status || 'OFF'
  const voltage = props.voltage || 0

  if (status === 'OFF') {
    fillMesh.value.scale.y = 0.01
    fillMesh.value.material.color.setHex(cfg.colors?.off || 0x909399)
    return
  }

  const minV = specs.minVoltage || 2.5
  const maxV = specs.maxVoltage || 4.2
  const clampedV = Math.max(minV, Math.min(maxV, voltage))
  const ratio = (clampedV - minV) / (maxV - minV)

  fillMesh.value.scale.y = Math.max(0.01, ratio)

  // Цвет по уровню
  let color = cfg.colors?.normal || 0x67c23a
  if (ratio < 0.2) color = cfg.colors?.critical || 0xf56c6c
  else if (ratio < 0.5) color = cfg.colors?.warning || 0xe6a23c

  fillMesh.value.material.color.setHex(color)
  fillMesh.value.material.needsUpdate = true
}

// === АНИМАЦИЯ ===
const animate = () => {
  animationId.value = requestAnimationFrame(animate)
  if (mesh.value && props.visualConfig?.animation?.rotate) {
    mesh.value.rotation.y += props.visualConfig.animation.speed || 0.01
  }
  if (props.renderer && props.camera && props.scene) {
    props.renderer.render(props.scene, props.camera)
  }
}

// === LIFECYCLE ===
onMounted(() => {
  initModel()
  animate()
})

onUnmounted(() => {
  if (animationId.value) cancelAnimationFrame(animationId.value)
  if (mesh.value && props.scene) {
    props.scene.remove(mesh.value)
    mesh.value.traverse(obj => {
      obj.geometry?.dispose()
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
        else obj.material.dispose()
      }
    })
  }
})

// === WATCH ===
watch(() => [props.voltage, props.status, props.specs], () => updateFill(), { deep: true })
</script>

<style scoped>
.battery-base-three {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
