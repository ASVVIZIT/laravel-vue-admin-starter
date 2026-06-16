<template>
  <component
      v-if="isValid && blockComponent"
      :is="blockComponent"
      :settings="mergedSettings"
      :block-id="block.id"
  />
  <div v-else class="block-error">
    ⚠️ Невалидный блок: {{ block.type }}
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getBlockComponent } from '../config/blockRegistry'
import { getBlockDefaults } from '../config/blockDefaults'
import { blockFactory } from '../config/blockFactory'

const props = defineProps({
  block: {
    type: Object,
    required: true
  }
})

const isValid = computed(() => blockFactory.isValid(props.block))

const blockComponent = computed(() => {
  if (!isValid.value) return null
  return getBlockComponent(props.block.type)
})

const mergedSettings = computed(() => {
  if (!isValid.value) return {}
  return { ...getBlockDefaults(props.block.type), ...props.block.settings }
})
</script>

<style scoped>
.block-error {
  padding: 8px;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: 4px;
  color: #ff4757;
  text-align: center;
  font-size: 12px;
}
</style>
