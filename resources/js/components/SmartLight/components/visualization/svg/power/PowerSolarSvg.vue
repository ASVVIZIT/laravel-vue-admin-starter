<template>
  <div class="power-solar-three"></div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

const props = defineProps({
  voltage: { type: Number, default: 12 },
  status: { type: String, default: 'OFF' },
  scene: { type: Object, required: true },
  camera: { type: Object },
  renderer: { type: Object }
});

const emit = defineEmits(['model-ready', 'model-update']);

let powerModel = null;
let sun = null;

const createModel = () => {
  powerModel = new THREE.Group();

  // Солнечная панель
  const panelGeometry = new THREE.BoxGeometry(1.2, 0.05, 0.8);
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a237e,
    roughness: 0.3,
    metalness: 0.5
  });
  const panel = new THREE.Mesh(panelGeometry, panelMaterial);
  panel.rotation.x = Math.PI / 6;
  powerModel.add(panel);

  // Ячейки
  const cellGeometry = new THREE.PlaneGeometry(0.35, 0.25);
  const cellMaterial = new THREE.MeshStandardMaterial({
    color: 0x283593,
    roughness: 0.2,
    metalness: 0.6
  });

  for (let x = -0.4; x <= 0.4; x += 0.4) {
    for (let z = -0.25; z <= 0.25; z += 0.5) {
      const cell = new THREE.Mesh(cellGeometry, cellMaterial);
      cell.position.set(x, 0.03, z);
      cell.rotation.x = Math.PI / 2;
      powerModel.add(cell);
    }
  }

  // Солнце
  const sunGeometry = new THREE.SphereGeometry(0.15, 16, 16);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xff9800,
    transparent: true,
    opacity: 0.6
  });
  sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.position.set(0.5, 0.5, 0.5);
  powerModel.add(sun);

  props.scene.add(powerModel);
  updateModel();
  emit('model-ready', { model: powerModel });
};

const updateModel = () => {
  if (!sun) return;
  if (props.status === 'ON' || props.status === 'ACTIVE') {
    sun.material.opacity = 0.8;
    sun.scale.set(1.2, 1.2, 1.2);
  } else {
    sun.material.opacity = 0.3;
    sun.scale.set(1, 1, 1);
  }
  emit('model-update', { status: props.status });
};

const animate = () => {
  if (powerModel) {
    powerModel.rotation.y += 0.005;
    powerModel.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
  }
  if (sun) {
    sun.rotation.y += 0.01;
  }
};

const dispose = () => {
  if (powerModel) {
    props.scene.remove(powerModel);
    powerModel.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
  }
};

onMounted(() => { createModel(); });
onUnmounted(() => { dispose(); });

defineExpose({ updateModel, animate, dispose });
</script>

<style scoped>
.power-solar-three {
  width: 100%;
  height: 100%;
}
</style>
