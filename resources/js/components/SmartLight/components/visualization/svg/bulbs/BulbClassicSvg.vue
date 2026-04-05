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
          <div class="bulb-filament-container">
            <div class="bulb-filament-support">
              <div class="bulb-filament-support-inner"></div>
            </div>
            <div class="bulb-filament">
              <div class="bulb-filament-inner"></div>
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
let bulb = null, filament = null, bulbLight = null, animationFrame = null;

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
    return 'radial-gradient(circle, rgba(255, 165, 0, 0.8) 0%, rgba(255, 140, 0, 0) 70%)';
  }
  return 'radial-gradient(circle, rgba(255, 220, 150, 0.9) 0%, rgba(255, 200, 100, 0) 70%)';
});

const createBulbModel = () => {
  const bulbGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const bulbMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transparent: true, opacity: 0.9,
    roughness: 0.1, metalness: 0.1, clearcoat: 1.0, clearcoatRoughness: 0.1
  });
  bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
  scene.add(bulb);

  const filamentGeometry = new THREE.TorusGeometry(0.1, 0.05, 16, 32, Math.PI * 0.8);
  const filamentMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.8
  });
  filament = new THREE.Mesh(filamentGeometry, filamentMaterial);
  filament.rotation.x = Math.PI / 2;
  filament.position.y = 0.2;
  scene.add(filament);

  bulbLight = new THREE.PointLight(0xffffcc, 1, 10);
  bulbLight.position.copy(bulb.position);
  scene.add(bulbLight);
};

const updateBulbStatus = () => {
  if (!bulb || !filament || !bulbLight) return;
  if (status.value === 'OFF') {
    bulbLight.intensity = 0;
    filament.material.emissiveIntensity = 0;
  } else {
    bulbLight.intensity = intensity.value / 100;
    filament.material.emissiveIntensity = 0.8 * (intensity.value / 100);
  }
  const color = status.value === 'SLEEPING' ? 0xff9800 : 0xffff00;
  filament.material.color.set(color);
  bulbLight.color.set(status.value === 'SLEEPING' ? 0xff9800 : 0xffffcc);
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
.bulb-3d-container, .css-bulb-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
.three-scene-container {
  width: 100%;
  height: 100%;
  min-width: 80px;
  min-height: 120px;
}
.css-bulb-container {
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
  background: linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%);
  box-shadow: 0 0 5px 1px rgba(255, 255, 255, 0.7) inset, 0 0 15px rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
}
.bulb-filament-container {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 30%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.bulb-filament-support {
  width: 100%;
  height: 20%;
  border-radius: 4px;
  background: linear-gradient(to bottom, #888, #333);
}
.bulb-filament-support-inner {
  width: 100%;
  height: 40%;
  background: linear-gradient(to bottom, #aaa, #666);
  border-radius: 2px;
}
.bulb-filament {
  width: 100%;
  height: 20%;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  position: relative;
}
.bulb-filament-inner {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, #ffcc00 0%, #ffffff 100%);
  border-radius: 4px;
  box-shadow: 0 0 15px #ffcc00;
  animation: filament-glow 2s infinite alternate;
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
.bulb-status-off .bulb-glass-inner {
  background: linear-gradient(135deg, #e6e6e6 0%, #d1d1d1 100%);
  box-shadow: none;
}
.bulb-status-off .bulb-filament-inner {
  background: linear-gradient(to top, #666 0%, #333 100%);
  box-shadow: none;
}
.bulb-status-off .bulb-glow { opacity: 0; }
.bulb-status-sleeping .bulb-glass-inner {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
}
.bulb-status-sleeping .bulb-filament-inner {
  background: linear-gradient(to top, #ff9800 0%, #ffcc99 100%);
  box-shadow: 0 0 15px #ff9800;
}
.bulb-status-sleeping .bulb-glow {
  background: radial-gradient(circle, rgba(255, 165, 0, 0.8) 0%, rgba(255, 140, 0, 0) 70%);
  box-shadow: 0 0 30px 15px rgba(255, 165, 0, 0.7), 0 0 60px 30px rgba(255, 165, 0, 0.4);
}
@keyframes filament-glow {
  0% { opacity: 0.7; }
  100% { opacity: 1; }
}
.bulb-status-on .bulb-filament-inner,
.bulb-status-sleeping .bulb-filament-inner {
  animation: filament-glow 2s infinite alternate;
}
</style>
