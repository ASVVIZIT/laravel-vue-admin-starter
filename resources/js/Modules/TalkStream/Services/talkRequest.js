import request from '@/utils/request'

/**
 * Обёртка для запросов чат-модуля TalkStream
 */
export default function talkRequest(config) {
    // Добавляем префикс /talkstream/
    if (config.url && !config.url.startsWith('/talkstream')) {
        config.url = '/talkstream' + config.url
    }

    return request(config).catch(error => {
        console.error('[TalkRequest] Ошибка запроса:', error.message)
        throw error
    })
}
