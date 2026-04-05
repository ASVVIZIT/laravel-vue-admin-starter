<template>
  <div ref="container" class="battery-base-three" :style="{ width: containerWidth, height: containerHeight }"></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, shallowRef } from 'vue';

const props = defineProps({
  /** THREE namespace от BaseScene */
  three: { type: Object, required: true },
  /** THREE.Scene от BaseScene */
  scene: { type: Object, required: true },
  /** THREE.Camera от BaseScene */
  camera: { type: Object, default: null },
  /** THREE.WebGLRenderer от BaseScene */
  renderer: { type: Object, default: null },
  /** Конфиг визуализации из store */
  visualConfig: { type: Object, required: true },
  /** Спецификации из store */
  specs: { type: Object, required: true },
  /** Текущее напряжение */
  voltage: { type: Number, default: 3.7 },
  /** Критическое напряжение */
  criticalVoltage: { type: Number, default: 3.2 },
  /** Ширина компонента */
  width: { type: String, default: '80px' },
  /** Высота компонента */
  height: { type: String, default: '80px' }
});

const emit = defineEmits(['model-ready', 'model-update']);

const container = ref(null);
const containerWidth = computed(() => props.width);
const containerHeight = computed(() => props.height);

// ✅ shallowRef для ThreeJS объектов (не вызывает реактивность)
const batteryModel = shallowRef(null);
const batteryFill = shallowRef(null);
const isDisposed = ref(false);

const createModel = () => {
  if (!props.scene || !props.three || isDisposed.value) return;

  const { geometry, material, scale } = props.visualConfig;
  batteryModel.value = new props.three.Group();

  if (geometry.type === 'cylinder') {
    createCylinderBattery(geometry, material, scale);
  } else if (geometry.type === 'box') {
    createBoxBattery(geometry, material, scale);
  }

  props.scene.add(batteryModel.value);
  updateModel();
  emit('model-ready', { model: batteryModel.value });
};

const createCylinderBattery = (geometry, material, scale) => {
  const { radius, height, segments } = geometry.dimensions;

  // Корпус
  const bodyGeometry = new props.three.CylinderGeometry(
      radius * scale,
      radius * scale,
      height * scale,
      segments
  );
  const bodyMaterial = new props.three.MeshPhysicalMaterial(material.body);
  const body = new props.three.Mesh(bodyGeometry, bodyMaterial);
  batteryModel.value.add(body);

  // Заполнение
  const fillGeometry = new props.three.CylinderGeometry(
      radius * 0.84 * scale,
      radius * 0.84 * scale,
      (height - 0.2) * scale,
      segments
  );
  const fillMaterial = new props.three.MeshPhysicalMaterial(material.fill);
  batteryFill.value = new props.three.Mesh(fillGeometry, fillMaterial);
  batteryFill.value.position.y = -0.15 * scale;
  batteryModel.value.add(batteryFill.value);

  // Крышка
  const capGeometry = new props.three.CylinderGeometry(
      radius * 1.04 * scale,
      radius * 1.04 * scale,
      0.15 * scale,
      segments
  );
  const capMaterial = new props.three.MeshStandardMaterial(material.cap);
  const cap = new props.three.Mesh(capGeometry, capMaterial);
  cap.position.y = (height / 2 + 0.075) * scale;
  batteryModel.value.add(cap);
};

const createBoxBattery = (geometry, material, scale) => {
  const { width, height, depth } = geometry.dimensions;

  // Корпус
  const bodyGeometry = new props.three.BoxGeometry(
      width * scale,
      height * scale,
      depth * scale
  );
  const bodyMaterial = new props.three.MeshPhysicalMaterial(material.body);
  const body = new props.three.Mesh(bodyGeometry, bodyMaterial);
  batteryModel.value.add(body);

  // Заполнение
  const fillGeometry = new props.three.BoxGeometry(
      (width - 0.2) * scale,
      (height - 0.05) * scale,
      (depth - 0.1) * scale
  );
  const fillMaterial = new props.three.MeshPhysicalMaterial(material.fill);
  batteryFill.value = new props.three.Mesh(fillGeometry, fillMaterial);
  batteryFill.value.position.y = 0.02 * scale;
  batteryModel.value.add(batteryFill.value);

  // Провода
  if (material.wires) {
    createWires(material.wires, scale);
  }
};

const createWires = (wires, scale) => {
  const wireGeometry = new props.three.CylinderGeometry(0.03, 0.03, 0.5, 8);

  const positiveMaterial = new props.three.MeshStandardMaterial({ color: wires.positive });
  const positiveWire = new props.three.Mesh(wireGeometry, positiveMaterial);
  positiveWire.position.set(-0.3 * scale, -0.2 * scale, 0.8 * scale);
  positiveWire.rotation.x = Math.PI / 2;
  batteryModel.value.add(positiveWire);

  const negativeMaterial = new props.three.MeshStandardMaterial({ color: wires.negative });
  const negativeWire = new props.three.Mesh(wireGeometry, negativeMaterial);
  negativeWire.position.set(0.3 * scale, -0.2 * scale, 0.8 * scale);
  negativeWire.rotation.x = Math.PI / 2;
  batteryModel.value.add(negativeWire);
};

const updateModel = () => {
  if (!batteryFill.value || isDisposed.value) return;

  const { minVoltage, maxVoltage } = props.specs;
  const progress = Math.min(1, Math.max(0, ((props.voltage - minVoltage) / (maxVoltage - minVoltage))));
  const scale = Math.max(0.05, progress);

  batteryFill.value.scale.set(1, scale, 1);

  const { colors } = props.visualConfig;
  if (progress < 0.3) {
    batteryFill.value.material.color.setHex(colors.critical);
  } else if (progress < 0.6) {
    batteryFill.value.material.color.setHex(colors.warning);
  } else {
    batteryFill.value.material.color.setHex(colors.normal);
  }

  emit('model-update', { voltage: props.voltage, progress });
};

const animate = () => {
  if (batteryModel.value && !isDisposed.value && props.visualConfig.animation?.rotate) {
    batteryModel.value.rotation.y += props.visualConfig.animation.speed;
  }
};

// ✅ Защита от двойного dispose
const dispose = () => {
  if (isDisposed.value) return;
  isDisposed.value = true;

  if (batteryModel.value && props.scene) {
    props.scene.remove(batteryModel.value);
    batteryModel.value.traverse((obj) => {
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
    batteryModel.value = null;
  }

  batteryFill.value = null;
};

// ✅ Анимационный цикл
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

// ✅ Пересоздание модели при смене конфига
watch(() => props.visualConfig, (newConfig, oldConfig) => {
  if (oldConfig && JSON.stringify(newConfig) !== JSON.stringify(oldConfig)) {
    dispose();
    batteryModel.value = null;
    isDisposed.value = false;
    setTimeout(() => createModel(), 50);
  }
}, { deep: true });

// ✅ Обновление при изменении напряжения
watch(() => [props.voltage, props.criticalVoltage], () => {
  if (!isDisposed.value) {
    updateModel();
  }
}, { deep: true });

defineExpose({ updateModel, animate, dispose, isDisposed });
</script>

<style scoped>
.battery-base-three {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
