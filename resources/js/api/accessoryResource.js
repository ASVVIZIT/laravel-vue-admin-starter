import Resource from '@/api/resource';
import request from "@utils/request.js";

class AccessoryResource extends Resource {
    constructor() {
        super('entities/ep_accessories');
    }

    // Универсальный метод для получения данных с параметрами
    listPaginated(query = {}) {
        return request({
            url: `/${this.uri}`,
            method: 'get',
            params: query
        });
    }

    listForDropdown() {
        return request({
            url: `/${this.uri}`,
            method: 'get',
            params: { for_dropdown: true }
        });
    }

}

export { AccessoryResource as default };
