<template>
  <div class="tester-login">
    <h2>{{ $t('login.testerTitle') }}</h2>
    <el-form @submit.prevent="handleLogin">
      <el-form-item :label="$t('login.selectRole')">
        <el-select v-model="role">
          <el-option value="admin" :label="t('roles.admin')" />
          <el-option value="user" :label="t('roles.user')" />
          <el-option value="moderator" :label="t('roles.moderator')" />
        </el-select>
      </el-form-item>
      <el-button
          type="primary"
          native-type="submit"
          :loading="loading"
      >
        {{ $t('login.loginAsTester') }}
      </el-button>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

// Устанавливаем тип входа при монтировании компонента
authStore.setLoginType('tester');

const role = ref('user');
const loading = ref(false);

const handleLogin = async () => {
  if (loading.value) return;
  loading.value = true;

  try {
    await authStore.testerLogin(role.value);
    router.push('/tester/dashboard');
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
.tester-login {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff3cd;
}
</style>
