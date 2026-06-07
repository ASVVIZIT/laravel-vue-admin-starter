<template>
  <div class="user-sharing-selector">
    <!-- Отображение выбранных пользователей с прокруткой -->
    <div class="selected-users-list" v-if="selectedUsers.length > 0">
      <el-tag
          v-for="user in visibleUsers"
          :key="user.id"
          closable
          size="small"
          type="primary"
          @close="removeUser(user.id)"
          class="user-tag"
          :title="user.name || user.email"
      >
        {{ truncateText(user.name || user.email, 30) }}
      </el-tag>

      <el-tag
          v-if="hiddenUsersCount > 0 && !showAllUsers"
          size="small"
          type="info"
          effect="plain"
          class="more-users-tag"
          @click="toggleUsersVisibility"
      >
        +{{ hiddenUsersCount }} ещё
      </el-tag>

      <el-tag
          v-if="showAllUsers"
          size="small"
          type="info"
          effect="plain"
          class="more-users-tag"
          @click="toggleUsersVisibility"
      >
        ▲ Свернуть
      </el-tag>
    </div>

    <!-- Обёртка для кастомного placeholder -->
    <div class="select-wrapper">
      <!-- Кастомный placeholder - виден когда input пустой -->
      <div
          v-if="!searchQuery"
          class="custom-placeholder"
          @click="focusSelect"
      >
        {{ placeholder }}
      </div>

      <!-- Поле поиска -->
      <el-select
          ref="selectRef"
          v-model="localValue"
          multiple
          filterable
          remote
          clearable
          placeholder=""
          :remote-method="handleSearch"
          :loading="loading"
          class="user-search-select"
          :class="{ 'is-expanded': showAllUsers }"
          reserve-keyword
          default-first-option
          :popper-class="'user-sharing-popper'"
      >
        <el-option
            v-for="user in searchResults"
            :key="user.id"
            :label="user.name || user.email"
            :value="user.id"
            :disabled="isUserSelected(user.id)"
            :class="{ 'already-selected': isUserSelected(user.id) }"
        >
          <div class="user-option" :class="{ 'is-disabled': isUserSelected(user.id) }">
            <span class="user-name">{{ user.name || user.email }}</span>
            <span class="user-email" v-if="user.email && user.name">{{ user.email }}</span>
            <el-tag v-if="isUserSelected(user.id)" size="small" type="info" effect="plain" class="selected-badge">
              ✓ Добавлен
            </el-tag>
          </div>
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { TrainingUserResource } from '@/components/Training/api/core/resource/TrainingUserResource.js'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Найдите пользователя...' },
  maxVisibleTags: { type: Number, default: 3 }
})

const emit = defineEmits(['update:modelValue'])

const userResource = new TrainingUserResource()
const selectRef = ref(null)
const loading = ref(false)
const showAllUsers = ref(false)
const searchResults = ref([])
const loadedUsers = ref([])
const searchQuery = ref('')

const localValue = computed({
  get: () => props.modelValue || [],
  set: (val) => {
    const prevValue = localValue.value || []
    const newValue = val || []
    const addedIds = newValue.filter(id => !prevValue.includes(id))

    emit('update:modelValue', newValue)

    if (addedIds.length > 0) {
      nextTick(() => {
        showAllUsers.value = true
      })
    }
  }
})

const selectedUsers = computed(() => {
  const ids = localValue.value || []
  return [...ids].reverse().map(id => loadedUsers.value.find(u => u.id === id)).filter(Boolean)
})

const visibleUsers = computed(() => {
  if (showAllUsers.value || selectedUsers.value.length <= props.maxVisibleTags) {
    return selectedUsers.value
  }
  return selectedUsers.value.slice(0, props.maxVisibleTags)
})

const hiddenUsersCount = computed(() => {
  return Math.max(0, selectedUsers.value.length - props.maxVisibleTags)
})

const isUserSelected = (userId) => {
  return (localValue.value || []).includes(userId)
}

watch(() => props.modelValue, async (ids) => {
  if (!ids || ids.length === 0) {
    loadedUsers.value = []
    return
  }

  try {
    loading.value = true
    const users = await userResource.getUsersByIds(ids)
    if (users && users.length > 0) {
      loadedUsers.value = users
    }
  } catch (e) {
    console.error('Error loading users:', e)
  } finally {
    loading.value = false
  }
}, { immediate: true })

const handleSearch = async (query) => {
  searchQuery.value = query || ''
  if (!query || query.trim().length < 2) {
    searchResults.value = []
    return
  }

  try {
    loading.value = true
    const users = await userResource.searchUsers(query, { per_page: 100 })
    searchResults.value = users || []
  } catch (e) {
    console.error('Error searching users:', e)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

const removeUser = (userId) => {
  const newValues = localValue.value.filter(id => id !== userId)
  emit('update:modelValue', newValues)
}

const toggleUsersVisibility = () => {
  showAllUsers.value = !showAllUsers.value
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

const focusSelect = () => {
  if (selectRef.value) {
    selectRef.value.focus()
  }
}
</script>

<style scoped>
.user-sharing-selector {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

/* 🔹 Список тегов с прокруткой */
.selected-users-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: flex-start;
  align-content: flex-start;
  max-height: 100px;
  overflow-y: auto;
  padding: 4px 8px;
  border: 1px dashed #e4e7ed;
  border-radius: 4px;
  background: #fafafa;
}

.selected-users-list::-webkit-scrollbar {
  width: 4px;
}

.selected-users-list::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 2px;
}

.user-tag {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: default;
  animation: fadeIn 0.2s ease-in;
}

.user-tag :deep(.el-tag__close) {
  margin-left: 4px;
  cursor: pointer;
  font-size: 12px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.more-users-tag {
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.more-users-tag:hover {
  transform: scale(1.05);
  background-color: #f0f9ff;
}

/* 🔹 Обёртка для кастомного placeholder */
.select-wrapper {
  position: relative;
  width: 100%;
}

/* 🔹 Кастомный placeholder - виден ВСЕГДА когда input пустой */
.custom-placeholder {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #c0c4cc;
  font-size: 13px;
  pointer-events: none;
  user-select: none;
  z-index: 2;
  white-space: nowrap;
  transition: opacity 0.2s;
}

.user-search-select {
  width: 100%;
}

.user-search-select.is-expanded {
  margin-top: 2px;
}

.user-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
  width: 100%;
}

.user-option.is-disabled {
  opacity: 0.7;
}

.user-name {
  font-weight: 500;
  font-size: 13px;
}

.user-email {
  font-size: 11px;
  color: #909399;
}

.selected-badge {
  margin-top: 2px;
  font-size: 10px;
}

@media (max-width: 768px) {
  .user-tag {
    max-width: 160px;
    font-size: 11px;
  }

  .custom-placeholder {
    font-size: 12px;
  }
}
</style>

<style>
/* Скрываем только теги с ID внутри select */
.user-sharing-selector .el-select__selection .el-tag,
.user-sharing-selector .el-select__tags-text {
  display: none !important;
}

/* Скрываем нативный placeholder Element Plus (он всё равно не работает как надо) */
.user-sharing-selector .el-select__placeholder {
  display: none !important;
}

.user-sharing-selector .el-select__input-wrapper,
.user-sharing-selector .el-select__input {
  display: inline-flex !important;
  width: auto !important;
  min-width: 10px !important;
}

.user-sharing-selector .el-select__suffix {
  display: inline-flex !important;
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.user-sharing-selector .el-select__close {
  cursor: pointer !important;
  color: #c0c4cc;
}

.user-sharing-selector .el-select__close:hover {
  color: #f56c6c;
}

.user-sharing-selector .el-input__inner {
  cursor: text !important;
  background: transparent !important;
}

/* Стили для dropdown */
.user-sharing-popper .el-select-dropdown__item {
  padding: 8px 12px;
  transition: background-color 0.2s;
}

.user-sharing-popper .el-select-dropdown__item.already-selected {
  background-color: #f5f7fa !important;
  color: #909399 !important;
}

.user-sharing-popper .el-select-dropdown__item.already-selected:hover {
  background-color: #f5f7fa !important;
  cursor: not-allowed !important;
}

.user-sharing-popper .el-select-dropdown__item.disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}
</style>
