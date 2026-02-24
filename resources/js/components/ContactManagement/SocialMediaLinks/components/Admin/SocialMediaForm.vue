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

      <el-form-item label="Описание" prop="description">
        <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="Краткое описание назначения ссылки"
        />
      </el-form-item>

      <el-form-item label="Иконка" prop="icon">
        <el-select
            v-model="form.icon"
            placeholder="Выберите иконку"
            style="width: 100%"
        >
          <el-option
              v-for="item in iconOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
            <div class="icon-option-wrapper">
              <component
                  v-if="item.component"
                  :is="item.component"
                  :size="20"
                  class="option-icon"
              />
              <span class="option-label">{{ item.label }}</span>
            </div>
          </el-option>
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
import { useFenixIconsStore } from '@components/FenixIconVue/store/fenixIconsStore.js';
import { Link as LinkIcon } from '@element-plus/icons-vue';

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

const fenixIconStore = useFenixIconsStore();

const visible = ref(false);
const form = ref({
  name: '',
  url: '',
  description: '',
  icon: 'default',
  order_column: 0
});
const formRef = ref(null);

// ✅ ИСПРАВЛЕНО: Массив иконок с компонентами
const iconList = [
  { value: 'fab fa-2gis', label: '2GIS', component: 'Fenix2gis' },
  { value: 'fab fa-google-maps', label: 'Google Maps', component: 'FenixGoogleMaps' },
  { value: 'fab fa-yandex-maps', label: 'Yandex Maps', component: 'FenixYandexMaps' },
  { value: 'fab fa-vk', label: 'VK', component: 'FenixVk' },
  { value: 'fab fa-telegram', label: 'Telegram', component: 'FenixTelegram' },
  { value: 'fab fa-whatsapp', label: 'WhatsApp', component: 'FenixWhatsApp' },
  { value: 'fab fa-youtube', label: 'YouTube', component: 'FenixYouTube' },
  { value: 'fab fa-pinterest', label: 'Pinterest', component: 'FenixPinterest' },
  { value: 'fab fa-tiktok', label: 'TikTok', component: 'FenixTikTok' },
  { value: 'fab fa-instagram', label: 'Instagram', component: 'FenixInstagram' },
  { value: 'fab fa-twitter', label: 'Twitter', component: 'FenixTwitter' },
  { value: 'fab fa-facebook', label: 'Facebook', component: 'FenixFacebook' },
  { value: 'fab fa-linkedin', label: 'LinkedIn', component: 'FenixLinkedIn' },
  { value: 'default', label: 'Default', component: 'FenixDefault' }
];

// ✅ Получаем компоненты из стора
const iconOptions = computed(() => {
  return iconList.map(item => ({
    value: item.value,
    label: item.label,
    component: fenixIconStore.getIconByName(item.component) || LinkIcon
  }));
});

// Функция проверки URL
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

// Правила валидации
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

// Watch для инициализации формы
watch(() => props.link, (newLink) => {
  if (newLink && Object.keys(newLink).length > 0) {
    form.value = {
      id: newLink.id || null,
      name: newLink.name || '',
      url: newLink.url || '',
      description: newLink.description || '',
      icon: newLink.icon || 'default',
      order_column: newLink.order_column !== undefined ? newLink.order_column : 0
    };
    visible.value = true;
  } else {
    form.value = {
      name: '',
      url: '',
      description: '',
      icon: 'default',
      order_column: 0
    };
  }
}, { deep: true, immediate: true });

const onClose = () => {
  visible.value = false;
  form.value = {
    name: '',
    url: '',
    description: '',
    icon: 'default',
    order_column: 0
  };
  emits('close');
};

const submitForm = async () => {
  const valid = await formRef.value.validate();
  if (!valid) return;

  let normalizedUrl = form.value.url.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }
  form.value.url = normalizedUrl;

  emits('saved', { ...form.value });
  visible.value = false;
};
</script>

<style scoped>
.icon-option-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Стили для dropdown (рендерится в body, вне scope) */
:deep(.el-select-dropdown__item) {
  padding: 8px 12px !important;
}

:deep(.el-select-dropdown__item.selected) {
  color: #409EFF;
  font-weight: 600;
}
</style>
