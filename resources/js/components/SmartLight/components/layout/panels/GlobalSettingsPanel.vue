<template>
  <div class="global-settings-panel" :class="{ 'panel-loading': loading }">
    <GlobalSettingsForm
        ref="formRef"
        @saved="handleSaved"
        @cancelled="handleCancelled"
    />

    <div class="panel-actions">
      <el-button @click="handleReset" :loading="loading">Сбросить</el-button>
      <el-button type="primary" @click="handleSave" :loading="loading">
        Сохранить
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElNotification } from 'element-plus';
import GlobalSettingsForm from '@/components/SmartLight/components/settings/GlobalSettingsForm.vue';

const emit = defineEmits(['saved']);

const formRef = ref(null);
const loading = ref(false);

const handleSave = async () => {
  if (!formRef.value) return;
  loading.value = true;
  try {
    await formRef.value.saveSettings();
    ElNotification({
      title: 'Успех',
      message: 'Глобальные настройки сохранены',
      type: 'success'
    });
    emit('saved');
  } catch (error) {
    ElNotification({
      title: 'Ошибка',
      message: error.message,
      type: 'error'
    });
  } finally {
    loading.value = false;
  }
};

const handleReset = async () => {
  if (!formRef.value) return;
  loading.value = true;
  try {
    await formRef.value.resetSettings();
    ElNotification({
      title: 'Успех',
      message: 'Настройки сброшены',
      type: 'success'
    });
  } catch (error) {
    ElNotification({
      title: 'Ошибка',
      message: error.message,
      type: 'error'
    });
  } finally {
    loading.value = false;
  }
};

const handleCancelled = () => {};
</script>

<style scoped>
.global-settings-panel {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.global-settings-panel.panel-loading {
  opacity: 0.6;
  pointer-events: none;
}

.panel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid #e4e7ed;
}
</style>
