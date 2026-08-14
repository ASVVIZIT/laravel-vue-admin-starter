<template>
  <el-dialog
      v-model="visible"
      :close-on-click-modal="false"
      :before-close="handleBeforeClose"
      width="960px"
      class="user-permissions-dialog"
  >
    <!-- Кастомный заголовок -->
    <template #header>
      <div class="custom-dialog-header">
        <h3 class="dialog-title">
          <span class="title-text">{{ $t('permission.table.edit.user') }}</span>
          <span class="user-name" v-if="localUser?.name">— {{ localUser.name }}</span>
        </h3>
        <div class="header-right">
          <el-tag
              v-if="isReadonly"
              type="danger"
              effect="dark"
              class="readonly-tag"
          >
            🔒 Только просмотр
          </el-tag>
          <el-tag
              v-if="localUser?.roles?.length"
              type="warning"
              effect="dark"
              class="role-tag"
          >
            {{ $t('roles.name') }}: {{ localUser.roles.join(', ') }}
          </el-tag>
        </div>
      </div>
    </template>

    <div v-if="localUser?.name" v-loading="loading" class="form-container">
      <!-- 4 БЛОКА: 2 колонки -->
      <div class="permissions-grid">

        <!-- 1. Права роли - Просмотр (view) -->
        <div class="permission-block role-block">
          <div class="block-header">
            <div class="header-left">
              <el-icon class="header-icon"><Lock /></el-icon>
              <span class="header-title">
                {{ $t('permission.table.rolePermissions.name') }} — Просмотр
              </span>
            </div>
            <el-tag size="small" type="info" class="count-tag">
              {{ roleViewCount }}
            </el-tag>
          </div>
          <div class="tree-wrapper">
            <el-tree
                v-if="roleViewPermissions.length > 0"
                ref="roleViewTreeRef"
                :data="roleViewPermissions"
                :props="permissionProps"
                show-checkbox
                node-key="id"
                :check-strictly="true"
                :default-checked-keys="roleViewCheckedKeys"
                :disabled="isReadonly"
                default-expand-all
                class="permission-tree"
            />
            <el-empty v-else :description="$t('common.noData')" :image-size="40" />
          </div>
        </div>

        <!-- 2. Права роли - Управление (manage) -->
        <div class="permission-block role-block">
          <div class="block-header">
            <div class="header-left">
              <el-icon class="header-icon"><Lock /></el-icon>
              <span class="header-title">
                {{ $t('permission.table.rolePermissions.name') }} — Управление
              </span>
            </div>
            <el-tag size="small" type="info" class="count-tag">
              {{ roleManageCount }}
            </el-tag>
          </div>
          <div class="tree-wrapper">
            <el-tree
                v-if="roleManagePermissions.length > 0"
                ref="roleManageTreeRef"
                :data="roleManagePermissions"
                :props="permissionProps"
                show-checkbox
                node-key="id"
                :check-strictly="true"
                :default-checked-keys="roleManageCheckedKeys"
                :disabled="isReadonly"
                default-expand-all
                class="permission-tree"
            />
            <el-empty v-else :description="$t('common.noData')" :image-size="40" />
          </div>
        </div>

        <!-- 3. Права пользователя - Просмотр (view) -->
        <div class="permission-block user-block">
          <div class="block-header">
            <div class="header-left">
              <el-icon class="header-icon"><EditPen /></el-icon>
              <span class="header-title">
                Дополнительные — Просмотр
              </span>
            </div>
            <el-tag size="small" class="count-tag ratio-tag">
              {{ userViewChecked }}/{{ userViewTotal }}
            </el-tag>
          </div>
          <div class="tree-wrapper">
            <el-tree
                v-if="userViewPermissions.length > 0"
                ref="userViewTreeRef"
                :data="userViewPermissions"
                :props="permissionProps"
                show-checkbox
                node-key="id"
                :check-strictly="true"
                :default-checked-keys="userViewCheckedKeys"
                :disabled="isReadonly"
                default-expand-all
                @check="updateCounts"
                class="permission-tree"
            />
            <el-empty v-else :description="$t('common.noData')" :image-size="40" />
          </div>
        </div>

        <!-- 4. Права пользователя - Управление (manage) -->
        <div class="permission-block user-block">
          <div class="block-header">
            <div class="header-left">
              <el-icon class="header-icon"><EditPen /></el-icon>
              <span class="header-title">
                Дополнительные — Управление
              </span>
            </div>
            <el-tag size="small" class="count-tag ratio-tag">
              {{ userManageChecked }}/{{ userManageTotal }}
            </el-tag>
          </div>
          <div class="tree-wrapper">
            <el-tree
                v-if="userManagePermissions.length > 0"
                ref="userManageTreeRef"
                :data="userManagePermissions"
                :props="permissionProps"
                show-checkbox
                node-key="id"
                :check-strictly="true"
                :default-checked-keys="userManageCheckedKeys"
                :disabled="isReadonly"
                default-expand-all
                @check="updateCounts"
                class="permission-tree"
            />
            <el-empty v-else :description="$t('common.noData')" :image-size="40" />
          </div>
        </div>

      </div>

      <div class="dialog-footer">
        <el-button :size="size" @click="handleClose">
          {{ $t('permission.actions.cancel') }}
        </el-button>
        <el-button
            v-if="!isReadonly"
            :size="size"
            type="primary"
            @click="handleConfirm"
            :loading="saving"
        >
          {{ $t('permission.actions.confirm') }}
        </el-button>
      </div>
    </div>

    <div v-else-if="loading" v-loading="true" style="min-height: 200px;"></div>
    <div v-else class="empty-state">
      <el-empty :description="$t('permission.errors.noUserData')" />
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Lock, EditPen } from '@element-plus/icons-vue'
import UserResource from '@/api/user'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  user: { type: Object, default: null },
  allPermissions: { type: Array, default: () => [] },
  size: { type: String, default: 'small' }
})

const emit = defineEmits(['update:modelValue', 'success'])
const { t } = useI18n()
const userResource = new UserResource()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const saving = ref(false)
const roleViewTreeRef = ref(null)
const roleManageTreeRef = ref(null)
const userViewTreeRef = ref(null)
const userManageTreeRef = ref(null)
const localUser = ref(null)

// Счётчики
const roleViewCount = ref(0)
const roleManageCount = ref(0)
const userViewTotal = ref(0)
const userManageTotal = ref(0)
const userViewChecked = ref(0)
const userManageChecked = ref(0)

// Ключи для default-checked-keys
const roleViewCheckedKeys = ref([])
const roleManageCheckedKeys = ref([])
const userViewCheckedKeys = ref([])
const userManageCheckedKeys = ref([])

const permissionProps = {
  children: 'children',
  label: 'name',
  disabled: 'disabled'
}

// Проверка: является ли пользователь админом (readonly режим)
const isReadonly = computed(() => {
  if (!localUser.value?.roles) return false
  return ['superadmin', 'admin'].some(role => localUser.value.roles.includes(role))
})

const isView = (name) => name?.startsWith('view ')

const isManage = (name) =>
    name?.startsWith('manage ') ||
    name === 'share training' ||
    name === 'create training log' ||
    name === 'confirm user email'

// 1. Права роли - Просмотр
const roleViewPermissions = computed(() => {
  if (!localUser.value) return []
  return (localUser.value.permissions?.role || [])
      .filter(p => isView(p.name))
      .map(p => ({ ...p, disabled: true }))
})

// 2. Права роли - Управление
const roleManagePermissions = computed(() => {
  if (!localUser.value) return []
  return (localUser.value.permissions?.role || [])
      .filter(p => isManage(p.name))
      .map(p => ({ ...p, disabled: true }))
})

// 3. Права пользователя - Просмотр (без прав роли)
const userViewPermissions = computed(() => {
  if (!localUser.value || !props.allPermissions.length) return []
  const rolePermIds = (localUser.value.permissions?.role || []).map(p => p.id)
  return props.allPermissions
      .filter(p => isView(p.name) && !rolePermIds.includes(p.id))
      .map(p => ({ ...p, disabled: false }))
})

// 4. Права пользователя - Управление (без прав роли)
const userManagePermissions = computed(() => {
  if (!localUser.value || !props.allPermissions.length) return []
  const rolePermIds = (localUser.value.permissions?.role || []).map(p => p.id)
  return props.allPermissions
      .filter(p => isManage(p.name) && !rolePermIds.includes(p.id))
      .map(p => ({ ...p, disabled: false }))
})

// Обновление счётчиков при клике
const updateCounts = () => {
  userViewChecked.value = userViewTreeRef.value?.getCheckedKeys(false).length || 0
  userManageChecked.value = userManageTreeRef.value?.getCheckedKeys(false).length || 0
}

// Загрузка прав
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen && props.user) {
    await loadPermissions()
  }
})

const loadPermissions = async () => {
  loading.value = true
  localUser.value = null

  // Сброс счётчиков и ключей
  roleViewCount.value = 0
  roleManageCount.value = 0
  userViewTotal.value = 0
  userManageTotal.value = 0
  userViewChecked.value = 0
  userManageChecked.value = 0
  roleViewCheckedKeys.value = []
  roleManageCheckedKeys.value = []
  userViewCheckedKeys.value = []
  userManageCheckedKeys.value = []

  try {
    const response = await userResource.permissions(props.user.id)
    const permissionsData = response.data || response

    localUser.value = {
      ...props.user,
      permissions: {
        role: permissionsData.role || [],
        user: permissionsData.user || []
      }
    }

    // Собираем ID
    const rolePerms = permissionsData.role || []
    const rViewKeys = rolePerms.filter(p => isView(p.name)).map(p => p.id)
    const rManageKeys = rolePerms.filter(p => isManage(p.name)).map(p => p.id)

    const userPerms = permissionsData.user || []
    const uViewKeys = userPerms.filter(p => isView(p.name)).map(p => p.id)
    const uManageKeys = userPerms.filter(p => isManage(p.name)).map(p => p.id)

    // Устанавливаем ключи для default-checked-keys
    roleViewCheckedKeys.value = rViewKeys
    roleManageCheckedKeys.value = rManageKeys
    userViewCheckedKeys.value = uViewKeys
    userManageCheckedKeys.value = uManageKeys

    // Счетчики
    roleViewCount.value = rViewKeys.length
    roleManageCount.value = rManageKeys.length
    userViewTotal.value = userViewPermissions.value.length
    userManageTotal.value = userManagePermissions.value.length
    userViewChecked.value = uViewKeys.length
    userManageChecked.value = uManageKeys.length

  } catch (error) {
    console.error('❌ Error:', error)
    ElMessage.error(error.response?.data?.message || t('error.loadPermissions'))
    visible.value = false
  } finally {
    loading.value = false
  }
}

const handleClose = () => resetDialog()
const handleBeforeClose = (done) => { done(); resetDialog() }

const resetDialog = () => {
  visible.value = false
  localUser.value = null
  roleViewCheckedKeys.value = []
  roleManageCheckedKeys.value = []
  userViewCheckedKeys.value = []
  userManageCheckedKeys.value = []

  roleViewCount.value = 0
  roleManageCount.value = 0
  userViewTotal.value = 0
  userManageTotal.value = 0
  userViewChecked.value = 0
  userManageChecked.value = 0
}

const handleConfirm = async () => {
  if (!localUser.value || isReadonly.value) return

  saving.value = true

  try {
    const currentViewKeys = userViewTreeRef.value?.getCheckedKeys(false) || []
    const currentManageKeys = userManageTreeRef.value?.getCheckedKeys(false) || []
    const allUserPermissions = [...currentViewKeys, ...currentManageKeys]

    // 🔥 ИСПРАВЛЕНО: передаём плоский массив ID, без обёртки { permissions: ... }
    // Метод updatePermission в user.js уже сам оборачивает данные при отправке
    await userResource.updatePermission(localUser.value.id, allUserPermissions)

    ElMessage.success(t('permission.table.elMessage.update.success.message'))
    resetDialog()
    emit('success')

  } catch (error) {
    console.error('❌ Error saving:', error)
    ElMessage.error(error.response?.data?.message || t('permission.table.elMessage.update.error.message'))
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.user-permissions-dialog {
  :deep(.el-dialog) {
    width: 960px !important;
    max-width: 960px;
    border-radius: 8px;
  }

  :deep(.el-dialog__header) {
    padding: 0;
    margin: 0;
    border-bottom: none;
  }

  :deep(.el-dialog__body) {
    padding: 12px 16px;
    overflow-x: hidden;
    overflow-y: auto;
    max-height: calc(100vh - 180px);
  }
}

.custom-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-fill-color-light) 100%);
  border-left: 4px solid var(--el-color-warning);
  border-radius: 6px;
  margin: -12px -16px 12px -16px;

  .dialog-title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    display: flex;
    align-items: center;
    gap: 8px;

    .title-text {
      white-space: nowrap;
    }

    .user-name {
      font-weight: 700;
      color: var(--el-color-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 400px;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .readonly-tag,
  .role-tag {
    font-weight: 600;
    flex-shrink: 0;
  }
}

.form-container {
  width: 100%;
  overflow-x: hidden;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 12px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.permission-block {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 6px;
  background: var(--el-fill-color-blank);
  display: flex;
  flex-direction: column;
  min-height: 160px;

  .block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 6px;
    margin-bottom: 6px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    flex-shrink: 0;

    .header-left {
      display: flex;
      align-items: center;
      gap: 5px;
      min-width: 0;
      flex: 1;

      .header-icon {
        font-size: 13px;
        flex-shrink: 0;
        color: var(--el-text-color-secondary);
      }

      .header-title {
        font-size: 11px;
        font-weight: 600;
        color: var(--el-text-color-regular);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .count-tag {
      font-weight: 600;
      font-size: 11px;
      padding: 2px 8px;
      flex-shrink: 0;
      background-color: var(--el-fill-color);
      border: 1px solid var(--el-border-color);

      &.ratio-tag {
        background-color: var(--el-color-success-light-9);
        border-color: var(--el-color-success-light-7);
        color: var(--el-color-success);
      }
    }
  }

  .tree-wrapper {
    flex: 1;
    min-height: 100px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .permission-tree {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 290px;

    :deep(.el-tree-node__content) {
      height: 18px;
      min-height: 18px;
      padding: 0 3px;
      font-size: 11px;
      line-height: 18px;

      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }

    :deep(.el-checkbox) {
      height: 14px;
      margin-right: 3px;

      .el-checkbox__inner {
        width: 13px;
        height: 13px;
      }
    }

    :deep(.el-tree-node__expand-icon) {
      font-size: 11px;
      margin-right: 2px;
    }

    :deep(.el-tree-node__label) {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: calc(100% - 25px);
    }
  }

  &.role-block {
    background: var(--el-fill-color-lighter);

    .permission-tree {
      :deep(.el-tree-node__content) {
        color: var(--el-text-color-placeholder);

        .el-checkbox__input.is-checked .el-checkbox__inner {
          background-color: var(--el-text-color-placeholder);
          border-color: var(--el-text-color-placeholder);
        }
      }
    }
  }

  &.user-block {
    .permission-tree {
      :deep(.el-tree-node.is-checked > .el-tree-node__content) {
        background-color: var(--el-color-success-light-9);
        border-radius: 2px;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 0 0;
  border-top: 1px solid var(--el-border-color-lighter);
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}
</style>
