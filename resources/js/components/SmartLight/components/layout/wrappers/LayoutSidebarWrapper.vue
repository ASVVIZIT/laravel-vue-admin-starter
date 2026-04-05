<template>
  <div class="sidebar-layout-wrapper" :class="{ 'sidebar-open': isOpen }">
    <!-- HEADER -->
    <div class="sidebar-header">
      <h3 class="sidebar-title">
        <el-icon v-if="icon">
          <component :is="icon" />
        </el-icon>
        <span>{{ title }}</span>
      </h3>
      <el-button
          v-if="closable"
          type="info"
          size="small"
          @click="handleClose"
      >
        <el-icon><Close /></el-icon>
      </el-button>
    </div>

    <!-- CONTENT -->
    <div class="sidebar-content">
      <slot name="content">
        <div class="sidebar-empty">
          <el-icon><InfoFilled /></el-icon>
          <p>{{ emptyText }}</p>
        </div>
      </slot>
    </div>

    <!-- FOOTER -->
    <div v-if="$slots.footer" class="sidebar-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { Close, InfoFilled } from '@element-plus/icons-vue';

const props = defineProps({
  isOpen: { type: Boolean, default: true },
  title: { type: String, default: 'Настройки' },
  icon: { type: Object, default: null },
  closable: { type: Boolean, default: true },
  emptyText: { type: String, default: 'Нет данных для отображения' }
});

const emit = defineEmits(['close']);

const handleClose = () => {
  emit('close');
};
</script>

<style scoped>
.sidebar-layout-wrapper {
  position: fixed;
  top: 60px;
  right: -350px;
  width: 350px;
  height: calc(100vh - 60px);
  background: #fff;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.15);
  transition: right 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e4e7ed;
}

.sidebar-layout-wrapper.sidebar-open {
  right: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.sidebar-title .el-icon {
  color: #409eff;
  font-size: 16px;
}

.sidebar-content {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

.sidebar-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  gap: 12px;
}

.sidebar-empty .el-icon {
  font-size: 48px;
  color: #c0c4cc;
}

.sidebar-empty p {
  margin: 0;
  font-size: 14px;
}

.sidebar-footer {
  padding: 12px 15px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
  flex-shrink: 0;
}
</style>
