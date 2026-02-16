// resources/js/components/FenixIconVue/FenixIconRegistry.js

// Импортируем иконки
import Fenix2gis from './icons/Fenix2gis.vue';
import FenixTikTok from './icons/FenixTikTok.vue';
// Импортируйте другие иконки по мере их добавления
// import FenixSomeOtherIcon from './icons/FenixSomeOtherIcon.vue';

// Создаём объект, где ключ - имя иконки, значение - компонент
export const FenixIcons = {
    Fenix2gis,
    FenixTikTok,
    // FenixSomeOtherIcon,
    // ... другие иконки
};

// Экспортируем отдельные иконки, если нужно импортировать конкретно
export { Fenix2gis, FenixTikTok };
// export { FenixSomeOtherIcon }; // и т.д.
