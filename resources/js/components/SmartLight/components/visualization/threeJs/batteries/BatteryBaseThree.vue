<template>
  <div class="battery-base-three" :style="{ width, height }"></div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, defineProps, defineEmits, shallowRef, markRaw } from 'vue';
import * as THREE from 'three';

const props = defineProps({
  three: { type: Object, required: true },
  scene: { type: Object, required: true },
  camera: { type: Object, default: null },
  renderer: { type: Object, default: null },
  visualConfig: { type: Object, default: () => ({}) },
  specs: { type: Object, default: () => ({ minVoltage: 2.5, maxVoltage: 4.2 }) },
  voltage: { type: Number, default: 3.7 },
  status: { type: String, default: 'OFF' },
  width: { type: String, default: '80px' },
  height: { type: String, default: '80px' }
});

const emit = defineEmits(['model-ready', 'model-update']);
const mesh = shallowRef(null);
const parts = shallowRef({});

// === УРОВЕНЬ ЗАРЯДА ===
const getLevel = () => {
  const { minVoltage, maxVoltage } = props.specs;
  const v = Math.max(minVoltage, Math.min(maxVoltage, props.voltage));
  return (v - minVoltage) / (maxVoltage - minVoltage);
};

// === ЦВЕТ ПО ПОРОГУ ===
const getColorByLevel = (level) => {
  if (props.status === 'OFF') return props.visualConfig.colors.off;
  if (level >= 0.5) return props.visualConfig.colors.normal;
  if (level >= 0.2) return props.visualConfig.colors.warning;
  return props.visualConfig.colors.critical;
};

// === СОЗДАНИЕ МОДЕЛИ ===
const createModel = () => {
  const group = new THREE.Group();
  const cfg = props.visualConfig;
  const geo = cfg.geometry;
  const level = getLevel();

  if (cfg.type === 'battery-cylindrical') {
    // Корпус
    const bodyGeo = new THREE.CylinderGeometry(geo.radius, geo.radius, geo.height, geo.segments);
    const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0xf5f7fa, ...cfg.materials.body, side: THREE.DoubleSide });
    parts.value.body = markRaw(new THREE.Mesh(bodyGeo, bodyMat));
    group.add(parts.value.body);

    // Заливка
    const fillGeo = new THREE.CylinderGeometry(geo.radius * 0.95, geo.radius * 0.95, geo.height, geo.segments);
    const fillMat = new THREE.MeshStandardMaterial({ color: getColorByLevel(level), ...cfg.materials.fill });
    parts.value.fill = markRaw(new THREE.Mesh(fillGeo, fillMat));
    parts.value.fill.position.y = -geo.height / 2;
    parts.value.fill.scale.y = Math.max(0.01, level);
    parts.value.fill.userData = { isFill: true, h: geo.height };
    group.add(parts.value.fill);

    // Кольца порогов
    cfg.thresholds.forEach((t, i) => {
      const ringGeo = new THREE.TorusGeometry(geo.radius + 0.02, cfg.materials.ring.radius, 8, 32);
      const ringMat = new THREE.MeshStandardMaterial({ color: getColorByLevel(t), emissive: 0x000000, metalness: 0.5 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -geo.height / 2 + t * geo.height;
      ring.userData = { isRing: true, threshold: t };
      group.add(ring);
    });

    // Крышки
    const capGeo = new THREE.CylinderGeometry(geo.radius * 1.05, geo.radius * 1.05, 0.2, geo.segments);
    const capMat = new THREE.MeshStandardMaterial({ ...cfg.materials.cap });
    const topCap = new THREE.Mesh(capGeo, capMat); topCap.position.y = geo.height / 2 + 0.1;
    const botCap = new THREE.Mesh(capGeo, capMat); botCap.position.y = -geo.height / 2 - 0.1;
    group.add(topCap); group.add(botCap);
  }
  else if (cfg.type === 'battery-box') {
    // Свинцовокислотный / Li-Po
    const bodyGeo = new THREE.BoxGeometry(geo.width, geo.height, geo.depth);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x333333, transparent: true, ...cfg.materials.body });
    parts.value.body = markRaw(new THREE.Mesh(bodyGeo, bodyMat));
    group.add(parts.value.body);

    const fillGeo = new THREE.BoxGeometry(geo.width * 0.9, geo.height * 0.9, geo.depth * 0.9);
    const fillMat = new THREE.MeshStandardMaterial({ color: getColorByLevel(level), ...cfg.materials.fill });
    parts.value.fill = markRaw(new THREE.Mesh(fillGeo, fillMat));
    parts.value.fill.position.y = -geo.height / 2;
    parts.value.fill.scale.y = Math.max(0.01, level);
    parts.value.fill.userData = { isFill: true, h: geo.height };
    group.add(parts.value.fill);

    // Клеммы
    const termGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 12);
    const termMat = new THREE.MeshStandardMaterial({ ...cfg.materials.terminal });
    const p = new THREE.Mesh(termGeo, termMat); p.position.set(-0.8, geo.height/2 + 0.15, 0);
    const n = new THREE.Mesh(termGeo, termMat.clone()); n.position.set(0.8, geo.height/2 + 0.15, 0); n.material.color.set(0x333333);
    group.add(p); group.add(n);
  }

  mesh.value = markRaw(group);
  if (props.scene?.add) props.scene.add(mesh.value);
  updateVisuals();
  return mesh.value;
};

// === ОБНОВЛЕНИЕ ВИЗУАЛА ===
const updateVisuals = () => {
  if (!mesh.value || !parts.value.fill) return;
  const level = getLevel();
  const color = getColorByLevel(level);

  parts.value.fill.material.color.setHex(color);
  parts.value.fill.scale.y = Math.max(0.01, level);

  // Обновляем кольца
  mesh.value.children.forEach(c => {
    if (c.userData?.isRing) {
      c.material.color.setHex(getColorByLevel(c.userData.threshold));
      c.material.emissive.setHex(level >= c.userData.threshold ? color : 0x000000);
      c.material.emissiveIntensity = level >= c.userData.threshold ? 0.5 : 0;
    }
  });

  // Пульсация при <20%
  if (level < 0.2 && props.status !== 'OFF' && parts.value.fill.material) {
    parts.value.fill.material.opacity = 0.7 + 0.2 * Math.sin(Date.now() * 0.005);
    parts.value.fill.material.needsUpdate = true;
  }
};

// === LIFECYCLE ===
onMounted(() => { if (props.scene?.add) createModel(); emit('model-ready', { type: cfg.type, level: getLevel() }); });
onUnmounted(() => {
  if (mesh.value && props.scene?.remove) {
    props.scene.remove(mesh.value);
    mesh.value.traverse(o => { o.geometry?.dispose?.(); if(o.material) Array.isArray(o.material)?o.material.forEach(m=>m.dispose?.()):o.material.dispose?.(); });
  }
  mesh.value = null; parts.value = {};
});

watch(() => [props.voltage, props.status], () => { if(mesh.value) { updateVisuals(); emit('model-update', { voltage: props.voltage, level: getLevel() }); } });
defineExpose({ updateVisuals, getMesh: () => mesh.value, getLevel });
</script>

<style scoped>.battery-base-three{width:v-bind(width);height:v-bind(height)}</style>
