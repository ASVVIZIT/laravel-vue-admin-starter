import axios from "axios";
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Функция для получения токена из cookies
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Установите Pusher в глобальную область видимости
window.Pusher = Pusher;

// Создайте экземпляр Echo
const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: parseInt(import.meta.env.VITE_REVERB_PORT, 10),
    wssPort: parseInt(import.meta.env.VITE_REVERB_PORT, 10),
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel) => {
        return {
            authorize: (socketId, callback) => {
                axios.post(
                    import.meta.env.VITE_API_BASE_URL + 'broadcasting/auth',
                    {
                        socket_id: socketId,
                        channel_name: channel.name
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${getCookie('fenix-token')}`,
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                        },
                        withCredentials: true // Важно для кук!
                    }
                )
                    .then(response => callback(false, response.data))
                    .catch(error => callback(true, error));
            }
        };
    }
});

const socketId = '123.456';
const channelName = `chat.1`;

axios.post('/broadcasting/auth', {
    socket_id: socketId,
    channel_name: channelName
}, {
    headers: {
        'Authorization': `Bearer ${getCookie('fenix-token')}`,
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
    }
})
    .then(response => console.log('Auth success:', response))
    .catch(error => console.error('Auth error:', error));


export default echo;
