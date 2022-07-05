import { t } from 'gm-i18n'
import moment from 'moment'

export const returnDateByFlag = (flag: number) => {
  const map = [
    t('当天'),
    t('第二天'),
    t('第三天'),
    t('第四天'),
    t('第五天'),
    t('第六天'),
    t('第七天'),
    t('第八天'),
    t('第九天'),
    t('第十天'),
    t('第十一天'),
    t('第十二天'),
    t('第十三天'),
    t('第十四天'),
    t('第十五天'),
    t('第十六天'),
    t('第十七天'),
    t('第十八天'),
    t('第十九天'),
    t('第二十天'),
    t('第二十一天'),
    t('第二十二天'),
    t('第二十三天'),
    t('第二十四天'),
    t('第二十五天'),
    t('第二十六天'),
    t('第二十七天'),
    t('第二十八天'),
    t('第二十九天'),
    t('第三十天'),
  ]
  return map[flag]
}

export const getDayList = (maxDay = 15) => {
  const days = []
  let i = 0
  while (i < maxDay) {
    days.push({
      value: i,
      text: returnDateByFlag(i),
    })
    i++
  }
  return days
}
