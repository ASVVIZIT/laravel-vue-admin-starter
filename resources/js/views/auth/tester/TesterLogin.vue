<template>
  <div class="tester-login">
    <div class="title-wrap">
      <h3 class="title">
        <img class="logo" alt="Fenix Portal" :src="logo">
        {{ $t('login.testerTitle') }}
        <LangSelect class="set-language" />
      </h3>
    </div>

    <el-form @submit.prevent="handleLogin" class="login-form">
      <el-form-item :label="$t('login.selectRole')">
        <el-select v-model="role">
          <el-option value="admin" :label="t('roles.admin')" />
          <el-option value="user" :label="t('roles.user')" />
          <el-option value="moderator" :label="t('roles.moderator')" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
            type="primary"
            native-type="submit"
            :loading="loading"
            :disabled="loading"
            style="width:100%;"
        >
          {{ $t('login.loginAsTester') }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import logo from '@/assets/login/logo.svg';

// 🔥 ИМПОРТЫ КОМПОНЕНТОВ
import LangSelect from '@components/LangSelect/LangSelect.vue';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const role = ref('user');
const loading = ref(false);

const handleLogin = async () => {
  if (loading.value) return;
  loading.value = true;

  try {
    await authStore.login({ role: role.value }, 'tester');
    router.replace('/dashboard');
  } catch (error) {
    const message = error?.response?.data?.error || error?.message || t('login.loginFailed');
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
$bg: #2d3a4b;
$light_gray: #eee;
$textColor: #eee;

.tester-login {
  width: 100%;

  .title-wrap {
    display: block;
    margin-bottom: 15px;
    position: relative;

    .logo {
      display: block;
      width: 100%;
      max-width: 200px;
      height: auto;
      margin: 0 auto 20px;
    }

    .title {
      font-size: 24px;
      color: $textColor;
      margin: 0;
      text-align: center;
      font-weight: bold;
    }

    .set-language {
      color: $textColor;
      position: absolute;
      top: 0;
      right: 0;
      cursor: pointer;
    }
  }

  .login-form {
    width: 100%;
  }

  .el-input,
  .el-select {
    display: contents;
    height: 47px;
    width: 85%;

    .el-input__wrapper,
    .el-select__wrapper {
      background: #283443;
      box-shadow: none;
    }

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray !important;
      height: 47px;

      &:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: rgb(192, 188, 188) !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>
