import {
  ListTaskResponse,
  Task_Type,
  TaskInput_Type,
} from 'gm_api/src/production'
import { SalesInvoicingSheet } from '../../interface'
import _ from 'lodash'

export const adapterTaskList = (
  data: Omit<ListTaskResponse, 'paging'>,
  skuId?: string,
): SalesInvoicingSheet.TaskDetail[] => {
  const result: SalesInvoicingSheet.TaskDetail[] = _.map(
    data.task_details,
    (item) => {
      const { units, skus } = data
      const ssu_map = (
        (skus && skus[item.task?.sku_id || '']) || { ssu_map: {} }
      ).ssu_map
      const ssu = ssu_map && ssu_map[item.task?.unit_id || '']

      // 生产任务直接取sku的单位
      let unit_name = ''
      if (item.task!.type !== Task_Type.TYPE_PACK) {
        unit_name =
          item.task!.unit_id && units
            ? units[item.task!.unit_id!]?.name || ''
            : ''
      } else {
        // 包装任务的单位需要取ssu的单位
        unit_name = ssu?.ssu?.unit.name || ''
      }

      return {
        ...item.task!,
        isMaterial:
          !!skuId &&
          !_.find(
            item.task_inputs,
            ({ type, sku_id }) =>
              type !== TaskInput_Type.TYPE_SUBSTITUTE_MATERIAL &&
              sku_id === skuId,
          ), // 是否为替代料
        unit_name: unit_name,
      }
    },
  )

  return result
}

export const mergeData = (
  selected: SalesInvoicingSheet.TaskDetail[],
  data: SalesInvoicingSheet.TaskDetail[],
  selectKey: keyof SalesInvoicingSheet.TaskDetail,
): SalesInvoicingSheet.TaskDetail[] => {
  const totalData: SalesInvoicingSheet.TaskDetail[] = [...selected]

  _.each(data, (dataItem) => {
    const targetIndex = _.findIndex(totalData, [selectKey, dataItem[selectKey]])
    if (targetIndex !== -1) {
      totalData.splice(targetIndex, 1)
    }
    // 不管是否在selected中，都去data的值吧，最新
    totalData.push({ ...dataItem })
  })

  return totalData
}
