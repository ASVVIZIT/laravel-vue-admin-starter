<template>
  <!-- Bootstrap Icons -->
  <i
      v-if="resolvedSource === ICON_SOURCES.BOOTSTRAP"
      :class="bootstrapClasses"
      :style="iconStyle"
      aria-hidden="true"
  ></i>

  <!-- Fenix SVG Icons -->
  <component
      v-else-if="resolvedSource === ICON_SOURCES.FENIX && fenixIcon"
      :is="fenixIcon"
      :size="resolvedSize"
      :color="resolvedColor"
      :class="['i18n-custom-icon', customClass]"
      v-bind="$attrs"
  />

  <!-- Custom SVG Icons -->
  <component
      v-else-if="resolvedSource === ICON_SOURCES.CUSTOM && customIcon"
      :is="customIcon"
      :size="resolvedSize"
      :color="resolvedColor"
      :use-gradients="useGradients"
      :class="['i18n-custom-icon', customClass]"
      v-bind="$attrs"
  />

  <!-- Fallback на Bootstrap если fenix/custom не найдены -->
  <i
      v-else
      :class="['i18n-custom-icon', 'bi', `bi-${getBootstrapName(resolvedName)}`, customClass]"
      :style="iconStyle"
      aria-hidden="true"
  ></i>
</template>

<script setup>
import { computed } from 'vue';
import { useFenixIconsStore } from '@components/FenixIconVue/store/fenixIconsStore.js';
import { useI18nSettings } from '@components/I18nChecker/composables/useI18nSettings.js';
import { getCustomIcon } from '@components/I18nChecker/components/icons/customIconsRegistry.js';
import {
  ICON_SOURCES,
  ICON_DEFAULTS,
  getIconConfig,
  getIconRealName,
  getIconSize,
} from '@components/I18nChecker/config/iconsConfig.js';

const iconsStore = useFenixIconsStore();
const {
  iconSource: settingsSource,
  iconSize: settingsSize,
  iconColor: settingsColor,
  useGradients: settingsUseGradients
} = useI18nSettings();

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: null },
  color: { type: String, default: null },
  customClass: { type: String, default: 'i18n-custom-icon' },
  forceBootstrap: { type: Boolean, default: false }
});

const iconConfig = computed(() => getIconConfig(props.name));

// ========================================================================
// 🔥 МАППИНГ: Custom/Fenix имя → Bootstrap имя
// Используется когда source = bootstrap
// ========================================================================
const CUSTOM_TO_BOOTSTRAP = {
  'Translate': 'translate',
  'Key': 'key',
  'CheckCircle': 'check-circle',
  'ExclamationCircle': 'exclamation-circle',
  'Gear': 'gear',
  'Search': 'search',
  'Warning': 'exclamation-triangle',
  'Close': 'x',
  'Refresh': 'arrow-clockwise',
  'Export': 'download',
  'Copy': 'clipboard',
  'Info': 'info-circle',
  'Success': 'check-circle',
  'Missing': 'exclamation-circle',
};

const FENIX_TO_BOOTSTRAP = {
  'Telegram': 'send',
  'Vk': 'chat',
  'WhatsApp': 'chat-dots',
  'YouTube': 'play-circle',
  'Instagram': 'camera',
  'Twitter': 'chat-square-text',
  'Facebook': 'chat-fill',
  'TikTok': 'music-note',
  'Pinterest': 'pin',
  'LinkedIn': 'briefcase',
  '2gis': 'geo-alt',
  'GoogleMaps': 'geo-alt',
  'YandexMaps': 'geo-alt',
  'Search': 'search',
  'Warning': 'exclamation-triangle',
  'Default': 'circle',
};

const getBootstrapName = (name) => {
  return CUSTOM_TO_BOOTSTRAP[name] || FENIX_TO_BOOTSTRAP[name] || name;
};

// ========================================================================
// 🔥 ПРИОРИТЕТ ИСТОЧНИКА: prop > НАСТРОЙКИ > default
// Config больше НЕ перебивает настройки пользователя!
// ========================================================================
const resolvedSource = computed(() => {
  // 1. Принудительный bootstrap
  if (props.forceBootstrap) return ICON_SOURCES.BOOTSTRAP;

  // 2. 🔥 Настройки пользователя ВСЕГДА побеждают
  if (settingsSource.value) return settingsSource.value;

  // 3. Дефолт
  return ICON_SOURCES.BOOTSTRAP;
});

// ========================================================================
// 🔥 ИМЯ ИКОНКИ зависит от источника
// Bootstrap → bootstrap имя (translate, check-circle)
// Custom/Fenix → config имя (Translate, CheckCircle)
// ========================================================================
const resolvedName = computed(() => {
  const configName = getIconRealName(props.name);

  if (resolvedSource.value === ICON_SOURCES.BOOTSTRAP) {
    // Для bootstrap маппим на bootstrap-имя
    return getBootstrapName(configName);
  }

  // Для fenix/custom используем имя из конфига
  return configName;
});

// ========================================================================
// РАЗМЕР: prop > настройки > конфиг > дефолт
// ========================================================================
const resolvedSize = computed(() => {
  if (props.size) return props.size;
  if (settingsSize.value && settingsSize.value !== ICON_DEFAULTS.size) return settingsSize.value;
  const configSize = getIconSize(props.name);
  if (configSize && configSize !== ICON_DEFAULTS.size) return configSize;
  return ICON_DEFAULTS.size;
});

// ========================================================================
// ЦВЕТ: prop > настройки > дефолт
// ========================================================================
const resolvedColor = computed(() => {
  if (props.color) return props.color;
  return settingsColor.value || ICON_DEFAULTS.color;
});

const useGradients = computed(() => settingsUseGradients.value);

// ========================================================================
// FENIX ИКОНКА
// ========================================================================
const fenixIcon = computed(() => {
  if (resolvedSource.value !== ICON_SOURCES.FENIX) return null;
  const configName = getIconRealName(props.name);
  const fenixName = configName.startsWith('Fenix')
      ? configName
      : `Fenix${configName.charAt(0).toUpperCase() + configName.slice(1)}`;
  const icon = iconsStore.getIconByName(fenixName);
  if (!icon) {
    console.warn(`[I18nIcon] Fenix icon "${fenixName}" not found, fallback to Bootstrap`);
    return null;
  }
  return icon;
});

// ========================================================================
// CUSTOM ИКОНКА
// ========================================================================
const customIcon = computed(() => {
  if (resolvedSource.value !== ICON_SOURCES.CUSTOM) return null;
  const configName = getIconRealName(props.name);
  const icon = getCustomIcon(configName);
  if (!icon) {
    console.warn(`[I18nIcon] Custom icon "${configName}" not found, fallback to Bootstrap`);
    return null;
  }
  return icon;
});

// ========================================================================
// КЛАССЫ И СТИЛИ
// ========================================================================
const bootstrapClasses = computed(() => [
  'i18n-custom-icon',
  'bi',
  `bi-${resolvedName.value}`,
  props.customClass
].filter(Boolean));

const iconStyle = computed(() => {
  const sizeValue = typeof resolvedSize.value === 'number'
      ? `${resolvedSize.value}px`
      : resolvedSize.value;
  return {
    fontSize: sizeValue,
    color: resolvedColor.value,
    width: sizeValue,
    height: sizeValue
  };
});
</script>

<style lang="scss" scoped>
.i18n-custom-icon {
  width: 1em;
  height: 1em;
  font-size: 1.2rem !important;
  margin-right: 5px;
  position: relative;
  fill: currentColor;
  line-height: 1rem;
  vertical-align: 0px !important;
  align-self: center;
}
</style>
