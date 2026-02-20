<template>
  <el-dialog
      v-model="localVisible"
      title="Подтверждение удаления"
      width="30%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
  >
    <p>Вы уверены, что хотите удалить компанию "<strong>{{ company?.name }}</strong>"?</p>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="localVisible = false" :disabled="loading">Отмена</el-button>
        <el-button type="danger" @click="handleConfirm" :loading="loading">Удалить</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  company: { type: Object, default: null },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['update:visible', 'confirm']);
const localVisible = ref(props.visible);

watch(() => props.visible, (newVal) => { localVisible.value = newVal; });

const handleConfirm = () => emit('confirm');
</script>

<style scoped>
.dialog-footer button:first-child { margin-right: 10px; }
</style>
