/**
 * ============================================================================
 * USE WEBGL — 3D СЦЕНА
 * ============================================================================
 * 📁 Путь: composables/useWebGL.js
 * ✅ Используется: ThreeScene, Bulb3D, BatteryRenderer
 * ✅ Интеграция: apiWebglSupportUtils, useContainer, appLogger
 * ============================================================================
 */

import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { checkWebGLSupport } from '@/components/SmartLight/api/core/utils/coreApiWebglSupportUtils.js';
import { logDebug, logError } from '@/components/SmartLight/utils/appLogger.js';
import { useContainer } from './useContainer.js';

export function useWebGL(containerRef) {
    const webGLCheck = checkWebGLSupport();
    const isWebGLSupported = ref(webGLCheck.isSupported);
    const isInitialized = ref(false);
    const animationFrame = ref(null);
    let scene = null, camera = null, renderer = null, controls = null;
    const { isVisible, isActiveTab } = useContainer(containerRef);

    const initScene = () => {
        logDebug('useWebGL', 'Инициализация 3D-сцены', { webGLSupported: isWebGLSupported.value });
        if (!containerRef.value || !isWebGLSupported.value) {
            logDebug('useWebGL', 'Контейнер или WebGL не поддерживается');
            return false;
        }
        cleanupScene();
        try {
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf5f7fa);
            camera = new THREE.PerspectiveCamera(
                75,
                containerRef.value.clientWidth / containerRef.value.clientHeight,
                0.1,
                1000
            );
            camera.position.z = 5;
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true;
            containerRef.value.appendChild(renderer.domElement);
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(1, 1, 1);
            directionalLight.castShadow = true;
            scene.add(directionalLight);
            isInitialized.value = true;
            animate();
            return true;
        } catch (e) {
            logError('useWebGL', 'Ошибка инициализации 3D', e);
            return false;
        }
    };

    const animate = () => {
        if (!isVisible.value) return;
        animationFrame.value = requestAnimationFrame(animate);
        try {
            if (controls) controls.update();
            renderer.render(scene, camera);
        } catch (e) {
            logError('useWebGL', 'Ошибка рендеринга', e);
        }
    };

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
        if (controls) {
            controls.dispose();
            controls = null;
        }
        isInitialized.value = false;
    };

    const onWindowResize = () => {
        if (!containerRef.value || !camera || !renderer) return;
        camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
    };

    onMounted(() => {
        setTimeout(() => {
            if (isVisible.value && isActiveTab.value && isWebGLSupported.value) {
                initScene();
            }
        }, 100);
        window.addEventListener('resize', onWindowResize);
    });

    onUnmounted(() => {
        cleanupScene();
        window.removeEventListener('resize', onWindowResize);
    });

    watch([isVisible, isActiveTab], ([visible, active]) => {
        if (visible && active && !isInitialized.value && isWebGLSupported.value) {
            initScene();
        }
    });

    return {
        isWebGLSupported,
        isInitialized,
        initScene,
        cleanupScene
    };
}

export default useWebGL;
