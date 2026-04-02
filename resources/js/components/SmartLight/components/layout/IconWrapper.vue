<template>
  <component :is="icon" v-bind="iconProps" />
</template>

<script setup>
import { computed, useAttrs } from 'vue';

const props = defineProps({
  icon: {
    type: Object,
    required: true
  },
  size: {
    type: String,
    default: 'default',
    validator: value => ['small', 'default', 'large'].includes(value)
  }
});

const iconProps = computed(() => {
  const attrs = useAttrs();
  return {
    ...attrs,
    class: [
      'icon',
      props.size !== 'default' ? `icon-${props.size}` : '',
      attrs.class || ''
    ]
  };
});
</script>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
  fill: currentColor;
  stroke: currentColor;
  width: 1em;
  height: 1em;
  color: inherit;
  transition: all 0.3s ease;
}

.icon-small {
  width: 0.75em;
  height: 0.75em;
}

.icon-large {
  width: 1.25em;
  height: 1.25em;
}
</style>
