import request from '@/utils/request'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * Обёртка для запросов чат-модуля TalkStream.
 * Автоматически добавляет префикс /talkstream к URL.
 */
export default function talkRequest<T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    if (config.url && !config.url.startsWith('/talkstream')) {
        config.url = '/talkstream' + config.url
    }

    return request(config).catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('[TalkRequest] Ошибка запроса:', errorMessage)
        throw error
    })
}
