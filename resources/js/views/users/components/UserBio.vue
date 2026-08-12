<template>
  <el-card class="box-card user-bio" shadow="hover">
    <template #header>
      <div class="card-header">
        <el-icon><User /></el-icon>
        <span>{{ t('user.profile.about_me') }}</span>
      </div>
    </template>

    <!-- Блок "О себе" -->
    <div class="user-bio-section">
      <div class="user-bio-section-header">
        <el-icon><Document /></el-icon>
        <span>{{ t('user.profile.fields.description.title') || 'О себе' }}</span>
      </div>
      <div class="user-bio-section-body">
        <p class="text-muted">
          {{ user.description || (t('user.profile.noDescription') || 'Пользователь пока не заполнил информацию о себе.') }}
        </p>
      </div>
    </div>

    <!-- Заглушка для будущих расширений (например, навыки, интересы или соцсети) -->
    <div class="user-bio-section">
      <div class="user-bio-section-header">
        <el-icon><Star /></el-icon>
        <span>{{ t('user.profile.skills') || 'Навыки и интересы' }}</span>
      </div>
      <div class="user-bio-section-body">
        <el-empty :description="t('common.noData')" :image-size="60" />
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { User, Document, Star } from '@element-plus/icons-vue'

const { t } = useI18n({ useScope: 'global' })

const props = defineProps({
  user: {
    type: Object,
    default: () => ({
      description: ''
    })
  }
})
</script>

<style lang="scss" scoped>
.user-bio {
  margin-top: 20px;
  color: var(--el-text-color-regular);

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 16px;
  }

  .user-bio-section {
    font-size: 14px;
    padding: 15px 0;

    &:not(:last-child) {
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .user-bio-section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-bottom: 10px;
      margin-bottom: 10px;
      font-weight: 600;
      color: var(--el-text-color-primary);

      .el-icon {
        font-size: 16px;
        color: var(--el-color-primary);
      }
    }

    .user-bio-section-body {
      .text-muted {
        color: var(--el-text-color-secondary);
        line-height: 1.6;
        margin: 0;
      }
    }
  }
}
</style>
