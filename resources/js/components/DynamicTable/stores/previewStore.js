// resources/js/components/DynamicTable/TemplateBuilder/stores/previewStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const usePreviewStore = defineStore('previewStore', () => {
    const testMode = ref('auto'); // 'auto' | 'manual'
    const manualTestData = ref({}); // { rowIndex: { colIndex: value, ... }, ... }
    const columnWidths = ref({}); // { colIndex: width, ... }
    const cellStyles = ref({}); // { rowIndex: { colIndex: { backgroundColor, color, ... }, ... } }

    const isManualMode = computed(() => testMode.value === 'manual');

    const setTestMode = (mode) => {
        if (mode === 'auto' || mode === 'manual') {
            testMode.value = mode;
        }
    };

    const toggleTestMode = () => {
        testMode.value = testMode.value === 'auto' ? 'manual' : 'auto';
    };

    const updateManualTestData = (rowIndex, colIndex, value) => {
        if (!manualTestData.value[rowIndex]) {
            manualTestData.value[rowIndex] = {};
        }
        manualTestData.value[rowIndex][colIndex] = value;
    };

    const resetManualTestData = () => {
        manualTestData.value = {};
    };

    const setColumnWidth = (colIndex, width) => {
        columnWidths.value[colIndex] = width;
    };

    const updateCellStyles = (rowIndex, colIndex, styles) => {
        if (!cellStyles.value[rowIndex]) {
            cellStyles.value[rowIndex] = {};
        }
        cellStyles.value[rowIndex][colIndex] = {
            ...cellStyles.value[rowIndex][colIndex],
            ...styles
        };
    };

    const resetCellStyles = (rowIndex, colIndex) => {
        if (cellStyles.value[rowIndex]) {
            delete cellStyles.value[rowIndex][colIndex];
            if (Object.keys(cellStyles.value[rowIndex]).length === 0) {
                delete cellStyles.value[rowIndex];
            }
        }
    };

    const resetAllCellStyles = () => {
        cellStyles.value = {};
    };

    return {
        testMode,
        manualTestData,
        columnWidths,
        cellStyles,
        isManualMode,
        setTestMode,
        toggleTestMode,
        updateManualTestData,
        resetManualTestData,
        setColumnWidth,
        updateCellStyles,
        resetCellStyles,
        resetAllCellStyles
    };
});
