import '@/bootstrap';
import { ElMessage } from 'element-plus';
import { isLogged, getToken } from '@/utils/auth';

// Create axios instance
const service = window.axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, // Request timeout
});

// Request intercepter
/*service.interceptors.request.use(config => {
    if (isTokenValid()) { // Используйте проверку валидности
        config.withCredentials = true; // Для передачи кук
        config.headers['Authorization'] = 'Bearer ' + getToken();
    } else {
        // Перенаправление на страницу входа
        window.location.href = '/login';
    }
    return config;
});*/

service.interceptors.request.use(
  config => {
    const token = isLogged();
    if (token) {
      config.withCredentials = true; // Для передачи кук
      config.headers['Authorization'] = 'Bearer ' + getToken(); // Set JWT token
    }
    return config;
  },
  error => {
    // Do something with request error
    console.log(error); // for debug
    Promise.reject(error);
  }
);

// response pre-processing
service.interceptors.response.use(
  response => {
    if (response.headers.authorization) {
      setLogged(response.headers.authorization);
      response.data.token = response.headers.authorization;
    }

    return response.data;
  },
  error => {
    let message = error.message;
    if (error.response.data && error.response.data.message) {
      message = error.response.data.message;
    }

    ElMessage({
      message: message,
      type: 'error',
      duration: 5 * 1000,
    });
    return Promise.reject(error);
  }
);

export default service;
