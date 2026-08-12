import request from '@/utils/request';
import Resource from '@/api/resource';

class UserResource extends Resource {
  constructor() {
    super('users');
  }

  async show(id) {
    try {
      console.log(`[UserResource] Fetching user ID:`, id);
      const response = await request({ url: `/${this.uri}/${id}`, method: 'get' });
      console.log(`[UserResource] User fetched successfully:`, response);
      return response;
    } catch (error) {
      console.error(`[UserResource] Error fetching user ID ${id}:`, error);
      throw error;
    }
  }

  async permissions(id) {
    try {
      console.log(`[UserResource] Fetching permissions for user ID:`, id);
      const response = await request({ url: `/${this.uri}/${id}/permissions`, method: 'get' });
      console.log(`[UserResource] Permissions fetched successfully:`, response);
      return response;
    } catch (error) {
      console.error(`[UserResource] Error fetching permissions for user ID ${id}:`, error);
      throw error;
    }
  }

  async updatePermission(id, permissions) {
    try {
      console.log(`[UserResource] Updating permissions for user ID: ${id}`, { permissions });
      const response = await request({ url: `/${this.uri}/${id}/permissions`, method: 'put', data: { permissions } });
      console.log(`[UserResource] Permissions updated successfully:`, response);
      return response;
    } catch (error) {
      console.error(`[UserResource] Error updating permissions for user ID ${id}:`, error);
      throw error;
    }
  }

  async logs(id, params = {}) {
    try {
      console.log(`[UserResource] Fetching logs for user ID: ${id}`, { params });
      const response = await request({ url: `/${this.uri}/${id}/logs`, method: 'get', params });
      console.log(`[UserResource] Logs fetched successfully:`, response);
      return response;
    } catch (error) {
      console.error(`[UserResource] Error fetching logs for user ID ${id}:`, error);
      throw error;
    }
  }

  async ban(id) {
    try {
      console.log(`[UserResource] Attempting to ban user ID:`, id);
      const response = await request({ url: `/${this.uri}/${id}/ban`, method: 'post' });
      console.log(`[UserResource] User ID ${id} banned successfully:`, response);
      return response;
    } catch (error) {
      console.error(`[UserResource] Error banning user ID ${id}:`, error);
      throw error;
    }
  }

  async unban(id) {
    try {
      console.log(`[UserResource] Attempting to unban user ID:`, id);
      const response = await request({ url: `/${this.uri}/${id}/unban`, method: 'post' });
      console.log(`[UserResource] User ID ${id} unbanned successfully:`, response);
      return response;
    } catch (error) {
      console.error(`[UserResource] Error unbanning user ID ${id}:`, error);
      throw error;
    }
  }

  async restore(id) {
    try {
      console.log(`[UserResource] Attempting to restore user ID:`, id);
      const response = await request({ url: `/${this.uri}/${id}/restore`, method: 'post' });
      console.log(`[UserResource] User ID ${id} restored successfully:`, response);
      return response;
    } catch (error) {
      console.error(`[UserResource] Error restoring user ID ${id}:`, error);
      throw error;
    }
  }

  async reverify() {
    try {
      console.log(`[UserResource] Requesting email re-verification`);
      const response = await request({ url: `/${this.uri}/me/reverify-email`, method: 'post' });
      console.log(`[UserResource] Re-verification email requested successfully:`, response);
      return response;
    } catch (error) {
      console.error(`[UserResource] Error requesting re-verification:`, error);
      throw error;
    }
  }

  async requestEmailChange(userId, newEmail) {
    try {
      console.log(`[UserResource] Requesting email change for user ${userId} to:`, newEmail);
      const response = await request({
        url: `/${this.uri}/${userId}/request-email-change`,
        method: 'post',
        data: { new_email: newEmail }
      });
      console.log(`[UserResource] Email change requested:`, response);
      return response;
    } catch (error) {
      console.error(`[UserResource] Error requesting email change:`, error);
      throw error;
    }
  }

  async adminConfirmOldEmail(userId, reason = '') {
    try {
      const response = await request({
        url: `/${this.uri}/${userId}/admin-confirm-old-email`,
        method: 'post',
        data: { reason }
      });
      return response;
    } catch (error) {
      console.error(`[UserResource] Error admin confirming old email:`, error);
      throw error;
    }
  }

  async adminConfirmNewEmail(userId, reason = '') {
    try {
      const response = await request({
        url: `/${this.uri}/${userId}/admin-confirm-new-email`,
        method: 'post',
        data: { reason }
      });
      return response;
    } catch (error) {
      console.error(`[UserResource] Error admin confirming new email:`, error);
      throw error;
    }
  }

}

export { UserResource as default };
