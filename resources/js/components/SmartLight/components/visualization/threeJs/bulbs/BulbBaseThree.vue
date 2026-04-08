<template>
  <div class="bulb-base-three" :style="{ width, height }"></div>
</template>
<script setup>
import { onMounted, onUnmounted, watch, shallowRef, markRaw } from 'vue';
import * as THREE from 'three';

const props = defineProps({ three:Object, scene:Object, camera:Object, renderer:Object, config:{type:Object,default:()=>({})}, data:{type:Object,default:()=>({})}, width:String, height:String });
const emit = defineEmits(['model-ready','model-update']);
const mesh = shallowRef(null); const parts = shallowRef({});

const makeGeo = (t, p) => {
  switch(t) {
    case 'sphere': return new THREE.SphereGeometry(p.r, p.seg||32, p.seg||32);
    case 'cylinder': return new THREE.CylinderGeometry(p.rTop||p.r, p.rBot||p.r, p.h||1, p.seg||16);
    default: return new THREE.BoxGeometry(p.w||1, p.h||1, p.d||1);
  }
};

const createFilament = (cfg) => {
  const pts = []; const steps = cfg.seg*2;
  for(let i=0;i<=steps;i++){const t=i/steps; const a=t*cfg.turns*Math.PI*2; pts.push(new THREE.Vector3(cfg.r*Math.cos(a), (t-0.5)*cfg.h, cfg.r*Math.sin(a)));}
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), steps*2, 0.025, 8, false);
};

const createModel = () => {
  if(!props.scene) return console.warn('BulbBase: scene null');
  const g = new THREE.Group(); const c = props.config?.visualConfig || {}; const geo = c.geometry || {}; const mat = c.materials || {};

  if(c.type==='bulb-classic') {
    const glass = new THREE.Mesh(new THREE.SphereGeometry(geo.glass?.r||0.5, geo.glass?.seg||32), new THREE.MeshPhysicalMaterial({color:0xffffff,transparent:true,opacity:0.2,roughness:0.05,clearcoat:1}));
    parts.value.glass=glass; g.add(glass);

    const base = new THREE.Mesh(makeGeo('cylinder', geo.base||{rTop:0.2,rBot:0.25,h:0.35,seg:16}), new THREE.MeshStandardMaterial({color:0xb5a642,metalness:0.9,roughness:0.3}));
    base.position.y = -(geo.glass?.r||0.5) - (geo.neck?.h||0.3) - (geo.base?.h||0.35)/2;
    g.add(base);

    parts.value.filament = new THREE.Mesh(createFilament(geo.filament||{turns:5,r:0.08,h:0.5,seg:64}), new THREE.MeshStandardMaterial({color:0x555555,emissive:0x000000,emissiveIntensity:0}));
    g.add(parts.value.filament);
  } else {
    // Fallback
    const defMat = new THREE.MeshStandardMaterial({color:0x888888,emissive:0x222222});
    parts.value.body = new THREE.Mesh(makeGeo('sphere', {r:0.4,seg:16}), defMat);
    g.add(parts.value.body);
  }

  mesh.value = markRaw(g);
  props.scene.add(mesh.value);
  updateVisuals();
  emit('model-ready', {type: c.type});
};

const updateVisuals = () => {
  if(!parts.value.filament) return;
  const c = props.config?.visualConfig || {};
  const status = props.data?.status || 'OFF';
  const intensity = props.data?.intensity || 0;
  const on = status==='ON', sl = status==='SLEEPING';
  const i = on ? intensity/100 : (sl?0.15:0);
  const col = c.colors?.[on?'on':(sl?'sleeping':'off')] || 0x444444;

  parts.value.filament.material.color.setHex(col);
  parts.value.filament.material.emissive.setHex(col);
  parts.value.filament.material.emissiveIntensity = i * 2.5;
  if(parts.value.glass) parts.value.glass.material.opacity = 0.2 + i*0.15;
};

onMounted(() => createModel());
watch(() => props.scene, (val) => { if(val && !mesh.value) createModel(); });
watch(() => props.data, () => { if(mesh.value) updateVisuals(); emit('model-update', props.data); }, {deep:true});
onUnmounted(() => { if(mesh.value && props.scene){ props.scene.remove(mesh.value); mesh.value.traverse(o=>{o.geometry?.dispose?.(); if(o.material) Array.isArray(o.material)?o.material.forEach(m=>m.dispose?.()):o.material.dispose?.();}); } mesh.value=null; parts.value={}; });
defineExpose({ updateVisuals, getMesh:()=>mesh.value });
</script>
<style scoped>.bulb-base-three{width:v-bind(width);height:v-bind(height)}</style>
