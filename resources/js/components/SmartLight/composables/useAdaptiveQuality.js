/**
 * ============================================================================
 * USE ADAPTIVE QUALITY — АДАПТИВНОЕ КАЧЕСТВО РЕНДЕРИНГА
 * ============================================================================
 * 📁 Путь: composables/useAdaptiveQuality.js
 * ✅ Используется: UniversalThreeScene, BatteryRenderer, BulbRenderer
 * ✅ Назначение: Определение возможностей устройства и настройка качества
 * ============================================================================
 */

import { ref, computed, onMounted } from 'vue';

export function useAdaptiveQuality() {
    const isMobile = ref(false);
    const isTablet = ref(false);
    const isLowEnd = ref(false);
    const isTouchDevice = ref(false);
    const targetFPS = ref(60);
    const currentQuality = ref('high');
    const pixelRatio = ref(window.devicePixelRatio || 1);
    const maxTextureSize = ref(0);
    const gpuName = ref('Unknown');

    // DETECT DEVICE TYPE
    const detectDeviceType = () => {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;

        // Mobile detection
        isMobile.value = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

        // Tablet detection
        isTablet.value = /iPad|Android(?!.*Mobile)/i.test(userAgent);

        // Touch device detection
        isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        console.log('[AdaptiveQuality] Device detected:', {
            isMobile: isMobile.value,
            isTablet: isTablet.value,
            isTouchDevice: isTouchDevice.value
        });
    };

    // TEST GPU PERFORMANCE
    const testGPUPerformance = async () => {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

            if (!gl) {
                isLowEnd.value = true;
                currentQuality.value = 'low';
                targetFPS.value = 24;
                pixelRatio.value = 1;
                return;
            }

            // Get GPU info
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                gpuName.value = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }

            // Get max texture size
            maxTextureSize.value = gl.getParameter(gl.MAX_TEXTURE_SIZE);

            // Low-end GPU detection
            const lowEndGPUs = [
                'Adreno 5', 'Adreno 6', 'Mali-G', 'Mali-T',
                'PowerVR', 'SGX', 'Intel HD Graphics 3', 'Intel HD Graphics 4'
            ];

            isLowEnd.value = lowEndGPUs.some(gpu => gpuName.value.includes(gpu));

            // Quality determination
            if (isLowEnd.value || maxTextureSize.value < 4096) {
                currentQuality.value = 'low';
                targetFPS.value = 24;
                pixelRatio.value = 1;
            } else if (maxTextureSize.value < 8192 || isMobile.value) {
                currentQuality.value = 'medium';
                targetFPS.value = 30;
                pixelRatio.value = Math.min(1.5, window.devicePixelRatio);
            } else {
                currentQuality.value = 'high';
                targetFPS.value = 60;
                pixelRatio.value = window.devicePixelRatio;
            }

            console.log('[AdaptiveQuality] GPU test result:', {
                gpuName: gpuName.value,
                maxTextureSize: maxTextureSize.value,
                isLowEnd: isLowEnd.value,
                quality: currentQuality.value,
                targetFPS: targetFPS.value,
                pixelRatio: pixelRatio.value
            });

        } catch (error) {
            console.error('[AdaptiveQuality] GPU test failed:', error);
            isLowEnd.value = true;
            currentQuality.value = 'low';
        }
    };

    // GET RENDERER SETTINGS
    const getRendererSettings = computed(() => {
        return {
            antialias: currentQuality.value === 'high',
            alpha: true,
            powerPreference: currentQuality.value === 'high' ? 'high-performance' : 'default',
            pixelRatio: pixelRatio.value,
            preserveDrawingBuffer: currentQuality.value === 'low',
            failIfMajorPerformanceCaveat: false
        };
    });

    // GET SHADOW SETTINGS
    const getShadowSettings = computed(() => {
        return {
            enabled: currentQuality.value === 'high',
            type: currentQuality.value === 'high' ? 'PCFSoftShadowMap' : 'BasicShadowMap',
            autoUpdate: currentQuality.value !== 'low'
        };
    });

    // GET ANIMATION SETTINGS
    const getAnimationSettings = computed(() => {
        return {
            targetFPS: targetFPS.value,
            frameInterval: 1000 / targetFPS.value,
            autoRotate: currentQuality.value !== 'low',
            rotateSpeed: currentQuality.value === 'low' ? 0.005 : 0.01
        };
    });

    // INITIALIZE
    const init = async () => {
        detectDeviceType();
        await testGPUPerformance();
    };

    // RUN ON MOUNTED
    onMounted(() => {
        init();
    });

    return {
        // State
        isMobile,
        isTablet,
        isLowEnd,
        isTouchDevice,
        targetFPS,
        currentQuality,
        pixelRatio,
        maxTextureSize,
        gpuName,
        // Computed settings
        getRendererSettings,
        getShadowSettings,
        getAnimationSettings,
        // Methods
        init,
        detectDeviceType,
        testGPUPerformance
    };
}

export default useAdaptiveQuality;
