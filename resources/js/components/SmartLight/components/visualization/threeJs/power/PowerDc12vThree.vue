<template>
  <PowerBaseThree
      ref="powerRef"
      :status="status"
      :voltage="voltage"
      :label="label"
      :width="width"
      :height="height"
      @ready="handleReady"
      @error="handleError"
  />
</template>

<script setup>
import { ref } from 'vue';
import * as THREE from 'three';
import PowerBaseThree from './PowerBaseThree.vue';

const props = defineProps({
  status: { type: String, default: 'OFF' },
  voltage: { type: Number, default: 12 },
  label: { type: String, default: 'DC 12V' },
  width: { type: String, default: '60px' },
  height: { type: String, default: '80px' }
});

const powerRef = ref(null);

const handleReady = ({ scene }) => {
  // Блок питания (коробка)
  const boxGeometry = new THREE.BoxGeometry(1, 0.6, 0.4);
  const boxMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.5,
    metalness: 0.3
  });

  powerRef.value?.createPowerUnit(boxGeometry, boxMaterial);

  // Добавляем LED индикатор на корпус
  const ledGeometry = new THREE.SphereGeometry(0.05, 16, 16);
  const ledMaterial = new THREE.MeshBasicMaterial({
    color: props.status === 'ON' ? 0x67c23a : 0x666666
  });
  const led = new THREE.Mesh(ledGeometry, ledMaterial);
  led.position.set(0.35, 0.2, 0.21);
  powerRef.value?.powerUnit?.add(led);

  // Провода
  const wireGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
  const positiveMaterial = new THREE.MeshStandardMaterial({ color: 0xf56c6c });
  const negativeMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

  const positiveWire = new THREE.Mesh(wireGeometry, positiveMaterial);
  positiveWire.position.set(-0.2, -0.35, 0.2);
  positiveWire.rotation.x = Math.PI / 2;
  powerRef.value?.powerUnit?.add(positiveWire);

  const negativeWire = new THREE.Mesh(wireGeometry, negativeMaterial);
  negativeWire.position.set(0.2, -0.35, 0.2);
  negativeWire.rotation.x = Math.PI / 2;
  powerRef.value?.powerUnit?.add(negativeWire);

  // Метка DC
  // (текст в ThreeJS требует TextGeometry, пока заглушка)
};

const handleError = (error) => {
  console.error('[PowerDc12vThree] Error:', error);
};
</script>
