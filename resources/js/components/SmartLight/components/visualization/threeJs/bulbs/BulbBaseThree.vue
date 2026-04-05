<template>
  <div ref="container" class="bulb-base-three" :style="{ width: containerWidth, height: containerHeight }"></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, shallowRef } from 'vue';

const props = defineProps({
  three: { type: Object, required: true },
  scene: { type: Object, required: true },
  camera: { type: Object, default: null },
  renderer: { type: Object, default: null },
  visualConfig: { type: Object, required: true },
  voltage: { type: Number, default: 3.7 },
  status: { type: String, default: 'OFF' },
  intensity: { type: Number, default: 0 },
  width: { type: String, default: '80px' },
  height: { type: String, default: '80px' }
});

const emit = defineEmits(['model-ready', 'model-update']);

const container = ref(null);
const containerWidth = computed(() => props.width);
const containerHeight = computed(() => props.height);

const bulbModel = shallowRef(null);
const filament = shallowRef(null);
const light = shallowRef(null);
const isDisposed = ref(false);

const createModel = () => {
  if (!props.scene || !props.three || isDisposed.value) return;

  const { geometry, material, light: lightConfig, scale } = props.visualConfig;
  bulbModel.value = new props.three.Group();

  // Стекло/купол
  const glassGeometry = geometry.type === 'sphere'
      ? new props.three.SphereGeometry(geometry.dimensions.radius * scale, geometry.dimensions.segments, geometry.dimensions.segments)
      : new props.three.SphereGeometry(geometry.dimensions.radius * scale, geometry.dimensions.segments, geometry.dimensions.segments, 0, Math.PI * 2, 0, Math.PI / 2);

  const glassMaterial = new props.three.MeshPhysicalMaterial(material.glass);
  const glass = new props.three.Mesh(glassGeometry, glassMaterial);
  glass.position.y = 0.5 * scale;
  bulbModel.value.add(glass);

  // Нить накала или LED чипы
  if (material.filament) {
    createFilament(material.filament, scale);
  } else if (material.chips) {
    createChips(material.chips, scale);
  }

  // Свет
  if (lightConfig) {
    light.value = new props.three.PointLight(
        lightConfig.color,
        lightConfig.intensity,
        lightConfig.distance
    );
    light.value.position.set(0, 0.45 * scale, 0);
    bulbModel.value.add(light.value);
  }

  // Цоколь
  if (material.base) {
    const baseGeometry = new props.three.CylinderGeometry(0.25 * scale, 0.25 * scale, 0.4 * scale, 16);
    const baseMaterial = new props.three.MeshStandardMaterial(material.base);
    const base = new props.three.Mesh(baseGeometry, baseMaterial);
    base.position.y = -0.2 * scale;
    bulbModel.value.add(base);
  }

  props.scene.add(bulbModel.value);
  updateModel();
  emit('model-ready', { model: bulbModel.value });
};

const createFilament = (filamentMat, scale) => {
  const filamentGeometry = new props.three.TorusGeometry(
      0.15 * scale,
      0.025 * scale,
      16,
      32,
      Math.PI * 0.8
  );
  const filamentMaterial = new props.three.MeshBasicMaterial(filamentMat);
  filament.value = new props.three.Mesh(filamentGeometry, filamentMaterial);
  filament.value.rotation.x = Math.PI / 2;
  filament.value.position.y = 0.45 * scale;
  bulbModel.value.add(filament.value);
};

const createChips = (chips, scale) => {
  const chipGeometry = new props.three.SphereGeometry(0.04 * scale, 16, 16);
  const colors = chips.colors || [chips.color];

  for (let i = 0; i < chips.count; i++) {
    const chipMaterial = new props.three.MeshBasicMaterial({
      color: colors[i % colors.length],
      transparent: true,
      opacity: chips.opacity
    });
    const chip = new props.three.Mesh(chipGeometry, chipMaterial);
    const angle = (i / chips.count) * Math.PI * 2;
    chip.position.set(
        Math.cos(angle) * 0.15 * scale,
        0.45 * scale,
        Math.sin(angle) * 0.15 * scale
    );
    bulbModel.value.add(chip);
  }
};

const updateModel = () => {
  if ((!light.value && !filament.value) || isDisposed.value) return;

  const isOn = props.status === 'ON';
  const isSleeping = props.status === 'SLEEPING';
  const intensityValue = isOn ? (props.intensity / 100) : (isSleeping ? 0.3 : 0);

  if (light.value) {
    light.value.intensity = intensityValue * 0.8;
  }

  if (filament.value) {
    filament.value.material.opacity = intensityValue > 0 ? 1 : 0.3;
  }

  emit('model-update', { status: props.status, intensity: props.intensity });
};

const animate = () => {
  if (bulbModel.value && !isDisposed.value && props.visualConfig.animation?.rotate) {
    bulbModel.value.rotation.y += props.visualConfig.animation.speed;
  }
};

const dispose = () => {
  if (isDisposed.value) return;
  isDisposed.value = true;

  if (bulbModel.value && props.scene) {
    props.scene.remove(bulbModel.value);
    bulbModel.value.traverse((obj) => {
      if (obj.geometry) {
        obj.geometry.dispose();
        obj.geometry = null;
      }
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => {
            m.dispose();
            m = null;
          });
        } else {
          obj.material.dispose();
          obj.material = null;
        }
      }
    });
    bulbModel.value = null;
  }

  filament.value = null;
  light.value = null;
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

onMounted(() => {
  createModel();
  startAnimation();
});

onUnmounted(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  dispose();
});

watch(() => props.visualConfig, (newConfig, oldConfig) => {
  if (oldConfig && JSON.stringify(newConfig) !== JSON.stringify(oldConfig)) {
    dispose();
    bulbModel.value = null;
    isDisposed.value = false;
    setTimeout(() => createModel(), 50);
  }
}, { deep: true });

watch(() => [props.status, props.intensity], () => {
  if (!isDisposed.value) {
    updateModel();
  }
}, { deep: true });

defineExpose({ updateModel, animate, dispose, isDisposed });
</script>

<style scoped>
.bulb-base-three {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
