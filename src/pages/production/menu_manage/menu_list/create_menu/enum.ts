import { t } from 'gm-i18n'

interface options {
  value: number | string
  text: string
}
const Week: options[] = [
  { value: 1, text: t('周一') },
  { value: 2, text: t('周二') },
  { value: 3, text: t('周三') },
  { value: 4, text: t('周四') },
  { value: 5, text: t('周五') },
  { value: 6, text: t('周六') },
  { value: 7, text: t('周日') },
]

export { Week }
