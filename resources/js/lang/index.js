import {createI18n} from 'vue-i18n'
import Cookies from 'js-cookie'
import elementRuLocale from 'element-plus/dist/locale/ru.mjs'
import elementEnLocale from 'element-plus/dist/locale/en.mjs'
import elementZhCnLocale from 'element-plus/dist/locale/zh-cn.mjs'
import ruLocale from './ru'
import enLocale from './en'
import zhLocale from './zh-cn'

const messages = {
  'ru': {
    ...ruLocale,
    ...elementRuLocale,
  },
  'en': {
    ...enLocale,
    ...elementEnLocale,
  },
  'zh-cn': {
    ...zhLocale,
    ...elementZhCnLocale,
  },
}

export function getLanguage() {
  const chooseLanguage = Cookies.get('language')
  if (chooseLanguage) {
    return chooseLanguage
  }

  // if has not choose language
  const language = (navigator.language || navigator.browserLanguage).toLowerCase()
  const locales = Object.keys(messages)
  for (const locale of locales) {
    if (language.indexOf(locale) > -1) {
      return locale
    }
  }
  return 'ru'
}

const i18n = createI18n({
  messages,
  locale: getLanguage(),
  legacy: false,
  globalInjection: true,
  allowComposition: true,
  escapeParameterHtml: false,
  interpolation: {
    escapeValue: false,
    prefix: '{',
    suffix: '}'
  }
})

export default i18n
