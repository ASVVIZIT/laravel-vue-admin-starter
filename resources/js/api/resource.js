// resources/js/api/resource.js
import request from '@/utils/request';
class Resource {
  constructor(uri) {
    this.uri = uri;
  }
  list(query, path = '') {
    const url = path ? `/${this.uri}/${path}/` : `/${this.uri}`
    return request({
      url: url,
      method: 'get',
      params: query,
    });
  }
  get(id, path = '') {
    const url = path ? `/${this.uri}/${path}/${id}` : `/${this.uri}/${id}`
    return request({
      url,
      method: 'get'
    })
  }
  store(data, path = '') {
    const url = path ? `${this.uri}/${path}` : this.uri
    return request({
      url: '/' + url,
      method: 'post',
      data
    })
  }
  update(id, resource) {
    return request({
      url: '/' + this.uri + '/' + id,
      method: 'put',
      data: resource,
    });
  }
  destroy(id) {
    return request({
      url: '/' + this.uri + '/' + id,
      method: 'delete',
    });
  }

  children(parentId, query) {
    return this.list(query, `${parentId}/children`);
  }
}

export { Resource as default };
