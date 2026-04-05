<template>
  <div class="power-dc24v-three"></div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

const props = defineProps({
  voltage: { type: Number, default: 24 },
  status: { type: String, default: 'OFF' },
  scene: { type: Object, required: true },
  camera: { type: Object },
  renderer: { type: Object }
});

const emit = defineEmits(['model-ready', 'model-update']);

let powerModel = null;
let statusLed = null;

const createModel = () => {
  powerModel = new THREE.Group();

  // Блок питания 24V (больше)
  const boxGeometry = new THREE.BoxGeometry(1.2, 0.7, 0.5);
  const boxMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d3436,
    roughness: 0.5,
    metalness: 0.4
  });
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  powerModel.add(box);

  // LED индикаторы (2 шт)
  const ledGeometry = new THREE.SphereGeometry(0.04, 16, 16);
  const powerLedMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
  statusLed = new THREE.Mesh(ledGeometry, powerLedMaterial);
  statusLed.position.set(0.45, 0.25, 0.26);
  powerModel.add(statusLed);

  const outputLedGeometry = new THREE.SphereGeometry(0.04, 16, 16);
  const outputLedMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
  const outputLed = new THREE.Mesh(outputLedGeometry, outputLedMaterial);
  outputLed.position.set(0.35, 0.25, 0.26);
  powerModel.add(outputLed);

  // 4 клеммы
  const terminalGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.15, 16);
  const positiveMaterial = new THREE.MeshStandardMaterial({ color: 0xf56c6c, roughness: 0.3, metalness: 0.7 });
  const negativeMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.7 });

  const positions = [
    { x: -0.4, z: 0.26, material: positiveMaterial },
    { x: -0.15, z: 0.26, material: positiveMaterial },
    { x: 0.15, z: 0.26, material: negativeMaterial },
    { x: 0.4, z: 0.26, material: negativeMaterial }
  ];

  positions.forEach((pos) => {
    const terminal = new THREE.Mesh(terminalGeometry, pos.material);
    terminal.position.set(pos.x, -0.35, pos.z);
    terminal.rotation.x = Math.PI / 2;
    powerModel.add(terminal);
  });

  // Радиатор
  const finGeometry = new THREE.BoxGeometry(0.1, 0.15, 0.05);
  const finMaterial = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.4, metalness: 0.6 });
  for (let i = 0; i < 5; i++) {
    const fin = new THREE.Mesh(finGeometry, finMaterial);
    fin.position.set(-0.4 + (i * 0.2), -0.4, 0);
    powerModel.add(fin);
  }

  props.scene.add(powerModel);
  updateModel();
  emit('model-ready', { model: powerModel });
};

const updateModel = () => {
  if (!statusLed) return;
  if (props.status === 'ON' || props.status === 'ACTIVE') {
    statusLed.material.color.setHex(0x67c23a);
    statusLed.material.emissive = new THREE.Color(0x67c23a);
    statusLed.material.emissiveIntensity = 0.5;
  } else if (props.status === 'ERROR') {
    statusLed.material.color.setHex(0xf56c6c);
    statusLed.material.emissive = new THREE.Color(0xf56c6c);
    statusLed.material.emissiveIntensity = 0.5;
  } else {
    statusLed.material.color.setHex(0x666666);
    statusLed.material.emissive = new THREE.Color(0x000000);
    statusLed.material.emissiveIntensity = 0;
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
.power-dc24v-three {
  width: 100%;
  height: 100%;
}
</style>
