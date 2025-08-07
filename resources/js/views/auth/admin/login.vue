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
              <img class="logo" alt="Laravel Vue Admin" :src="logo">
              {{ $t('login.title') }}
              <lang-select class="set-language" />
            </h3>
          </div>

          <el-form-item prop="email">
            <el-input
                v-model="form.email"
                :placeholder="$t('login.email')"
                clearable
            >
              <template #prefix>
                <icon class-name="person-fill" />
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
                <icon class-name="shield-lock" />
              </template>
              <template #suffix>
                <span class="show-pwd" @click="showPassword = !showPassword">
                  <icon :class-name="showPassword ? 'eye-slash-fill' : 'eye-fill'" />
                </span>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-button
                type="primary"
                style="width:100%;"
                :loading="loading"
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { validEmail } from '@utils/validate';
import { ElMessage } from 'element-plus';
import logo from '@/assets/login/logo.svg';
import backgroundImage from '@/assets/login/background.jpg';
import LangSelect from '@components/LangSelect/LangSelect.vue';

const { t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

// Устанавливаем тип входа при монтировании компонента
authStore.setLoginType('user');

const form = reactive({
  email: import.meta.env.VITE_ADMIN_EMAIL || '', // admin@fenix.dev
  password: import.meta.env.VITE_ADMIN_PASSWORD || '', // 123456
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
  try {
    loading.value = true;

    // Выполняем вход через authStore Внутри // Получаем CSRF токен
    await authStore.login(form);

    // Успешный вход
    ElMessage.success(t('login.loginSuccess'));

    // Перенаправление на главную страницу
    // window.location.href = '/';

    router.push('/');
  } catch (error) {
    console.error('Login error:', error);
    const message = error.response?.data?.error ||
        error.value ||
        t('login.loginFailed');
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
$bg: #2d3a4b;
$light_gray: #eee;

/* reset element-plus css */
.login-container {
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
        -webkit-text-colorfill-color: rgb(192, 188, 188) !important;
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

<style lang="scss">

$bg: #1d1b28;
$dark_gray: #889aa4;
$light_gray: rgb(211, 203, 203);
$bgColor: #054b5d;
$brown: #B27C66;
$textColor: #eee;

.login {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $bgColor;
  transition: background-color .3s ease-in-out;
  overflow: auto;

  .login-container {
    background: $bg;
    width: 1120px;
    min-height: 590px;
    display: grid;
    grid-template-columns: auto 480px;
    transition: all .3s ease-in-out;
    transform: scale(1);

    .logo {
      display: block;
      width: 100%;
      height: 200px;
      margin-bottom: 20px;
    }

    .login-image {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      overflow: hidden;
      background-color: #303c4b;
      background-image: url('@/assets/login/background.jpg');
      background-position: 50%;
      background-size: cover;
      opacity: 1;
      transition: opacity .3s ease-in-out, padding .2s ease-in-out;

      .photo-credit {
        justify-content: flex-end;
        align-self: flex-end;
        background-color: rgba(255, 255, 255, 0.8);
        margin: 10px;
        padding: 5px 8px;

        h4, span {
          margin: 0;
        }
      }
    }

    .login-form {
      min-width: 320px;
      padding: 30px 60px;
      position: relative;
      opacity: 1;
      transition: opacity .3s ease-in-out, padding .2s ease-in-out;
    }

    .tips {
      font-size: 14px;
      color: #fff;
      margin-bottom: 10px;

      span {
        &:first-of-type {
          margin-right: 16px;
        }
      }
    }

    .svg-container {
      padding: 6px 5px 6px 15px;
      color: $dark_gray;
      vertical-align: middle;
      width: 30px;
      display: inline-block;
    }

    .title-wrap {
      display: block;
      margin-bottom: 15px;

      .title {
        font-size: 24px;
        color: $textColor;
        margin: 0px auto 10px auto;
        text-align: left;
        font-weight: bold;
      }

      .sub-heading {
        font-size: 14px;
        color: $textColor;
        padding-bottom: 15px;
      }
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

    .set-language {
      color: $textColor;
      position: absolute;
      top: 40px;
      right: 35px;
    }
  }
}
</style>
