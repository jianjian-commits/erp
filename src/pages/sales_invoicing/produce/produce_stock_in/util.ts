import { ListTaskResponse } from 'gm_api/src/production'
import _ from 'lodash'
import Big from 'big.js'
import { backEndDp } from '../../util'

// import { toFixedByType } from '@/common/util'
import { PDetail } from './stores/receipt_store'

export const getDataByRecommend = (
  recommendData: ListTaskResponse,
  productData: PDetail,
): {
  amount: number
  base_price: number
} => {
  const currentTask = _.find(
    recommendData.task_details,
    ({ task }) => task?.task_id === productData.production_task_id,
  )
  const base_price = +Big(currentTask?.task?.cost ?? 0).toFixed(backEndDp)
  // const amount_show = toFixedByType(+amount, 'dpInventoryAmount')

  const amount = +Big(
    recommendData.costs![productData.production_task_id!] ?? 0,
  ).toFixed(backEndDp)

  return {
    amount,
    base_price,
  }
}
