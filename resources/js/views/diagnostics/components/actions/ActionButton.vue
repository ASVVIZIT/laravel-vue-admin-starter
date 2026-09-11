<template>
  <el-tooltip
      :content="disabled && disabledReasonKey ? $t(disabledReasonKey) : ''"
      :disabled="!disabled || !disabledReasonKey"
      placement="top"
      effect="dark"
  >
    <span class="action-button-wrapper">
      <el-button
          :type="type"
          size="small"
          plain
          :icon="icon"
          :loading="loading"
          :disabled="disabled"
          class="action-button"
          @click="emit('click')"
      >
        {{ labelKey ? $t(labelKey) : '' }}
      </el-button>
    </span>
  </el-tooltip>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'primary' },
  icon: { type: [Object, Function], default: null },
  labelKey: { type: String, default: null },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  // Ключ перевода с причиной неактивности (показывается в тултипе)
  disabledReasonKey: { type: String, default: null }
})

const emit = defineEmits(['click'])
</script>

<style scoped lang="scss">
// Обёртка обязательна: disabled-кнопка не ловит mouseenter, тултип вешаем на span
.action-button-wrapper {
  display: inline-block;
}

.action-button {
  margin: 0;
  font-size: 12px;
  padding: 5px 10px;
}
</style>
