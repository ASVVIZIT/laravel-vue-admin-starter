import request from '@/utils/request';
import Cookies from 'js-cookie';

export const login = (data, loginType = 'user') => {
  // 🔥 ОДИН endpoint для всех типов! Контроллер сам определяет тип
  return request({
    url: '/auth/login',  // ← Всегда /auth/login
    method: 'post',
    data: {
      ...data,
      login_type: loginType  // ← Передаём тип в теле запроса
    },
  });
};

export const testerLogin = (role) => {
  return request({
    url: `/tester/login/${role}`,
    method: 'post',
  });
};

export const logout = () => {
  return request({
    url: '/auth/logout',
    method: 'post',
  });
};

export const getInfo = () => {
  return request({
    url: '/user',
    method: 'get',
  });
};

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
          if (token) {
            resolve(token);
          } else {
            setTimeout(() => {
              resolve(Cookies.get('XSRF-TOKEN') || '');
            }, 100);
          }
        })
        .catch((err) => {
          console.warn('[Auth] CSRF cookie failed:', err?.message);
          resolve('');
        });
  });
};
