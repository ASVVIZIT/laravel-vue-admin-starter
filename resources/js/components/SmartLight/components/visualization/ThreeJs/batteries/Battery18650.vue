<template>
  <div class="three-scene-container" ref="container"></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { checkWebGLSupport, initWhenReady } from '@components/SmartLight/api/core/utils/coreApiWebglSupportUtils.js';

const props = defineProps({
  deviceId: { type: String, required: true },
  voltage: { type: Number, default: 3.7 },
  criticalVoltage: { type: Number, default: 3.2 }
});

const container = ref(null);
let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let battery = null;
let batteryFill = null;
let batteryCritical = null;
let batteryCap = null;
let batteryMark = null;
let animationFrame = null;

const webGLCheck = checkWebGLSupport();
const webGLSupported = webGLCheck.isSupported;

const batteryProgress = computed(() => {
  const minVoltage = 2.5;
  const maxVoltage = 4.3;
  return Math.min(100, Math.max(0,
      ((props.voltage - minVoltage) / (maxVoltage - minVoltage)) * 100
  ));
});

const batteryColor = computed(() => {
  if (props.voltage < 2.7) return '#f56c6c';
  if (props.voltage < 3.0) return '#e6a23c';
  return '#67c23a';
});

const criticalProgress = computed(() => {
  if (props.voltage >= props.criticalVoltage) return 0;
  const minVoltage = 2.5;
  return Math.min(100, Math.max(0,
      ((props.criticalVoltage - props.voltage) / (props.criticalVoltage - minVoltage)) * 100
  ));
});

const createBatteryModel = () => {
  const batteryGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 32);
  const batteryMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f7fa,
    roughness: 0.8,
    metalness: 0.2
  });

  battery = new THREE.Mesh(batteryGeometry, batteryMaterial);
  battery.rotation.x = Math.PI / 2;
  scene.add(battery);

  const fillGeometry = new THREE.CylinderGeometry(0.45, 0.45, 3.9, 32);
  const fillMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x67c23a,
    transparent: true,
    opacity: 0.7,
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 1.0
  });

  batteryFill = new THREE.Mesh(fillGeometry, fillMaterial);
  batteryFill.position.z = -0.1;
  scene.add(batteryFill);

  const criticalGeometry = new THREE.CylinderGeometry(0.45, 0.45, 3.9, 32);
  const criticalMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf56c6c,
    transparent: true,
    opacity: 0.7,
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 1.0
  });

  batteryCritical = new THREE.Mesh(criticalGeometry, criticalMaterial);
  batteryCritical.position.z = -0.1;
  scene.add(batteryCritical);

  const capGeometry = new THREE.CylinderGeometry(0.55, 0.5, 0.1, 32);
  const capMaterial = new THREE.MeshStandardMaterial({
    color: 0xffa640,
    roughness: 0.5,
    metalness: 0.8
  });

  batteryCap = new THREE.Mesh(capGeometry, capMaterial);
  batteryCap.position.y = 2;
  scene.add(batteryCap);

  const markGeometry = new THREE.BoxGeometry(0.5, 0.02, 0.05);
  const markMaterial = new THREE.MeshBasicMaterial({
    color: 0xe6a23c,
    transparent: true,
    opacity: 0.8
  });

  batteryMark = new THREE.Mesh(markGeometry, markMaterial);
  batteryMark.position.y = calculateCriticalPosition();
  scene.add(batteryMark);
};

const calculateCriticalPosition = () => {
  const minVoltage = 2.5;
  const maxVoltage = 4.3;
  const criticalVoltage = 3.2;
  const voltageRange = maxVoltage - minVoltage;
  return ((criticalVoltage - minVoltage) / voltageRange) * 4 - 2;
};

const updateFill = () => {
  if (!batteryFill || !batteryCritical) return;

  const normalHeight = batteryProgress.value - criticalProgress.value;

  batteryFill.scale.set(1, normalHeight / 100, 1);
  batteryFill.position.y = (normalHeight / 100) * 2 - 2;

  batteryCritical.scale.set(1, criticalProgress.value / 100, 1);
  batteryCritical.position.y = (criticalProgress.value / 100) * 2 - 2;

  batteryMark.position.y = calculateCriticalPosition();
};

const onWindowResize = () => {
  if (!container.value || !camera || !renderer) return;
  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
};

const animate = () => {
  animationFrame = requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

const cleanup = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
    renderer = null;
  }
  if (container.value && container.value.firstChild) {
    container.value.removeChild(container.value.firstChild);
  }
  if (scene) {
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    scene = null;
  }
  if (controls) {
    controls.dispose();
    controls = null;
  }
  window.removeEventListener('resize', onWindowResize);
};

const init = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f7fa);

  camera = new THREE.PerspectiveCamera(
      75,
      container.value.clientWidth / container.value.clientHeight,
      0.1,
      1000
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;

  container.value.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  createBatteryModel();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  window.addEventListener('resize', onWindowResize);
};

onMounted(() => {
  if (webGLSupported) {
    const { ready } = initWhenReady(container.value, init);
    ready.then(isReady => {
      if (isReady) animate();
    });
  }
});

onUnmounted(() => {
  cleanup();
});

watch(() => props.voltage, updateFill);
watch(() => props.criticalVoltage, updateFill);
</script>

<style scoped>
.three-scene-container {
  width: 100%;
  height: 100%;
  min-width: 80px;
  min-height: 50px;
  position: relative;
  overflow: hidden;
}
</style>
