import request from '@/utils/request'

export default class TalkResource {
    constructor(uri) {
        this.uri = uri
    }

    list(query) {
        return request({
            url: '/' + this.uri,
            method: 'get',
            params: query
        })
    }

    store(data, uri = this.uri) {
        return request({
            url: '/' + uri,
            method: 'post',
            data
        })
    }

    get(id) {
        return request({
            url: '/' + this.uri + '/' + id,
            method: 'get'
        })
    }

    update(id, data) {
        return request({
            url: '/' + this.uri + '/' + id,
            method: 'put',
            data
        })
    }

    destroy(id) {
        return request({
            url: '/' + this.uri + '/' + id,
            method: 'delete'
        })
    }
}
