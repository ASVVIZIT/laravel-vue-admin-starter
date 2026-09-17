<template>
  <el-tooltip
      :content="tooltipContent"
      :disabled="!disabled || !tooltipContent"
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
        <span v-if="!hideLabel && labelKey" class="action-label">{{ $t(labelKey) }}</span>
      </el-button>
    </span>
  </el-tooltip>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

/**
 * Универсальная кнопка действия модуля диагностики.
 *
 * Возможности:
 * - disabled + тултип с причиной (disabled-кнопка не ловит mouseenter,
 *   поэтому тултип висит на span-обёртке, а не на самой кнопке)
 * - три источника текста тултипа с приоритетом:
 *   tooltipText (прямой текст) → tooltipKey (перевод действия) → disabledReasonKey (перевод причины)
 * - hideLabel: скрыть текст, оставить только иконку (компактные таблицы / мобильные)
 */
const props = defineProps({
  // Тип кнопки Element Plus: primary / success / warning / danger / info
  type: { type: String, default: 'primary' },

  // Иконка (компонент из ~icons/ep/*)
  icon: { type: [Object, Function], default: null },

  // Ключ перевода лейбла кнопки
  labelKey: { type: String, default: null },

  // Состояние загрузки: спиннер + блокировка клика
  loading: { type: Boolean, default: false },

  // Состояние неактивности: блокировка клика + тултип
  disabled: { type: Boolean, default: false },

  // Ключ перевода причины неактивности (тултип у disabled-кнопки)
  disabledReasonKey: { type: String, default: null },

  // Ключ перевода реального действия (тултип, например «Заблокировать пользователя»)
  tooltipKey: { type: String, default: null },

  // Прямой текст тултипа без перевода (приоритет выше всех ключей)
  tooltipText: { type: String, default: null },

  // Скрыть лейбл: остаётся только иконка
  hideLabel: { type: Boolean, default: false }
})

const emit = defineEmits(['click'])

const { t } = useI18n()

/**
 * Содержимое тултипа.
 * Приоритет: tooltipText → tooltipKey → disabledReasonKey.
 * Возвращает null, если кнопка активна или источников текста нет —
 * в этом случае el-tooltip отключён целиком.
 */
// computed — авто-импорт (unplugin-auto-import)
const tooltipContent = computed(() => {
  if (!props.disabled) return null
  if (props.tooltipText) return props.tooltipText
  if (props.tooltipKey) return t(props.tooltipKey)
  if (props.disabledReasonKey) return t(props.disabledReasonKey)
  return null
})
</script>

<style scoped lang="scss">
// Обёртка обязательна: disabled-кнопка не ловит mouseenter, тултип вешаем на span
.action-button-wrapper {
  display: inline-block;
}

.action-button {
  margin: 0;
  font-size: 11px;
  padding: 4px 8px;

  .action-label {
    margin-left: 2px;
  }
}
</style>
