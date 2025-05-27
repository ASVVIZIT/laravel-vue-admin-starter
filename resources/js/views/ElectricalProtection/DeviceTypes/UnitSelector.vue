<template>
  <div>
    <label>{{ label }}</label>
    <select
        v-model="selectedUnit"
        @change="$emit('update:modelValue', selectedUnit)"
    >
      <option
          v-for="unit in units"
          :key="unit.id"
          :value="unit.id"
      >
        {{ unit.symbol }} ({{ unit.name }})
      </option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  units: Array,
  label: String
});

const selectedUnit = ref(null);
</script>
