<template>
  <div class="bulb-base-three" :style="{ width, height }"></div>
</template>

<script setup>
// ✅ ЕДИНСТВЕННОЕ место с импортом Three.js в иерархии моделей
import { onMounted, onUnmounted, watch, defineProps, defineEmits, shallowRef, markRaw } from 'vue';
import * as THREE from 'three';

const props = defineProps({
  three: { type: Object, required: true },      // THREE namespace от родителя
  scene: { type: Object, required: true },      // THREE.Scene
  camera: { type: Object, default: null },
  renderer: { type: Object, default: null },
  visualConfig: { type: Object, default: () => ({}) }, // ✅ Конфиг из store
  specs: { type: Object, default: () => ({}) },
  voltage: { type: Number, default: 3.7 },
  status: { type: String, default: 'OFF' },     // 'ON' | 'OFF' | 'SLEEPING'
  intensity: { type: Number, default: 0 },      // 0-100
  width: { type: String, default: '80px' },
  height: { type: String, default: '80px' }
});

const emit = defineEmits(['model-ready', 'model-update']);

// === THREE.JS ОБЪЕКТЫ (shallowRef + markRaw) ===
const mesh = shallowRef(null);
const parts = shallowRef({}); // { glass, filament, base, light }

// === ГЕОМЕТРИИ: фабрика по конфига ===
const createGeometry = (cfg) => {
  const { type, dimensions } = cfg;
  switch (type) {
    case 'sphere':
      return new THREE.SphereGeometry(dimensions.radius, dimensions.segments || 32, dimensions.segments || 32);
    case 'cylinder':
      return new THREE.CylinderGeometry(
          dimensions.radiusTop ?? dimensions.radius,
          dimensions.radiusBottom ?? dimensions.radius,
          dimensions.height,
          dimensions.segments || 32
      );
    case 'box':
      return new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth);
    case 'torus':
      return new THREE.TorusGeometry(dimensions.radius, dimensions.tube, dimensions.radialSegments || 16, dimensions.tubularSegments || 32);
    default:
      console.warn('[BulbBaseThree] Unknown geometry type:', type);
      return new THREE.SphereGeometry(0.5, 16, 16);
  }
};

// === МАТЕРИАЛЫ: фабрика по конфига ===
const createMaterial = (cfg, isEmissive = false) => {
  const MaterialClass = isEmissive ? THREE.MeshBasicMaterial : THREE.MeshStandardMaterial;
  return markRaw(new MaterialClass({
    color: cfg.color ?? 0xffffff,
    transparent: cfg.transparent ?? false,
    opacity: cfg.opacity ?? 1,
    metalness: cfg.metalness ?? 0.3,
    roughness: cfg.roughness ?? 0.5,
    emissive: isEmissive ? cfg.color : 0x000000,
    emissiveIntensity: isEmissive ? (cfg.emissiveIntensity ?? 1) : 0
  }));
};

// === СОЗДАНИЕ МОДЕЛИ ИЗ КОНФИГА ===
const createModel = () => {
  const group = new THREE.Group();
  const vc = props.visualConfig;

  // 1. Стеклянная колба
  if (vc.material?.glass && vc.geometry) {
    const glassGeo = createGeometry(vc.geometry);
    parts.value.glass = markRaw(new THREE.Mesh(
        glassGeo,
        createMaterial(vc.material.glass, false)
    ));
    group.add(parts.value.glass);
  }

  // 2. Нить накаливания
  if (vc.material?.filament) {
    const filamentGeo = new THREE.TorusGeometry(0.15, 0.03, 16, 32);
    parts.value.filament = markRaw(new THREE.Mesh(
        filamentGeo,
        createMaterial(vc.material.filament, true) // emissive
    ));
    parts.value.filament.rotation.x = Math.PI / 2;
    group.add(parts.value.filament);
  }

  // 3. Цоколь
  if (vc.material?.base) {
    const baseGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.3, 16);
    parts.value.base = markRaw(new THREE.Mesh(
        baseGeo,
        createMaterial(vc.material.base, false)
    ));
    parts.value.base.position.y = -0.65;
    group.add(parts.value.base);
  }

  // 4. Точечный свет (визуальный эффект)
  if (vc.light) {
    parts.value.light = markRaw(new THREE.PointLight(
        vc.light.color ?? 0xffffcc,
        0,  // intensity обновляется в updateVisuals
        vc.light.distance ?? 10,
        2
    ));
    parts.value.light.position.set(0, 0, 0);
    group.add(parts.value.light);
  }

  // Масштаб из конфига
  if (vc.scale) {
    group.scale.setScalar(vc.scale);
  }

  mesh.value = markRaw(group);

  // ✅ Добавляем в переданную сцену
  if (props.scene?.add) {
    props.scene.add(mesh.value);
  }

  // Применяем начальный статус
  updateVisuals();

  return mesh.value;
};

// === ОБНОВЛЕНИЕ ВИЗУАЛА ПО СТАТУСУ ===
const updateVisuals = () => {
  const vc = props.visualConfig;
  const colors = vc.colors || {};
  const isOn = props.status === 'ON';
  const isSleeping = props.status === 'SLEEPING';
  const intensityFactor = props.intensity / 100;

  // Цвета по статусу
  const activeColor = isOn ? colors.on : (isSleeping ? colors.sleeping : colors.off);

  // 1. Стеклянная колба
  if (parts.value.glass?.material) {
    parts.value.glass.material.color.setHex(isOn ? 0xffffff : 0x888888);
    parts.value.glass.material.opacity = isOn ? 0.8 : 0.4;
    parts.value.glass.material.needsUpdate = true;
  }

  // 2. Нить накаливания (свечение)
  if (parts.value.filament?.material) {
    parts.value.filament.material.color.setHex(activeColor);
    parts.value.filament.material.emissive.setHex(activeColor);
    parts.value.filament.material.opacity = isOn ? (0.3 + intensityFactor * 0.7) : 0.1;
    parts.value.filament.material.needsUpdate = true;
  }

  // 3. Свет
  if (parts.value.light) {
    parts.value.light.intensity = isOn ? (0.5 + intensityFactor * 1.5) : 0;
    parts.value.light.color.setHex(activeColor);
  }

  // 4. Пульсация в SLEEPING
  if (isSleeping && parts.value.filament?.material) {
    const pulse = 0.3 + 0.2 * Math.sin(Date.now() * 0.003);
    parts.value.filament.material.opacity = pulse;
    parts.value.filament.material.needsUpdate = true;
  }
};

// === LIFECYCLE ===
onMounted(() => {
  if (!props.scene?.add) {
    console.warn('[BulbBaseThree] Scene not ready');
    return;
  }

  try {
    createModel();
    emit('model-ready', { type: 'bulb-base', status: props.status });
  } catch (error) {
    console.error('[BulbBaseThree] Creation error:', error);
    emit('model-ready', { error: error.message });
  }
});

onUnmounted(() => {
  // Очистка
  if (mesh.value && props.scene?.remove) {
    props.scene.remove(mesh.value);
    mesh.value.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose?.();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose?.());
        } else {
          obj.material.dispose?.();
        }
      }
    });
  }
  mesh.value = null;
  parts.value = {};
});

// === WATCH: Реакция на изменения данных ===
watch(() => [props.status, props.intensity, props.voltage], () => {
  if (mesh.value) {
    updateVisuals();
    emit('model-update', { status: props.status, intensity: props.intensity });
  }
}, { deep: true });

// Экспортируем метод для внешних обновлений
defineExpose({
  updateVisuals,
  getMesh: () => mesh.value
});
</script>

<style scoped>
.bulb-base-three {
  width: v-bind(width);
  height: v-bind(height);
  /* Пустой контейнер — всё рендерится в общую сцену */
}
</style>
