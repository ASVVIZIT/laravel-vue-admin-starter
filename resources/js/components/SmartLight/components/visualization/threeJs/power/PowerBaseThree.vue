<template>
  <div class="power-base-three" :style="{ width, height }"></div>
</template>
<script setup>
import { onMounted, onUnmounted, watch, shallowRef, markRaw } from 'vue';
import * as THREE from 'three';

const props = defineProps({ three:Object, scene:Object, config:{type:Object,default:()=>({})}, data:{type:Object,default:()=>({})}, width:String, height:String });
const emit = defineEmits(['model-ready','model-update']);
const mesh = shallowRef(null); const parts = shallowRef({});

const createModel = () => {
  if(!props.scene) return console.warn('PowBase: scene null');
  const g = new THREE.Group(); const c = props.config?.visualConfig || {}; const geo = c.geometry || {}; const on = props.data?.status==='ON';
  parts.value.body = new THREE.Mesh(new THREE.BoxGeometry(geo.w||1.5, geo.h||0.8, geo.d||0.5), new THREE.MeshStandardMaterial({color:0x2d3436,roughness:0.5}));
  g.add(parts.value.body);

  parts.value.ind = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.05), new THREE.MeshBasicMaterial({color: on ? 0x67c23a : 0x555555}));
  parts.value.ind.position.set((geo.w||1.5)/2-0.2, (geo.h||0.8)/2-0.15, (geo.d||0.5)/2+0.03);
  g.add(parts.value.ind);

  mesh.value=markRaw(g); props.scene.add(mesh.value); updateVisuals(); emit('model-ready',{type:c.type});
};
const updateVisuals = () => { if(!parts.value.ind) return; parts.value.ind.material.color.setHex(props.data?.status==='ON'?0x67c23a:0x555555); };

onMounted(() => createModel());
watch(() => props.scene, (val) => { if(val && !mesh.value) createModel(); });
watch(() => props.data, () => { if(mesh.value) { updateVisuals(); emit('model-update', props.data); } });
onUnmounted(() => { if(mesh.value && props.scene){ props.scene.remove(mesh.value); mesh.value.traverse(o=>{o.geometry?.dispose?.(); if(o.material) Array.isArray(o.material)?o.material.forEach(m=>m.dispose?.()):o.material.dispose?.();}); } mesh.value=null; parts.value={}; });
defineExpose({ updateVisuals, getMesh:()=>mesh.value });
</script>
<style scoped>.power-base-three{width:v-bind(width);height:v-bind(height)}</style>
