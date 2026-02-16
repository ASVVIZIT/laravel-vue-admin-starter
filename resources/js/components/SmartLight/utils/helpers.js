// resources/js/components/SmartLight/api/utils/helpers.js
export const helpers = {
    /**
     * Приведение строки к числу с валидацией
     */
    toNumber(value, defaultValue = 0) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string' && !isNaN(parseFloat(value))) {
            return parseFloat(value);
        }
        return defaultValue;
    },

    /**
     * Форматирование напряжения с 3 знаками после запятой
     */
    formatVoltage(voltage) {
        return this.toNumber(voltage).toFixed(3) + ' В';
    },

    /**
     * Расчёт процента заряда аккумулятора
     */
    calculateBatteryPercentage(voltage, minVoltage = 2.5, maxVoltage = 4.3) {
        const numVoltage = this.toNumber(voltage);
        if (numVoltage <= minVoltage) return 0;
        if (numVoltage >= maxVoltage) return 100;
        return Math.round(((numVoltage - minVoltage) / (maxVoltage - minVoltage)) * 100);
    },

    /**
     * Определение цвета аккумулятора по напряжению
     */
    getBatteryColor(voltage) {
        const percentage = this.calculateBatteryPercentage(voltage);
        if (percentage < 20) return '#f56c6c'; // Красный
        if (percentage < 50) return '#e6a23c'; // Жёлтый
        return '#67c23a'; // Зелёный
    },

    /**
     * Глубокое клонирование объекта
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (Array.isArray(obj)) return obj.map(item => this.deepClone(item));
        const cloned = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    }
};
