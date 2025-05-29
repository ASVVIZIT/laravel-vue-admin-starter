import Resource from '@/api/resource';
import request from "@utils/request.js";

class DeviceTypeResource extends Resource {
    constructor() {
        super('entities/ep_device_types');
    }

    // Универсальный метод для получения данных с параметрами
    list(query = {}) {
        return request({
            url: `/${this.uri}`,
            method: 'get',
            params: query
        });
    }
}

export { DeviceTypeResource as default };
