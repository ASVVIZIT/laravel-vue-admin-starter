import Resource from '@/api/resource';
import request from "@utils/request.js";

class MeasurementUnitResource extends Resource {
    constructor() {
        super('entities/ep_measurement_units');
    }

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

export default MeasurementUnitResource;
