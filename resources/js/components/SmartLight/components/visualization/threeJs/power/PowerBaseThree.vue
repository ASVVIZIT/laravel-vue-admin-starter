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
const indicator = shallowRef(null);
const sun = shallowRef(null);
const isDisposed = ref(false);

const createModel = () => {
  if (!props.scene || !props.three || isDisposed.value) return;

  const { geometry, material, scale } = props.visualConfig;
  powerModel.value = new props.three.Group();

  const { width, height, depth } = geometry.dimensions;

  // Корпус
  const bodyGeometry = new props.three.BoxGeometry(width * scale, height * scale, depth * scale);
  const bodyMaterial = new props.three.MeshStandardMaterial(material.body);
  const body = new props.three.Mesh(bodyGeometry, bodyMaterial);
  powerModel.value.add(body);

  // Индикатор
  if (material.indicator) {
    createIndicator(material.indicator, scale);
  }

  // Клеммы/провода
  if (material.terminals || material.wires) {
    createTerminalsOrWires(material, scale);
  }

  // Солнце для solar
  if (material.sun) {
    createSun(material.sun, scale);
  }

  props.scene.add(powerModel.value);
  updateModel();
  emit('model-ready', { model: powerModel.value });
};

const createIndicator = (indicatorMat, scale) => {
  const indicatorGeometry = new props.three.SphereGeometry(0.05 * scale, 16, 16);
  const indicatorMaterial = new props.three.MeshBasicMaterial({ color: indicatorMat.color });
  indicator.value = new props.three.Mesh(indicatorGeometry, indicatorMaterial);
  indicator.value.position.set(0.35 * scale, 0.2 * scale, 0.21 * scale);
  powerModel.value.add(indicator.value);
};

const createTerminalsOrWires = (material, scale) => {
  if (material.wires) {
    const wireGeometry = new props.three.CylinderGeometry(0.03, 0.03, 0.5, 8);

    const positiveMaterial = new props.three.MeshStandardMaterial({ color: material.wires.positive });
    const positiveWire = new props.three.Mesh(wireGeometry, positiveMaterial);
    positiveWire.position.set(-0.2 * scale, -0.35 * scale, 0.2 * scale);
    positiveWire.rotation.x = Math.PI / 2;
    powerModel.value.add(positiveWire);

    const negativeMaterial = new props.three.MeshStandardMaterial({ color: material.wires.negative });
    const negativeWire = new props.three.Mesh(wireGeometry, negativeMaterial);
    negativeWire.position.set(0.2 * scale, -0.35 * scale, 0.2 * scale);
    negativeWire.rotation.x = Math.PI / 2;
    powerModel.value.add(negativeWire);
  }

  if (material.terminals) {
    const terminalGeometry = new props.three.CylinderGeometry(0.06, 0.06, 0.15, 16);
    const positions = [
      { x: -0.4, z: 0.26, color: material.terminals.positive },
      { x: -0.15, z: 0.26, color: material.terminals.positive },
      { x: 0.15, z: 0.26, color: material.terminals.negative },
      { x: 0.4, z: 0.26, color: material.terminals.negative }
    ];

    positions.forEach((pos) => {
      const terminalMaterial = new props.three.MeshStandardMaterial({ color: pos.color });
      const terminal = new props.three.Mesh(terminalGeometry, terminalMaterial);
      terminal.position.set(pos.x * scale, -0.35 * scale, pos.z * scale);
      terminal.rotation.x = Math.PI / 2;
      powerModel.value.add(terminal);
    });
  }
};

const createSun = (sunMat, scale) => {
  const sunGeometry = new props.three.SphereGeometry(0.15 * scale, 16, 16);
  const sunMaterial = new props.three.MeshBasicMaterial({
    color: sunMat.color,
    transparent: true,
    opacity: sunMat.opacity
  });
  sun.value = new props.three.Mesh(sunGeometry, sunMaterial);
  sun.value.position.set(0.5 * scale, 0.5 * scale, 0.5 * scale);
  powerModel.value.add(sun.value);
};

const updateModel = () => {
  if (!indicator.value || isDisposed.value) return;

  const { indicator: indicatorMat } = props.visualConfig.material;

  if (props.status === 'ON' || props.status === 'ACTIVE') {
    indicator.value.material.color.setHex(indicatorMat.activeColor);
    indicator.value.material.emissive = new props.three.Color(indicatorMat.activeColor);
    indicator.value.material.emissiveIntensity = 0.5;
  } else if (props.status === 'ERROR') {
    indicator.value.material.color.setHex(0xf56c6c);
    indicator.value.material.emissive = new props.three.Color(0xf56c6c);
    indicator.value.material.emissiveIntensity = 0.5;
  } else {
    indicator.value.material.color.setHex(indicatorMat.color);
    indicator.value.material.emissive = new props.three.Color(0x000000);
    indicator.value.material.emissiveIntensity = 0;
  }

  // Солнце для solar
  if (sun.value) {
    if (props.status === 'ON' || props.status === 'ACTIVE') {
      sun.value.material.opacity = 0.8;
      sun.value.scale.set(1.2, 1.2, 1.2);
    } else {
      sun.value.material.opacity = 0.3;
      sun.value.scale.set(1, 1, 1);
    }
  }

  emit('model-update', { status: props.status });
};

const animate = () => {
  if (powerModel.value && !isDisposed.value && props.visualConfig.animation?.rotate) {
    powerModel.value.rotation.y += props.visualConfig.animation.speed;
  }
  if (sun.value && !isDisposed.value && props.visualConfig.animation?.sunRotate) {
    sun.value.rotation.y += 0.01;
  }
};

const dispose = () => {
  if (isDisposed.value) return;
  isDisposed.value = true;

  if (powerModel.value && props.scene) {
    props.scene.remove(powerModel.value);
    powerModel.value.traverse((obj) => {
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
    powerModel.value = null;
  }

  indicator.value = null;
  sun.value = null;
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
    powerModel.value = null;
    isDisposed.value = false;
    setTimeout(() => createModel(), 50);
  }
}, { deep: true });

watch(() => props.status, () => {
  if (!isDisposed.value) {
    updateModel();
  }
}, { deep: true });

defineExpose({ updateModel, animate, dispose, isDisposed });
</script>

<style scoped>
.power-base-three {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
