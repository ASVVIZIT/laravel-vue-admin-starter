<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const authStore = useAuthStore();
const router = useRouter();

authStore.setLoginType('admin');

const login = async () => {
  loading.value = true;
  error.value = '';
  try {
    await authStore.login({ email: email.value, password: password.value });
    router.push('/admin/dashboard');
  } catch (err) {
    error.value = err.response?.data?.error || 'Admin login failed';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="admin-login">
    <h2>Admin Login</h2>
    <input v-model="email" placeholder="Email">
    <input v-model="password" type="password" placeholder="Password">
    <button @click="login" :disabled="loading">
      {{ loading ? 'Logging in...' : 'Login as Admin' }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<style scoped>
.admin-login {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.error {
  color: red;
  margin-top: 1rem;
}
</style>
