<template>
  <div class="landing-editor">
    <div class="editor-header">
      <h2>{{ isEdit ? 'Редактирование' : 'Создание' }} лендинга</h2>
      <div class="header-actions">
        <el-button size="small" @click="$router.back()">Отмена</el-button>
        <el-button type="primary" size="small" @click="save" :loading="saving">
          Сохранить
        </el-button>
      </div>
    </div>

    <el-form :model="form" label-width="120px" size="small">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="Название" required>
            <el-input v-model="form.title" placeholder="Название лендинга" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Slug" required>
            <el-input v-model="form.slug" placeholder="public-home" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="Описание">
        <el-input v-model="form.description" type="textarea" :rows="2" />
      </el-form-item>

      <el-form-item label="Блоки (JSON)">
        <el-input
            v-model="blocksJson"
            type="textarea"
            :rows="10"
            placeholder="Массив блоков в формате JSON"
        />
      </el-form-item>

      <el-form-item label="Настройки (JSON)">
        <el-input
            v-model="settingsJson"
            type="textarea"
            :rows="6"
            placeholder="Настройки темы, SEO и т.д."
        />
      </el-form-item>

      <el-form-item label="Статус">
        <el-checkbox v-model="form.is_active">Активен</el-checkbox>
        <el-checkbox v-model="form.is_published" style="margin-left: 16px;">
          Опубликован
        </el-checkbox>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useLandingStore } from '@/components/Landing/store/landingStore'

const route = useRoute()
const router = useRouter()
const store = useLandingStore()
const saving = ref(false)

const isEdit = computed(() => !!route.params.id)

const form = ref({
  title: '',
  slug: '',
  description: '',
  is_active: true,
  is_published: false,
  settings: {},
  blocks: []
})

const blocksJson = computed({
  get: () => JSON.stringify(form.value.blocks, null, 2),
  set: (val) => {
    try {
      form.value.blocks = JSON.parse(val)
    } catch (e) {
      // Игнорируем ошибки парсинга при вводе
    }
  }
})

const settingsJson = computed({
  get: () => JSON.stringify(form.value.settings, null, 2),
  set: (val) => {
    try {
      form.value.settings = JSON.parse(val)
    } catch (e) {
      // Игнорируем ошибки парсинга при вводе
    }
  }
})

onMounted(async () => {
  if (isEdit.value) {
    await store.fetchLanding(route.params.id)
    if (store.currentLanding) {
      Object.assign(form.value, store.currentLanding)
    }
  }
})

async function save() {
  if (!form.value.title || !form.value.slug) {
    ElMessage.warning('Заполните название и slug')
    return
  }

  saving.value = true
  try {
    if (isEdit.value) {
      await store.updateLanding(route.params.id, form.value)
      ElMessage.success('Лендинг обновлён')
    } else {
      await store.createLanding(form.value)
      ElMessage.success('Лендинг создан')
    }
    router.push({ name: 'LandingList' })
  } catch (error) {
    ElMessage.error('Ошибка сохранения: ' + (error.message || 'Неизвестная ошибка'))
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.landing-editor {
  padding: 16px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.editor-header h2 {
  margin: 0;
  font-size: 20px;
}

.header-actions {
  display: flex;
  gap: 8px;
}
</style>
