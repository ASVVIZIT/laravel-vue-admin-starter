<template>
  <div class="admin-login">
    <h2>{{ $t('login.adminTitle') }}</h2>
    <el-form ref="formRef" :model="form" @submit.prevent="handleLogin">
      <el-form-item>
        <el-input
            v-model="form.email"
            :placeholder="$t('login.email')"
            type="email"
            required
        />
      </el-form-item>
      <el-form-item>
        <el-input
            v-model="form.password"
            :placeholder="$t('validation.rules.password.placeholder')"
            type="password"
            required
            show-password
        />
      </el-form-item>
      <el-button
          type="primary"
          native-type="submit"
          :loading="loading"
      >
        {{ $t('login.logIn') }}
      </el-button>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Устанавливаем тип входа при монтировании компонента
authStore.setLoginType('admin');

const form = ref({
  email: import.meta.env.VITE_ADMIN_EMAIL || 'admin@fenix.dev',
  password: import.meta.env.VITE_ADMIN_PASSWORD || '123456'
});

const loading = ref(false);

const handleLogin = async () => {
  try {
    loading.value = true;
    await authStore.login(form.value);

    const redirectPath = route.query.redirect ||
        route.hash.replace('#', '') ||
        '/admin/dashboard';

    router.push(redirectPath);
  } catch (error) {
    const message = error.response?.data?.error ||
        error.value ||
        t('login.loginFailed');
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.admin-login {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f0f8ff;
}
</style>
