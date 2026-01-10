// resources/js/components/SmartLight/services/PowerService.js
export class PowerService {
    static calculateRuntime(device) {
        const currentVoltage = device.voltage || 3.7;
        const batteryCapacity = device.battery_capacity || 2000;
        const criticalVoltage = device.critical_voltage || 3.2;

        if (currentVoltage <= criticalVoltage) {
            return 'КРИТИЧЕСКИЙ ЗАРЯД';
        }

        const lightCurrent = 40; // mA
        const espCurrent = 0.5;  // mA
        const remainingCapacity = batteryCapacity * ((currentVoltage - 2.8) / (4.2 - 2.8));
        const dailyConsumption = (lightCurrent * 10) + (espCurrent * 24);
        const days = remainingCapacity / dailyConsumption;

        return this.formatRuntime(days);
    }

    static formatRuntime(days) {
        if (days < 1) {
            const hours = Math.round(days * 24);
            return `${hours} ${this.declineWord(hours, ['час', 'часа', 'часов'])}`;
        }
        return `${Math.round(days * 10) / 10} ${this.declineWord(Math.floor(days), ['день', 'дня', 'дней'])}`;
    }

    static declineWord(number, words) {
        const num = Math.abs(number) % 100;
        const lastDigit = num % 10;
        if (num > 10 && num < 20) return words[2];
        if (lastDigit === 1) return words[0];
        if (lastDigit >= 2 && lastDigit <= 4) return words[1];
        return words[2];
    }
}
