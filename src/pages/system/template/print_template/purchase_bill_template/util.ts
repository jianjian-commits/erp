import _ from 'lodash'
import Big from 'big.js'
import { PurchaseTask } from 'gm_api/src/purchase'
import { PurchaseTaskForPrint, PurchaseTaskForPrintDetail } from './interface'

const getDetailsForPrint = (v: PurchaseTask) => ({
  batch_id: v.batch_id!,
  sku_id: v.sku_id,
  request_value: v.request_value!,
  plan_value: v.plan_value!,
  purchase_value: v.purchase_value!,
  request_details: v.request_details.request_details!,
})
// 根据供应商id分组, 同个组别根据sku_id 合并商品，及相关信息
export const purchaseTaskGroupBy = (purchaseTask: PurchaseTask[]) => {
  const list = _.groupBy(purchaseTask, 'supplier_id')
  const result: PurchaseTaskForPrint[] = []
  _.forEach(list, (v: PurchaseTask[], key: string) => {
    if (key === '0') {
      const items = v.map((v) => getDetailsForPrint(v))
      result.push({ ...v[0], _detailsForPrint: items })
    } else {
      if (v.length === 1) {
        result.push({ ...v[0], _detailsForPrint: [getDetailsForPrint(v[0])] })
      } else {
        const listBySku = _.groupBy(v, 'sku_id')
        const resultBySku = _.map(listBySku, (_v) => {
          let detailsForPrint: PurchaseTaskForPrintDetail

          _.forEach(_v, (item) => {
            detailsForPrint = {
              batch_id: item.batch_id!,
              sku_id: item.sku_id,
              request_details: _.concat(
                detailsForPrint?.request_details,
                item?.request_details?.request_details,
              ).filter((_) => _),
              request_value: {
                ...item?.request_value!,
                calculate: {
                  ...item?.request_value?.calculate!,
                  quantity: `${Big(
                    Number(
                      detailsForPrint?.request_value?.calculate?.quantity!,
                    ) || 0,
                  ).plus(
                    Number(item?.request_value?.calculate?.quantity!) || 0,
                  )}`,
                },
              },
              plan_value: {
                ...item.plan_value!,
                calculate: {
                  ...item.plan_value?.calculate!,
                  quantity: `${
                    (Number(
                      detailsForPrint?.plan_value?.calculate?.quantity!,
                    ) || 0) +
                    (Number(item?.plan_value?.calculate?.quantity!) || 0)
                  }`,
                },
              },
              purchase_value: {
                ...item.purchase_value!,
                calculate: {
                  ...item.purchase_value?.calculate!,
                  quantity: `${
                    (Number(
                      detailsForPrint?.purchase_value?.calculate?.quantity!,
                    ) || 0) +
                    (Number(item?.purchase_value?.calculate?.quantity!) || 0)
                  }`,
                },
              },
            }
          })
          return detailsForPrint!
        })
        result.push({ ...v[0], _detailsForPrint: resultBySku })
      }
    }
  })
  return result
}
