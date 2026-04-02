/**
 * ============================================================================
 * V1 COMMAND RESOURCE — ВЕРСИЯ 1 (НЕЗАВИСИМА ОТ V0)
 * ============================================================================
 * 📁 Путь: api/v1/resource/V1CommandResource.js
 * ✅ Расширяет: Core CommandResource
 * ============================================================================
 */

import { CommandResource } from '@/components/SmartLight/api/core/resource/CommandResource.js';

export class V1CommandResource extends CommandResource {
    constructor() {
        super();
        this.version = 'v1';
    }

    getVersion() {
        return 'v1';
    }

    // ✅ V1: Batch commands
    async batchSend(commands) {
        return this.post('/commands/batch', { commands });
    }

    async schedule(deviceId, command, scheduleAt) {
        return this.post('/commands/schedule', {
            device_id: deviceId,
            command,
            schedule_at: scheduleAt
        });
    }
}

export default V1CommandResource;
