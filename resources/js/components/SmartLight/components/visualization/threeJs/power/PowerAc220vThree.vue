<template>
  <div ref="container" class="power-ac220v-three"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';

const props = defineProps({
  status: { type: String, default: 'OFF' },
  voltage: { type: Number, default: 220 }
});

const container = ref(null);
let scene, camera, renderer, socket, indicator;
let animationFrame;

const init = () => {
  if (!container.value) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f7fa);

  camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  camera.position.set(0, 0, 3);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(60, 80);

  container.value.innerHTML = '';
  container.value.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(3, 3, 3);
  scene.add(directionalLight);

  // Розетка (корпус)
  const socketGeometry = new THREE.BoxGeometry(1, 1.2, 0.3);
  const socketMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  socket = new THREE.Mesh(socketGeometry, socketMaterial);

  // Отверстия
  const holeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 16);
  const holeMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

  const leftHole = new THREE.Mesh(holeGeometry, holeMaterial);
  leftHole.position.set(-0.25, 0.1, 0.16);
  leftHole.rotation.x = Math.PI / 2;
  socket.add(leftHole);

  const rightHole = new THREE.Mesh(holeGeometry, holeMaterial);
  rightHole.position.set(0.25, 0.1, 0.16);
  rightHole.rotation.x = Math.PI / 2;
  socket.add(rightHole);

  // Индикатор
  const indicatorGeometry = new THREE.SphereGeometry(0.08, 16, 16);
  const indicatorMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
  indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
  indicator.position.set(0.35, 0.4, 0.16);
  socket.add(indicator);

  scene.add(socket);
  updateStatus();
  animate();
};

const updateStatus = () => {
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
};

const animate = () => {
  animationFrame = requestAnimationFrame(animate);
  if (socket) {
    socket.rotation.y += 0.005;
    socket.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
  }
  if (renderer && scene && camera) renderer.render(scene, camera);
};

const cleanup = () => {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  if (renderer) { renderer.dispose(); renderer.forceContextLoss(); }
  if (container.value) container.value.innerHTML = '';
};

watch(() => props.status, () => updateStatus());

onMounted(() => init());
onUnmounted(() => cleanup());
</script>

<style scoped>
.power-ac220v-three {
  width: 60px;
  height: 80px;
}
</style>
