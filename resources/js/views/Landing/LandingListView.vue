<template>
  <div class="landing-list-view">
    <div class="page-header">
      <h2>Лендинги</h2>
      <el-button type="primary" size="small" @click="goCreate">
        + Создать лендинг
      </el-button>
    </div>

    <el-table :data="store.landings" v-loading="store.loading" stripe size="small">
      <el-table-column prop="title" label="Название" min-width="200" />
      <el-table-column prop="slug" label="Slug" width="150" />
      <el-table-column label="Статус" width="120">
        <template #default="{ row }">
          <el-tag :type="row.is_published ? 'success' : 'info'" size="small">
            {{ row.is_published ? 'Опубликован' : 'Черновик' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Действия" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="goEdit(row.id)">
            Редактировать
          </el-button>
          <el-button link type="warning" size="small" @click="goPreview(row.id)">
            Превью
          </el-button>
          <el-button
              link
              :type="row.is_published ? 'danger' : 'success'"
              size="small"
              @click="togglePublish(row.id)"
          >
            {{ row.is_published ? 'Снять' : 'Опубликовать' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLandingStore } from '@/components/Landing/store/landingStore'

const router = useRouter()
const store = useLandingStore()

onMounted(() => {
  store.fetchLandings()
})

function goCreate() {
  router.push({ name: 'LandingCreate' })
}

function goEdit(id) {
  router.push({ name: 'LandingEdit', params: { id } })
}

function goPreview(id) {
  router.push({ name: 'LandingPreview', params: { id } })
}

async function togglePublish(id) {
  await store.togglePublish(id)
}
</script>

<style scoped>
.landing-list-view {
  padding: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
}
</style>
