// /resources/js/api/brandResource.js
import Resource from '@api/resource.js';
import request from '@utils/request.js';

class BrandResource extends Resource {
    constructor() {
        super('entities/ep_brands');
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
    // Или методы, специфичные для бренда
    getBrandsByCountry(countryCode) {
        return request({
            url: `/entities/ep_brands?country=${countryCode}`,
            method: 'get'
        });
    }
}

export { BrandResource as default };
