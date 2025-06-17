import Cookies from 'js-cookie';

const TokenKey = 'fenix-token';

export function isLogged() {
  return !!Cookies.get(TokenKey);
}

export function setToken(token) {
  // Определяем домен для production
  const domain = window.location.hostname === 'localhost'
      ? undefined
      : '94.41.87.10';

  return Cookies.set(TokenKey, token, {
    expires: 7, // 7 дней
    domain: domain,
    secure: false,
    sameSite: 'Lax'
  });
}

export function getToken() {
  return Cookies.get(TokenKey);
}

export function removeToken() {
  const domain = window.location.hostname === 'localhost'
      ? undefined
      : '94.41.87.10';

  return Cookies.remove(TokenKey, { domain });
}

export function getCsrfToken() {
  return document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];
}
