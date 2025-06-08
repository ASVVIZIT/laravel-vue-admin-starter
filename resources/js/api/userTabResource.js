// resources/js/api/userTabResource.js
import { toRaw } from 'vue';
import Resource from '@api/resource.js';
import request from "@utils/request.js";

class UserTabResource extends Resource {
    constructor() {
        super('user-tabs');
    }

    async update(id, resource) {
        console.log('Updating tab:', { id, resource }); // Лог запроса
        return request({
            url: '/' + this.uri + '/' + id,
            method: 'put',
            data: toRaw(resource),
        });
    }
}

export default UserTabResource;
