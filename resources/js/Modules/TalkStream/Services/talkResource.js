import talkRequest from '@/modules/TalkStream/Services/talkRequest.js'

export default class TalkResource {
    constructor(uri) {
        this.uri = uri
    }

    list(query = {}, path = '') {
        const url = path ? `/${this.uri}/${path}` : `/${this.uri}`
        return talkRequest({
            url,
            method: 'get',
            params: query
        })
    }

    store(data, path = '') {
        const url = path ? `/${this.uri}/${path}` : `/${this.uri}`
        return talkRequest({
            url,
            method: 'post',
            data
        })
    }

    get(id, path = '') {
        const url = path ? `/${this.uri}/${path}/${id}` : `/${this.uri}/${id}`
        return talkRequest({
            url,
            method: 'get'
        })
    }

    update(id, data, path = '') {
        const url = path ? `/${this.uri}/${path}/${id}` : `/${this.uri}/${id}`
        return talkRequest({
            url,
            method: 'put',
            data
        })
    }

    destroy(id, path = '') {
        const url = path ? `/${this.uri}/${path}/${id}` : `/${this.uri}/${id}`
        return talkRequest({
            url,
            method: 'delete'
        })
    }
}
