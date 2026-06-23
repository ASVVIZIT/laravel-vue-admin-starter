<template>
  <!-- Режим 1: Bootstrap Icons -->
  <i
      v-if="resolvedSource === ICON_SOURCES.BOOTSTRAP"
      :class="bootstrapClasses"
      :style="iconStyle"
      aria-hidden="true"
  ></i>

  <!-- Режим 2: Fenix SVG Icons -->
  <component
      v-else-if="resolvedSource === ICON_SOURCES.FENIX && fenixIcon"
      :is="fenixIcon"
      :size="resolvedSize"
      :color="resolvedColor"
      :use-gradients="useGradients"
      :class="['i18n-custom-icon', customClass]"
      v-bind="$attrs"
  />

  <!-- Режим 3: Custom SVG Icons (с fallback на Fenix) -->
  <component
      v-else-if="resolvedSource === ICON_SOURCES.CUSTOM && customIcon"
      :is="customIcon"
      :size="resolvedSize"
      :color="resolvedColor"
      :use-gradients="useGradients"
      :class="['i18n-custom-icon', customClass]"
      v-bind="$attrs"
  />

  <!-- Fallback на Bootstrap если иконка не найдена ни в одном источнике -->
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
import { getBootstrapName } from '@components/I18nChecker/config/iconMapping.js';
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
// ПРИОРИТЕТ ИСТОЧНИКА: prop > НАСТРОЙКИ > default
// ========================================================================
const resolvedSource = computed(() => {
  if (props.forceBootstrap) return ICON_SOURCES.BOOTSTRAP;
  if (settingsSource.value) return settingsSource.value;
  return ICON_SOURCES.BOOTSTRAP;
});

// ========================================================================
// ИМЯ ИКОНКИ зависит от источника
// ========================================================================
const resolvedName = computed(() => {
  const configName = getIconRealName(props.name);

  if (resolvedSource.value === ICON_SOURCES.BOOTSTRAP) {
    return getBootstrapName(configName);
  }

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
// 🔥 CUSTOM ИКОНКА С ТРЁХУРОВНЕВЫМ FALLBACK
// ========================================================================
// Приоритет: Custom → Fenix → Bootstrap (через template v-else)
// ========================================================================
const customIcon = computed(() => {
  if (resolvedSource.value !== ICON_SOURCES.CUSTOM) return null;
  const configName = getIconRealName(props.name);

  // 🔥 УРОВЕНЬ 1: Ищем в Custom registry
  const custom = getCustomIcon(configName);
  if (custom) {
    return custom;
  }

  // 🔥 УРОВЕНЬ 2: Custom не найден → пробуем Fenix
  const fenixName = configName.startsWith('Fenix')
      ? configName
      : `Fenix${configName.charAt(0).toUpperCase() + configName.slice(1)}`;
  const fenix = iconsStore.getIconByName(fenixName);
  if (fenix) {
    console.info(`[I18nIcon] Custom "${configName}" not found, using Fenix "${fenixName}"`);
    return fenix;
  }

  // 🔥 УРОВЕНЬ 3: Ни Custom, ни Fenix нет → fallback на Bootstrap (через v-else)
  console.warn(`[I18nIcon] Icon "${configName}" not found in Custom/Fenix, fallback to Bootstrap`);
  return null;
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
