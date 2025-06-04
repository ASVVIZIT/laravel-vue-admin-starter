<template>
  <span class="progress-stars">
    <template v-if="required > 0">
      <el-tooltip
          :content="`Обязательные: ${filledRequired}/${required}`"
          placement="top"
      >
        <div class="container-stars">
          <span class="required-stars">
            <el-icon
                v-for="i in required"
                :key="`req-${i}`"
                :color="i <= filledRequired ? '#67C23A' : '#F56C6C'"
            >
              <StarFilled v-if="i <= filledRequired" />
              <Star v-else />
            </el-icon>
          </span>
        </div>
      </el-tooltip>
    </template>
    <el-tooltip
        :content="`Заполнено: ${filled}/${total}`"
        placement="top"
    >
      <!-- Добавляем динамический класс -->
      <span
          class="progress-indicator"
          :class="{ 'completed': filled === total && total > 0 }"
      >
        {{ filled }}/{{ total }}
      </span>
    </el-tooltip>
  </span>
</template>

<script setup>
import { Star, StarFilled } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps({
  total: { type: Number, default: 0 },
  filled: { type: Number, default: 0 },
  required: { type: Number, default: 0 },
  filledRequired: { type: Number, default: 0 }
});
</script>

<style lang="scss" scoped>

.progress-stars {
  display: inline-flex;
  align-items: center;
  gap: 1px;
}

.container-stars {
  display: flex;
  width: 100%;
}


.tab-label {
  .progress-stars {
    display: inline-flex;
    align-items: center;
    gap: 1px;
    top: 13px;
    right: 5px;
    position: absolute;
  }
}

.collapse-header {
  .progress-stars {
    display: inline-flex;
    align-items: center;
    gap: 1px;
    margin-left: 5px;
    top: 16px;
    left: -30px;
    position: absolute;
  }
}

.tab-label {
  .container-stars {
    position: absolute;
    z-index: 10;
  }
}

.collapse-header {
  .container-stars {
    position: absolute;
    top: -14px;
    right: 2px;
    z-index: 10;
  }
}

.tab-label {
  .required-stars {
    display: flex;
    position: absolute;
    top: -21px;
    right: 0px;
  }
}

.required-stars {
  display: flex;
}

.required-stars .el-icon {
  font-size: 1.1em;
}

.progress-indicator {
  font-size: 1.0em;
  min-width: 20px;
  text-align: center;
  background: #e0e0e0;
  border-radius: 2px;
  padding: 2px 4px;
  color: #666;
  transition: all 0.3s ease;

  /* Стиль для заполненного состояния */
  &.completed {
    background-color: #67C23A;
    color: white;
    font-weight: 500;
  }
}
</style>
