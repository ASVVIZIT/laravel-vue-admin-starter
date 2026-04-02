/**
 * ============================================================================
 * USE CONTAINER — ОТСЛЕЖИВАНИЕ КОНТЕЙНЕРА
 * ============================================================================
 * 📁 Путь: composables/useContainer.js
 * ✅ Отслеживание видимости и активности контейнера
 * ✅ Отвечает за: проверку видимости, ResizeObserver, MutationObserver
 * ============================================================================
 */

import { ref, onMounted, onUnmounted, watch } from 'vue';
import { logDebug } from '@/components/SmartLight/utils/appLogger.js';

export function useContainer(containerRef) {
    const isVisible = ref(false);
    const isActiveTab = ref(true);
    const observers = [];

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

    const checkActiveTab = () => {
        const tabPane = containerRef.value?.closest('.el-tab-pane');
        if (tabPane) {
            isActiveTab.value = !tabPane.classList.contains('is-active');
        }
        return isActiveTab.value;
    };

    const setupObservers = () => {
        const tabPane = containerRef.value?.closest('.el-tab-pane');
        if (tabPane) {
            const observer = new MutationObserver(checkActiveTab);
            observer.observe(tabPane, {
                attributes: true,
                attributeFilter: ['class']
            });
            observers.push(observer);
        }
        if (typeof ResizeObserver !== 'undefined' && containerRef.value) {
            const resizeObserver = new ResizeObserver(checkVisibility);
            resizeObserver.observe(containerRef.value);
            observers.push(resizeObserver);
        }
    };

    const cleanup = () => {
        observers.forEach(observer => observer.disconnect());
        observers.length = 0;
    };

    onMounted(() => {
        checkVisibility();
        checkActiveTab();
        if (containerRef.value) {
            setupObservers();
        }
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

export default useContainer;
