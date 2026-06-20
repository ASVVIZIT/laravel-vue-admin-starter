/**
 * Composable для управления состоянием I18n Checker
 * Выносит бизнес-логику из UI компонентов
 */
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { scanI18n, validateI18nPaths } from '@components/I18nChecker/api/i18n.js';

export function useI18nChecker() {
    const { t } = useI18n();

    const currentMode = ref('simple');

    // Scanner state
    const scannerLoading = ref(false);
    const scannerReport = ref(null);
    const scannerError = ref(null);

    // Validator state
    const validatorLoading = ref(false);
    const validatorReport = ref(null);
    const validatorError = ref(null);

    /**
     * Запустить сканер кода
     */
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

    /**
     * Запустить валидатор путей
     */
    const runValidator = async () => {
        validatorLoading.value = true;
        validatorError.value = null;

        try {
            const response = await validateI18nPaths();

            if (response?.success && response?.data) {
                validatorReport.value = response.data;
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

    /**
     * Переключить режим
     */
    const switchMode = (mode) => {
        currentMode.value = mode;

        // Автозапуск при первом переключении
        if (mode === 'scanner' && !scannerReport.value && !scannerError.value) {
            runScanner();
        } else if (mode === 'validator' && !validatorReport.value && !validatorError.value) {
            runValidator();
        }
    };

    return {
        currentMode,
        switchMode,

        // Scanner
        scannerLoading,
        scannerReport,
        scannerError,
        runScanner,

        // Validator
        validatorLoading,
        validatorReport,
        validatorError,
        runValidator
    };
}
