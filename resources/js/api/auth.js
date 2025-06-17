import request from '@/utils/request';

export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data: data,
  });
}

export function getInfo(token) {
  return request({
    url: '/user',
    method: 'get',
  });
}

export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post',
  });
}

export function csrf() {
  return new Promise((resolve, reject) => {
    request({
      url: '/sanctum/csrf-cookie',
      method: 'get',
    })
        .then(() => {
          console.log('CSRF cookies установлены:', document.cookie)
          resolve()
        })
        .catch(error => {
          console.error('Ошибка получения CSRF:', error)
          reject(error)
        })
  })
}
