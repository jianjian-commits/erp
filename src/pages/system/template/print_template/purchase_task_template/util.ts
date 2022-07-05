import _ from 'lodash'
import Big from 'big.js'
import {
  PurchaseTask,
  PurchaseTask_PurchaseDetails_PurchaseDetail,
  Batch,
} from 'gm_api/src/purchase'
import { PurchaseTaskForPrint, PurchaseTaskForPrintDetail } from './interface'

const getDetailsForPrint = (v: PurchaseTask, batchMap: Batch[]) => ({
  batch_id: v.batch_id!,
  batch_name:
    _.find(batchMap, (item) => item.batch_id === v.batch_id)?.name || '-',
  remark: v.remark,
  sku_level_filed_id: v.sku_level_filed_id!,
  sku_id: v.sku_id,
  purchase_task_id: v.purchase_task_id,
  request_value: v.request_value!,
  plan_value: v.plan_value!,
  purchase_value: v.purchase_value!,
  request_details: v.request_details.request_details!,
  purchase_details: v.purchase_details?.purchase_details!,
})

// 根据不同的采购单位来分组
const purchaseUnitGroupBy = (
  listBySku: _.Dictionary<[PurchaseTask, ...PurchaseTask[]]>,
  batchMap: Batch[],
): PurchaseTaskForPrintDetail[] => {
  let remark = ''
  let sku_id = ''
  const resultBySku: any[] = []
  _.map(listBySku, (_v) => {
    // 波次暂时不理
    // sku相同的时候
    let detailsForPrint: { [key: string]: PurchaseTaskForPrintDetail } = {}
    _.forEach(_v, (item) => {
      // 这个是单位(采购单位)
      const unit_id = item.plan_value?.input?.unit_id!
      const level_id = item?.sku_level_filed_id!
      // 兼容问题
      if (sku_id !== item.sku_id) {
        sku_id = item?.sku_id
        remark = ''
      }
      if (item.remark !== '') {
        remark = detailsForPrint?.[unit_id!]?.remark! || '' + item.remark + ','
      }
      const {
        request_details,
        purchase_details,
        request_value,
        plan_value,
        purchase_value,
      } = item

      const detailsForPrintObj = {
        [(unit_id! + '_' + level_id) as string]: {
          // TODO: 先记录
          batch_id: item.batch_id!,
          batch_name:
            _.find(batchMap, (batch) => batch.batch_id === item?.batch_id)
              ?.name || '-',
          sku_level_filed_id: item.sku_level_filed_id!,
          remark: remark,
          sku_id: item?.sku_id,
          /** 订单明细 */
          request_details: _.concat(
            detailsForPrint?.[unit_id + '_' + level_id!]?.request_details! ||
              '',
            request_details?.request_details,
          ).filter((_) => _),
          /** 采购详情 */
          purchase_details: _.concat(
            detailsForPrint?.[unit_id + '_' + level_id!]?.purchase_details! ||
              '',
            purchase_details?.purchase_details,
          ).filter((_) => _) as PurchaseTask_PurchaseDetails_PurchaseDetail[],
          /** 需要采购 */
          request_value: {
            ...request_value!,
            calculate: {
              ...request_value?.calculate!,
              quantity: `${Big(
                Number(
                  detailsForPrint?.[unit_id + '_' + level_id!]?.request_value
                    ?.calculate?.quantity!,
                ) || 0,
              ).plus(Number(request_value?.calculate?.quantity!) || 0)}`,
            },
          },
          /** 计划采购 */
          plan_value: {
            ...plan_value!,
            calculate: {
              ...plan_value?.calculate!,
              quantity: `${
                (Number(
                  detailsForPrint?.[unit_id + '_' + level_id!]?.plan_value
                    ?.calculate?.quantity!,
                ) || 0) + (Number(plan_value?.calculate?.quantity!) || 0)
              }`,
            },
          },
          /** 已采购 */
          purchase_value: {
            ...purchase_value!,
            calculate: {
              ...purchase_value?.calculate!,
              quantity: `${
                (Number(
                  detailsForPrint?.[unit_id + '_' + level_id!]?.purchase_value
                    ?.calculate?.quantity!,
                ) || 0) + (Number(purchase_value?.calculate?.quantity!) || 0)
              }`,
            },
          },
        },
      }
      detailsForPrint = Object.assign(detailsForPrint, detailsForPrintObj)
    })
    _.keys(detailsForPrint).forEach((i) => {
      resultBySku.push(detailsForPrint[i])
    })
  })
  return resultBySku
}

// 根据供应商id分组, 同个组别根据sku_id 合并商品，及相关信息
export const purchaseTaskGroupBy = (
  purchaseTask: PurchaseTask[],
  batchMap: Batch[],
) => {
  const list = _.groupBy(purchaseTask, 'supplier_id')
  const result: PurchaseTaskForPrint[] = []
  _.forEach(list, (v: PurchaseTask[], key: string) => {
    if (key === '0') {
      const items = v.map((v) => getDetailsForPrint(v, batchMap))
      result.push({ ...v[0], _detailsForPrint: items })
    } else {
      if (v.length === 1) {
        result.push({
          ...v[0],
          _detailsForPrint: [getDetailsForPrint(v[0], batchMap)],
        })
      } else {
        const listBySku = _.groupBy(v, 'sku_id')
        const resultBySku = purchaseUnitGroupBy(listBySku, batchMap)
        result.push({ ...v[0], _detailsForPrint: resultBySku })
      }
    }
  })
  return result
}

// const resultBySku = _.map(listBySku, (_v) => {
//   let detailsForPrint: PurchaseTaskForPrintDetail

//   _.forEach(_v, (item) => {
//     if (sku_id !== item.sku_id) {
//       sku_id = item.sku_id
//       remark = ''
//     }
//     if (item.remark !== '') {
//       remark = remark + item.remark + ','
//     }

//     detailsForPrint = {
//       batch_id: item.batch_id!,
//       batch_name:
//         _.find(batchMap, (batch) => batch.batch_id === item?.batch_id)
//           ?.name || '-',
//       remark: remark,
//       sku_id: item.sku_id,
//       request_details: _.concat(
//         detailsForPrint?.request_details,
//         item?.request_details?.request_details,
//       ).filter((_) => _),
//       purchase_details: _.concat(
//         detailsForPrint?.purchase_details,
//         item?.purchase_details?.purchase_details,
//       ).filter(
//         (_) => _,
//       ) as PurchaseTask_PurchaseDetails_PurchaseDetail[],
//       request_value: {
//         ...item?.request_value!,
//         calculate: {
//           ...item?.request_value?.calculate!,
//           quantity: `${Big(
//             Number(
//               detailsForPrint?.request_value?.calculate?.quantity!,
//             ) || 0,
//           ).plus(
//             Number(item?.request_value?.calculate?.quantity!) || 0,
//           )}`,
//         },
//       },
//       plan_value: {
//         ...item.plan_value!,
//         calculate: {
//           ...item.plan_value?.calculate!,
//           quantity: `${
//             (Number(
//               detailsForPrint?.plan_value?.calculate?.quantity!,
//             ) || 0) +
//             (Number(item?.plan_value?.calculate?.quantity!) || 0)
//           }`,
//         },
//       },
//       purchase_value: {
//         ...item.purchase_value!,
//         calculate: {
//           ...item.purchase_value?.calculate!,
//           quantity: `${
//             (Number(
//               detailsForPrint?.purchase_value?.calculate?.quantity!,
//             ) || 0) +
//             (Number(item?.purchase_value?.calculate?.quantity!) || 0)
//           }`,
//         },
//       },
//     }
//   })
//   return detailsForPrint!
// })
