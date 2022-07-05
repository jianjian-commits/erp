import globalStore from '@/stores/global'
import { t } from 'gm-i18n'
// 仅配送单
const orderTypeListsOrdinary = [
  { value: 'delivery_task', label: t('配送单据') },
]
// 司机任务单、司机装车单、分拣单等
const orderTypeListsDriver = [
  { value: 'to_print_task', label: t('司机任务单据') },
]

const orderTypeLists = [...orderTypeListsOrdinary, ...orderTypeListsDriver]

const orderTemplateTypeLists = [
  { value: '1', label: t('商户配送单据'), disabled: false },
  {
    value: '2',
    label: t('商户明细模板'),
    disabled: globalStore.isLite,
  },
  {
    value: '3',
    label: t('账户合并配送单据'),
    disabled: globalStore.isLite,
  },
]

enum childType {
  'skuType' = 1,
}

export {
  orderTypeListsOrdinary,
  orderTypeListsDriver,
  orderTypeLists,
  orderTemplateTypeLists,
  childType,
}
