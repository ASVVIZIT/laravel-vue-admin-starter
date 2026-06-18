import request from '@/utils/request';
import Cookies from 'js-cookie';

// ============================================================================
// 🔐 CSRF
// ============================================================================

export const csrf = () => {
  return new Promise((resolve) => {
    const existingToken = Cookies.get('XSRF-TOKEN');
    if (existingToken) {
      resolve(existingToken);
      return;
    }

    request({
      url: '/sanctum/csrf-cookie',
      method: 'get',
    })
        .then(() => {
          const token = Cookies.get('XSRF-TOKEN');
          resolve(token || '');
        })
        .catch((err) => {
          console.warn('[Auth] CSRF cookie failed:', err?.message);
          resolve('');
        });
  });
};

// ============================================================================
// 🔑 ВХОД (с P0 защитой от undefined)
// ============================================================================

export const login = (data, loginType = 'user') => {
  // 🔥 P0: Защита от undefined data
  const safeData = data && typeof data === 'object' ? data : {};

  return request({
    url: '/auth/login',
    method: 'post',
    data: {
      ...safeData,
      login_type: loginType,
    },
  });
};

// ============================================================================
// 🧪 ТЕСТОВЫЙ ВХОД
// ============================================================================

export const testerLogin = (role) => {
  // 🔥 P0: Защита от undefined role
  const safeRole = role || 'user';

  return request({
    url: `/tester/login/${safeRole}`,
    method: 'post',
  });
};

// ============================================================================
// 🚪 ВЫХОД
// ============================================================================

export const logout = () => {
  return request({
    url: '/auth/logout',
    method: 'post',
  });
};

// ============================================================================
// 👤 ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ
// ============================================================================

export const getInfo = () => {
  return request({
    url: '/user',
    method: 'get',
  });
};

// ============================================================================
// 🔥 НОВЫЕ ФУНКЦИИ (с P0 защитой)
// ============================================================================

export const forgotPassword = (data) => {
  // 🔥 P0: Защита от undefined
  if (!data || !data.email) {
    return Promise.reject(new Error('Email is required'));
  }

  return request({
    url: '/auth/forgot-password',
    method: 'post',
    data,
  });
};

export const resetPassword = (data) => {
  // 🔥 P0: Проверка обязательных полей
  if (!data || !data.token || !data.email || !data.password) {
    return Promise.reject(new Error('Missing required fields'));
  }

  return request({
    url: '/auth/reset-password',
    method: 'post',
    data,
  });
};

export const register = (data) => {
  // 🔥 P0: Проверка обязательных полей
  if (!data || !data.name || !data.email || !data.password) {
    return Promise.reject(new Error('Missing required fields'));
  }

  return request({
    url: '/auth/register',
    method: 'post',
    data,
  });
};

export const checkVerification = () => {
  return request({
    url: '/auth/verification/check',
    method: 'get',
  });
};

export const resendVerificationEmail = () => {
  return request({
    url: '/auth/verification/resend',
    method: 'post',
  });
};

export const verifyEmail = (id, hash) => {
  // 🔥 P0: Проверка параметров
  if (!id || !hash) {
    return Promise.reject(new Error('Invalid verification link'));
  }

  return request({
    url: `/auth/verify-email/${encodeURIComponent(id)}/${encodeURIComponent(hash)}`,
    method: 'post',
  });
};
