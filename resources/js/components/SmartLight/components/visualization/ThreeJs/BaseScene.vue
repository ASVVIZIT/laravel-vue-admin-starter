<template>
  <div class="three-scene-container" ref="container">
    <div v-show="showResetButton" class="camera-reset-btn" @click="resetCamera" title="Сбросить камеру">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { checkContainerReady } from '@components/SmartLight/api/core/utils/coreApiWebglSupportUtils.js';
import { getBatteryTypeById } from '@components/SmartLight/stores/smartlight/types/batteryTypes.js';
import { getBulbTypeById } from '@components/SmartLight/stores/smartlight/types/bulbTypes.js';

const props = defineProps({
  deviceId: { type: String, required: true },
  visualizationType: {
    type: String,
    default: 'battery',
    validator: v => ['battery', 'bulb'].includes(v)
  },
  batteryTypeId: { type: String, default: 'li-ion-18650' },
  bulbTypeId: { type: String, default: 'classic' },
  voltage: { type: Number, default: 3.7 },
  criticalVoltage: { type: Number, default: 3.2 },
  status: { type: String, default: 'OFF' },
  intensity: { type: Number, default: 100 },
  show3D: { type: Boolean, default: true }
});

const container = ref(null);
const showResetButton = ref(false);

let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let model = null;
let modelFill = null;
let modelLight = null;
let animationFrame = null;
let isInitialized = false;

let defaultCameraPosition = null;
let defaultCameraTarget = null;

// ✅ МАСШТАБЫ МОДЕЛЕЙ
const BATTERY_SCALE = 1.15;
const BULB_SCALE = 1.5;

// ✅ ПОЗИЦИИ КАМЕРЫ (компактные для карточки 170px)
const BATTERY_CAMERA_Z = 3.35;  // Было 3.2, +4% = 3.35 (дальше)
const BULB_CAMERA_Z = 3.05;     // Было 3.2, -5% = 3.05 (ближе)
const BULB_CAMERA_Y = 0.55;     // Было 0.6, -3% = 0.55 (ниже)

const batteryType = computed(() => getBatteryTypeById(props.batteryTypeId));
const bulbType = computed(() => getBulbTypeById(props.bulbTypeId));

const batteryProgress = () => {
  const min = batteryType.value.minVoltage;
  const max = batteryType.value.maxVoltage;
  return Math.min(100, Math.max(0, ((props.voltage - min) / (max - min)) * 100));
};

const bulbIntensity = () => {
  if (props.status === 'OFF') return 0;
  if (props.status === 'SLEEPING') return 0.3 * (props.intensity / 100);
  return 0.8 * (props.intensity / 100);
};

const checkCameraChanged = () => {
  if (!defaultCameraPosition || !camera) return;

  const posChanged = Math.abs(camera.position.x - defaultCameraPosition.x) > 0.1 ||
      Math.abs(camera.position.y - defaultCameraPosition.y) > 0.1 ||
      Math.abs(camera.position.z - defaultCameraPosition.z) > 0.1;

  const targetChanged = controls && (
      Math.abs(controls.target.x - defaultCameraTarget.x) > 0.1 ||
      Math.abs(controls.target.y - defaultCameraTarget.y) > 0.1 ||
      Math.abs(controls.target.z - defaultCameraTarget.z) > 0.1
  );

  showResetButton.value = posChanged || targetChanged;
};

const resetCamera = () => {
  if (!camera || !controls || !defaultCameraPosition) return;
  camera.position.copy(defaultCameraPosition);
  controls.target.copy(defaultCameraTarget);
  controls.update();
  showResetButton.value = false;
};

const createBatteryModel = () => {
  console.log('[ThreeScene] Creating BATTERY model', { scale: BATTERY_SCALE });

  const vf = batteryType.value.visualFeatures;
  model = new THREE.Group();

  const bodyGeometry = new THREE.CylinderGeometry(0.5 * BATTERY_SCALE, 0.5 * BATTERY_SCALE, 4 * BATTERY_SCALE, 32);
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(vf.baseColor || '#f5f7fa'),
    transparent: true,
    opacity: 0.25,
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });
  const batteryBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
  model.add(batteryBody);

  const fillGeometry = new THREE.CylinderGeometry(0.42 * BATTERY_SCALE, 0.42 * BATTERY_SCALE, 3.8 * BATTERY_SCALE, 32);
  const fillMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(vf.liquidColor || '#67c23a'),
    transparent: true,
    opacity: 0.9,
    roughness: 0.3,
    metalness: 0.2,
    clearcoat: 0.5
  });
  modelFill = new THREE.Mesh(fillGeometry, fillMaterial);
  modelFill.position.y = -0.15 * BATTERY_SCALE;
  model.add(modelFill);

  const capGeometry = new THREE.CylinderGeometry(0.52 * BATTERY_SCALE, 0.52 * BATTERY_SCALE, 0.15 * BATTERY_SCALE, 32);
  const capMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(vf.capColor || '#ffa640'),
    roughness: 0.4,
    metalness: 0.8
  });
  const batteryCap = new THREE.Mesh(capGeometry, capMaterial);
  batteryCap.position.y = 2.05 * BATTERY_SCALE;
  model.add(batteryCap);

  const bottomGeometry = new THREE.CylinderGeometry(0.5 * BATTERY_SCALE, 0.5 * BATTERY_SCALE, 0.1 * BATTERY_SCALE, 32);
  const bottomMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.5,
    metalness: 0.6
  });
  const batteryBottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
  batteryBottom.position.y = -2.05 * BATTERY_SCALE;
  model.add(batteryBottom);

  const markGeometry = new THREE.TorusGeometry(0.43 * BATTERY_SCALE, 0.03 * BATTERY_SCALE, 16, 32);
  const markMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(vf.criticalColor || '#e6a23c'),
    transparent: true,
    opacity: 0.8
  });
  const batteryMark = new THREE.Mesh(markGeometry, markMaterial);
  batteryMark.rotation.x = Math.PI / 2;
  batteryMark.position.y = calculateCriticalPosition();
  model.add(batteryMark);

  scene.add(model);
  updateBatteryFill();
};

const createBulbModel = () => {
  console.log('[ThreeScene] Creating BULB model', { scale: BULB_SCALE });

  const vf = bulbType.value.visualFeatures;
  const glassVf = vf.glass || {};
  const filamentVf = vf.filament || {};
  const lightVf = vf.light || {};
  const baseVf = vf.base || {};

  model = new THREE.Group();

  const glassGeometry = new THREE.SphereGeometry(0.5 * BULB_SCALE, 32, 32);
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(glassVf.baseColor || '#ffffff'),
    transparent: true,
    opacity: glassVf.glassOpacity || 0.4,
    roughness: glassVf.roughness || 0.1,
    metalness: glassVf.metalness || 0.05,
    clearcoat: glassVf.clearcoat || 1.0,
    clearcoatRoughness: glassVf.clearcoatRoughness || 0.1,
    transmission: glassVf.transmission || 0.9
  });
  const bulbGlass = new THREE.Mesh(glassGeometry, glassMaterial);
  bulbGlass.position.y = 0.5 * BULB_SCALE;
  model.add(bulbGlass);

  if (filamentVf.visible !== false) {
    const filamentGeometry = new THREE.TorusGeometry(0.15 * BULB_SCALE, 0.025 * BULB_SCALE, 16, 32, Math.PI * 0.8);
    const filamentMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(filamentVf.color || '#ffff00'),
      transparent: true,
      opacity: filamentVf.glow ? (bulbIntensity() > 0 ? 1 : 0.3) : 1
    });
    const filament = new THREE.Mesh(filamentGeometry, filamentMaterial);
    filament.rotation.x = Math.PI / 2;
    filament.position.y = 0.45 * BULB_SCALE;
    model.add(filament);
    modelFill = filament;
  }

  if (lightVf.type === 'point') {
    modelLight = new THREE.PointLight(
        new THREE.Color(lightVf.color || '#ffffcc'),
        bulbIntensity() * (lightVf.intensity || 1),
        lightVf.distance || 10
    );
    modelLight.position.set(0, 0.45 * BULB_SCALE, 0);
    model.add(modelLight);
  }

  if (filamentVf.supportInner) {
    const holderGeometry = new THREE.CylinderGeometry(0.02 * BULB_SCALE, 0.02 * BULB_SCALE, 0.3 * BULB_SCALE, 8);
    const holderMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.7,
      metalness: 0.5
    });
    const holder = new THREE.Mesh(holderGeometry, holderMaterial);
    holder.position.y = 0.35 * BULB_SCALE;
    model.add(holder);
  }

  const baseGeometry = new THREE.CylinderGeometry(0.25 * BULB_SCALE, 0.25 * BULB_SCALE, 0.4 * BULB_SCALE, 16);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(baseVf.color || '#555555'),
    roughness: 0.6,
    metalness: baseVf.material === 'metal' ? 0.8 : 0.5
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = -0.2 * BULB_SCALE;
  model.add(base);

  if (baseVf.threading) {
    const threadGeometry = new THREE.TorusGeometry(0.26 * BULB_SCALE, 0.02 * BULB_SCALE, 8, 32);
    const threadMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.5,
      metalness: 0.8
    });
    const thread1 = new THREE.Mesh(threadGeometry, threadMaterial);
    thread1.rotation.x = Math.PI / 2;
    thread1.position.y = -0.1 * BULB_SCALE;
    model.add(thread1);

    const thread2 = new THREE.Mesh(threadGeometry.clone(), threadMaterial);
    thread2.rotation.x = Math.PI / 2;
    thread2.position.y = -0.3 * BULB_SCALE;
    model.add(thread2);
  }

  const contactGeometry = new THREE.SphereGeometry(0.08 * BULB_SCALE, 16, 16);
  const contactMaterial = new THREE.MeshStandardMaterial({
    color: 0xffa640,
    roughness: 0.3,
    metalness: 0.9
  });
  const contact = new THREE.Mesh(contactGeometry, contactMaterial);
  contact.position.y = -0.42 * BULB_SCALE;
  model.add(contact);

  scene.add(model);
  updateBulbGlow();
};

const calculateCriticalPosition = () => {
  const min = batteryType.value.minVoltage;
  const max = batteryType.value.maxVoltage;
  const voltageRange = max - min;
  const progress = (props.criticalVoltage - min) / voltageRange;
  return (progress * 3.6 * BATTERY_SCALE) - 1.8 * BATTERY_SCALE;
};

const updateBatteryFill = () => {
  if (!modelFill) return;
  const progress = batteryProgress() / 100;
  const scale = Math.max(0.05, progress);
  modelFill.scale.set(1, scale, 1);
  modelFill.position.y = (scale * 1.9 * BATTERY_SCALE) - 1.9 * BATTERY_SCALE;

  const vf = batteryType.value.visualFeatures;
  if (progress < 0.3) {
    modelFill.material.color.set(new THREE.Color(vf.criticalColor || '#f56c6c'));
  } else if (progress < 0.6) {
    modelFill.material.color.set(0xe6a23c);
  } else {
    modelFill.material.color.set(new THREE.Color(vf.liquidColor || '#67c23a'));
  }
};

const updateBulbGlow = () => {
  if (!modelFill || !modelLight) return;
  const intensity = bulbIntensity();
  const vf = bulbType.value.visualFeatures;
  const filamentVf = vf.filament || {};
  const lightVf = vf.light || {};
  const glassVf = vf.glass || {};

  if (filamentVf.glow) {
    modelFill.material.opacity = intensity > 0 ? 1 : 0.3;
  }
  modelLight.intensity = intensity * (lightVf.intensity || 1);

  if (props.status === 'SLEEPING') {
    const color = new THREE.Color(vf.filament?.criticalColor || '#ff9800');
    modelLight.color.set(color);
    if (modelFill) modelFill.material.color.set(color);
  } else if (props.status === 'OFF') {
    const color = new THREE.Color(glassVf.offColor || '#666666');
    modelLight.color.set(color);
    if (modelFill) modelFill.material.color.set(color);
  } else {
    const color = new THREE.Color(filamentVf.color || '#ffff00');
    modelLight.color.set(color);
    if (modelFill) modelFill.material.color.set(color);
  }
};

const updateModel = () => {
  if (!model) return;
  if (props.visualizationType === 'battery') {
    updateBatteryFill();
  } else {
    updateBulbGlow();
  }
};

const init = () => {
  if (!container.value || isInitialized) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f7fa);

  camera = new THREE.PerspectiveCamera(
      75,
      container.value.clientWidth / container.value.clientHeight,
      0.1,
      1000
  );

  // ✅ КАМЕРА — РАЗНЫЕ ПОЗИЦИИ ДЛЯ БАТАРЕИ И ЛАМПЫ
  if (props.visualizationType === 'battery') {
    camera.position.set(0, 0.6, BATTERY_CAMERA_Z);  // Дальше на 4%
  } else {
    camera.position.set(0, BULB_CAMERA_Y, BULB_CAMERA_Z);  // Ближе на 5%, ниже на 3%
  }
  camera.lookAt(0, 0, 0);

  defaultCameraPosition = camera.position.clone();
  defaultCameraTarget = new THREE.Vector3(0, 0, 0);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;

  container.value.innerHTML = '';
  container.value.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(3, 3, 3);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const backLight = new THREE.DirectionalLight(0xffffff, 0.6);
  backLight.position.set(-2, 1, -2);
  scene.add(backLight);

  if (props.visualizationType === 'battery') {
    createBatteryModel();
  } else {
    createBulbModel();
  }

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 3;
  controls.enablePan = false;
  controls.target.set(0, 0, 0);

  controls.addEventListener('change', checkCameraChanged);

  window.addEventListener('resize', onWindowResize);
  isInitialized = true;
};

const onWindowResize = () => {
  if (!container.value || !camera || !renderer) return;
  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
};

const animate = () => {
  animationFrame = requestAnimationFrame(animate);
  if (scene && camera && renderer) {
    updateModel();
    controls.update();
    renderer.render(scene, camera);
  }
};

const cleanup = () => {
  if (animationFrame) { cancelAnimationFrame(animationFrame); animationFrame = null; }
  if (renderer) { renderer.dispose(); renderer.forceContextLoss(); renderer = null; }
  if (container.value) container.value.innerHTML = '';
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
    controls.removeEventListener('change', checkCameraChanged);
    controls.dispose();
    controls = null;
  }
  model = null; modelFill = null; modelLight = null;
  window.removeEventListener('resize', onWindowResize);
  isInitialized = false;
  showResetButton.value = false;
};

const init3D = () => {
  if (props.show3D && !isInitialized) {
    nextTick(() => {
      if (checkContainerReady(container.value)) { init(); animate(); }
      else { setTimeout(init3D, 100); }
    });
  }
};

const cleanup3D = () => { cleanup(); };

watch(() => props.batteryTypeId, () => {
  if (isInitialized && props.visualizationType === 'battery') {
    cleanup();
    setTimeout(() => init(), 50);
  }
});

watch(() => props.bulbTypeId, () => {
  if (isInitialized && props.visualizationType === 'bulb') {
    cleanup();
    setTimeout(() => init(), 50);
  }
});

watch(() => props.visualizationType, (newType, oldType) => {
  if (isInitialized) {
    cleanup();
    setTimeout(() => init(), 50);
  }
});

watch(() => props.show3D, (newVal, oldVal) => {
  if (newVal && !oldVal) { init3D(); }
  else if (!newVal && oldVal) { cleanup3D(); }
}, { immediate: true });

watch([() => props.voltage, () => props.status, () => props.intensity], () => {
  updateModel();
});

onMounted(() => { init3D(); });
onUnmounted(() => { cleanup3D(); });

defineExpose({ init3D, cleanup3D, resetCamera });
</script>

<style scoped>
.three-scene-container {
  width: 100%;
  aspect-ratio: 1 / 1;
  position: relative;
  overflow: hidden;
  padding: 2px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow:
      inset 0 1px 3px rgba(255, 255, 255, 0.8),
      inset 0 -1px 2px rgba(0, 0, 0, 0.05),
      0 2px 4px rgba(0, 0, 0, 0.08);
}

.camera-reset-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  background: linear-gradient(145deg, rgba(0, 0, 0, 0.75) 0%, rgba(20, 20, 20, 0.85) 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 999;
  transition: all 0.2s ease;
  box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.3),
      inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

.camera-reset-btn:hover {
  background: linear-gradient(145deg, rgba(64, 158, 255, 0.95) 0%, rgba(50, 140, 240, 0.9) 100%);
  border-color: #409eff;
  transform: scale(1.08);
  box-shadow:
      0 4px 12px rgba(64, 158, 255, 0.5),
      inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.camera-reset-btn:active {
  transform: scale(0.95);
}
</style>
