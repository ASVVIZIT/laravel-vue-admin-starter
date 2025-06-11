import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getToken } from '@/utils/auth'; // Важно!

// Установите Pusher в глобальную область видимости
window.Pusher = Pusher;

export default function createEcho() {
    const authToken = getToken(); // Получаем токен из куки

    return new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT,
        wssPort: import.meta.env.VITE_REVERB_PORT,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        // Дополнительные настройки для работы с куками
        auth: {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Authorization': `Bearer ${authToken}`
            },
            withCredentials: true
        },
        authEndpoint: '/broadcasting/auth',
    });
}
