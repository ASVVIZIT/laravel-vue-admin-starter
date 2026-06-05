<template>
  <el-dialog
      v-model="visible"
      title="Настройки модуля тренировок"
      width="700px"
      :close-on-click-modal="false"
      class="training-settings-modal"
  >
    <!-- Форма настроек -->
    <TrainingSettingsForm
        ref="formRef"
        @saved="handleSaved"
        @cancelled="handleCancelled"
    />

    <!-- Footer с кнопками -->
    <template #footer>
      <el-button @click="visible = false">Отмена</el-button>
      <el-button @click="handleReset" :loading="loading">Сбросить</el-button>
      <el-button type="primary" @click="handleSave" :loading="loading">
        Сохранить
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { ElNotification } from 'element-plus';
import TrainingSettingsForm from '../forms/TrainingSettingsForm.vue';

const visible = defineModel();
const formRef = ref(null);
const loading = ref(false);

const handleSave = async () => {
  if (!formRef.value) return;
  loading.value = true;
  try {
    await formRef.value.saveSettings();
  } catch (error) {
    ElNotification({
      title: 'Ошибка',
      message: error.message || 'Не удалось сохранить настройки',
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
      message: error.message || 'Не удалось сбросить настройки',
      type: 'error'
    });
  } finally {
    loading.value = false;
  }
};

const handleSaved = () => {
  ElNotification({
    title: 'Успех',
    message: 'Настройки сохранены',
    type: 'success'
  });
  visible.value = false;
};

const handleCancelled = () => {};
</script>

<style scoped>
.training-settings-modal :deep(.el-dialog__body) {
  padding: 20px;
}

.training-settings-modal :deep(.el-dialog__footer) {
  padding: 12px 20px;
  border-top: 1px solid #ebeef5;
}
</style>
