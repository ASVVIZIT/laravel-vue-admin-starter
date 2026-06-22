<template>
  <i
      v-if="resolvedSource === ICON_SOURCES.BOOTSTRAP"
      :class="bootstrapClasses"
      :style="iconStyle"
      aria-hidden="true"
  ></i>
  <component
      v-else-if="resolvedSource === ICON_SOURCES.FENIX && fenixIcon"
      :is="fenixIcon"
      :size="resolvedSize"
      :color="resolvedColor"
      :class="['i18n-custom-icon', customClass]"
      v-bind="$attrs"
  />
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

const resolvedSource = computed(() => {
  if (props.forceBootstrap) return ICON_SOURCES.BOOTSTRAP;
  const configSource = iconConfig.value?.source;
  return configSource || settingsSource.value || ICON_SOURCES.BOOTSTRAP;
});

const resolvedName = computed(() => getIconRealName(props.name));

const resolvedSize = computed(() => {
  if (props.size) return props.size;
  const configSize = getIconSize(props.name);
  if (configSize && configSize !== ICON_DEFAULTS.size) return configSize;
  return settingsSize.value || ICON_DEFAULTS.size;
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
