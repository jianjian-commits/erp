import { childType } from '@/pages/delivery/components/order_print_modal_new/enum'
import { GroupType } from './types'

const groupByType: GroupType = {
  [childType.skuType]: 'notPackageSubSkuTypeName',
}

export { groupByType }
