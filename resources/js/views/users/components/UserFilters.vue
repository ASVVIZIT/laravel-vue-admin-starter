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
        filterable
        clearable
        @change="$emit('role-change', $event)"
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
        @change="$emit('status-change', $event)"
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
    required: true
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

defineEmits([
  'update:modelValue',
  'search',
  'reset',
  'create',
  'status-change',
  'role-change'
])

// Read-only computed: v-model по полям (filters.search и т.д.) пишет
// напрямую в объект родителя, writable-ветка не нужна.
const filters = computed(() => props.modelValue)

const uppercaseFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<style lang="scss" scoped>
$filter-search-width: 220px;
$filter-role-width: 130px;
$filter-status-width: 150px;
$filter-gap: 5px;
$breakpoint-md: 1200px;

.filter-container {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: $filter-gap;
  margin-bottom: 16px;

  .filter-item {
    margin-right: 0;
  }

  .search-filter-item {
    width: $filter-search-width;
  }

  .select-role-filter-item {
    width: $filter-role-width;

    &.is-disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  .select-status-filter-item {
    width: $filter-status-width;
  }

  // Адаптивность для маленьких экранов
  @media (max-width: $breakpoint-md) {
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
