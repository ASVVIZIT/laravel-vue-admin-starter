<template>
  <div class="admin-login">
    <el-form @submit.prevent="login">
      <el-form-item>
        <el-input v-model="email" placeholder="Email" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="password" type="password" placeholder="Password" show-password />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="login" :loading="loading">
          Войти как админ
        </el-button>
      </el-form-item>
      <el-alert v-if="error" :title="error" type="error" show-icon />
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const store = useStore();
const router = useRouter();

const login = async () => {
  loading.value = true;
  error.value = '';

  try {
    await store.dispatch('auth/adminLogin', {
      email: email.value,
      password: password.value
    });

    ElMessage.success('Админский вход выполнен');
    router.push('/admin/dashboard');
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка входа';
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
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
