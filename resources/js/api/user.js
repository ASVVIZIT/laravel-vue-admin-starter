import request from '@/utils/request';
import Resource from '@/api/resource';

class UserResource extends Resource {
  constructor() {
    super('users');
  }

  async list(params = {}) {
    try {
      console.log('[UserResource] Fetching users list:', params);
      const response = await request({ url: `/${this.uri}`, method: 'get', params });
      console.log('[UserResource] Users list fetched:', response);
      return response;
    } catch (error) {
      console.error('[UserResource] Error fetching users list:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      console.log(`[UserResource] Updating user ID: ${id}`, data);
      const response = await request({ url: `/${this.uri}/${id}`, method: 'put', data });
      console.log('[UserResource] User updated successfully:', response);
      return response;
    } catch (error) {
      console.error(`[UserResource] Error updating user ID ${id}:`, error);
      throw error;
    }
  }

  async destroy(id) {
    try {
      console.log('[UserResource] Attempting to destroy user ID:', id);
      const response = await request({ url: `/${this.uri}/${id}`, method: 'delete' });
      console.log(`[UserResource] User ID ${id} destroyed successfully:`, response);
      return response;
    } catch (error) {
      console.error(`[UserResource] Error destroying user ID ${id}:`, error);
      throw error;
    }
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

  async confirmOldEmail(token) {
    try {
      console.log(`[UserResource] Confirming old email with token`);
      const response = await request({
        url: `/${this.uri}/confirm-old-email/${token}`,
        method: 'get'
      });
      console.log(`[UserResource] Old email confirmed:`, response);
      return response;
    } catch (error) {
      console.error(`[UserResource] Error confirming old email:`, error);
      throw error;
    }
  }

  async confirmNewEmail(token) {
    try {
      console.log(`[UserResource] Confirming new email with token`);
      const response = await request({
        url: `/${this.uri}/confirm-new-email/${token}`,
        method: 'get'
      });
      console.log(`[UserResource] New email confirmed:`, response);
      return response;
    } catch (error) {
      console.error(`[UserResource] Error confirming new email:`, error);
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

  async resendNewEmailConfirmation(userId) {
    try {
      console.log(`[UserResource] Resending new-email confirmation for user ${userId}`);
      const response = await request({
        url: `/${this.uri}/${userId}/resend-new-email-confirmation`,
        method: 'post'
      });
      console.log(`[UserResource] New-email confirmation resent:`, response);
      return response;
    } catch (error) {
      console.error(`[UserResource] Error resending new-email confirmation:`, error);
      throw error;
    }
  }

}

export { UserResource as default };
