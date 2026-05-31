<template>
  <div class="layout-card-wrapper" :class="wrapperClass">
    <div v-if="title || $slots.header" class="card-header">
      <slot name="header">
        <h3 class="card-title">
          <el-icon v-if="icon">
            <component :is="icon" />
          </el-icon>
          <span>{{ title }}</span>
        </h3>
        <slot name="header-actions"></slot>
      </slot>
    </div>

    <div class="card-content">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, default: '' },
  icon: { type: Object, default: null },
  bordered: { type: Boolean, default: true },
  shadow: { type: Boolean, default: false }
});

const wrapperClass = computed(() => ({
  'layout-card-wrapper--bordered': props.bordered,
  'layout-card-wrapper--shadow': props.shadow
}));
</script>

<style scoped>
.layout-card-wrapper {
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
}

.layout-card-wrapper--bordered {
  border: 1px solid #ebeef5;
}

.layout-card-wrapper--shadow {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.card-title .el-icon {
  color: #409eff;
  font-size: 14px;
}

.card-content {
  padding: 12px;
}

.card-footer {
  padding: 10px 12px;
  border-top: 1px solid #ebeef5;
  background: #fafafa;
}
</style>
