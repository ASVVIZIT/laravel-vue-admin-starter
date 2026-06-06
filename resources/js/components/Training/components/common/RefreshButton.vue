<template>
  <el-tooltip
      :content="tooltipText"
      placement="bottom"
  >
    <el-button
        size="small"
        circle
        :disabled="disabled || loading"
        @click="handleClick"
        :class="['refresh-button', { 'is-loading': loading }]"
    >
      <!-- 🔥 Иконка Refresh (показывается только в idle) -->
      <el-icon v-if="!loading">
        <Refresh />
      </el-icon>

      <!--  Иконка спиннера (показывается только при загрузке) -->
      <el-icon v-else class="is-loading">
        <Loading />
      </el-icon>
    </el-button>
  </el-tooltip>
</template>

<script setup>
import { computed } from 'vue'
import { Refresh, Loading } from '@element-plus/icons-vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  idleTooltip: {
    type: String,
    default: 'Обновить данные'
  },
  loadingTooltip: {
    type: String,
    default: 'Загрузка данных...'
  }
})

const emit = defineEmits(['refresh'])

const tooltipText = computed(() => {
  return props.loading ? props.loadingTooltip : props.idleTooltip
})

const handleClick = () => {
  if (!props.loading && !props.disabled) {
    emit('refresh')
  }
}
</script>

<style scoped>
.refresh-button {
  width: 26px;
  height: 26px;
  padding: 0;
  transition: all 0.3s ease;
}

.refresh-button :deep(.el-icon) {
  font-size: 14px;
  transition: transform 0.3s ease;
}

/* 🔥 Вращение спиннера при загрузке */
.refresh-button .is-loading {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Hover эффект только в idle состоянии */
.refresh-button:not(.is-loading):hover {
  background: rgba(64, 158, 255, 0.1);
  border-color: #409eff;
  color: #409eff;
}

.refresh-button:not(.is-loading):hover :deep(.el-icon) {
  transform: rotate(-180deg);
}
</style>
