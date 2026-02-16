import { ref, onMounted, onUnmounted, watch } from 'vue';
import {
    isContainerActive,
    isContainerVisible,
    logDebug
} from '@/components/SmartLight/api/utils/webglSupport';

export function useContainer(containerRef) {
    const isVisible = ref(false);
    const isActiveTab = ref(true);
    const observers = [];

    /**
     * Проверка видимости контейнера
     */
    const checkVisibility = () => {
        if (!containerRef.value) return false;

        const rect = containerRef.value.getBoundingClientRect();
        const style = getComputedStyle(containerRef.value);

        isVisible.value = (
            rect.width > 0 &&
            rect.height > 0 &&
            rect.bottom > 0 &&
            rect.top < window.innerHeight &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0'
        );

        return isVisible.value;
    };

    /**
     * Проверка активности вкладки
     */
    const checkActiveTab = () => {
        isActiveTab.value = isContainerActive(containerRef.value);
        return isActiveTab.value;
    };

    /**
     * Настройка наблюдателей
     */
    const setupObservers = () => {
        // MutationObserver для отслеживания изменений вкладок
        const tabPane = containerRef.value?.closest('.el-tab-pane');
        if (tabPane) {
            const observer = new MutationObserver(checkActiveTab);
            observer.observe(tabPane, {
                attributes: true,
                attributeFilter: ['class']
            });
            observers.push(observer);
        }

        // ResizeObserver для отслеживания размеров
        if (typeof ResizeObserver !== 'undefined' && containerRef.value) {
            const resizeObserver = new ResizeObserver(checkVisibility);
            resizeObserver.observe(containerRef.value);
            observers.push(resizeObserver);
        }
    };

    /**
     * Очистка наблюдателей
     */
    const cleanup = () => {
        observers.forEach(observer => observer.disconnect());
        observers.length = 0;
    };

    onMounted(() => {
        // Устанавливаем начальные значения
        checkVisibility();
        checkActiveTab();

        // Настраиваем наблюдателей
        if (containerRef.value) {
            setupObservers();
        }

        // Отслеживание видимости и активности вкладки
        watch([isVisible, isActiveTab], ([visible, active]) => {
            logDebug('useContainer', 'Изменение видимости или активности', {
                visible,
                active,
                container: containerRef.value
            });
        });
    });

    onUnmounted(cleanup);

    return {
        isVisible,
        isActiveTab,
        checkVisibility,
        checkActiveTab,
        setupObservers,
        cleanup
    };
}
