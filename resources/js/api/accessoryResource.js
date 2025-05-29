import Resource from '@/api/resource';
import request from "@utils/request.js";

class AccessoryResource extends Resource {
    constructor() {
        super('entities/ep_accessories');
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

export { AccessoryResource as default };
