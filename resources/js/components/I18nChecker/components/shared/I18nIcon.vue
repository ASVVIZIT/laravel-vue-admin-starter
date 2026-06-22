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

  <!-- Fallback: если fenix запрошен, но не найден → bootstrap -->
  <i
      v-else-if="resolvedSource === ICON_SOURCES.FENIX && !fenixIcon"
      :class="['bi', `bi-${bootstrapFallbackName}`, 'i18n-custom-icon', customClass]"
      :style="iconStyle"
      aria-hidden="true"
  ></i>

  <!-- Custom (локальные SVG модуля) -->
  <i
      v-else
      :class="['bi', `bi-${resolvedName}`, 'i18n-custom-icon', customClass]"
      :style="iconStyle"
      aria-hidden="true"
  ></i>
</template>

<script setup>
import { computed } from 'vue';
import { useFenixIconsStore } from '@components/FenixIconVue/store/fenixIconsStore.js';
import { useI18nSettings } from '@components/I18nChecker/composables/useI18nSettings.js';
import {
  ICON_SOURCES,
  ICON_DEFAULTS,
  getIconConfig,
  getIconRealName,
  getIconSize,
} from '@components/I18nChecker/config/iconsConfig.js';

const iconsStore = useFenixIconsStore();
const { iconSource: settingsSource, iconSize: settingsSize, iconColor: settingsColor } = useI18nSettings();

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: null },
  color: { type: String, default: null },
  customClass: { type: String, default: 'i18n-custom-icon' },
  forceBootstrap: { type: Boolean, default: false }
});

const iconConfig = computed(() => getIconConfig(props.name));

// 🔥 ИСПРАВЛЕННЫЙ ПРИОРИТЕТ: prop > settings > config > default
const resolvedSource = computed(() => {
  if (props.forceBootstrap) return ICON_SOURCES.BOOTSTRAP;

  const userSource = settingsSource.value;
  if (userSource === ICON_SOURCES.FENIX) return ICON_SOURCES.FENIX;
  if (userSource === ICON_SOURCES.CUSTOM) return ICON_SOURCES.CUSTOM;

  const configSource = iconConfig.value?.source;
  if (configSource === ICON_SOURCES.FENIX) return ICON_SOURCES.FENIX;

  return ICON_SOURCES.BOOTSTRAP;
});

const resolvedName = computed(() => getIconRealName(props.name));

// 🔥 ИСПРАВЛЕНО: добавлен маппинг для стандартных иконок модуля
const bootstrapFallbackName = computed(() => {
  const iconMap = {
    // Соцсети (Fenix)
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
    // Карты (Fenix)
    '2gis': 'geo-alt',
    'GoogleMaps': 'geo-alt',
    'YandexMaps': 'geo-alt',
    // 🔥 Стандартные иконки модуля I18nChecker
    'search': 'search',
    'settings': 'gear',
    'key': 'key',
    'refresh': 'arrow-clockwise',
    'export': 'download',
    'copy': 'clipboard',
    'missing': 'exclamation-circle',
    'success': 'check-circle',
    'warning': 'exclamation-triangle',
    'info': 'info-circle',
    'close': 'x',
    // Заголовок и режимы
    'i18n.title': 'translate',
    'i18n.simpleMode': 'check-circle',
    'i18n.scannerMode': 'search',
    'i18n.validatorMode': 'exclamation-triangle',
  };

  // 🔥 Если не найдено в маппинге → возвращаем само имя (для Bootstrap)
  return iconMap[resolvedName.value] || resolvedName.value;
});

// 🔥 ИСПРАВЛЕННЫЙ ПРИОРИТЕТ: prop > settings > config > default
const resolvedSize = computed(() => {
  if (props.size) return props.size;

  if (settingsSize.value && settingsSize.value !== ICON_DEFAULTS.size) {
    return settingsSize.value;
  }

  const configSize = getIconSize(props.name);
  if (configSize && configSize !== ICON_DEFAULTS.size) return configSize;

  return ICON_DEFAULTS.size;
});

const resolvedColor = computed(() => {
  if (props.color) return props.color;
  return settingsColor.value || ICON_DEFAULTS.color;
});

const fenixIcon = computed(() => {
  if (resolvedSource.value !== ICON_SOURCES.FENIX) return null;

  const fenixName = resolvedName.value.startsWith('Fenix')
      ? resolvedName.value
      : `Fenix${resolvedName.value.charAt(0).toUpperCase() + resolvedName.value.slice(1)}`;

  const icon = iconsStore.getIconByName(fenixName);
  if (!icon) {
    console.warn(`[I18nIcon] Fenix icon "${fenixName}" not found, fallback to Bootstrap`);
    return null;
  }
  return icon;
});

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
