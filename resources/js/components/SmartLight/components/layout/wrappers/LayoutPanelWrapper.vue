<template>
  <div class="panel-layout-wrapper" :class="wrapperClass">
    <!-- HEADER -->
    <div v-if="title || $slots.header" class="panel-header">
      <slot name="header">
        <h3 class="panel-title">
          <el-icon v-if="icon">
            <component :is="icon" />
          </el-icon>
          <span>{{ title }}</span>
        </h3>
      </slot>
    </div>

    <!-- CONTENT -->
    <div class="panel-content">
      <slot></slot>
    </div>

    <!-- FOOTER -->
    <div v-if="$slots.footer" class="panel-footer">
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
  shadow: { type: Boolean, default: false },
  collapsible: { type: Boolean, default: false }
});

const wrapperClass = computed(() => ({
  'panel-layout-wrapper--bordered': props.bordered,
  'panel-layout-wrapper--shadow': props.shadow,
  'panel-layout-wrapper--collapsible': props.collapsible
}));
</script>

<style scoped>
.panel-layout-wrapper {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.panel-layout-wrapper--bordered {
  border: 1px solid #e4e7ed;
}

.panel-layout-wrapper--shadow {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.panel-title .el-icon {
  color: #409eff;
  font-size: 16px;
}

.panel-content {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

.panel-footer {
  padding: 12px 15px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
  flex-shrink: 0;
}
</style>
