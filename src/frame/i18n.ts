import { appTranslator, getCurrentLng } from 'gm-i18n'
import { setLocale } from '@gm-pc/locales'
import locales from '@/locales'

// 初始化 库 的多语言设置
const lng = getCurrentLng()
appTranslator.loadSimplifiedChinese(locales.zh)
setLocale(lng)
