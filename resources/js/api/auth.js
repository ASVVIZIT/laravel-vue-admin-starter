// resources/js/api/auth.js
import request from '@/utils/request';
import Cookies from 'js-cookie';

export const login = (data, loginType = 'user') => {
  const url = loginType === 'admin' ? '/admin/auth/login' : '/auth/login';
  return request({
    url,
    method: 'post',
    data,
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
    // Проверяем, есть ли уже токен
    const existingToken = Cookies.get('XSRF-TOKEN');
    if (existingToken) {
      resolve(existingToken);
      return;
    }

    // Если токена нет - запрашиваем
    request({
      url: '/sanctum/csrf-cookie',
      method: 'get',
    })
        .then(() => {
          // Проверяем установился ли токен
          const token = Cookies.get('XSRF-TOKEN');
          if (token) {
            resolve(token);
          } else {
            // Если не установился - ждем 100мс и проверяем снова
            setTimeout(() => {
              resolve(Cookies.get('XSRF-TOKEN') || '');
            }, 100);
          }
        })
        .catch(() => {
          resolve(''); // Все равно разрешаем промис
        });
  });
};
