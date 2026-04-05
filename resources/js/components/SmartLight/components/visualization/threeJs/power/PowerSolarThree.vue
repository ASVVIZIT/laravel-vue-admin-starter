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
import { ref, watch } from 'vue';
import * as THREE from 'three';
import PowerBaseThree from './PowerBaseThree.vue';

const props = defineProps({
  status: { type: String, default: 'OFF' },
  voltage: { type: Number, default: 12 },
  label: { type: String, default: 'Solar' },
  width: { type: String, default: '70px' },
  height: { type: String, default: '80px' }
});

const powerRef = ref(null);
let sun = null;

const handleReady = ({ scene }) => {
  // Солнечная панель (плоская)
  const panelGeometry = new THREE.BoxGeometry(1.2, 0.05, 0.8);
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a237e,
    roughness: 0.3,
    metalness: 0.5
  });

  powerRef.value?.createPowerUnit(panelGeometry, panelMaterial);

  // Ячейки панели (сетка)
  const cellGeometry = new THREE.PlaneGeometry(0.35, 0.25);
  const cellMaterial = new THREE.MeshStandardMaterial({
    color: 0x283593,
    roughness: 0.2,
    metalness: 0.6
  });

  for (let x = -0.4; x <= 0.4; x += 0.4) {
    for (let z = -0.25; z <= 0.25; z += 0.5) {
      const cell = new THREE.Mesh(cellGeometry, cellMaterial);
      cell.position.set(x, 0.03, z);
      cell.rotation.x = Math.PI / 2;
      powerRef.value?.powerUnit?.add(cell);
    }
  }

  // Солнце (декоративное)
  const sunGeometry = new THREE.SphereGeometry(0.15, 16, 16);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xff9800,
    transparent: true,
    opacity: 0.6
  });
  sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.position.set(0.5, 0.5, 0.5);
  scene.add(sun);

  updateSun();
};

const updateSun = () => {
  if (!sun) return;

  if (props.status === 'ON' || props.status === 'ACTIVE') {
    sun.material.opacity = 0.8;
    sun.scale.set(1.2, 1.2, 1.2);
  } else {
    sun.material.opacity = 0.3;
    sun.scale.set(1, 1, 1);
  }
};

const handleError = (error) => {
  console.error('[PowerSolarThree] Error:', error);
};

watch(() => props.status, () => updateSun());
</script>
