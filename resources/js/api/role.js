import request from '@/utils/request';
import Resource from '@/api/resource';

class RoleResource extends Resource {
  constructor() {
    super('roles');
  }

  list(query) {
    return request({
      url: '/' + this.uri,
      method: 'get',
      params: query,
    });
  }

  permissions(id) {
    return request({
      url: '/' + this.uri + '/' + id + '/permissions',
      method: 'get',
    });
  }
}

export { RoleResource as default };
