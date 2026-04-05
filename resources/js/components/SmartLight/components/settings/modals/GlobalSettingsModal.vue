<template>
  <el-dialog
      v-model="visible"
      title="Глобальные настройки"
      width="700px"
      :close-on-click-modal="false"
      class="global-settings-modal"
  >
    <!-- Форма глобальных настроек -->
    <GlobalSettingsForm
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
import { useTypesStore } from '@/components/SmartLight/stores/index.js';
import GlobalSettingsForm from '@/components/SmartLight/components/settings/forms/GlobalSettingsForm.vue';

const visible = defineModel();
const formRef = ref(null);
const typesStore = useTypesStore(); // ✅ Добавлен для ожидания загрузки типов
const loading = ref(false);

// Сохранение настроек
const handleSave = async () => {
  if (!formRef.value) return;
  loading.value = true;
  try {
    // Ждём загрузки типов если форма их использует
    if (!typesStore.typesLoaded) {
      await typesStore.fetchTypesStore();
    }
    await formRef.value.saveSettings();
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

// Сброс настроек
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

// Обработка успешного сохранения
const handleSaved = () => {
  ElNotification({
    title: 'Успех',
    message: 'Глобальные настройки сохранены',
    type: 'success'
  });
  visible.value = false;
};

// Обработка отмены
const handleCancelled = () => {};
</script>

<style scoped>
.global-settings-modal :deep(.el-dialog__body) {
  padding: 20px;
}

.global-settings-modal :deep(.el-dialog__footer) {
  padding: 12px 20px;
  border-top: 1px solid #ebeef5;
}
</style>
