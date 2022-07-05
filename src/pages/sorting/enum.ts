import { t } from 'gm-i18n'

// 默认订单类型: 搜索筛选默认全部，创建订单独自定义默认为常规
export const initOrderType: string = '0'

export const INSPECT_STATUS_SKU = [
  { value: '', text: t('全部状态') },
  { value: 1, text: t('未验货') },
  { value: 2, text: t('已验货') },
]

// 订单类型, 搜索条件
export const orderTypes = [
  { value: '0', text: t('全部') },
  { value: '', text: t('常规') },
]

// 分拣进度状态
export const SORTING_STATUS_LIST = [
  { value: 0, text: t('全部状态') },
  { value: 5, text: t('分拣中') },
  { value: 10, text: t('配送中') },
  { value: 15, text: t('已签收') },
]

// 订单分拣状态
export const SORT_STATUS_ORDER = [
  { value: 0, text: t('全部状态') },
  { value: 1, text: t('未完成分拣') },
  { value: 2, text: t('已完成分拣') },
]

export const ORDER_PRINT_STATUS = [
  { value: '', text: t('全部状态') },
  { value: '1', text: t('已打印') },
  { value: '0', text: t('未打印') },
]
