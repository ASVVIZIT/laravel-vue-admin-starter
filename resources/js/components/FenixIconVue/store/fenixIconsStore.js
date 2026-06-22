import { defineStore } from 'pinia';
import { markRaw } from 'vue';

// ============================================================================
// АВТО-ИМПОРТ ВСЕХ ИКОНОК
// ============================================================================
const iconsModules = import.meta.glob('../icons/**/*.vue', { eager: true });

const availableIcons = {};
const rawCategories = {};

// 🔥 УЛУЧШЕННАЯ логика определения категории
Object.entries(iconsModules).forEach(([path, module]) => {
    // Нормализуем путь: убираем ../ и разбиваем
    const normalizedPath = path.replace(/^\.\.\//, '');
    const parts = normalizedPath.split('/');

    // Ожидаемая структура: icons/CATEGORY/.../FileName.vue
    // parts[0] = 'icons'
    // parts[1] = CATEGORY
    // parts[last] = FileName.vue

    if (parts[0] !== 'icons' || parts.length < 3) return;

    const category = parts[1];                          // social, maps, ui, i18n
    const fileName = parts[parts.length - 1].replace('.vue', '');

    // Регистрируем иконку
    availableIcons[fileName] = markRaw(module.default);

    // Добавляем в основную категорию
    if (!rawCategories[category]) {
        rawCategories[category] = [];
    }
    if (!rawCategories[category].includes(fileName)) {
        rawCategories[category].push(fileName);
    }

    // Если есть подкатегория (i18n/core, i18n/status) — добавляем отдельно
    if (parts.length >= 4) {
        const subCategory = parts[2];
        const subKey = `${category}/${subCategory}`;

        if (!rawCategories[subKey]) {
            rawCategories[subKey] = [];
        }
        if (!rawCategories[subKey].includes(fileName)) {
            rawCategories[subKey].push(fileName);
        }
    }
});

// 🔥 СОРТИРОВКА для предсказуемого порядка
Object.keys(rawCategories).forEach(key => {
    rawCategories[key].sort();
});

// ============================================================================
// STORE
// ============================================================================
export const useFenixIconsStore = defineStore('fenixIcons', {
    state: () => ({
        availableIcons: { ...availableIcons },
        // 🔥 ГЛУБОКАЯ КОПИЯ для защиты от мутаций
        iconCategories: JSON.parse(JSON.stringify(rawCategories)),
    }),

    getters: {
        getIconByName: (state) => (name) => state.availableIcons[name] || null,

        getIconNames: (state) => Object.keys(state.availableIcons),

        // 🔥 УЛУЧШЕНО: поддержка путей через /
        getIconsByCategory: (state) => (category) => {
            const iconNames = state.iconCategories[category] || [];
            return iconNames
                .filter(name => state.availableIcons[name])
                .map(name => ({ name, component: state.availableIcons[name] }));
        },

        // 🔥 НОВОЕ: только основные категории (без подкатегорий с /)
        getMainCategories: (state) => {
            return Object.keys(state.iconCategories)
                .filter(key => !key.includes('/'));
        },

        // 🔥 НОВОЕ: подкатегории для основной категории
        getSubCategories: (state) => (mainCategory) => {
            return Object.keys(state.iconCategories)
                .filter(key => key.startsWith(`${mainCategory}/`))
                .map(key => key.split('/')[1]);
        },

        getCategories: (state) => Object.keys(state.iconCategories),

        getIconWithCategory: (state) => (name) => {
            const component = state.availableIcons[name];
            if (!component) return null;

            for (const [category, icons] of Object.entries(state.iconCategories)) {
                if (icons.includes(name)) {
                    return { name, component, category };
                }
            }
            return { name, component, category: 'unknown' };
        },

        hasIcon: (state) => (name) => !!state.availableIcons[name],

        // 🔥 НОВОЕ: дерево категорий для UI
        getCategoryTree: (state) => {
            const tree = {};
            Object.keys(state.iconCategories)
                .filter(key => !key.includes('/'))
                .forEach(mainCat => {
                    tree[mainCat] = {
                        icons: state.iconCategories[mainCat] || [],
                        subCategories: {}
                    };

                    // Добавляем подкатегории
                    Object.keys(state.iconCategories)
                        .filter(key => key.startsWith(`${mainCat}/`))
                        .forEach(subKey => {
                            const subName = subKey.split('/')[1];
                            tree[mainCat].subCategories[subName] = state.iconCategories[subKey];
                        });
                });
            return tree;
        },
    },

    actions: {
        addIconToCategory(category, iconName) {
            if (!this.iconCategories[category]) {
                this.iconCategories[category] = [];
            }
            if (!this.iconCategories[category].includes(iconName)) {
                this.iconCategories[category].push(iconName);
                this.iconCategories[category].sort();
            }
        },

        removeIconFromCategory(category, iconName) {
            if (this.iconCategories[category]) {
                const index = this.iconCategories[category].indexOf(iconName);
                if (index !== -1) {
                    this.iconCategories[category].splice(index, 1);
                }
            }
        },

        iconExists(iconName) {
            return !!this.availableIcons[iconName];
        },

        getIconsCount() {
            return Object.keys(this.availableIcons).length;
        },

        getIconsCountByCategory(category) {
            return (this.iconCategories[category] || []).length;
        }
    }
});
