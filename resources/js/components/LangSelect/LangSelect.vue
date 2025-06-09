<template>
  <el-dropdown trigger="click" @command="handleSetLanguage">
    <div class="pl-1 pr-4">
      <icon class-name="translate" class="nav-icon" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
            v-for="item in langOptions"
            :key="item.value"
            :command="item.value"
            :disabled="language === item.value"
        >
          <h3 class="pt-1 pb-1 font-langPx14">{{ item.label }}</h3>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { computed } from 'vue';
import { appStore } from '@/store/app';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';

const useAppStore = appStore();
const { t, locale } = useI18n();

// Реактивные данные
const language = computed(() => useAppStore.language);
const langOptions = [
  { label: 'Русский', value: 'ru' },
  { label: 'English', value: 'en' },
  { label: '中文', value: 'zh-cn' },
];

// Обработчик смены языка
const handleSetLanguage = (lang) => {
  locale.value = lang;
  useAppStore.setLanguage(lang);
  ElMessage.success(t('switchLang.localName'));
};
</script>

<style lang="scss" scoped>
.font-langPx14 {
  line-height: 1;
  font-weight: 400;
  margin: 0;
  padding: 0;
}
</style>
