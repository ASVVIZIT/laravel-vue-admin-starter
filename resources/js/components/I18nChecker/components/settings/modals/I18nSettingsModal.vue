<template>
  <el-dialog
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      title="Настройки модуля I18nChecker"
      width="700px"
      :close-on-click-modal="false"
      class="i18n-settings-modal"
  >
    <I18nSettingsForm
        ref="formRef"
        @saved="handleSaved"
        @cancelled="handleCancelled"
    />

    <template #footer>
      <el-button @click="close">Отмена</el-button>
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
import I18nSettingsForm from '../I18nSettingsForm.vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);

const formRef = ref(null);
const loading = ref(false);

const close = () => {
  emit('update:modelValue', false);
};

const handleSave = async () => {
  if (!formRef.value) return;
  loading.value = true;
  try {
    await formRef.value.saveSettings();
  } catch (error) {
    console.error('[I18nSettingsModal] Save error:', error);
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
    console.error('[I18nSettingsModal] Reset error:', error);
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
  close();
};

const handleCancelled = () => {};
</script>

<style scoped>
.i18n-settings-modal :deep(.el-dialog__body) {
  padding: 10px;
}

.i18n-settings-modal :deep(.el-dialog__footer) {
  padding: 8px 10px;
  border-top: 1px solid #ebeef5;
}
</style>
