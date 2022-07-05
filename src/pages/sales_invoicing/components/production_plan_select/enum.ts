import { t } from 'gm-i18n'

// 列表文本搜索
export const listSearchType = [
  {
    value: 1,
    text: t('按生产成品'),
    desc: t('输入生产成品名称搜索'),
    key: 'sku_name',
  },
  {
    value: 2,
    text: t('按计划编号'),
    desc: t('输入计划编号搜索'),
    key: 'serial_no',
  },
]
