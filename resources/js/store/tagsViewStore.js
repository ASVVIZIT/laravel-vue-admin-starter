import { toRaw } from 'vue';
import { defineStore } from "pinia";
import UserTabResource from '@/api/userTabResource';

const userTabResource = new UserTabResource();

export const tagsViewStore = defineStore('tagsView', {
  state: () => ({
    visitedViews: [],
    cachedViews: []
  }),

  actions: {
    async loadVisitedViewsFromServer() {
      try {
        const response = await userTabResource.list();
        console.log('Loaded tabs from server:', response.data); // Лог загрузки
        this.visitedViews = Array.isArray(response.data)
            ? response.data.map(item => ({
              id: item.id,
              title: item.title || 'Untitled',
              name: item.name || 'no-name',
              path: item.path, // Обязательное поле
              fullPath: item.fullPath || item.path,
              meta: { ...item?.meta, affix: item.meta?.affix || false }, // Указываем affix
            }))
            : [];
      } catch (error) {
        console.error('Failed to load tabs:', error);
        this.visitedViews = [];
      }
    },

    async saveVisitedViewToServer(view) {
      console.log('Saving view:', view); // Лог сохранения
      try {
        if (!view.path) {
          throw new Error('Поле path требуется.');
        }

        const tagData = {
          id: view?.id,
          name: view.name,
          path: view.path,
          fullPath: view.fullPath,
          meta: toRaw(view.meta), // ✅ Преобразуем Proxy в обычный объект
          title: view.title,
        };

        console.log('Saving tagData:', tagData); // Лог сохранения

        // Если view.id существует, используем update
        if (view.id) {
          await userTabResource.update(view.id, { tag_data: tagData });
        } else {
          await userTabResource.store({ path: view.path, tag_data: tagData });
        }
      } catch (error) {
        console.error('Failed to save tab:', error);
      }
    },

    async addView(view) {
      // Проверка path перед добавлением
      if (!view.path) {
        console.error('Ошибка: view не содержит path', view);
        return;
      }
      await this.addVisitedView(view);
      this.addCachedView(view);
    },

    async addVisitedView(view) {
      if (!Array.isArray(this.visitedViews)) {
        this.visitedViews = [];
      }
      const exists = this.visitedViews.some(v => v.path === view.path);
      if (exists) return;

      const viewToAdd = {
        ...view,
        title: view.meta?.title || view.title || 'no-name',
        meta: toRaw(view.meta),
      };
      this.visitedViews.push(viewToAdd);
      await this.saveVisitedViewToServer(viewToAdd);
    },

    addCachedView(view) {
      if (!Array.isArray(this.cachedViews)) this.cachedViews = [];
      if (!this.cachedViews.includes(view.name) && !view.meta?.noCache) {
        this.cachedViews.push(view.name);
      }
    },

    async delView(view) {
      await this.delVisitedView(view);
      this.delCachedView(view);
    },

    async delVisitedView(view) {
      if (!Array.isArray(this.visitedViews)) {
        this.visitedViews = [];
      }

      this.visitedViews = this.visitedViews.filter(v => v.path !== view.path);

      try {
        if (view.id) {
          await userTabResource.destroy(view.id);
        } else if (view.path) {
          const tabs = await userTabResource.list();
          const tabToDelete = tabs.data.find(tab => tab.tag_data.path === view.path);

          if (tabToDelete) {
            await userTabResource.destroy(tabToDelete.id);
          }
        }
      } catch (error) {
        console.error('Failed to delete tab:', error);
      }
    },

    delCachedView(view) {
      if (!Array.isArray(this.cachedViews)) {
        this.cachedViews = [];
      }

      this.cachedViews = this.cachedViews.filter(i => i !== view.name);
    },

    async delOthersViews(view) {
      await this.delOthersVisitedViews(view);
      this.delOthersCachedViews(view);
    },

    delOthersVisitedViews(view) {
      if (!Array.isArray(this.visitedViews)) {
        this.visitedViews = [];
      }

      this.visitedViews = this.visitedViews.filter(v => v.meta?.affix || v.path === view.path);
    },

    delOthersCachedViews(view) {
      if (!Array.isArray(this.cachedViews)) {
        this.cachedViews = [];
      }

      this.cachedViews = this.cachedViews.filter(i => i === view.name);
    },

    async delAllViews() {
      await this.delAllVisitedViews();
      this.delAllCachedViews();
    },

    delAllVisitedViews() {
      if (!Array.isArray(this.visitedViews)) {
        this.visitedViews = [];
      }

      this.visitedViews = this.visitedViews.filter(tag => tag.meta?.affix);
    },

    delAllCachedViews() {
      this.cachedViews = [];
    },

    async updateVisitedView(view) {
      if (!Array.isArray(this.visitedViews)) {
        this.visitedViews = [];
      }

      const index = this.visitedViews.findIndex(v => v.path === view.path);
      if (index !== -1) {
        this.visitedViews[index] = {
          ...this.visitedViews[index],
          ...view
        };
        await this.saveVisitedViewToServer(this.visitedViews[index]);
      }
    },

    async togglePinTag(tag) {
      if (!tag.path) {
        console.error('Ошибка: tag не содержит path', tag);
        return;
      }
      const updatedMeta = { ...tag?.meta, affix: !tag.meta?.affix };
      const updatedTag = { ...tag, meta: updatedMeta };
      await this.updateVisitedView(updatedTag);
      console.log('Toggle affix:', updatedTag); // Лог изменения статуса
    },
  }
});
