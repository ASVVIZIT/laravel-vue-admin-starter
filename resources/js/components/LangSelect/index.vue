<template>
  <el-dropdown trigger="click" @command="handleSetLanguage">
    <div class="pl-1 pr-4">
      <icon class-name="translate" class="nav-icon" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
            v-for="item in langOptions"
            :key="item.value"
            :command="item.value"
            :disabled="language === item.value"
        >
          <h3 class="pt-1 pb-1 font-langPx14">{{ item.label }}</h3>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script>
import {computed, getCurrentInstance, reactive, toRefs} from "vue"
import {useAppStore} from "@/store/app"
import {useI18n} from "vue-i18n"

export default {
  setup() {
    const {proxy} = getCurrentInstance()
    const appStore = useAppStore()
    const {t} = useI18n()
    const handleSetLanguage = (lang) => {
      proxy.$i18n.locale = lang
      appStore.setLanguage(lang)
      proxy.$message({
        message: t('switchLang.localName'),
        type: 'success',
      });
    }

    const resData = reactive({
      language: computed(() => {
        return appStore.language
      }),
      langOptions: [
        { label: 'Русский', value: 'ru' },
        { label: 'English', value: 'en' },
      ]
    })
    return {
      ...toRefs(resData),
      handleSetLanguage
    }
  },
};
</script>

<style lang="scss" scoped>
.font-langPx14 {
  line-height: 1;
  font-weight: 400;
  margin: 0;
  padding: 0;
}
</style>
