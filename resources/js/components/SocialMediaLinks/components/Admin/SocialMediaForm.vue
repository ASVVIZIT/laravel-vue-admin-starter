<template>
  <el-dialog
      :title="form.id ? 'Редактировать ссылку' : 'Добавить ссылку'"
      v-model="visible"
      width="500px"
      @close="onClose"
  >
    <el-form
        ref="formRef"
        :model="form"
        label-width="120px"
        :rules="rules"
    >
      <el-form-item label="Название" prop="name">
        <el-input v-model="form.name" placeholder="Например: Instagram" />
      </el-form-item>

      <el-form-item label="URL" prop="url">
        <el-input v-model="form.url" placeholder="https://example.com" />
      </el-form-item>

      <el-form-item label="Иконка" prop="icon">
        <el-select v-model="form.icon" placeholder="Выберите иконку">
          <el-option
              v-for="icon in availableIcons"
              :key="icon"
              :label="icon"
              :value="icon"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Порядок" prop="order">
        <el-input-number
            v-model="form.order"
            :min="0"
            :max="maxOrder"
            @change="updateOrder"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">Отмена</el-button>
      <el-button type="primary" @click="submitForm">Сохранить</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  link: {
    type: Object,
    default: () => ({})
  },
  links: {
    type: Array,
    default: () => []
  }
});

const emits = defineEmits(['close', 'saved']);

const visible = ref(false);
const form = ref({
  name: '',
  url: '',
  icon: 'fab fa-instagram',
  order: 0
});
const formRef = ref(null);

const availableIcons = ref([
  'fab fa-facebook',
  'fab fa-twitter',
  'fab fa-instagram',
  'fab fa-vk',
  'fab fa-telegram',
  'fab fa-youtube',
  'fab fa-tiktok',
  'fab fa-pinterest',
  'fab fa-whatsapp',
  'fab fa-linkedin'
]);

const isValidUrl = (url) => {
  if (!url || !url.trim()) return false;

  // Добавляем протокол, если его нет
  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  try {
    new URL(normalizedUrl);
    return true;
  } catch (e) {
    return false;
  }
};

const rules = {
  name: [
    { required: true, message: 'Введите название', trigger: 'blur' },
    { max: 50, message: 'Максимум 50 символов', trigger: 'blur' }
  ],
  url: [
    { required: true, message: 'Введите URL', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value || !value.trim()) {
          callback(new Error('URL не может быть пустым'));
        } else {
          // Проверяем валидность URL (с автоматическим добавлением протокола)
          if (isValidUrl(value)) {
            callback();
          } else {
            callback(new Error('Неверный URL'));
          }
        }
      },
      trigger: 'blur'
    }
  ],
  icon: [
    { required: true, message: 'Выберите иконку', trigger: 'change' }
  ]
};

const maxOrder = computed(() => {
  return props.links.length ? props.links.length - 1 : 0;
});

// Правильное наблюдение за изменением props.link
watch(() => props.link, (newLink) => {
  if (newLink && newLink !== null) {
    // Создаем копию объекта, чтобы избежать мутации props
    form.value = {
      id: newLink.id || null,
      name: newLink.name || '',
      url: newLink.url || '',
      icon: newLink.icon || 'fab fa-instagram',
      order: newLink.order !== undefined ? newLink.order : 0
    };
    visible.value = true;
  } else {
    // Сброс формы при пустом значении
    form.value = {
      name: '',
      url: '',
      icon: 'fab fa-instagram',
      order: 0
    };
  }
}, { immediate: true });

const onClose = () => {
  visible.value = false;
  // Сброс формы при закрытии
  form.value = {
    name: '',
    url: '',
    icon: 'fab fa-instagram',
    order: 0
  };
  emits('close');
};

const updateOrder = (newOrder) => {
  // Проверяем, не превышает ли порядок количество элементов
  if (newOrder > maxOrder.value) {
    form.value.order = maxOrder.value;
  }
};

const submitForm = async () => {
  const valid = await formRef.value.validate();
  if (!valid) return;

  // Нормализуем URL перед отправкой
  let normalizedUrl = form.value.url.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  // Обновляем URL в форме
  form.value.url = normalizedUrl;

  emits('saved', { ...form.value });
  visible.value = false;
};
</script>
