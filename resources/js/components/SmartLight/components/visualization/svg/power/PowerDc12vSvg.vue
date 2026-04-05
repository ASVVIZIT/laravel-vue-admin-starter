<template>
  <div class="power-dc12v-three"></div>
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
let statusLed = null;

const createModel = () => {
  powerModel = new THREE.Group();

  // Блок питания
  const boxGeometry = new THREE.BoxGeometry(1, 0.6, 0.4);
  const boxMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.5,
    metalness: 0.3
  });
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  powerModel.add(box);

  // LED индикатор
  const ledGeometry = new THREE.SphereGeometry(0.05, 16, 16);
  const ledMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
  statusLed = new THREE.Mesh(ledGeometry, ledMaterial);
  statusLed.position.set(0.35, 0.2, 0.21);
  powerModel.add(statusLed);

  // Провода
  const wireGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
  const positiveMaterial = new THREE.MeshStandardMaterial({ color: 0xf56c6c });
  const negativeMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

  const positiveWire = new THREE.Mesh(wireGeometry, positiveMaterial);
  positiveWire.position.set(-0.2, -0.35, 0.2);
  positiveWire.rotation.x = Math.PI / 2;
  powerModel.add(positiveWire);

  const negativeWire = new THREE.Mesh(wireGeometry, negativeMaterial);
  negativeWire.position.set(0.2, -0.35, 0.2);
  negativeWire.rotation.x = Math.PI / 2;
  powerModel.add(negativeWire);

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
.power-dc12v-three {
  width: 100%;
  height: 100%;
}
</style>
