<template>
  <div class="power-ac220v-three"></div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

const props = defineProps({
  voltage: { type: Number, default: 220 },
  status: { type: String, default: 'OFF' },
  scene: { type: Object, required: true },
  camera: { type: Object },
  renderer: { type: Object }
});

const emit = defineEmits(['model-ready', 'model-update']);

let powerModel = null;
let indicator = null;

const createModel = () => {
  powerModel = new THREE.Group();

  // Корпус розетки
  const socketGeometry = new THREE.BoxGeometry(1, 1.2, 0.3);
  const socketMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
    metalness: 0.3
  });
  const socket = new THREE.Mesh(socketGeometry, socketMaterial);
  powerModel.add(socket);

  // Отверстия
  const holeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 16);
  const holeMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

  const leftHole = new THREE.Mesh(holeGeometry, holeMaterial);
  leftHole.position.set(-0.25, 0.1, 0.16);
  leftHole.rotation.x = Math.PI / 2;
  powerModel.add(leftHole);

  const rightHole = new THREE.Mesh(holeGeometry, holeMaterial);
  rightHole.position.set(0.25, 0.1, 0.16);
  rightHole.rotation.x = Math.PI / 2;
  powerModel.add(rightHole);

  // Индикатор
  const indicatorGeometry = new THREE.SphereGeometry(0.08, 16, 16);
  const indicatorMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
  indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
  indicator.position.set(0.35, 0.4, 0.16);
  powerModel.add(indicator);

  props.scene.add(powerModel);
  updateModel();
  emit('model-ready', { model: powerModel });
};

const updateModel = () => {
  if (!indicator) return;
  if (props.status === 'ON' || props.status === 'ACTIVE') {
    indicator.material.color.setHex(0x67c23a);
    indicator.material.emissive = new THREE.Color(0x67c23a);
    indicator.material.emissiveIntensity = 0.5;
  } else if (props.status === 'ERROR') {
    indicator.material.color.setHex(0xf56c6c);
    indicator.material.emissive = new THREE.Color(0xf56c6c);
    indicator.material.emissiveIntensity = 0.5;
  } else {
    indicator.material.color.setHex(0x666666);
    indicator.material.emissive = new THREE.Color(0x000000);
    indicator.material.emissiveIntensity = 0;
  }
  emit('model-update', { status: props.status });
};

const animate = () => {
  if (powerModel) {
    powerModel.rotation.y += 0.005;
    powerModel.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
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
.power-ac220v-three {
  width: 100%;
  height: 100%;
}
</style>
