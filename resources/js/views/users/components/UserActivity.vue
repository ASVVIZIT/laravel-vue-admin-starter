<template>
  <el-card v-if="user.id">
    <el-tabs v-model="activeActivity" @tab-click="handleClick" type="border-card">
      <!-- Вкладка: Журнал действий -->
      <el-tab-pane :size="store.size" :label="t('user.profile.tabs.timeline')" name="first">
        <div class="block">
          <el-timeline class="el-timeline">
            <el-timeline-item
                center
                placement="top"
                v-for="(item, index) in timeLinesData"
                :key="index"
                :timestamp="formatDate(item.created_at)"
            >
              <el-card>
                <h4>{{ item.title }}</h4>
                <p>{{ item.content }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-tab-pane>

      <!-- Вкладка: Аккаунт -->
      <el-tab-pane v-loading="updating" :label="t('user.profile.tabs.account')" name="second">
        <el-form
            :model="user"
            label-width="140px"
            label-position="right"
            class="profile-form"
        >
          <el-form-item :label="t('user.profile.fields.name.title')">
            <el-input
                v-model="user.name"
                :size="store.size"
                :disabled="isDisabled"
                :placeholder="t('user.profile.fields.name.placeholder')"
            />
          </el-form-item>

          <el-form-item :label="t('user.profile.fields.email.title')">
            <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
              <el-input
                  v-model="user.email"
                  :size="store.size"
                  disabled
                  style="flex: 1;"
              />
              <!-- Кнопка вызова модального окна смены email -->
              <el-button
                  v-if="!isSystemEmailComputed"
                  type="primary"
                  :size="store.size"
                  @click="showEmailChangeDialog = true"
              >
                {{ t('user.profile.emailChange.changeButton') }}
              </el-button>
            </div>

            <!-- Подсказки -->
            <div v-if="!isSystemEmailComputed" class="email-change-hint">
              <el-icon><InfoFilled /></el-icon>
              <span>{{ t('user.profile.fields.email.changeHint') }}</span>
            </div>
            <div v-else class="email-system-hint">
              <el-icon><Warning /></el-icon>
              <span>{{ t('user.profile.fields.email.systemEmail') }}</span>
            </div>
          </el-form-item>

          <!-- Блок статуса Email (только для не-системных email) -->
          <template v-if="!isSystemEmailComputed">
            <el-divider content-position="left" style="margin: 10px 0;">
              <el-icon><Message /></el-icon>
              <span style="margin-left: 6px;">{{ t('user.profile.emailStatus') || 'Статус Email' }}</span>
            </el-divider>

            <el-descriptions :column="1" border size="small" style="margin-bottom: 15px;">
              <el-descriptions-item :label="t('user.profile.fields.email_verified.title') || 'Статус'">
                <el-tag :type="user.email_verified ? 'success' : 'danger'" size="small">
                  {{ user.email_verified ? (t('common.verified') || 'Подтвержден') : (t('common.unverified') || 'Не подтвержден') }}
                </el-tag>
                <span v-if="user.email_verified_at" style="margin-left: 10px; font-size: 12px; color: #909399;">
                  ({{ formatDate(user.email_verified_at) }})
                </span>
              </el-descriptions-item>
              <el-descriptions-item :label="t('user.profile.fields.email_reverified.title') || 'Перепроверка'">
                <span v-if="user.email_reverified_at">
                  {{ formatDate(user.email_reverified_at) }}
                </span>
                <span v-else style="color: #909399;">{{ t('common.never') || 'Не проводилась' }}</span>

                <el-button
                    v-if="needsReverification"
                    type="warning"
                    size="small"
                    :loading="reverifying"
                    style="margin-left: 15px;"
                    @click="handleReverify"
                >
                  {{ t('user.profile.actions.request_reverify') || 'Запросить перепроверку' }}
                </el-button>
              </el-descriptions-item>

              <!-- Звёзды способа подтверждения (email / admin) -->
              <el-descriptions-item :label="t('users.verify.label') || 'Подтверждения'">
                <EmailVerifyStars :user="user" always />
                <span v-if="!user.old_email_confirm_method && !user.new_email_confirm_method" class="verify-hint">
                  {{ t('users.verify.notDone') || 'Шаги не пройдены' }}
                </span>
              </el-descriptions-item>
            </el-descriptions>
          </template>

          <el-form-item :label="t('user.profile.fields.sex.title')">
            <el-radio-group v-model="user.sex">
              <el-radio :size="store.size" :value="0">{{ $t('user.profile.fields.male.title') }}</el-radio>
              <el-radio :size="store.size" :value="1">{{ $t('user.profile.fields.female.title') }}</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item :label="t('user.profile.fields.birthday.title')">
            <el-date-picker
                v-model="user.birthday"
                :size="store.size"
                type="datetime"
                :placeholder="t('user.profile.fields.birthday.placeholder')"
                value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>

          <el-form-item :label="t('user.profile.fields.description.title')">
            <el-input
                v-model="user.description"
                :size="store.size"
                :autosize="{ minRows: 3, maxRows: 6 }"
                maxlength="255"
                :placeholder="t('user.profile.fields.description.placeholder')"
                show-word-limit
                type="textarea"
            />
          </el-form-item>

          <el-form-item>
            <el-button
                type="primary"
                @click="onSubmit"
                :size="store.size"
                :loading="updating"
            >
              {{ t('form.button.save') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <!-- Подключение компонента смены email с передачей userId -->
    <EmailChangeDialog
        v-model="showEmailChangeDialog"
        :user-id="user.id"
        :current-email="user.email"
        @success="handleEmailChangeSuccess"
    />
  </el-card>
</template>

<script setup>
import { ref, reactive, computed, toRefs, watch } from 'vue'
import UserResource from '@/api/user'
import dayjs from 'dayjs'
import { ElMessage } from "element-plus"
import { InfoFilled, Warning, Message } from '@element-plus/icons-vue'
import { useI18n } from "vue-i18n"
import { appStore } from '@/store/appStore'
import { isSystemEmail } from '@/utils/emailConfig'

// Импорт компонента смены email
import EmailChangeDialog from './EmailChangeDialog.vue'

// Импорт компонента звёзд подтверждения
import EmailVerifyStars from './EmailVerifyStars.vue'

const { t } = useI18n({ useScope: 'global' })
const store = appStore()
const userResource = new UserResource('users')

const props = defineProps({
  user: {
    type: Object,
    default: () => ({
      name: '',
      email: '',
      avatar: '',
      roles: [],
      sex: 0,
      birthday: '2001-01-02 12:12:12',
      description: '',
      email_verified: false,
      email_verified_at: null,
      email_reverified_at: null,
      // Поля звёзд (отдаются из UserResource)
      old_email_confirm_method: null,
      new_email_confirm_method: null,
    }),
  },
})

const reverifying = ref(false)
const showEmailChangeDialog = ref(false)

const isSystemEmailComputed = computed(() => {
  return isSystemEmail(props.user.email)
})

const formatDate = (dateString) => {
  if (!dateString) return '—'
  return dayjs(dateString).format('DD.MM.YYYY HH:mm')
}

const needsReverification = computed(() => {
  if (!props.user.email_verified) return false
  const lastCheck = props.user.email_reverified_at || props.user.email_verified_at
  if (!lastCheck) return true
  return dayjs().diff(dayjs(lastCheck), 'day') > 90
})

const handleReverify = async () => {
  reverifying.value = true
  try {
    await userResource.reverify()
    ElMessage({
      message: t('user.profile.elMessage.reverify.success') || 'Письмо для перепроверки отправлено на вашу почту',
      type: 'success',
      duration: 5000,
    })
  } catch (error) {
    ElMessage({
      message: error.response?.data?.message || (t('user.profile.elMessage.reverify.error') || 'Ошибка отправки письма'),
      type: 'error',
    })
  } finally {
    reverifying.value = false
  }
}

const isDisabled = computed(() => {
  return props.user.roles && props.user.roles.includes('admin')
})

watch(() => props.user.id, (newId) => {
  if (newId) {
    getTimeLines()
  }
}, { immediate: true })

const resData = reactive({
  activeActivity: 'second',
  updating: false,
  timeLinesData: [],
  timeLinesParams: {
    page: 1,
    per_page: 10,
  },
  timeLinesPagination: {
    total: 0,
    currentPage: 1,
    pageSize: 10
  }
})

const handleClick = (tab, event) => {
  // Логика переключения вкладок при необходимости
}

const onSubmit = () => {
  resData.updating = true
  let params = {
    name: props.user?.name,
    sex: props.user?.sex,
    description: props.user?.description
  }

  if (props.user.birthday) {
    params.birthday = dayjs(props.user.birthday).format('YYYY-MM-DD HH:mm:ss')
  }

  userResource
      .update(props.user.id, params)
      .then(response => {
        resData.updating = false
        ElMessage({
          message: t('user.profile.elMessage.update.success.message'),
          type: 'success',
          duration: 5 * 1000,
        })
      })
      .catch(error => {
        console.error(error)
        resData.updating = false
        ElMessage({
          message: error.response?.data?.message || 'Ошибка сохранения',
          type: 'error',
        })
      })
}

const getTimeLines = () => {
  userResource.logs(props.user.id, resData.timeLinesParams).then((res) => {
    resData.timeLinesData = res.data || []
    resData.timeLinesPagination = res.pages || {}
  }).catch(err => {
    console.error('Failed to load logs', err)
  })
}

const handleEmailChangeSuccess = () => {
  console.log('Email change requested successfully for user ID:', props.user.id)
  // Здесь можно добавить перезагрузку данных пользователя, если потребуется
}

const { activeActivity, updating, timeLinesData, timeLinesPagination } = toRefs(resData)
</script>

<style lang="scss" scoped>
.el-timeline {
  padding: 10px;
}

.profile-form {
  max-width: 800px;
  margin: 0 auto;

  .el-form-item {
    margin-bottom: 20px;
  }
}

.email-change-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);

  .el-icon {
    color: var(--el-color-warning);
  }
}

.email-system-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  font-style: italic;

  .el-icon {
    color: var(--el-color-info);
  }
}

/* Стиль подсказки, когда шаги подтверждения не пройдены */
.verify-hint {
  margin-left: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-style: italic;
}
</style>
