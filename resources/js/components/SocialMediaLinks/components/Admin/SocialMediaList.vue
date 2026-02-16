<template>
  <div class="social-media-links-list">
    <!-- Кнопка добавления сверху -->
    <div class="add-button-top">
      <el-button type="primary" @click="addLink">Добавить ссылку</el-button>
    </div>

    <el-scrollbar style="height: 500px;">
      <draggable
          v-model="localLinks"
          :options="{
            animation: 150,
            ghostClass: 'dragging',
            dragClass: 'dragging',
            chosenClass: 'dragging',
            forceFallback: true,
            handle: '.drag-handle',
            sort: true
          }"
          @start="onDragStart"
          @end="onReorder"
      >
        <div
            v-for="link in localLinks"
            :key="link.id"
            class="social-media-link-card"
            :class="{ 'dragging': link.isDragging }"
        >
          <div class="drag-handle" style="cursor: move; margin-right: 10px;">
            <i class="fas fa-grip-lines"></i>
          </div>
          <i :class="link.icon" class="social-media-icon"></i>
          <div class="name">{{ link.name }}</div>
          <div class="url">{{ link.url }}</div>
          <div class="qr-code">
            <qr-code-generator :url="link.url" :name="link.name" :size="100" />
          </div>
          <div class="actions">
            <el-button size="small" @click="editLink(link)">Редактировать</el-button>
            <el-button size="small" type="danger" @click="showDeleteConfirm(link.id)">Удалить</el-button>
          </div>
        </div>
      </draggable>
    </el-scrollbar>

    <!-- Кнопка добавления снизу -->
    <div class="add-button-bottom">
      <el-button type="primary" @click="addLink">Добавить ссылку</el-button>
    </div>

    <social-media-form
        v-if="showForm"
        :link="currentLink"
        :links="sortedLinks"
        @close="showForm = false"
        @saved="handleLinkSaved"
    />

    <!-- Диалог подтверждения удаления -->
    <el-dialog
        v-model="showDeleteConfirmDialog"
        title="Подтверждение удаления"
        width="300px"
    >
      <p>Вы уверены, что хотите удалить эту ссылку?</p>
      <template #footer>
        <el-button @click="showDeleteConfirmDialog = false">Отмена</el-button>
        <el-button type="danger" @click="confirmDelete">Удалить</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useSocialMediaLinksStore } from '@/components/SocialMediaLinks/store/socialMediaLinks';
import { VueDraggableNext as Draggable } from 'vue-draggable-next';
import SocialMediaForm from './SocialMediaForm.vue';
import QrCodeGenerator from './QrCodeGenerator.vue';
import { ElMessage } from 'element-plus';

const store = useSocialMediaLinksStore();
const showForm = ref(false);
const currentLink = ref({}); // Используем пустой объект вместо null
const showDeleteConfirmDialog = ref(false);
const deleteLinkId = ref(null);

// Локальное состояние для перетаскивания
const localLinks = ref([]);

// Используем сортированные ссылки из стора
const sortedLinks = computed(() => store.sortedLinks);

// Синхронизируем локальное состояние с глобальным
watch(sortedLinks, (newLinks) => {
  localLinks.value = newLinks.map(link => ({
    ...link,
    isDragging: link.isDragging || false
  }));
}, { immediate: true });

onMounted(async () => {
  await store.fetchLinks();
});

const editLink = (link) => {
  if (!link) return;
  // Создаем копию ссылки, чтобы избежать мутации оригинала
  currentLink.value = { ...link };
  showForm.value = true;
};

const addLink = () => {
  currentLink.value = {
    name: '',
    url: '',
    icon: 'fab fa-instagram',
    order: store.linkCount
  };
  showForm.value = true;
};

const handleLinkSaved = async (linkData) => {
  try {
    if (linkData.id) {
      // Обновляем существующую ссылку
      await store.updateLink(linkData.id, linkData);
    } else {
      // Создаем новую ссылку
      await store.createLink(linkData);
    }
    showForm.value = false;
    ElMessage.success(linkData.id ? 'Ссылка обновлена' : 'Ссылка создана');
  } catch (error) {
    ElMessage.error('Ошибка сохранения: ' + error.message);
  }
};

const deleteLink = async (id) => {
  try {
    await store.deleteLink(id);
    ElMessage.success('Ссылка удалена');
  } catch (error) {
    ElMessage.error('Ошибка удаления: ' + error.message);
  }
};

const onDragStart = (event) => {
  const index = event.oldIndex;
  if (index !== undefined && index >= 0 && index < localLinks.value.length) {
    localLinks.value[index].isDragging = true;
  }
};

const onReorder = async (event) => {
  try {
    // Получаем новый порядок ID
    const newOrder = localLinks.value.map(link => link.id);

    // Обновляем порядок в локальном состоянии
    store.updateLocalOrder(newOrder);

    // Отправляем изменения на сервер
    await store.reorderLinks(newOrder);

    ElMessage.success('Порядок обновлен');
  } catch (error) {
    ElMessage.error('Ошибка обновления порядка: ' + error.message);

    // Восстанавливаем порядок из стора
    const freshLinks = store.sortedLinks;
    localLinks.value = freshLinks.map(link => ({
      ...link,
      isDragging: link.isDragging || false
    }));
  } finally {
    // Сброс состояния dragging
    localLinks.value.forEach(link => {
      link.isDragging = false;
    });
  }
};

const showDeleteConfirm = (id) => {
  deleteLinkId.value = id;
  showDeleteConfirmDialog.value = true;
};

const confirmDelete = async () => {
  await deleteLink(deleteLinkId.value);
  showDeleteConfirmDialog.value = false;
};
</script>

<style scoped>
.social-media-links-list {
  padding: 20px;
}

.add-button-top, .add-button-bottom {
  margin: 15px 0;
  text-align: center;
}

.social-media-link-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
  background: #fff;
  transition: all 0.3s;
  min-height: 120px;
}

.dragging {
  border: 2px dashed #409EFF;
  background-color: #f5f7fa;
  transform: scale(1.02);
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  z-index: 10;
}

.drag-handle {
  cursor: move;
  margin-right: 10px;
  color: #999;
}

.social-media-icon {
  font-size: 24px;
  margin-right: 10px;
  color: #409EFF;
}

.name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 5px;
  line-height: 1.4;
}

.url {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
  word-break: break-all;
  max-width: 250px;
}

.qr-code {
  margin: 5px 0;
  display: flex;
  justify-content: center;
}

.actions {
  display: flex;
  gap: 5px;
  margin-top: 5px;
}

.actions .el-button {
  padding: 0 5px;
  font-size: 12px;
}
</style>
