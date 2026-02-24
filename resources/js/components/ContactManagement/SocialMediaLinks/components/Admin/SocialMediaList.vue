<template>
  <div class="social-media-links-list">
    <div class="add-button-top">
      <el-button type="primary" @click="addLink">Добавить ссылку</el-button>
    </div>

    <el-scrollbar style="height: 480px;">
      <draggable
          v-model="localLinks"
          :options="{
            animation: 200,
            ghostClass: 'dragging-row-ghost',
            chosenClass: 'dragging-row-chosen',
            forceFallback: true,
            handle: '.card-header',
            sort: true
          }"
          @start="onDragStart"
          @end="onReorder"
      >
        <el-card
            v-for="link in localLinks"
            :key="link.id"
            shadow="hover"
            class="link-row"
        >
          <div class="card-header" slot="header">
            <component :is="getIconComponent(link.icon)" class="header-icon" />
            <span class="header-title">{{ link.name }}</span>
            <div class="drag-handle" title="Перетащите для сортировки">
              <component :is="DragHandleIcon" />
            </div>
          </div>

          <div class="row-content">
            <div class="col-info">
              <div class="url-label">URL:</div>
              <div class="url">{{ link.url }}</div>
              <div v-if="link.description" class="description-label">Описание:</div>
              <div v-if="link.description" class="description">{{ link.description }}</div>
            </div>

            <div class="col-qr">
              <qr-code-generator :url="link.url" :name="link.name" :size="100" />
            </div>

            <div class="col-controls">
              <el-tooltip content="Редактировать" placement="top">
                <el-button
                    size="small"
                    type="primary"
                    @click="editLink(link)"
                    :icon="EditIcon"
                    circle
                    :disabled="loading || link._updating || link._refreshing"
                    class="action-btn action-btn-edit"
                />
              </el-tooltip>

              <el-tooltip content="Удалить" placement="top">
                <el-button
                    size="small"
                    type="danger"
                    @click="showDeleteConfirm(link.id)"
                    :icon="DeleteIcon"
                    circle
                    :disabled="loading || link._updating || link._refreshing"
                    class="action-btn action-btn-delete"
                />
              </el-tooltip>
            </div>
          </div>
        </el-card>
      </draggable>
    </el-scrollbar>

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
import { useSocialMediaLinksStore } from '@components/ContactManagement/SocialMediaLinks/store/socialMediaLinks.js';
import { VueDraggableNext as Draggable } from 'vue-draggable-next';
import SocialMediaForm from './SocialMediaForm.vue';
import QrCodeGenerator from './QrCodeGenerator.vue';
import { ElMessage } from 'element-plus';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Operation as DragHandleIcon,
  Link as LinkIcon
} from '@element-plus/icons-vue';
import { useFenixIconsStore } from '@components/FenixIconVue/store/fenixIconsStore.js';

const fenixIconStore = useFenixIconsStore();
const store = useSocialMediaLinksStore();

const showForm = ref(false);
const currentLink = ref({});
const showDeleteConfirmDialog = ref(false);
const deleteLinkId = ref(null);
const localLinks = ref([]);
const loading = ref(false);

const sortedLinks = computed(() => store.sortedLinks);

// ✅ ИСПРАВЛЕНО: computed + без markRaw (уже в сторе) + без fa-x-twitter
const iconMap = computed(() => ({
  // Maps
  'fab fa-2gis': fenixIconStore.getIconByName('Fenix2gis') || LinkIcon,
  'fab fa-google-maps': fenixIconStore.getIconByName('FenixGoogleMaps') || LinkIcon,
  'fab fa-yandex-maps': fenixIconStore.getIconByName('FenixYandexMaps') || LinkIcon,

  // Social
  'fab fa-vk': fenixIconStore.getIconByName('FenixVk') || LinkIcon,
  'fab fa-telegram': fenixIconStore.getIconByName('FenixTelegram') || LinkIcon,
  'fab fa-whatsapp': fenixIconStore.getIconByName('FenixWhatsApp') || LinkIcon,
  'fab fa-youtube': fenixIconStore.getIconByName('FenixYouTube') || LinkIcon,
  'fab fa-pinterest': fenixIconStore.getIconByName('FenixPinterest') || LinkIcon,
  'fab fa-tiktok': fenixIconStore.getIconByName('FenixTikTok') || LinkIcon,
  'fab fa-instagram': fenixIconStore.getIconByName('FenixInstagram') || LinkIcon,
  'fab fa-twitter': fenixIconStore.getIconByName('FenixTwitter') || LinkIcon,
  'fab fa-facebook': fenixIconStore.getIconByName('FenixFacebook') || LinkIcon,
  'fab fa-linkedin': fenixIconStore.getIconByName('FenixLinkedIn') || LinkIcon,

  // Default
  'default': fenixIconStore.getIconByName('FenixDefault') || LinkIcon
}));

const getIconComponent = (iconString) => {
  const mappedComponent = iconMap.value[iconString];
  if (mappedComponent) {
    return mappedComponent;
  } else {
    if (import.meta.env.DEV) {
      console.warn(`Иконка для '${iconString}' не найдена, используется резервная.`);
    }
    return iconMap.value.default;
  }
};

watch(sortedLinks, (newSortedLinks) => {
  localLinks.value = [...newSortedLinks];
}, { immediate: true });

onMounted(async () => {
  loading.value = true;
  try {
    await store.fetchLinks();
  } catch (error) {
    ElMessage.error('Ошибка загрузки ссылок: ' + error.message);
  } finally {
    loading.value = false;
  }
});

const editLink = (link) => {
  currentLink.value = { ...link };
  showForm.value = true;
};

const addLink = () => {
  currentLink.value = {
    name: '',
    url: '',
    description: '',
    icon: 'fab fa-instagram',
    order_column: store.linkCount
  };
  showForm.value = true;
};

const handleLinkSaved = async (linkData) => {
  try {
    if (linkData.id) {
      await store.updateLink(linkData.id, linkData);
      ElMessage.success('Ссылка обновлена');
    } else {
      await store.createLink(linkData);
      ElMessage.success('Ссылка создана');
    }
    showForm.value = false;
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

const onDragStart = () => {
};

const onReorder = async () => {
  try {
    const newOrder = localLinks.value.map(link => link.id);
    await store.reorderLinks(newOrder);
    ElMessage.success('Порядок обновлён');
  } catch (error) {
    ElMessage.error('Ошибка обновления порядка: ' + error.message);
    localLinks.value = [...store.sortedLinks];
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
  padding: 5px;
}

.add-button-top, .add-button-bottom {
  margin: 5px 0;
  text-align: center;
}

.link-row {
  margin-bottom: 10px;
  border-radius: 8px;
  transition: box-shadow 0.2s;
}

.link-row:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.dragging-row-ghost {
  opacity: 0.6;
  transform: scale(1.02);
  background-color: #e6f7ff;
  border: 2px dashed #1890ff;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.3);
}

.dragging-row-chosen {
  opacity: 0.9;
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  z-index: 1000;
  background-color: #f0f9ff;
}

.card-header {
  padding: 8px 10px !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fafafa;
  border-bottom: 1px solid #eee;
  border-radius: 8px 8px 0 0;
  cursor: move;
  user-select: none;
  gap: 8px;
}

.header-icon {
  font-size: 18px;
  color: #409EFF;
  flex-shrink: 0;
  width: 50px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  flex: 1;
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #999;
  font-size: 14px;
  border-radius: 4px;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.drag-handle:hover {
  background-color: #ebebeb;
}

.drag-handle :deep(svg) {
  width: 1em;
  height: 1em;
  fill: currentColor;
}

.row-content {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 15px;
  align-items: start;
}

.col-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.url-label, .description-label {
  font-size: 11px;
  color: #909399;
  font-weight: 500;
}

.url {
  font-size: 12px;
  color: #606266;
  word-break: break-all;
}

.description {
  font-size: 12px;
  color: #909399;
  line-height: 1.3;
}

.col-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.col-controls {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.action-buttons .el-button + .el-button {
  margin-left: 0px !important;
}

.action-btn {
  padding: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn-refresh {
  color: #FF9500 !important;
}

.action-btn-refresh:hover:not(:disabled) {
  color: #FFB140 !important;
  transform: scale(1.15);
}

.action-btn-edit {
  color: #409EFF !important;
}

.action-btn-edit:hover:not(:disabled) {
  color: #66b1ff !important;
  transform: scale(1.15);
}

.action-btn-delete {
  color: #F56C6C !important;
}

.action-btn-delete:hover:not(:disabled) {
  color: #f78989 !important;
  transform: scale(1.15);
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none !important;
  color: #c0c4cc !important;
}
</style>
