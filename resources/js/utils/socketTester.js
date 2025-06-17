// resources/js/utils/socketTester.js
export function testWebSocketConnection(options = {}) {
    return new Promise((resolve, reject) => {
        // Параметры с значениями по умолчанию
        const {
            protocol = window.location.protocol === 'https:' ? 'wss' : 'ws',
            host = import.meta.env.VITE_REVERB_HOST || window.location.hostname,
            port = import.meta.env.VITE_REVERB_PORT || (import.meta.env.DEV ? 8050 : window.location.port),
            path = '',
            timeout = 5000,
            silent = false,
            appName = import.meta.env.VITE_APP_NAME || 'UnknownApp'
        } = options;

        // Формирование URL
        const socketUrl = port
            ? `${protocol}://${host}:${port}${path}`
            : `${protocol}://${host}${path}`;

        !silent && console.log(`[WebSocket Test] Connecting to: ${socketUrl}`);

        try {
            const testSocket = new WebSocket(socketUrl);
            let timedOut = false;

            // Таймер для таймаута
            const timer = setTimeout(() => {
                timedOut = true;
                testSocket.close();
                const error = new Error(`Connection timeout after ${timeout}ms`);
                !silent && console.warn('[WebSocket Test] Timeout:', error.message);
                reject(error);
            }, timeout);

            // Обработчики событий
            testSocket.onopen = () => {
                !silent && console.log('[WebSocket Test] Connection established');

                testSocket.send(JSON.stringify({
                    event: 'ping',
                    data: {
                        time: new Date().toISOString(),
                        app: appName,
                        domain: window.location.hostname
                    }
                }));
            };

            testSocket.onmessage = (event) => {
                !silent && console.log('[WebSocket Test] Received message:', event.data);
                clearTimeout(timer);
                testSocket.close();
                resolve({
                    status: 'success',
                    url: socketUrl,
                    message: event.data
                });
            };

            testSocket.onerror = (error) => {
                clearTimeout(timer);
                !silent && console.error('[WebSocket Test] Error:', error);
                reject({
                    status: 'error',
                    url: socketUrl,
                    error: error.event || error
                });
            };

            testSocket.onclose = (event) => {
                if (!timedOut) {
                    clearTimeout(timer);
                    !silent && console.log('[WebSocket Test] Connection closed', event);

                    if (event.code !== 1000) {
                        const error = new Error(`Unexpected closure: ${event.code} ${event.reason || ''}`);
                        !silent && console.error('[WebSocket Test] Closure error:', error.message);
                        reject({
                            status: 'closed',
                            url: socketUrl,
                            error: error.message,
                            code: event.code
                        });
                    }
                }
            };

        } catch (error) {
            !silent && console.error('[WebSocket Test] Critical error:', error);
            reject({
                status: 'exception',
                url: socketUrl,
                error: error.message
            });
        }
    });
}
