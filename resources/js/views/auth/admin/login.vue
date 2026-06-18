<template>
  <div class="login">
    <div class="login-container">
      <div class="login-image" :style="bgStyle">
        <div class="photo-credit">
          <span>Powered by ASV</span>
        </div>
      </div>
      <div class="login-content">
        <el-form ref="formRef" :model="form" :rules="rules" class="login-form">
          <div class="title-wrap">
            <h3 class="title">
              <img class="logo" alt="Fenix Portal" :src="logo">
              {{ $t('login.title') }}
              <LangSelect class="set-language" />
            </h3>
          </div>

          <el-form-item prop="email">
            <el-input
                v-model="form.email"
                :placeholder="$t('login.email')"
                clearable
            >
              <template #prefix>
                <Icon class-name="person-fill" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
                v-model="form.password"
                :placeholder="$t('validation.rules.password.placeholder')"
                :type="showPassword ? 'text' : 'password'"
                @keyup.enter="handleLogin"
            >
              <template #prefix>
                <Icon class-name="shield-lock" />
              </template>
              <template #suffix>
                <span class="show-pwd" @click="showPassword = !showPassword">
                  <Icon :class-name="showPassword ? 'eye-slash-fill' : 'eye-fill'" />
                </span>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-button
                type="primary"
                style="width:100%;"
                :loading="loading"
                :disabled="loading"
                @click="handleLogin"
            >
              {{ $t('login.logIn') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { validEmail } from '@utils/validate';
import { ElMessage } from 'element-plus';
import logo from '@/assets/login/logo.svg';
import backgroundImage from '@/assets/login/background.jpg';

// 🔥 ИМПОРТЫ КОМПОНЕНТОВ
import Icon from '@/components/Icon/Icon.vue';
import LangSelect from '@components/LangSelect/LangSelect.vue';

const { t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const formRef = ref(null);

const form = reactive({
  email: import.meta.env.VITE_ADMIN_EMAIL || '',
  password: import.meta.env.VITE_ADMIN_PASSWORD || '',
});

const showPassword = ref(false);
const loading = ref(false);
const bgStyle = ref({
  backgroundImage: `url(${backgroundImage})`
});

const validateEmail = (_, value, callback) => {
  if (!validEmail(value)) {
    callback(new Error(t('validation.rules.email.type')));
  } else {
    callback();
  }
};

const validatePass = (_, value, callback) => {
  if (value.length < 6) {
    callback(new Error(t('validation.rules.password.minLength')));
  } else {
    callback();
  }
};

const rules = reactive({
  email: [{ required: true, trigger: 'blur', validator: validateEmail }],
  password: [{ required: true, trigger: 'blur', validator: validatePass }],
});

const handleLogin = async () => {
  if (loading.value) return;

  if (formRef.value) {
    try {
      await formRef.value.validate();
    } catch (e) {
      console.warn('[Login] Form validation failed');
      return;
    }
  }

  loading.value = true;

  try {
    await authStore.login(form, 'user');

    ElMessage.success(t('login.loginSuccess'));

    let redirectPath = '/dashboard';
    if (route.query.redirect) {
      try {
        const decoded = decodeURIComponent(route.query.redirect);
        if (decoded.startsWith('/')) {
          redirectPath = decoded;
        }
      } catch (e) {
        console.warn('[Login] Invalid redirect:', e?.message);
      }
    }

    router.replace(redirectPath);
  } catch (error) {
    console.error('[Login] error:', error);
    const message = error?.response?.data?.error
        || error?.message
        || t('login.loginFailed');
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
$bg: #2d3a4b;
$light_gray: #eee;
$dark_gray: #889aa4;
$textColor: #eee;

.login {
  width: 100%;
  height: 100%;

  .login-container {
    width: 100%;
    min-height: 100%;
    background: transparent;
    display: block;

    .login-image {
      display: none;
    }

    .login-content {
      width: 100%;
    }

    .login-form {
      min-width: 320px;
      padding: 0;
      position: relative;
    }

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

    .el-input {
      display: contents;
      height: 47px;
      width: 85%;

      .el-input__wrapper {
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

    .show-pwd {
      position: absolute;
      right: 10px;
      top: 14px;
      font-size: 16px;
      color: $dark_gray;
      cursor: pointer;
      user-select: none;
    }
  }
}
</style>
