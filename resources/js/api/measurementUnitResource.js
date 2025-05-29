import Resource from '@/api/resource';
import request from "@utils/request.js";

class MeasurementUnitResource extends Resource {
    constructor() {
        super('entities/ep_measurement_units');
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

export default MeasurementUnitResource;
