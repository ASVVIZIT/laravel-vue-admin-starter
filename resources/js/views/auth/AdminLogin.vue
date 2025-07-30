<template>
  <div class="admin-login">
    <el-form @submit.prevent="login">
      <el-form-item>
        <el-input v-model="email" placeholder="Email" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="password" type="password" placeholder="Password" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="login" :loading="loading">
          Войти как админ
        </el-button>
      </el-form-item>
      <div v-if="error" class="error-message">{{ error }}</div>
    </el-form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

export default {
  setup() {
    const email = ref('admin@test.com');
    const password = ref('secret');
    const loading = ref(false);
    const error = ref('');
    const store = useStore();
    const router = useRouter();

    const login = async () => {
      loading.value = true;
      error.value = '';

      try {
        const response = await store.dispatch('auth/adminLogin', {
          email: email.value,
          password: password.value
        });

        ElMessage.success('Админский вход выполнен');
        router.push('/admin/dashboard');
      } catch (err) {
        error.value = 'Ошибка входа: ' + (err.response?.data?.error || 'Неверные данные');
      } finally {
        loading.value = false;
      }
    };

    return { email, password, loading, error, login };
  }
};
</script>
