<template>
  <div ref="container" class="power-base-three" :style="{ width: containerWidth, height: containerHeight }"></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, shallowRef } from 'vue';

const props = defineProps({
  three: { type: Object, required: true },
  scene: { type: Object, required: true },
  camera: { type: Object, default: null },
  renderer: { type: Object, default: null },
  visualConfig: { type: Object, required: true },
  specs: { type: Object, default: () => ({}) },
  voltage: { type: Number, default: 220 },
  status: { type: String, default: 'OFF' },
  width: { type: String, default: '80px' },
  height: { type: String, default: '80px' }
});

const emit = defineEmits(['model-ready', 'model-update']);

const container = ref(null);
const containerWidth = computed(() => props.width);
const containerHeight = computed(() => props.height);

const powerModel = shallowRef(null);
const statusLed = shallowRef(null);
const isDisposed = ref(false);

const createModel = () => {
  if (!props.scene || !props.three || isDisposed.value) return;

  const { geometry, material, scale } = props.visualConfig;
  powerModel.value = new props.three.Group();

  const dims = geometry.dimensions || { width: 1, height: 1, depth: 0.5 };
  let bodyGeo;

  if (geometry.type === 'box') {
    bodyGeo = new props.three.BoxGeometry(dims.width * scale, dims.height * scale, dims.depth * scale);
  } else {
    bodyGeo = new props.three.BoxGeometry(1 * scale, 0.8 * scale, 0.5 * scale);
  }

  const bodyMat = new props.three.MeshStandardMaterial(material.body);
  const body = new props.three.Mesh(bodyGeo, bodyMat);
  powerModel.value.add(body);

  // Индикатор статуса (LED)
  if (material.indicator) {
    const ledGeo = new props.three.SphereGeometry(0.05 * scale, 16, 16);
    const ledMat = new props.three.MeshBasicMaterial({ color: material.indicator.color || 0x666666 });
    statusLed.value = new props.three.Mesh(ledGeo, ledMat);
    statusLed.value.position.set(dims.width * scale * 0.4, dims.height * scale * 0.35, dims.depth * scale * 0.51);
    powerModel.value.add(statusLed.value);
  }

  props.scene.add(powerModel.value);
  updateModel();
  emit('model-ready', { model: powerModel.value });
};

const updateModel = () => {
  if (!statusLed.value || isDisposed.value) return;

  const { indicator } = props.visualConfig.material;
  let color = indicator.color || 0x666666;

  if (props.status === 'ON' || props.status === 'ACTIVE') {
    color = indicator.activeColor || 0x67c23a;
    statusLed.value.material.emissive = new props.three.Color(color);
    statusLed.value.material.emissiveIntensity = 0.8;
  } else if (props.status === 'ERROR') {
    color = props.visualConfig.colors.error || 0xf56c6c;
    statusLed.value.material.emissive = new props.three.Color(color);
    statusLed.value.material.emissiveIntensity = 1.0;
  } else {
    statusLed.value.material.emissive = new props.three.Color(0x000000);
    statusLed.value.material.emissiveIntensity = 0;
  }

  statusLed.value.material.color.setHex(color);
  emit('model-update', { status: props.status, voltage: props.voltage });
};

const animate = () => {
  if (powerModel.value && !isDisposed.value && props.visualConfig.animation?.rotate) {
    powerModel.value.rotation.y += props.visualConfig.animation.speed;
  }
  if (props.visualConfig.animation?.pulse && statusLed.value) {
    const t = Date.now() * 0.002;
    statusLed.value.scale.setScalar(1 + Math.sin(t) * 0.2);
  }
};

const dispose = () => {
  if (isDisposed.value) return;
  isDisposed.value = true;

  if (powerModel.value && props.scene) {
    props.scene.remove(powerModel.value);
    powerModel.value.traverse((obj) => {
      if (obj.geometry) { obj.geometry.dispose(); obj.geometry = null; }
      if (obj.material) { obj.material.dispose(); obj.material = null; }
    });
    powerModel.value = null;
  }

  statusLed.value = null;
};

let animationFrame = null;
const startAnimation = () => {
  const loop = () => {
    if (!isDisposed.value) {
      animate();
      animationFrame = requestAnimationFrame(loop);
    }
  };
  loop();
};

onMounted(() => { createModel(); startAnimation(); });
onUnmounted(() => { if (animationFrame) cancelAnimationFrame(animationFrame); dispose(); });

watch(() => props.visualConfig, (newCfg, oldCfg) => {
  if (oldCfg && JSON.stringify(newCfg) !== JSON.stringify(oldCfg)) {
    dispose();
    powerModel.value = null;
    isDisposed.value = false;
    setTimeout(() => createModel(), 50);
  }
}, { deep: true });

watch(() => [props.status, props.voltage], () => { if (!isDisposed.value) updateModel(); }, { deep: true });

defineExpose({ updateModel, animate, dispose, isDisposed });
</script>

<style scoped>
.power-base-three { position: relative; display: flex; justify-content: center; align-items: center; background: transparent; }
</style>
