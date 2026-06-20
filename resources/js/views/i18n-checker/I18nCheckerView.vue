<template>
  <div class="i18n-checker">
    <div class="i18n-page-header">
      <h1 class="i18n-page-title">
        <Icon class-name="translate" />
        {{ $t('i18nChecker.title') || 'Проверка переводов i18n' }}
      </h1>
      <p class="i18n-page-subtitle">
        {{ $t('i18nChecker.subtitle') || 'Проверка и сканирование переводов' }}
      </p>
    </div>

    <!-- Три режима -->
    <div class="i18n-mode-switcher">
      <button
          :class="['i18n-mode-btn', { 'i18n-mode-active': currentMode === 'simple' }]"
          @click="currentMode = 'simple'"
      >
        <Icon class-name="check-circle" />
        <span>{{ $t('i18nChecker.simpleMode') || 'Простая проверка' }}</span>
      </button>
      <button
          :class="['i18n-mode-btn', { 'i18n-mode-active': currentMode === 'scanner' }]"
          @click="switchToScanner"
      >
        <Icon class-name="search" />
        <span>{{ $t('i18nChecker.scannerMode') || 'Сканер кода' }}</span>
      </button>
      <button
          :class="['i18n-mode-btn', { 'i18n-mode-active': currentMode === 'validator' }]"
          @click="switchToValidator"
      >
        <Icon class-name="warning" />
        <span>{{ $t('i18nChecker.validatorMode') || 'Проверка путей' }}</span>
      </button>
    </div>

    <div v-if="currentMode === 'simple'" class="i18n-mode-content">
      <I18nCheckerSimpleMode />
    </div>

    <div v-else-if="currentMode === 'scanner'" class="i18n-mode-content">
      <I18nScannerMode
          :loading="scannerLoading"
          :report="scannerReport"
          :error="scannerError"
          @scan="runScanner"
      />
    </div>

    <div v-else-if="currentMode === 'validator'" class="i18n-mode-content">
      <I18nValidatorMode
          :loading="validatorLoading"
          :report="validatorReport"
          :error="validatorError"
          @validate="runValidator"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import Icon from '@components/Icon/Icon.vue';
import I18nCheckerSimpleMode from '@components/I18nChecker/components/I18nCheckerSimpleMode.vue';
import I18nScannerMode from '@components/I18nChecker/components/I18nScannerMode.vue';
import I18nValidatorMode from '@components/I18nChecker/components/I18nValidatorMode.vue';
import { scanI18n, validateI18nPaths } from '@components/I18nChecker/api/i18n.js';

const { t } = useI18n();

const currentMode = ref('simple');

// Scanner
const scannerLoading = ref(false);
const scannerReport = ref(null);
const scannerError = ref(null);

// Validator
const validatorLoading = ref(false);
const validatorReport = ref(null);
const validatorError = ref(null);

const switchToScanner = () => {
  currentMode.value = 'scanner';
  if (!scannerReport.value && !scannerError.value) {
    runScanner();
  }
};

const switchToValidator = () => {
  currentMode.value = 'validator';
  if (!validatorReport.value && !validatorError.value) {
    runValidator();
  }
};

const runScanner = async () => {
  scannerLoading.value = true;
  scannerError.value = null;

  try {
    const response = await scanI18n();

    if (response?.success && response?.data) {
      scannerReport.value = response.data;
      ElMessage.success(t('i18nChecker.scanComplete') || 'Сканирование завершено!');
    } else {
      scannerError.value = response?.message || 'Ошибка сканирования';
      ElMessage.error(scannerError.value);
    }
  } catch (error) {
    scannerError.value = error?.response?.data?.message || 'Ошибка при сканировании';
    ElMessage.error(scannerError.value);
  } finally {
    scannerLoading.value = false;
  }
};

const runValidator = async () => {
  validatorLoading.value = true;
  validatorError.value = null;

  try {
    const response = await validateI18nPaths();

    if (response?.success && response?.data) {
      validatorReport.value = response.data;
      ElMessage.success(t('i18nChecker.validationComplete') || 'Проверка путей завершена!');
    } else {
      validatorError.value = response?.message || 'Ошибка проверки';
      ElMessage.error(validatorError.value);
    }
  } catch (error) {
    validatorError.value = error?.response?.data?.message || 'Ошибка при проверке';
    ElMessage.error(validatorError.value);
  } finally {
    validatorLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.i18n-checker {
  padding: 4px;
  max-width: 1400px;
  margin: 0 auto;
}

.i18n-page-header {
  margin-bottom: 4px;

  .i18n-page-title {
    font-size: 20px;
    font-weight: 700;
    color: #303133;
    margin: 0 0 4px 0;
    display: flex;
    align-items: center;
    gap: 4px;

    .bi {
      font-size: 24px;
      color: #1890ff;
    }
  }

  .i18n-page-subtitle {
    font-size: 13px;
    color: #909399;
    margin: 0;
  }
}

.i18n-mode-switcher {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
  padding: 4px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  .i18n-mode-btn {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 0 10px;
    height: 30px;
    background: #f5f7fa;
    border: 2px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 13px;
    font-weight: 500;

    &:hover {
      background: #ecf5ff;
      border-color: #b3d8ff;
    }

    &.i18n-mode-active {
      background: #ecf5ff;
      border-color: #1890ff;
      color: #1890ff;
    }
  }
}

.i18n-mode-content {
  animation: i18n-fadeIn 0.3s ease;
}

@keyframes i18n-fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
