// api/user.js
import request from '@/utils/request';
import Resource from '@/api/resource';

class UserResource extends Resource {
  constructor() {
    super('users');
  }

  permissions(id) {
    console.log('Fetching permissions for user ID:', id);
    return request({
      url: '/' + this.uri + '/' + id + '/permissions',
      method: 'get',
    }).then(response => {
      console.log('Fetched permissions:', response);
      return response;
    }).catch(error => {
      console.error('Failed to fetch permissions:', error);
      throw error;
    });
  }

  updatePermission(id, permissions) {
    console.log('Updating permissions for user ID:', id, 'with permissions:', permissions);
    return request({
      url: '/' + this.uri + '/' + id + '/permissions',
      method: 'put',
      data: permissions,
    }).then(response => {
      console.log('Permissions updated successfully:', response);
      return response;
    }).catch(error => {
      console.error('Failed to update permissions:', error);
      throw error;
    });
  }

  logs(id, params) {
    return request({
      url: '/' + this.uri + '/' + id + '/logs',
      method: 'get',
      params: params
    });
  }
}

export { UserResource as default };
