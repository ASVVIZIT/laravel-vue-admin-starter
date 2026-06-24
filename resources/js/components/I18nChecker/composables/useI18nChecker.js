import { ref, computed, watch } from 'vue';
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

    // ========================================================================
    // 🔥 СТАТУС КЭША: fresh / used / expired
    // ========================================================================
    const getCacheStatus = (cacheTime, hasData) => {
        if (!hasData) return null;
        if (!cacheResults.value) return 'fresh';
        const age = Date.now() - cacheTime;
        const ttl = cacheTTL.value * 1000;
        if (age < ttl) return 'used';
        return 'expired';
    };

    const scannerCacheStatus = computed(() =>
        getCacheStatus(scannerCacheTime.value, !!scannerReport.value)
    );

    const validatorCacheStatus = computed(() =>
        getCacheStatus(validatorCacheTime.value, !!validatorReport.value)
    );

    // Текст статуса кэша (для UI)
    const scannerCacheLabel = computed(() => {
        const map = {
            'fresh': t('i18nChecker.settings.behavior.cacheFresh') || 'Актуальные данные',
            'used': t('i18nChecker.settings.behavior.cacheUsed') || 'Из кэша',
            'expired': t('i18nChecker.settings.behavior.cacheExpired') || 'Кэш устарел',
        };
        return map[scannerCacheStatus.value] || '';
    });

    const validatorCacheLabel = computed(() => {
        const map = {
            'fresh': t('i18nChecker.settings.behavior.cacheFresh') || 'Актуальные данные',
            'used': t('i18nChecker.settings.behavior.cacheUsed') || 'Из кэша',
            'expired': t('i18nChecker.settings.behavior.cacheExpired') || 'Кэш устарел',
        };
        return map[validatorCacheStatus.value] || '';
    });

    // Проверка валидности кэша
    const isCacheValid = (cacheTime) => {
        if (!cacheResults.value) return false;
        return (Date.now() - cacheTime) < (cacheTTL.value * 1000);
    };

    // ========================================================================
    // СКАНЕР
    // ========================================================================
    const runScanner = async () => {
        if (isCacheValid(scannerCacheTime.value) && scannerReport.value) {
            ElMessage.info(t('i18nChecker.settings.behavior.cacheUsed') || 'Из кэша');
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

    // ========================================================================
    // ВАЛИДАТОР
    // ========================================================================
    const runValidator = async () => {
        if (isCacheValid(validatorCacheTime.value) && validatorReport.value) {
            ElMessage.info(t('i18nChecker.settings.behavior.cacheUsed') || 'Из кэша');
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

    // ========================================================================
    // ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ
    // ========================================================================
    const switchMode = (mode) => {
        currentMode.value = mode;
    };

    // 🔥 ОТЛАДКА — watch ВСЕГДА срабатывает
    watch(scannerCacheStatus, (newStatus, oldStatus) => {
        console.log('[Cache] Scanner status changed:', oldStatus, '→', newStatus, {
            cacheTime: scannerCacheTime.value,
            hasData: !!scannerReport.value,
            cacheResults: cacheResults.value,
            cacheTTL: cacheTTL.value,
            age: scannerCacheTime.value ? Date.now() - scannerCacheTime.value : 'N/A'
        });
    }, { immediate: true });  // ← immediate: true → вызовется сразу при создании

    watch(validatorCacheStatus, (newStatus, oldStatus) => {
        console.log('[Cache] Validator status changed:', oldStatus, '→', newStatus);
    }, { immediate: true });

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
        scannerCacheStatus,
        scannerCacheLabel,
        runScanner,
        validatorLoading,
        validatorReport,
        validatorError,
        validatorCacheStatus,
        validatorCacheLabel,
        runValidator
    };
}
