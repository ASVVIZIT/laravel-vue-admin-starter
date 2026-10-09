import talkRequest from '@/modules/TalkStream/Services/talkRequestService'
import type { AxiosResponse } from 'axios'

/**
 * Базовый ресурс для REST-запросов модуля TalkStream.
 * Предоставляет стандартные CRUD-методы со строгой типизацией.
 */
export default class TalkResource {
    protected uri: string

    constructor(uri: string) {
        this.uri = uri
    }

    /**
     * GET — список ресурсов или кастомный путь
     */
    list<T = unknown>(query: Record<string, unknown> = {}, path: string = ''): Promise<AxiosResponse<T>> {
        const url = path ? `/${this.uri}/${path}` : `/${this.uri}`
        return talkRequest<T>({
            url,
            method: 'get',
            params: query
        })
    }

    /**
     * POST — создание ресурса
     */
    store<T = unknown>(data: Record<string, unknown>, path: string = ''): Promise<AxiosResponse<T>> {
        const url = path ? `/${this.uri}/${path}` : `/${this.uri}`
        return talkRequest<T>({
            url,
            method: 'post',
            data
        })
    }

    /**
     * GET — получение ресурса по ID
     */
    get<T = unknown>(id: number | string, path: string = ''): Promise<AxiosResponse<T>> {
        const url = path ? `/${this.uri}/${path}/${id}` : `/${this.uri}/${id}`
        return talkRequest<T>({
            url,
            method: 'get'
        })
    }

    /**
     * PUT — обновление ресурса по ID
     */
    update<T = unknown>(id: number | string, data: Record<string, unknown>, path: string = ''): Promise<AxiosResponse<T>> {
        const url = path ? `/${this.uri}/${path}/${id}` : `/${this.uri}/${id}`
        return talkRequest<T>({
            url,
            method: 'put',
            data
        })
    }

    /**
     * DELETE — удаление ресурса по ID
     */
    destroy<T = unknown>(id: number | string, path: string = ''): Promise<AxiosResponse<T>> {
        const url = path ? `/${this.uri}/${path}/${id}` : `/${this.uri}/${id}`
        return talkRequest<T>({
            url,
            method: 'delete'
        })
    }
}
