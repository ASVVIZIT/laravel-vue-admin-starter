import { ref, onMounted, onUnmounted, watch } from 'vue';
import { checkWebGLSupport } from '@/components/SmartLight/api/utils/webglSupport';
import { logDebug, logError } from '@/components/SmartLight/utils/appLogger';

export function useWebGL(containerRef) {
    const webGLCheck = ref(checkWebGLSupport());
    const isWebGLSupported = ref(webGLCheck.value.isSupported);
    const isInitialized = ref(false);
    const containerVisible = ref(false);
    const isActiveTab = ref(true);
    const animationFrame = ref(null);

    // THREE.js переменные
    let scene = null;
    let camera = null;
    let renderer = null;
    let controls = null;

    /**
     * Инициализация 3D-сцены
     */
    const initScene = () => {
        logDebug('useWebGL', 'Инициализация 3D-сцены', {
            webGLSupported: isWebGLSupported.value
        });

        if (!containerRef.value || !isWebGLSupported.value) {
            logDebug('useWebGL', 'Контейнер или WebGL не поддерживается', {
                containerRef: !!containerRef.value,
                isWebGLSupported: isWebGLSupported.value
            });
            return false;
        }

        // Очищаем предыдущую сцену
        cleanupScene();

        try {
            // Создаем сцену
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf5f7fa);

            // Создаем камеру
            camera = new THREE.PerspectiveCamera(
                75,
                containerRef.value.clientWidth / containerRef.value.clientHeight,
                0.1,
                1000
            );
            camera.position.z = 5;

            // Создаем рендерер
            renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });
            renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true;

            // Добавляем в DOM
            containerRef.value.appendChild(renderer.domElement);

            // Добавляем освещение
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(1, 1, 1);
            directionalLight.castShadow = true;
            scene.add(directionalLight);

            isInitialized.value = true;
            containerVisible.value = true;

            // Запускаем анимацию
            animate();

            return true;
        } catch (e) {
            logDebug('useWebGL', 'Ошибка инициализации 3D', {
                error: e.message,
                stack: e.stack
            });
            console.error('Ошибка инициализации 3D:', e);
            return false;
        }
    };

    /**
     * Анимация
     */
    const animate = () => {
        if (!containerVisible.value) {
            logDebug('useWebGL', 'Контейнер невидим, остановка анимации');
            return;
        }

        animationFrame.value = requestAnimationFrame(animate);

        try {
            if (controls) controls.update();
            renderer.render(scene, camera);
        } catch (e) {
            logDebug('useWebGL', 'Ошибка рендеринга', {
                error: e.message,
                stack: e.stack
            });
            console.error('Ошибка рендеринга:', e);
        }
    };

    /**
     * Очистка ресурсов
     */
    const cleanupScene = () => {
        logDebug('useWebGL', 'Очистка ресурсов 3D');

        if (animationFrame.value) {
            cancelAnimationFrame(animationFrame.value);
            animationFrame.value = null;
        }

        if (renderer) {
            renderer.dispose();
            renderer.forceContextLoss();
            renderer = null;
        }

        if (containerRef.value && containerRef.value.firstChild) {
            containerRef.value.removeChild(containerRef.value.firstChild);
        }

        if (scene) {
            scene.traverse(object => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            scene = null;
        }

        isInitialized.value = false;
        containerVisible.value = false;
    };

    /**
     * Проверка видимости контейнера
     */
    const checkVisibility = () => {
        if (!containerRef.value) {
            containerVisible.value = false;
            return false;
        }

        const rect = containerRef.value.getBoundingClientRect();
        const style = getComputedStyle(containerRef.value);

        // Проверяем, что контейнер виден
        const isVisible = (
            rect.width > 0 &&
            rect.height > 0 &&
            rect.bottom > 0 &&
            rect.top < window.innerHeight &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0'
        );

        containerVisible.value = isVisible;
        return isVisible;
    };

    /**
     * Проверка активности вкладки
     */
    const checkActiveTab = () => {
        const tabPane = containerRef.value?.closest('.el-tab-pane');
        if (tabPane) {
            const isActive = tabPane.classList.contains('is-active');
            isActiveTab.value = isActive;
            return isActive;
        }

        isActiveTab.value = true;
        return true;
    };

    /**
     * Инициализация при монтировании
     */
    onMounted(() => {
        // Даем время для полной загрузки
        setTimeout(() => {
            checkVisibility();
            checkActiveTab();

            if (containerVisible.value && isActiveTab.value && isWebGLSupported.value) {
                initScene();
            }
        }, 100);

        // Наблюдение за изменениями размеров контейнера
        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(() => {
                checkVisibility();
                if (containerVisible.value && isInitialized.value) {
                    camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
                }
            });

            resizeObserver.observe(containerRef.value);

            return () => {
                resizeObserver.disconnect();
            };
        }
    });

    /**
     * Обработка изменения размера окна
     */
    const onWindowResize = () => {
        if (!containerRef.value || !camera || !renderer) return;

        camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
    };

    // Следим за изменениями
    watch(containerVisible, (visible) => {
        if (visible && !isInitialized.value && isWebGLSupported.value) {
            initScene();
        }
    });

    watch(isActiveTab, (active) => {
        if (active && !isInitialized.value && isWebGLSupported.value) {
            initScene();
        }
    });

    // Инициализация обработчика ресайза
    window.addEventListener('resize', onWindowResize);

    // Очистка при размонтировании
    onUnmounted(() => {
        cleanupScene();
        window.removeEventListener('resize', onWindowResize);
    });

    return {
        isWebGLSupported,
        isInitialized,
        containerVisible,
        isActiveTab,
        initScene,
        cleanupScene,
        checkVisibility,
        checkActiveTab
    };
}
