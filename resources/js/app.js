import './styles/index.scss';
import 'bootstrap-icons/font/bootstrap-icons.scss';

import Cookies from 'js-cookie';

import {createApp} from 'vue';
import App from './views/App.vue';
import Icon from './components/Icon/Icon.vue';
import router from './router';
import './permission'; // permission control
// ElementPlus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import {dayjs} from 'element-plus';
import dayjsLocale from "dayjs/locale/ru";
import elementLocale from 'element-plus/es/locale/lang/ru';
// i18n lang
import i18n from './lang'; // Internationalization

const app = createApp(App);
dayjs.locale(dayjsLocale);
app.use(i18n);

app.config.globalProperties.productionTip = false;

app.use(ElementPlus, {
  size: Cookies.get('size') || 'medium', // set element-plus default size
  i18n: (key, value) => i18n.t(key, value),
  locale: elementLocale
});

// pinia
import {createPinia} from 'pinia';
app.use(createPinia());

// element svg icon
import ElSvgIcon from '@/components/ElSvgIcon.vue';

app.component('ElSvgIcon', ElSvgIcon);

app.component('Icon', Icon);

app.use(router).mount('#app');
