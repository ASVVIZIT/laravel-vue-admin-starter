<template>
  <div class="checklist-actions">
    <ActionButton
        type="warning"
        :icon="IconEpTools"
        label-key="diagnostics.actions.fix"
        :disabled="isDisabled"
        :disabled-reason-key="disabledReasonKey"
        @click="emit('fix', check)"
    />
  </div>
</template>

<script setup>
// computed — авто-импорт (unplugin-auto-import)
import IconEpTools from '~icons/ep/tools'
import ActionButton from './ActionButton.vue'

const props = defineProps({
  check: {type: Object, required: true}
})

const emit = defineEmits(['fix'])

// Кнопка неактивна: либо всё ОК, либо нет инструкции
const isDisabled = computed(() => {
  return props.check.status === 'ok' || !props.check.fix_instructions
})

// Причина неактивности для тултипа
const disabledReasonKey = computed(() => {
  if (props.check.status === 'ok') {
    return 'diagnostics.actions.tooltip_ok'
  }
  if (!props.check.fix_instructions) {
    return 'diagnostics.actions.tooltip_no_fix'
  }
  return null
})
</script>

<style scoped lang="scss">
.checklist-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
