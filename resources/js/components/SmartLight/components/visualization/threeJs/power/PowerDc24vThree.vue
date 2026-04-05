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
  voltage: { type: Number, default: 24 },
  current: { type: Number, default: 5000 },
  label: { type: String, default: 'DC 24V' },
  width: { type: String, default: '60px' },
  height: { type: String, default: '80px' }
});

const powerRef = ref(null);
let outputTerminals = [];
let statusLed = null;

const handleReady = ({ scene }) => {
  // Блок питания 24V (больше чем 12V)
  const boxGeometry = new THREE.BoxGeometry(1.2, 0.7, 0.5);
  const boxMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d3436,
    roughness: 0.5,
    metalness: 0.4
  });

  powerRef.value?.createPowerUnit(boxGeometry, boxMaterial);

  // Метка "24V"
  createVoltageLabel(scene, '24V');

  // Выходные клеммы (4 шт для 24V)
  createOutputTerminals(scene);

  // LED индикаторы (2 шт: Power + Output)
  createStatusLeds(scene);

  // Радиатор охлаждения
  createHeatsink(scene);

  updateStatus();
};

const createVoltageLabel = (scene, text) => {
  // Текстовая метка (упрощённо через plane)
  const labelGeometry = new THREE.PlaneGeometry(0.4, 0.15);
  const labelMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  });
  const label = new THREE.Mesh(labelGeometry, labelMaterial);
  label.position.set(0, 0.2, 0.26);
  powerRef.value?.powerUnit?.add(label);
};

const createOutputTerminals = (scene) => {
  const terminalGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.15, 16);

  // Положительные клеммы (красные)
  const positiveMaterial = new THREE.MeshStandardMaterial({
    color: 0xf56c6c,
    roughness: 0.3,
    metalness: 0.7
  });

  // Отрицательные клеммы (чёрные)
  const negativeMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.3,
    metalness: 0.7
  });

  // 4 клеммы: +V, +V, -V, -V
  const positions = [
    { x: -0.4, z: 0.26, material: positiveMaterial },
    { x: -0.15, z: 0.26, material: positiveMaterial },
    { x: 0.15, z: 0.26, material: negativeMaterial },
    { x: 0.4, z: 0.26, material: negativeMaterial }
  ];

  positions.forEach((pos) => {
    const terminal = new THREE.Mesh(terminalGeometry, pos.material);
    terminal.position.set(pos.x, -0.35, pos.z);
    terminal.rotation.x = Math.PI / 2;
    powerRef.value?.powerUnit?.add(terminal);
    outputTerminals.push(terminal);
  });
};

const createStatusLeds = (scene) => {
  const ledGeometry = new THREE.SphereGeometry(0.04, 16, 16);

  // Power LED (зелёный)
  const powerLedMaterial = new THREE.MeshBasicMaterial({
    color: props.status === 'ON' ? 0x67c23a : 0x666666
  });
  statusLed = new THREE.Mesh(ledGeometry, powerLedMaterial);
  statusLed.position.set(0.45, 0.25, 0.26);
  powerRef.value?.powerUnit?.add(statusLed);

  // Output LED (жёлтый)
  const outputLedMaterial = new THREE.MeshBasicMaterial({
    color: props.status === 'ON' ? 0xe6a23c : 0x666666
  });
  const outputLed = new THREE.Mesh(ledGeometry, outputLedMaterial);
  outputLed.position.set(0.35, 0.25, 0.26);
  powerRef.value?.powerUnit?.add(outputLed);
};

const createHeatsink = (scene) => {
  // Рёбра радиатора
  const finGeometry = new THREE.BoxGeometry(0.1, 0.15, 0.05);
  const finMaterial = new THREE.MeshStandardMaterial({
    color: 0x999999,
    roughness: 0.4,
    metalness: 0.6
  });

  for (let i = 0; i < 5; i++) {
    const fin = new THREE.Mesh(finGeometry, finMaterial);
    fin.position.set(-0.4 + (i * 0.2), -0.4, 0);
    powerRef.value?.powerUnit?.add(fin);
  }
};

const updateStatus = () => {
  if (!statusLed) return;

  if (props.status === 'ON' || props.status === 'ACTIVE') {
    statusLed.material.color.setHex(0x67c23a);
    statusLed.material.emissive = new THREE.Color(0x67c23a);
    statusLed.material.emissiveIntensity = 0.5;
  } else if (props.status === 'ERROR') {
    statusLed.material.color.setHex(0xf56c6c);
    statusLed.material.emissive = new THREE.Color(0xf56c6c);
    statusLed.material.emissiveIntensity = 0.5;
  } else {
    statusLed.material.color.setHex(0x666666);
    statusLed.material.emissive = new THREE.Color(0x000000);
    statusLed.material.emissiveIntensity = 0;
  }
};

const handleError = (error) => {
  console.error('[PowerDc24vThree] Error:', error);
};
</script>
