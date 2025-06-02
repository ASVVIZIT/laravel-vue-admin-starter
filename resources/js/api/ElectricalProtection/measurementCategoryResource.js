// /resources/js/api/measurementCategoryResource.js
import Resource from '@api/resource.js';
import request from '@utils/request.js';

class MeasurementCategoryResource extends Resource {
    constructor() {
        super('entities/ep_measurement_categories');
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
            url: `/${this.uri}/all`,
            method: 'get',
            params: { for_dropdown: true }
        });
    }
}

export default MeasurementCategoryResource;
