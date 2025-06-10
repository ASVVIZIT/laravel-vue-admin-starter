import Resource from '@api/resource.js';
import request from '@utils/request.js';

class MessageResource extends Resource {
    constructor() {
        super('messages');
    }

    list() {
        return request({
            url: `/${this.uri}`,
            method: 'get'
        });
    }

    send(data) {
        return request({
            url: `/${this.uri}`,
            method: 'post',
            data: data
        });
    }
}

export { MessageResource as default };
