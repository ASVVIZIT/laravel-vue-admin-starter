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
        <el-input v-model="form.url" placeholder="https://example.com/path?query=value" />
      </el-form-item>

      <!-- Новое поле Описание -->
      <el-form-item label="Описание" prop="description">
        <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="Краткое описание назначения ссылки"
        />
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

      <el-form-item label="Порядок" prop="order_column">
        <el-input-number
            v-model="form.order_column"
            :min="0"
            :max="maxOrder"
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
  description: '', // Добавлено
  icon: 'fab fa-instagram',
  order_column: 0
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

// Функция проверки URL (используем ту же, что и раньше)
const isValidUrl = (url) => {
  if (!url || !url.trim()) return false;

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

const normalizeUrl = (url) => {
  if (!url || !url.trim()) return '';

  url = url.trim();

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    const parsed = new URL(url);
    parsed.hostname = parsed.hostname.toLowerCase();
    return parsed.toString();
  } catch (e) {
    return `https://${url.replace(/[^a-z0-9.-]/gi, '').toLowerCase()}`;
  }
};

// Обновляем правила валидации
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
        } else if (isValidUrl(value)) {
          callback();
        } else {
          callback(new Error('Неверный URL'));
        }
      },
      trigger: 'blur'
    }
  ],
  // Новое правило для description
  description: [
    { max: 500, message: 'Максимум 500 символов', trigger: 'blur' }
  ],
  icon: [
    { required: true, message: 'Выберите иконку', trigger: 'change' }
  ]
};

const maxOrder = computed(() => {
  return props.links.length ? props.links.length - 1 : 0;
});

// Обновляем watch для инициализации формы с учётом description
watch(() => props.link, (newLink) => {
  if (newLink && Object.keys(newLink).length > 0) {
    form.value = {
      id: newLink.id || null,
      name: newLink.name || '',
      url: newLink.url || '',
      description: newLink.description || '', // Добавлено
      icon: newLink.icon || 'fab fa-instagram',
      order_column: newLink.order_column !== undefined ? newLink.order_column : 0
    };
    visible.value = true;
  } else {
    form.value = {
      name: '',
      url: '',
      description: '', // Сброс поля при открытии новой формы
      icon: 'fab fa-instagram',
      order_column: 0
    };
  }
}, { deep: true, immediate: true });

const onClose = () => {
  visible.value = false;
  // Сбрасываем форму при закрытии
  form.value = {
    name: '',
    url: '',
    description: '', // Добавлено
    icon: 'fab fa-instagram',
    order_column: 0
  };
  emits('close');
};

const submitForm = async () => {
  const valid = await formRef.value.validate();
  if (!valid) return;

  // Нормализуем URL перед отправкой
  let normalizedUrl = form.value.url.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }
  form.value.url = normalizedUrl;

  emits('saved', { ...form.value });
  visible.value = false;
};
</script>
