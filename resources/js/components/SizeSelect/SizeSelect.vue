<template>
  <el-dropdown id="size-select" trigger="click" @command="handleSetSize">
    <div class="pl-1 pr-1">
      <icon class-name="fonts" class="nav-svg-icon"/>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
            v-for="item in sizeOptions"
            :key="item.value"
            :command="item.value"
            :disabled="store.size === item.value"
        >
          <h3 class="font-sizePx12">{{ item.label }}</h3>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { appStore } from '@/store/app'
import { computed } from 'vue'

const store = appStore()

const sizeOptions = computed(() => [
  { label: 'Large', value: 'large' },
  { label: 'Medium', value: 'medium' },
  { label: 'Small', value: 'small' }
])

const handleSetSize = (size) => {
  store.setSize(size)
}
</script>
