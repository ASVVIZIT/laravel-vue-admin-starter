/**
 * ============================================================================
 * V0 DEVICE RESOURCE — ТЕКУЩАЯ ВЕРСИЯ
 * ============================================================================
 * 📁 Путь: api/v0/V0DeviceResource.js
 * ✅ Расширяет: api/core/DeviceResource.js
 * ============================================================================
 */

import { DeviceResource } from '@/components/SmartLight/api/core/DeviceResource.js';

export class V0DeviceResource extends DeviceResource {
    constructor() {
        super();
        this.version = null; // V0 = default (без префикса)
        this.apiVersion = 'v0';
    }

    // V0 использует всю логику Core без изменений
    // При необходимости можно переопределить методы

    getVersion() {
        return this.apiVersion;
    }
}

export default V0DeviceResource;
