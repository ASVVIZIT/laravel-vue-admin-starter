import defaultSettings from '@/settings';
import i18n from '@lang/index';

const title = defaultSettings.title || 'Laravel Fenix Admin';

export default function getPageTitle(key) {
  const hasKey = i18n.global.te(`route.${key}`);
  if (hasKey) {
    const pageName = i18n.global.t(`route.${key}`);
    return `${pageName} - ${title}`;
  }
  return `${title}`;
}
