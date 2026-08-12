<template>
  <el-card v-if="user.id" class="user-card" shadow="hover">
    <div class="user-profile">
      <!-- Аватар и имя -->
      <div class="user-avatar box-center">
        <pan-thumb :image="user.avatar" :height="'80px'" :width="'80px'" :hoverable="false"/>
      </div>
      <div class="box-center">
        <div class="user-name text-center">
          {{ user.name }}
        </div>
        <div class="user-role text-center text-muted">
          {{ getRole() }}
        </div>
      </div>

      <!-- Основная информация -->
      <div class="box-social">
        <el-descriptions
            :column="1"
            size="default"
            border
        >
          <el-descriptions-item :label="t('user.profile.fields.name.title')">
            {{ user.name }}
          </el-descriptions-item>

          <el-descriptions-item :label="t('user.profile.fields.email.title')">
            {{ user.email }}
            <el-tag
                v-if="user.email_verified"
                type="success"
                size="small"
                style="margin-left: 8px;"
            >
              {{ t('common.verified') || '✓' }}
            </el-tag>
            <el-tag
                v-else
                type="danger"
                size="small"
                style="margin-left: 8px;"
            >
              {{ t('common.unverified') || '✗' }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item :label="t('user.profile.fields.sex.title')">
            {{ user.sex ? t('user.profile.fields.female.title') : t('user.profile.fields.male.title') }}
          </el-descriptions-item>

          <el-descriptions-item :label="t('user.profile.fields.age.title')">
            {{ (user.age === null || user.age === '0') ? (t('common.noData') || 'нет данных') : user.age }}
          </el-descriptions-item>

          <el-descriptions-item :label="t('user.profile.fields.description.title')">
            {{ (user.description === null || user.description === '') ? '-' : user.description }}
          </el-descriptions-item>

          <!-- Последняя перепроверка (только для не-системных email) -->
          <el-descriptions-item
              v-if="!isSystemEmail(user.email)"
              :label="t('user.profile.fields.email_reverified.title') || 'Последняя перепроверка'"
          >
            {{ user.email_reverified_at ? formatDate(user.email_reverified_at) : (t('common.never') || 'Никогда') }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </el-card>

  <el-card v-else>
    <div class="user-profile">
      {{ t('user.profile.notfound') }}
    </div>
  </el-card>
</template>

<script setup>
import PanThumb from '@/components/PanThumb/PanThumb.vue'
import { isSystemEmail } from '@/utils/emailConfig'
import dayjs from 'dayjs'
import { uppercaseFirst } from '@/utils/index'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const props = defineProps({
  user: {
    type: Object,
    default: () => ({
      name: '',
      email: '',
      avatar: '',
      age: '',
      sex: '',
      description: '',
      roles: [],
      email_verified: false,
      email_reverified_at: null
    }),
  },
})

const getRole = () => {
  if (!props.user.roles || !props.user.roles.length) return ''
  return props.user.roles.map(value => uppercaseFirst(value)).join(' | ')
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  return dayjs(dateString).format('DD.MM.YYYY HH:mm')
}
</script>

<style lang="scss" scoped>
.user-card {
  .user-profile {
    .user-avatar {
      margin-bottom: 10px;
    }

    .user-name {
      font-weight: bold;
      font-size: 16px;
      color: var(--el-text-color-primary);
    }

    .box-center {
      padding-top: 10px;
    }

    .user-role {
      padding-top: 10px;
      font-weight: 400;
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }

    .box-social {
      padding-top: 20px;

      :deep(.el-descriptions__label) {
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      :deep(.el-descriptions__content) {
        color: var(--el-text-color-regular);
      }
    }
  }
}
</style>
