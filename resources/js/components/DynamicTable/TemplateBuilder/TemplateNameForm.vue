<!-- resources/js/components/DynamicTable/TemplateBuilder/TemplateNameForm.vue -->
<template>
  <div class="form-section">
    <el-form :model="form" :rules="rules" ref="templateForm" label-position="top">
      <el-form-item label="Название шаблона" prop="name">
        <el-input
            v-model="form.name"
            placeholder="Введите название шаблона"
            @blur="validateName"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const templateForm = ref(null);

const props = defineProps({
  name: {
    type: String,
    required: true,
    default: ''
  },
  rules: {
    type: Array,
    required: true,
    default: () => []
  }
});

const emit = defineEmits(['update:name']);

const form = ref({ name: props.name });

watch(() => props.name, (newName, oldName) => {
  console.log(`[TemplateNameForm] Обнаружено изменение названия: "${oldName}" → "${newName}"`);
  if (form.value.name !== newName) {
    form.value.name = newName;
  }
}, { immediate: true });

const validateName = async () => {
  if (templateForm.value && typeof templateForm.value.validateField === 'function') {
    await templateForm.value.validateField('name');
  } else {
    console.warn('[TemplateNameForm] templateForm ref is not available or validateField is not a function');
  }
};

watch(() => form.value.name, (newName) => {
  emit('update:name', newName);
});
</script>

<style lang="scss" scoped>
.form-section {
  background-color: #fff;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  flex-shrink: 0;
}
</style>
