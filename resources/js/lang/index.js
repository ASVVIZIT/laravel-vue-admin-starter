import {createI18n} from 'vue-i18n'
import Cookies from 'js-cookie'
import elementRuLocale from 'element-plus/dist/locale/ru.mjs' // element-plus lang
import elementEnLocale from 'element-plus/dist/locale/en.mjs' // element-plus lang
import ruLocale from './ru'
import enLocale from './en'

const messages = {
  ru: {
      ...ruLocale,
      ...elementRuLocale,
  },
  en: {
    ...enLocale,
    ...elementEnLocale,
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
