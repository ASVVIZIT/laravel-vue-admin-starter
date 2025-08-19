// resources/js/api/tableApi.js
import Resource from './resource';

const templateResource = new Resource('templates');

export default {
    /**
     * Получение шаблона по ID
     */
    get(id) {
        return templateResource.get(id);
    },

    /**
     * Получение списка шаблонов
     */
    list(params = {}) {
        return templateResource.list(params);
    },

    /**
     * Создание нового шаблона
     */
    store(data) {
        return templateResource.store(data);
    },

    /**
     * Обновление шаблона
     */
    update(id, data) {
        return templateResource.update(id, data);
    },

    /**
     * Удаление шаблона
     */
    destroy(id) {
        return templateResource.destroy(id);
    }
};
