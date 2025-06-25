import axios from "axios";
import Cookies from 'js-cookie';

const TokenKey = 'fenix-token';

export function isLogged() {
  return !!Cookies.get(TokenKey);
}

export function setToken(token) {
  // Определяем правильный домен для куки
  const hostname = window.location.hostname;
  let domain = undefined;

  // Для IP-адресов не используем домен в куках
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    domain = undefined;
  }
  // Для домена используем основной домен без поддоменов
  else if (hostname === 'fenixlaravel.loc') {
    domain = 'fenixlaravel.loc';
  }

  return Cookies.set(TokenKey, token, {
    expires: 7,
    domain: domain,
    secure: window.location.protocol === 'https:',
    sameSite: 'Lax'
  });
}

export function getToken() {
  return Cookies.get(TokenKey);
}

export function removeToken() {
  const hostname = window.location.hostname;
  let domain = undefined;

  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    domain = undefined;
  }
  else if (hostname === 'fenixlaravel.loc') {
    domain = 'fenixlaravel.loc';
  }

  return Cookies.remove(TokenKey, { domain });
}

// utils/csrf.js
export async function getCsrfToken() {
  try {
    const csrfToken = getToken();
    if (!csrfToken) {
      console.warn('[CSRF] Токен отсутствует');
      return false;
    }

    // Временная заглушка для отладки
    const tempDomainFix = window.location.hostname === '94.41.87.10'
        ? '94.41.87.10'
        : undefined;

    axios.defaults.headers.common['Authorization'] = `Bearer ${csrfToken}`;
    axios.defaults.withCredentials = true;

    if (window.axios) {
      window.axios.defaults.headers.common['Authorization'] = `Bearer ${csrfToken}`;
      window.axios.defaults.withCredentials = true;
    }

    const res = await axios.get('/sanctum/csrf-cookie', {
      baseURL: import.meta.env.VITE_API_BASE_URL,
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      }
    });

    console.log('Токен res ', res);

    // Временное решение: принудительно установить куки для IP
    if (window.location.hostname === '94.41.87.10') {
      document.cookie = `XSRF-TOKEN=${res.data.csrf_token}; path=/; domain=94.41.87.10; secure=false; sameSite=Lax`;
      document.cookie = `laravel_vue_admin_fenix_session=${res.data.session}; path=/; domain=94.41.87.10; secure=false; sameSite=Lax`;
    }

    if (res.status === 204 || res.status === 200) {
      console.log('[CSRF] Токен установлен');
      return true;
    }

    console.warn('[CSRF] Не удалось получить токен');
    return false;
  } catch (e) {
    console.error('[CSRF] Ошибка:', e);
    return false;
  }
}
