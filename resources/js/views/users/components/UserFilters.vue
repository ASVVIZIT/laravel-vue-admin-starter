<template>
  <div class="filter-container">
    <!-- Поиск по имени/email -->
    <el-input
        v-model="filters.search"
        :size="size"
        :placeholder="$t('table.user.form.fields.name.title') + '/' + $t('table.user.form.fields.email.title')"
        clearable
        class="filter-item search-filter-item"
        @keyup.enter="$emit('search')"
    />

    <!-- Фильтр по роли -->
    <el-select
        v-model="filters.singleRole"
        :size="size"
        :placeholder="$t('table.user.form.fields.role.title')"
        class="filter-item select-role-filter-item"
        :loading="loading"
        @change="handleRoleChange"
        filterable
        clearable
    >
      <el-option
          v-for="item in roles"
          :key="item"
          :label="uppercaseFirst(item)"
          :value="item"
      />
    </el-select>

    <!-- Фильтр по статусу -->
    <el-select
        v-model="filters.status"
        :size="size"
        :placeholder="$t('users.status.label')"
        class="filter-item select-status-filter-item"
        clearable
        @change="handleStatusChange"
    >
      <el-option :label="$t('users.status.all')" value="all" />
      <el-option :label="$t('users.status.active')" value="active" />
      <el-option :label="$t('users.status.banned')" value="banned" />
      <el-option :label="$t('users.status.trashed')" value="trashed" />
      <el-option :label="$t('users.status.unverified')" value="unverified" />
    </el-select>

    <!-- Кнопки действий -->
    <el-button :size="size" class="filter-item" type="primary" :icon="Search" @click="$emit('search')">
      {{ $t('table.general.search') }}
    </el-button>
    <el-button :size="size" class="filter-item" type="danger" :icon="Refresh" @click="$emit('reset')">
      {{ $t('table.general.filterReset') }}
    </el-button>
    <el-button :size="size" class="filter-item" type="success" :icon="Plus" @click="$emit('create')">
      {{ $t('table.general.add') }}
    </el-button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Search, Plus, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      search: '',
      roles: [],
      singleRole: '',
      status: 'all'
    })
  },
  roles: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'small'
  }
})

const emit = defineEmits([
  'update:modelValue',
  'search',
  'reset',
  'create',
  'status-change',
  'role-change'
])

// Вычисляемое свойство для двусторонней связи без watch
const filters = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Обработчик изменения роли
const handleRoleChange = (role) => {
  emit('role-change', role)
}

// Обработчик изменения статуса
const handleStatusChange = (status) => {
  emit('status-change', status)
}

// Утилита для форматирования текста
const uppercaseFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<style lang="scss" scoped>
.filter-container {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 5px;
  margin-bottom: 16px;

  .filter-item {
    margin-right: 0;
  }

  .search-filter-item {
    width: 220px;
  }

  .select-role-filter-item {
    width: 130px;

    &.is-disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  .select-status-filter-item {
    width: 150px;
  }

  // Адаптивность для маленьких экранов
  @media (max-width: 1200px) {
    flex-wrap: wrap;

    .search-filter-item,
    .select-role-filter-item,
    .select-status-filter-item {
      flex: 1;
      min-width: 150px;
    }
  }
}
</style>
