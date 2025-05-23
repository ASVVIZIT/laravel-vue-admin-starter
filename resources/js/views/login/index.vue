<template>
    <div class="login">
        <div class="login-container">
            <div class="login-image">
                <div class="photo-credit">
                    <span>Powered by ASV</span>
                </div>
            </div>
            <div class="login-content">
                <el-form ref="ruleFormRef" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on"
                         label-position="left">
                    <div class="title-wrap">
                        <h3 class="title">
                            <img
                                class="logo"
                                alt="Laravel Vue Admin Starter"
                                :src="logo"
                            >
                            {{ $t('login.title') }}
                            <lang-select class="set-language"/>
                        </h3>
                    </div>
                    <el-form-item prop="email">
            <span class="svg-container">
              <icon class-name="person-fill"/>
            </span>
                        <el-input v-model="loginForm.email" name="email" type="text" auto-complete="on"
                                  :placeholder="$t('login.email')"/>
                    </el-form-item>
                    <el-form-item prop="password">
            <span class="svg-container">
              <icon class-name="shield-lock"/>
            </span>
                        <el-input
                            v-model="loginForm.password"
                            name="password"
                            auto-complete="on"
                            :placeholder="$t('login.password')"
                            :type="pwdType"
                            @keyup.enter.native="handleLogin(ruleFormRef)"
                        />
                        <span class="show-pwd" @click="showPwd">
              <icon :class-name="pwdType === 'password' ? 'eye-fill' : 'eye-slash-fill'"/>
            </span>
                    </el-form-item>
                    <el-form-item>
                        <el-button :loading="loading" type="primary" style="width:100%;"
                                   @click.native.prevent="handleLogin(ruleFormRef)">
                            {{ $t('login.logIn') }}
                        </el-button>
                    </el-form-item>
                    <div class="tips">
                        <span style="margin-right:20px;">Email: admin@admin.com</span>
                        <span>Password: 123456</span>
                    </div>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script setup>
// Импорты Vue и сторонних библиотек
// Imports of Vue and third-party libraries
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElForm } from 'element-plus'
import LangSelect from '@components/LangSelect/index.vue'
import Icon from '@components/Icon/Icon.vue'
import { validEmail } from '@utils/validate'
import { csrf } from '@api/auth'
import { userStore } from '@store/user'
import logo from '@assets/login/logo.svg'

// Инициализация роутера и маршрута
// Router and route initialization
const router = useRouter()
const route = useRoute()

// Инициализация i18n
// i18n initialization
const { t } = useI18n()

// Инициализация хранилища пользователя
// User store initialization
const useUserStore = userStore()

// Реактивные переменные
// Reactive variables
const ruleFormRef = ref(ElForm) // Ссылка на форму ElForm
const pwdType = ref('password') // Тип поля пароля
const loading = ref(false) // Состояние загрузки
const redirect = ref('') // URL для редиректа
const otherQuery = ref({}) // Другие параметры запроса

// Данные формы логина
// Login form data
const loginForm = reactive({
    email: 'admin@admin.com',
    password: '123456'
})

// Правила валидации формы
// Form validation rules
const loginRules = reactive({
    email: [
        {
            required: true,
            trigger: 'blur',
            validator: validateEmail
        }
    ],
    password: [
        {
            required: true,
            trigger: 'blur',
            validator: validatePassword
        }
    ]
})

// Валидация email
// Email validation
function validateEmail(rule, value, callback) {
    if (!validEmail(value)) {
        callback(new Error(t('login.validateMassages.rules.email')))
    } else {
        callback()
    }
}

// Валидация пароля
// Password validation
function validatePassword(rule, value, callback) {
    if (value.length < 6) {
        callback(new Error(t('login.validateMassages.rules.password')))
    } else {
        callback()
    }
}

// Переключение видимости пароля
// Toggle password visibility
const showPwd = () => {
    pwdType.value = pwdType.value === 'password' ? 'text' : 'password'
}

// Обработка логина
// Handle login
const handleLogin = async (formEl) => {
    if (!formEl) return

    await formEl.validate(async (valid) => {
        if (!valid) return

        loading.value = true
        try {
            await csrf()
            await useUserStore.login(loginForm)

            ElMessage({
                message: t('login.loginSuccess'),
                type: 'success'
            })

            router.push({
                path: redirect.value || '/',
                query: otherQuery.value
            })
        } finally {
            loading.value = false
        }
    })
}

// Извлечение дополнительных параметров запроса
// Extract additional query parameters
const getOtherQuery = (query) => {
    return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
            acc[cur] = query[cur]
        }
        return acc
    }, {})
}

// Наблюдатель за изменениями параметров маршрута
// Watch for route query changes
watch(
    () => route.query,
    (query) => {
        if (query) {
            redirect.value = query.redirect
            otherQuery.value = getOtherQuery(query)
        }
    },
    { immediate: true }
)
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
            color: $light_gray;
            height: 47px;

            &:-webkit-autofill {
                -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
                -webkit-text-colorfill-color: rgb(8, 7, 7) !important;
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
$light_gray: rgb(7, 6, 6);
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
            background-image: url('https://cdn.laravel-vue-admin.eu.org/static/images/laravel-vue-admin/background.jpg');
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
