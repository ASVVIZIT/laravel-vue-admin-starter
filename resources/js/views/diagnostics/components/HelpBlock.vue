<template>
  <div class="help-block">
    <div class="help-content">
      <el-icon class="help-icon"><InfoFilled /></el-icon>
      <div class="help-text">
        <div class="help-title">{{ $t(titleKey) }}</div>
        <div class="help-desc">{{ $t(descriptionKey) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { InfoFilled } from '@element-plus/icons-vue'

defineProps({
  titleKey: { type: String, required: true },
  descriptionKey: { type: String, required: true }
})
</script>

<style scoped lang="scss">
.help-block {
  background: #f0f9ff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 12px;
  font-size: 13px;
  line-height: 1.4;

  .help-content {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .help-icon {
    color: #409eff;
    font-size: 16px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .help-text {
    flex: 1;
    min-width: 0;
  }

  .help-title {
    font-weight: 600;
    color: #409eff;
    margin-bottom: 2px;
    font-size: 13px;
  }

  .help-desc {
    color: #606266;
    font-size: 12px;
    line-height: 1.3;
  }
}
</style>
