<template>
  <div class="i18n-lang-switcher-wrapper">
    <!-- Переключатель -->
    <el-dropdown trigger="click" @command="handleSetLanguage" :teleported="true">
      <button type="button" class="i18n-lang-switcher-btn">
        <I18nIcon name="i18n.title" :size="14" />
        <span class="i18n-lang-switcher-current">{{ currentLabel }}</span>
        <el-icon class="i18n-lang-switcher-arrow"><CaretBottom /></el-icon>
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
              v-for="item in langOptions"
              :key="item.value"
              :command="item.value"
              :disabled="language === item.value"
          >
            <div class="i18n-lang-option">
              <span class="i18n-lang-flag">{{ item.flag }}</span>
              <span class="i18n-lang-name">{{ item.label }}</span>
              <el-icon v-if="language === item.value" class="i18n-lang-check"><Check /></el-icon>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 🔥 INLINE-УВЕДОМЛЕНИЕ (внутри компонента, не влияет на модалку) -->
    <Transition name="i18n-toast-fade">
      <div v-if="showToast" class="i18n-lang-toast">
        <el-icon class="i18n-lang-toast-icon"><Check /></el-icon>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { CaretBottom, Check } from '@element-plus/icons-vue';
import { appStore } from '@/store/appStore';
import { useI18n } from 'vue-i18n';
import I18nIcon from '@components/I18nChecker/components/shared/I18nIcon.vue';

const useAppStore = appStore();
const { t, locale } = useI18n();

const language = computed(() => useAppStore.language);

const langOptions = [
  { label: 'Русский', value: 'ru',    flag: '🇷🇺' },
  { label: 'English', value: 'en',    flag: '🇬🇧' },
  { label: '中文',     value: 'zh-cn', flag: '🇨🇳' },
];

const currentLabel = computed(() => {
  const current = langOptions.find(o => o.value === language.value);
  return current ? current.label : language.value.toUpperCase();
});

// ========================================================================
// 🔥 INLINE-УВЕДОМЛЕНИЕ (без ElMessage/ElNotification)
// ========================================================================
const showToast = ref(false);
const toastMessage = ref('');
let toastTimer = null;

const handleSetLanguage = (lang) => {
  if (lang === language.value) return;

  locale.value = lang;
  useAppStore.setLanguage(lang);

  // Показываем inline-уведомление
  toastMessage.value = t('switchLang.localName') || 'Язык изменён';
  showToast.value = true;

  // Автоскрытие через 1.5 сек
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    showToast.value = false;
    toastTimer = null;
  }, 1500);
};
</script>

<style lang="scss" scoped>
.i18n-lang-switcher-wrapper {
  position: relative;
  display: inline-flex;
}

.i18n-lang-switcher-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  height: 24px;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  color: #606266;
  transition: all 0.2s;

  &:hover {
    background: #ecf5ff;
    border-color: #b3d8ff;
    color: #1890ff;
  }

  .i18n-lang-switcher-current { line-height: 1; }
  .i18n-lang-switcher-arrow { font-size: 10px; margin-left: 2px; }
}

.i18n-lang-option {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;

  .i18n-lang-flag { font-size: 14px; line-height: 1; }
  .i18n-lang-name { flex: 1; font-size: 13px; font-weight: 500; }
  .i18n-lang-check { color: #52c41a; font-size: 14px; }
}

/* ========================================================================
 * 🔥 INLINE-TOAST (absolute, не влияет на размеры модалки)
 * ======================================================================== */
.i18n-lang-toast {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #52c41a;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  pointer-events: none;

  .i18n-lang-toast-icon {
    font-size: 13px;
    color: #52c41a;
  }
}

/* Анимация появления/исчезновения */
.i18n-toast-fade-enter-active,
.i18n-toast-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.i18n-toast-fade-enter-from,
.i18n-toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}

.i18n-toast-fade-enter-to,
.i18n-toast-fade-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
