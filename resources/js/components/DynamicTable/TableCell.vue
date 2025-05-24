<template>
  <td @dblclick="toggleEdit">
    <template v-if="!isEditing">
      {{ displayValue }}
    </template>

    <template v-else>
      <input
          v-if="column.type === 'text' || column.type === 'number'"
          :type="column.type"
          v-model="editValue"
          @blur="saveChanges"
      />

      <select
          v-else-if="column.type === 'select'"
          v-model="editValue"
          @change="saveChanges"
      >
        <option v-for="opt in column.options" :key="opt" :value="opt">{{ opt }}</option>
      </select>
    </template>
  </td>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  value: [String, Number, Object],
  column: Object
});

console.log(`[TableCell ${props.column.label}] Initializing with value:`, props.value);

const isEditing = ref(false);
const editValue = ref(props.value);

// Если используется селект с опциями
const resolvedValue = computed(() => {
  if (!props.value && props.column.options) {
    return props.column.options.find(opt => opt.id === props.value)?.name || 'N/A';
  }
  return props.value || '—';
});

const displayValue = computed(() => {
  if (props.column.type === 'select') {
    if (!props.value && props.column.options) {

      const found = props.column.options.find(opt => opt.id === props.value)?.name || 'N/A';
      console.log(`[TableCell ${props.column.label}] Select value resolved:`, found);
      return found || '-';
    }
  }
  return props.value;
});

const toggleEdit = () => {
  console.log(`[TableCell ${props.column.label}] Editing mode: ${!isEditing.value}`);
  isEditing.value = !isEditing.value;
};

const saveChanges = () => {
  console.log(`[TableCell ${props.column.label}] Saving changes:`, editValue.value);
  emit('update', editValue.value);
  isEditing.value = false;
};

// Отслеживание внешних изменений значения
watch(() => props.value, (newVal) => {
  console.log(`[TableCell ${props.column.label}] External value changed:`, newVal);
  editValue.value = newVal;
});
</script>
