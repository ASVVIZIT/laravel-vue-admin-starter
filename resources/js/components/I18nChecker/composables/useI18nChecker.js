import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { scanI18n, validateI18nPaths } from '@components/I18nChecker/api/i18n.js';
import { useI18nSettings } from './useI18nSettings.js';

export function useI18nChecker() {
    const { t } = useI18n();
    const { cacheResults, cacheTTL, autoRunScanner, autoRunValidator } = useI18nSettings();

    const currentMode = ref('simple');

    const scannerLoading = ref(false);
    const scannerReport = ref(null);
    const scannerError = ref(null);
    const scannerCacheTime = ref(0);

    const validatorLoading = ref(false);
    const validatorReport = ref(null);
    const validatorError = ref(null);
    const validatorCacheTime = ref(0);

    // 🔥 Проверка валидности кэша
    const isCacheValid = (cacheTime) => {
        if (!cacheResults.value) return false;
        const now = Date.now();
        return (now - cacheTime) < (cacheTTL.value * 1000);
    };

    const runScanner = async () => {
        // 🔥 Проверка кэша
        if (isCacheValid(scannerCacheTime.value) && scannerReport.value) {
            ElMessage.info(t('i18nChecker.cacheUsed') || 'Используются кэшированные данные');
            return;
        }

        scannerLoading.value = true;
        scannerError.value = null;

        try {
            const response = await scanI18n();
            if (response?.success && response?.data) {
                scannerReport.value = response.data;
                scannerCacheTime.value = Date.now();
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
        // 🔥 Проверка кэша
        if (isCacheValid(validatorCacheTime.value) && validatorReport.value) {
            ElMessage.info(t('i18nChecker.cacheUsed') || 'Используются кэшированные данные');
            return;
        }

        validatorLoading.value = true;
        validatorError.value = null;

        try {
            const response = await validateI18nPaths();
            if (response?.success && response?.data) {
                validatorReport.value = response.data;
                validatorCacheTime.value = Date.now();
                ElMessage.success(t('i18nChecker.validationComplete') || 'Проверка завершена!');
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

    const switchMode = (mode) => {
        currentMode.value = mode;
    };

    // 🔥 Автозапуск режимов при переключении
    watch(currentMode, (newMode) => {
        if (newMode === 'scanner' && autoRunScanner.value && !scannerReport.value && !scannerError.value) {
            runScanner();
        } else if (newMode === 'validator' && autoRunValidator.value && !validatorReport.value && !validatorError.value) {
            runValidator();
        }
    });

    return {
        currentMode,
        switchMode,
        scannerLoading,
        scannerReport,
        scannerError,
        runScanner,
        validatorLoading,
        validatorReport,
        validatorError,
        runValidator
    };
}
