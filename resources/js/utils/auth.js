import Cookies from 'js-cookie';

const TokenKey = 'fenix-token';
const LoginTypeKey = 'loginType';
const StorageMethodKey = 'auth_token_storage_mode';

// P0: Валидные типы пользователей
export const VALID_LOGIN_TYPES = ['user', 'admin', 'tester'];

// ============================================================================
// 🎛️ СПОСОБ ХРАНЕНИЯ
// ============================================================================

export const getStorageMethod = () => {
  const method = localStorage.getItem(StorageMethodKey);
  return (method === 'localStorage') ? 'localStorage' : 'cookie';
};

export const setStorageMethod = (method) => {
  if (method !== 'cookie' && method !== 'localStorage') {
    console.warn('[Auth] Неверный способ хранения, используем cookie:', method);
    method = 'cookie';
  }
  localStorage.setItem(StorageMethodKey, method);
};

// ============================================================================
// 🔐 CSRF
// ============================================================================

export const getCsrfToken = () => Cookies.get('XSRF-TOKEN') || '';

// ============================================================================
// 👤 ТИП ВХОДА (с P0 защитой)
// ============================================================================

export const getLoginType = () => {
  const method = getStorageMethod();
  let type;

  if (method === 'localStorage') {
    type = localStorage.getItem(LoginTypeKey);
  } else {
    const hostname = window.location.hostname;
    const domain = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
    ['fenixlaravel.loc', '94.41.87.10'].includes(hostname)
        ? hostname : undefined;
    type = Cookies.get(LoginTypeKey, { domain });
  }

  // P0: Валидация типа
  return VALID_LOGIN_TYPES.includes(type) ? type : 'user';
};

export const setLoginType = (type) => {
  // P0: Валидация входного значения
  if (!VALID_LOGIN_TYPES.includes(type)) {
    console.warn('[Auth] Неверный тип входа:', type, '— используем user');
    type = 'user';
  }

  const method = getStorageMethod();

  if (method === 'localStorage') {
    localStorage.setItem(LoginTypeKey, type);
    return;
  }

  const hostname = window.location.hostname;
  const domain = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
  ['fenixlaravel.loc', '94.41.87.10'].includes(hostname)
      ? hostname : undefined;

  Cookies.set(LoginTypeKey, type, {
    expires: 7,
    domain,
    secure: window.location.protocol === 'https:',
    sameSite: 'Lax'
  });
};

export const removeLoginType = () => {
  const method = getStorageMethod();

  if (method === 'localStorage') {
    localStorage.removeItem(LoginTypeKey);
    return;
  }

  const hostname = window.location.hostname;
  const domain = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
  ['fenixlaravel.loc', '94.41.87.10'].includes(hostname)
      ? hostname : undefined;

  Cookies.remove(LoginTypeKey, { domain });
};

// ============================================================================
// 🔑 ТОКЕН (с P1 защитой)
// ============================================================================

export const getToken = () => {
  const method = getStorageMethod();
  let token;

  if (method === 'localStorage') {
    token = localStorage.getItem(TokenKey);
  } else {
    const hostname = window.location.hostname;
    const domain = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
    ['fenixlaravel.loc', '94.41.87.10'].includes(hostname)
        ? hostname : undefined;
    token = Cookies.get(TokenKey, { domain });
  }

  // P1: Возвращаем null вместо undefined
  return token || null;
};

export const setToken = (token) => {
  // P1: Защита от установки undefined/null
  if (!token || typeof token !== 'string') {
    console.warn('[Auth] Попытка установить невалидный токен:', typeof token);
    return;
  }

  const method = getStorageMethod();

  if (method === 'localStorage') {
    localStorage.setItem(TokenKey, token);
    return;
  }

  const hostname = window.location.hostname;
  const domain = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
  ['fenixlaravel.loc', '94.41.87.10'].includes(hostname)
      ? hostname : undefined;

  Cookies.set(TokenKey, token, {
    expires: 7,
    domain,
    secure: window.location.protocol === 'https:',
    sameSite: 'Lax'
  });
};

export const removeToken = () => {
  const method = getStorageMethod();

  if (method === 'localStorage') {
    localStorage.removeItem(TokenKey);
    return;
  }

  const hostname = window.location.hostname;
  const domain = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
  ['fenixlaravel.loc', '94.41.87.10'].includes(hostname)
      ? hostname : undefined;

  Cookies.remove(TokenKey, { domain });
};

// ============================================================================
// ✅ ПРОВЕРКА АВТОРИЗАЦИИ
// ============================================================================

export const isLogged = () => {
  const token = getToken();
  return !!token && token.length > 0;
};
