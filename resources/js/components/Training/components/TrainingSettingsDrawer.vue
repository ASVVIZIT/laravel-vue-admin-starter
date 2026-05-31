<template>
  <div class="settings-drawer" :class="{ 'drawer-open': isOpen }">
    <div class="drawer-header">
      <span class="title">Настройки модуля</span>
      <el-button type="text" @click="$emit('close')" size="small"><el-icon><Close /></el-icon></el-button>
    </div>
    <div class="drawer-content">
      <el-descriptions :column="1" size="small" border>
        <el-descriptions-item label="Режим отображения">
          <el-switch v-model="compactMode" size="small" @change="toggleCompact" />
        </el-descriptions-item>
        <el-descriptions-item label="Показывать объём">
          <el-switch v-model="showVolume" size="small" @change="$emit('update:volume', $event)" />
        </el-descriptions-item>
        <el-descriptions-item label="Экспорт данных">
          <el-button size="small" @click="$emit('export-csv')">📄 CSV</el-button>
        </el-descriptions-item>
      </el-descriptions>
      <p class="hint">Фильтры применяются мгновенно. Настройки сохраняются локально.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Close } from '@element-plus/icons-vue'

defineProps({ isOpen: Boolean })
defineEmits(['close', 'update:volume', 'export-csv'])

const compactMode = ref(false)
const showVolume = ref(true)
const toggleCompact = () => document.body.classList.toggle('compact-mode')
</script>

<style scoped>
.settings-drawer {
  position: absolute; top: 0; right: -320px; width: 320px; height: 100%;
  background: #fff; border-left: 1px solid #e4e7ed; box-shadow: -2px 0 10px rgba(0,0,0,0.05);
  transition: right 0.25s ease; z-index: 50; display: flex; flex-direction: column;
}
.drawer-open { right: 0; }
.drawer-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid #ebeef5; background: #f8f9fa; }
.title { font-weight: 600; font-size: 13px; }
.drawer-content { padding: 12px; flex: 1; overflow-y: auto; }
.hint { font-size: 10px; color: #909399; margin-top: 12px; line-height: 1.4; }
</style>
