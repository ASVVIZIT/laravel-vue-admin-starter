// /resources/js/api/deviceTypeResource.js
import Resource from '@api/resource.js';
import request from '@utils/request.js';

class DeviceTypeResource extends Resource {
    constructor() {
        super('entities/ep_device_types');
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

    // Добавим остальные методы для полноты
    show(id) {
        return request({
            url: `/${this.uri}/${id}`,
            method: 'get'
        });
    }

    store(data) {
        return request({
            url: `/${this.uri}`,
            method: 'post',
            data: data
        });
    }

    update(id, data) {
        return request({
            url: `/${this.uri}/${id}`,
            method: 'put',
            data: data
        });
    }

    destroy(id) {
        return request({
            url: `/${this.uri}/${id}`,
            method: 'delete'
        });
    }
}

export { DeviceTypeResource as default };
