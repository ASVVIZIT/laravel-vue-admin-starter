import Cookies from 'js-cookie';

const TokenKey = 'fenix-token';
const LoginTypeKey = 'loginType';

// Универсальная функция получения CSRF токена
export const getCsrfToken = () => Cookies.get('XSRF-TOKEN');

// Проверка авторизации
export const isLogged = () => !!Cookies.get(TokenKey);

// Установка токена
export const setToken = (token) => {
  const hostname = window.location.hostname;
  const domain = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
  ['fenixlaravel.loc', '94.41.87.10'].includes(hostname)
      ? hostname : undefined;

  return Cookies.set(TokenKey, token, {
    expires: 7,
    domain,
    secure: window.location.protocol === 'https:',
    sameSite: 'Lax'
  });
};

// Получение токена
export const getToken = () => {
  const hostname = window.location.hostname;
  const domain = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
  ['fenixlaravel.loc', '94.41.87.10'].includes(hostname)
      ? hostname : undefined;

  return Cookies.get(TokenKey, { domain });
};

// Удаление токена
export const removeToken = () => {
  const hostname = window.location.hostname;
  const domain = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
  ['fenixlaravel.loc', '94.41.87.10'].includes(hostname)
      ? hostname : undefined;

  return Cookies.remove(TokenKey, { domain });
};

// Установка типа входа
export const setLoginType = (type) => {
  const hostname = window.location.hostname;
  const domain = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
  ['fenixlaravel.loc', '94.41.87.10'].includes(hostname)
      ? hostname : undefined;

  return Cookies.set(LoginTypeKey, type, {
    expires: 7,
    domain,
    secure: window.location.protocol === 'https:',
    sameSite: 'Lax'
  });
};

// Получение типа входа
export const getLoginType = () => {
  const hostname = window.location.hostname;
  const domain = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
  ['fenixlaravel.loc', '94.41.87.10'].includes(hostname)
      ? hostname : undefined;

  return Cookies.get(LoginTypeKey, { domain }) || 'user';
};

// Удаление типа входа
export const removeLoginType = () => {
  const hostname = window.location.hostname;
  const domain = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
  ['fenixlaravel.loc', '94.41.87.10'].includes(hostname)
      ? hostname : undefined;

  return Cookies.remove(LoginTypeKey, { domain });
};
