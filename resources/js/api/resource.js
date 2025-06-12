// api/resource.js

import request from '@/utils/request';

/**
 * Simple RESTful resource class
 */
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
  store(resource) {
    return request({
      url: '/' + this.uri,
      method: 'post',
      data: resource,
    });
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
}

export { Resource as default };
