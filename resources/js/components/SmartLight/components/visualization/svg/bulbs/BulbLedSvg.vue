<template>
  <BaseBulb
      :status="status"
      :intensity="intensity"
      :device-id="deviceId"
      :show-3d="show3D"
  >
    <div v-if="webGLSupported && show3D" class="bulb-3d-container">
      <div class="three-scene-container" ref="container"></div>
    </div>
    <div v-else class="css-bulb-container">
      <div class="bulb-glass">
        <div class="bulb-glass-inner">
          <div class="led-board">
            <div class="led-dots">
              <div v-for="i in 8" :key="i" class="led-dot"></div>
            </div>
          </div>
          <div class="bulb-glow" :style="{ opacity: glowIntensity, background: glowGradient }"></div>
        </div>
      </div>
      <div class="bulb-base">
        <div class="bulb-base-inner">
          <div class="bulb-contact"></div>
        </div>
      </div>
      <div class="bulb-threading"></div>
    </div>
  </BaseBulb>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import BaseBulb from './BulbBaseSvg.vue';
import { useSmartlightStore } from '@components/SmartLight/stores/index.js';
import { checkWebGLSupport, initWhenReady } from '@components/SmartLight/api/core/utils/index.js';

const props = defineProps({
  status: { type: String, required: true, validator: v => ['ON', 'OFF', 'SLEEPING', 'FULL_ON'].includes(v) },
  intensity: { type: Number, default: 100 },
  deviceId: { type: String, required: true },
  show3D: { type: Boolean, default: true }
});

const container = ref(null);
let scene = null, camera = null, renderer = null, controls = null;
let bulb = null, ledBoard = null, bulbLight = null, animationFrame = null;

const store = useSmartlightStore();
const webGLSupported = checkWebGLSupport().isSupported;

const device = computed(() => store.deviceGetDevice(props.deviceId));
const status = computed(() => device.value?.status || props.status);
const intensity = computed(() => device.value?.intensity || props.intensity);

const glowIntensity = computed(() => {
  if (status.value === 'OFF') return 0;
  if (status.value === 'SLEEPING') return 0.3 * (intensity.value / 100);
  return 0.8 * (intensity.value / 100);
});

const glowGradient = computed(() => {
  if (status.value === 'OFF') return 'none';
  if (status.value === 'SLEEPING') {
    return 'radial-gradient(circle, rgba(144, 255, 255, 0.8) 0%, rgba(144, 200, 200, 0) 70%)';
  }
  return 'radial-gradient(circle, rgba(144, 220, 255, 0.9) 0%, rgba(144, 200, 255, 0) 70%)';
});

const createBulbModel = () => {
  const bulbGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.8, 32);
  const bulbMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transparent: true, opacity: 0.9,
    roughness: 0.1, metalness: 0.1, clearcoat: 1.0, clearcoatRoughness: 0.1
  });
  bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
  bulb.rotation.x = Math.PI / 2;
  scene.add(bulb);

  const boardGeometry = new THREE.PlaneGeometry(0.7, 0.1);
  const boardMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
  ledBoard = new THREE.Mesh(boardGeometry, boardMaterial);
  ledBoard.position.z = 0.3;
  scene.add(ledBoard);

  bulbLight = new THREE.PointLight(0x90e0ff, 1, 10);
  bulbLight.position.z = 0.3;
  scene.add(bulbLight);
};

const updateBulbStatus = () => {
  if (!bulb || !ledBoard || !bulbLight) return;
  bulbLight.intensity = status.value === 'OFF' ? 0 : intensity.value / 100;
  bulbLight.color.set(status.value === 'SLEEPING' ? 0x90c0e0 : 0x90e0ff);
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
  if (animationFrame) { cancelAnimationFrame(animationFrame); animationFrame = null; }
  if (renderer) { renderer.dispose(); renderer.forceContextLoss(); renderer = null; }
  if (container.value?.firstChild) { container.value.removeChild(container.value.firstChild); }
  if (scene) {
    scene.traverse(obj => {
      obj.geometry?.dispose();
      if (obj.material) {
        (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => m.dispose());
      }
    });
    scene = null;
  }
  if (controls) { controls.dispose(); controls = null; }
  window.removeEventListener('resize', onWindowResize);
};

const init = () => {
  if (!webGLSupported) return;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f7fa);
  camera = new THREE.PerspectiveCamera(75, container.value.clientWidth / container.value.clientHeight, 0.1, 1000);
  camera.position.z = 5;
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  container.value.appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  createBulbModel();
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  window.addEventListener('resize', onWindowResize);
};

onMounted(() => {
  if (webGLSupported && props.show3D) {
    const { ready } = initWhenReady(container.value, init);
    ready.then(isReady => { if (isReady) animate(); });
  }
});

onUnmounted(() => cleanup());

watch([status, intensity], updateBulbStatus);
watch(() => props.show3D, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    if (newVal && webGLSupported) { init(); animate(); } else { cleanup(); }
  }
});
</script>

<style scoped>
.css-bulb-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.bulb-glass {
  width: 100%;
  height: 70%;
  position: relative;
  display: flex;
  justify-content: center;
  border-radius: 50% 50% 0 0;
}
.bulb-glass-inner {
  width: 100%;
  height: 100%;
  border-radius: 50% 50% 0 0;
  background: linear-gradient(135deg, #e0f7ff 0%, #ffffff 100%);
  box-shadow: 0 0 5px 1px rgba(255, 255, 255, 0.7) inset, 0 0 15px rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
}
.led-board {
  width: 100%;
  height: 25%;
  position: absolute;
  top: 70%;
  background: #333;
  border-radius: 4px;
}
.led-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 4px;
}
.led-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #90e0ff;
  box-shadow: 0 0 8px #90e0ff;
}
.bulb-glow {
  position: absolute;
  width: 90%;
  height: 80%;
  border-radius: 50% 50% 0 0;
  top: 5%;
  left: 5%;
  z-index: 1;
  transition: opacity 0.5s ease;
}
.bulb-base {
  width: 70%;
  height: 25%;
  border-radius: 0 0 4px 4px;
  background: linear-gradient(to bottom, #444, #222);
  position: relative;
  top: -1px;
}
.bulb-base-inner {
  width: 100%;
  height: 70%;
  background: linear-gradient(to bottom, #555, #333);
  border-radius: 0 0 2px 2px;
  position: relative;
  top: 5%;
}
.bulb-contact {
  width: 30%;
  height: 40%;
  background: #e6a23c;
  border-radius: 50%;
  position: absolute;
  bottom: 10%;
  left: 35%;
  box-shadow: 0 0 3px 1px #ffcc00;
}
.bulb-threading {
  width: 80%;
  height: 10%;
  background: linear-gradient(to right, #333 20%, #555 20%, #555 40%, #333 40%, #333 60%, #555 60%, #555 80%, #333 80%);
  border-radius: 0 0 2px 2px;
  position: absolute;
  bottom: 0;
}
</style>
