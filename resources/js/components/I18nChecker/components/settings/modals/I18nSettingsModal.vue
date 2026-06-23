<template>
  <el-dialog
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      width="700px"
      :close-on-click-modal="false"
      class="i18n-settings-modal"
  >
    <!-- 🔥 ШАПКА: заголовок + переключатель языка -->
    <template #header>
      <div class="i18n-settings-modal-header">
        <div class="i18n-settings-modal-title">
          <I18nIcon name="settings" :size="18" />
          <span>{{ $t('i18nChecker.settings.title') || 'Настройки модуля I18nChecker' }}</span>
        </div>
        <I18nLangSwitcher />
      </div>
    </template>

    <I18nSettingsForm
        ref="formRef"
        @saved="handleSaved"
        @cancelled="handleCancelled"
    />

    <template #footer>
      <el-button @click="close">{{ $t('i18nChecker.settings.cancel') || 'Отмена' }}</el-button>
      <el-button @click="handleReset" :loading="loading">{{ $t('i18nChecker.settings.reset') || 'Сбросить' }}</el-button>
      <el-button type="primary" @click="handleSave" :loading="loading">
        {{ $t('i18nChecker.settings.save') || 'Сохранить' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { ElNotification } from 'element-plus';
import I18nIcon from '@components/I18nChecker/components/shared/I18nIcon.vue';
import I18nLangSwitcher from '@components/I18nChecker/components/shared/I18nLangSwitcher.vue';
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
  padding: 20px;
}

.i18n-settings-modal :deep(.el-dialog__footer) {
  padding: 12px 20px;
  border-top: 1px solid #ebeef5;
}

.i18n-settings-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.i18n-settings-modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
</style>
