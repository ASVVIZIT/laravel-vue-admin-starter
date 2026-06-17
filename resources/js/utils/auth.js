import Cookies from 'js-cookie';

const TokenKey = 'fenix-token';
const LoginTypeKey = 'loginType';

// Универсальная функция получения CSRF токена
export const getCsrfToken = () => Cookies.get('XSRF-TOKEN');

/**
 * Получить способ хранения токена
 * Приоритет: localStorage > cookie (по умолчанию cookie)
 */
function getStorageMethod() {
  // Можно читать из конфига Laravel через API
  // Или из localStorage (если установлено вручную)
  return localStorage.getItem('token_storage') || 'cookie';
}

// Проверка авторизации
export const isLogged = () => {
  const method = getStorageMethod();

  if (method === 'localStorage') {
    return !!localStorage.getItem(TokenKey);
  }

  return !!Cookies.get(TokenKey);
};

// Установка токена
export const setToken = (token) => {
  const method = getStorageMethod();

  if (method === 'localStorage') {
    localStorage.setItem(TokenKey, token);
    return;
  }

  // Cookie способ
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
  const method = getStorageMethod();

  if (method === 'localStorage') {
    return localStorage.getItem(TokenKey);
  }

  // Cookie способ
  const hostname = window.location.hostname;
  const domain = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
  ['fenixlaravel.loc', '94.41.87.10'].includes(hostname)
      ? hostname : undefined;

  return Cookies.get(TokenKey, { domain });
};

// Удаление токена
export const removeToken = () => {
  const method = getStorageMethod();

  if (method === 'localStorage') {
    localStorage.removeItem(TokenKey);
    return;
  }

  // Cookie способ
  const hostname = window.location.hostname;
  const domain = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
  ['fenixlaravel.loc', '94.41.87.10'].includes(hostname)
      ? hostname : undefined;

  return Cookies.remove(TokenKey, { domain });
};

// Установка типа входа
export const setLoginType = (type) => {
  const method = getStorageMethod();

  if (method === 'localStorage') {
    localStorage.setItem(LoginTypeKey, type);
    return;
  }

  // Cookie способ
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
  const method = getStorageMethod();

  if (method === 'localStorage') {
    return localStorage.getItem(LoginTypeKey) || 'user';
  }

  // Cookie способ
  const hostname = window.location.hostname;
  const domain = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
  ['fenixlaravel.loc', '94.41.87.10'].includes(hostname)
      ? hostname : undefined;

  return Cookies.get(LoginTypeKey, { domain }) || 'user';
};

// Удаление типа входа
export const removeLoginType = () => {
  const method = getStorageMethod();

  if (method === 'localStorage') {
    localStorage.removeItem(LoginTypeKey);
    return;
  }

  // Cookie способ
  const hostname = window.location.hostname;
  const domain = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
  ['fenixlaravel.loc', '94.41.87.10'].includes(hostname)
      ? hostname : undefined;

  return Cookies.remove(LoginTypeKey, { domain });
};
/**
 * Установить способ хранения токена
 * @param {'cookie' | 'localStorage'} method
 */
export const setStorageMethod = (method) => {
  if (!['cookie', 'localStorage'].includes(method)) {
    console.error('[Auth] Неверный способ хранения:', method);
    return;
  }

  localStorage.setItem('token_storage', method);
  console.log(`[Auth] Способ хранения изменён на: ${method}`);
};

/**
 * Миграция токена из cookie в localStorage (или наоборот)
 */
export const migrateToken = (fromMethod, toMethod) => {
  const token = getToken();
  const loginType = getLoginType();

  if (token) {
    // Устанавливаем в новый способ
    localStorage.setItem('token_storage', toMethod);
    setToken(token);
    setLoginType(loginType);

    // Удаляем из старого способа
    if (fromMethod === 'cookie') {
      Cookies.remove(TokenKey);
      Cookies.remove(LoginTypeKey);
    } else if (fromMethod === 'localStorage') {
      localStorage.removeItem(TokenKey);
      localStorage.removeItem(LoginTypeKey);
    }

    console.log(`[Auth] Токен мигрирован: ${fromMethod} → ${toMethod}`);
  }
};
