<template>
  <div class="email-verification">
    <div class="title-wrap">
      <h3 class="title">
        <Icon class-name="envelope-check" />
        {{ $t('auth.emailVerificationTitle') }}
      </h3>
      <p class="subtitle">{{ $t('auth.emailVerificationSubtitle') }}</p>
    </div>

    <!-- Успешно подтверждён -->
    <div v-if="verified" class="success-message">
      <Icon class-name="check-circle-fill" />
      <p>{{ $t('auth.emailVerified') }}</p>
      <el-button type="primary" @click="goToLogin" style="margin-top: 16px;">
        {{ $t('auth.goToLogin') }}
      </el-button>
    </div>

    <!-- Ожидает подтверждения -->
    <div v-else class="pending-message">
      <Icon class-name="envelope" />
      <p>{{ $t('auth.checkYourEmail') }}</p>
      <p class="email-highlight">{{ userEmail }}</p>

      <el-button
          type="primary"
          @click="resendVerification"
          :loading="resending"
          :disabled="cooldown > 0"
          style="margin-top: 16px; width: 100%;"
      >
        {{ buttonText }}
      </el-button>
    </div>

    <div class="form-links">
      <a href="#" @click.prevent="goToLogin">
        <Icon class-name="arrow-left" />
        {{ $t('auth.backToLogin') }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import Icon from '@components/Icon/Icon.vue';
import { useAuthStore } from '@store/authStore.js';
import { checkVerification, resendVerificationEmail } from '@api/auth.js';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const verified = ref(false);
const resending = ref(false);
const cooldown = ref(0);
let cooldownTimer = null;

const userEmail = computed(() => authStore.user?.email || '');

const checkVerificationStatus = async () => {
  try {
    const response = await checkVerification();
    verified.value = response?.data?.verified || false;
  } catch (error) {
    console.error('[EmailVerification] Check failed:', error?.message);
  }
};

const resendVerification = async () => {
  resending.value = true;
  try {
    await resendVerificationEmail();
    ElMessage.success(t('auth.verificationResent'));

    cooldown.value = 60;
    cooldownTimer = setInterval(() => {
      cooldown.value--;
      if (cooldown.value <= 0) {
        clearInterval(cooldownTimer);
      }
    }, 1000);
  } catch (error) {
    ElMessage.error(t('auth.resendFailed'));
  } finally {
    resending.value = false;
  }
};

const buttonText = computed(() => {
  if (resending.value) return t('auth.sending');
  if (cooldown.value > 0) return t('auth.resendCooldown', { seconds: cooldown.value });
  return t('auth.resendVerification');
});

const goToLogin = () => {
  router.push('/login');
};

onMounted(() => {
  checkVerificationStatus();
});

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer);
});
</script>

<style lang="scss" scoped>
.email-verification {
  width: 100%;
}

.title-wrap {
  text-align: center;
  margin-bottom: 24px;

  .title {
    font-size: 22px;
    color: #eee;
    margin: 0 0 8px 0;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .subtitle {
    font-size: 13px;
    color: #889aa4;
    margin: 0;
  }
}

.success-message,
.pending-message {
  background: rgba(24, 144, 255, 0.1);
  border: 1px solid rgba(24, 144, 255, 0.3);
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  color: #1890ff;

  .bi {
    font-size: 48px;
    margin-bottom: 12px;
    display: block;
  }

  p {
    margin: 8px 0;
    font-size: 14px;
  }
}

.success-message {
  background: rgba(82, 196, 26, 0.1);
  border-color: rgba(82, 196, 26, 0.3);
  color: #52c41a;
}

.email-highlight {
  font-weight: bold;
  color: #fff !important;
  font-size: 16px !important;
}

.form-links {
  margin-top: 20px;
  text-align: center;

  a {
    color: #1890ff;
    text-decoration: none;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    gap: 6px;

    &:hover { color: #40a9ff; }
  }
}
</style>
