import Resource from '@/api/resource';
import request from "@utils/request.js";

class MeasurementCategoryResource extends Resource {
    constructor() {
        super('entities/ep_measurement_categories');
    }

    list(query = {}) {
        return request({
            url: `/${this.uri}`,
            method: 'get',
            params: query
        });
    }
}

export default MeasurementCategoryResource;
