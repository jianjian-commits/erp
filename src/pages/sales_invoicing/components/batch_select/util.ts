import {
  BatchLog,
  ListBatchLogResponse,
  ListBatchResponse,
  Shelf,
  Batch,
  Additional,
} from 'gm_api/src/inventory'
import _ from 'lodash'
import { SalesInvoicingSheet } from '../../interface'
import globalStore from '@/stores/global'
import {
  getSelectedShelfName,
  getShelfSelected,
  combineCategoryAndSku,
} from '../../util'
import { t } from 'gm-i18n'
import Big from 'big.js'
import { Route } from 'gm_api/src/delivery'
import { Customer } from 'gm_api/src/enterprise'

export interface BatchData extends SalesInvoicingSheet.BatchDetail {
  ssu_base_unit_rate: number
  ssu_unit_rate: number

  sku_base_material_out?: number
  ssu_material_out?: number

  _origin_sku_base_material_out?: number
  _origin_sku_stock_base_quantity?: string
  _origin_ssu_material_out?: number
  _origin_ssu_stock_quantity?: string
}

export const createSelectedBatchFactory = (
  sku: any,
  batchItem: Batch,
): Partial<BatchData> => {
  const batch = {}
  const skuBaseUnit = globalStore.getUnit(batchItem.base_unit_id!)!

  Object.assign(batch, {
    batch_delete_time: batchItem.delete_time!,
    batch_id: batchItem.batch_id,
    in_stock_time: batchItem.in_stock_time,
    production_time: batchItem.production_time,
    batch_serial_no: batchItem.batch_serial_no,
    batch_average_price: +batchItem.stock?.base_unit?.price!,
    shelf_id: batchItem.shelf_id,
    sku_stock_base_quantity: batchItem.stock?.base_unit?.quantity!,
    sku_base_unit_id: batchItem.stock?.base_unit?.unit_id!,
    sku_base_unit_name: skuBaseUnit?.text!,

    ssu_unit_id: batchItem.stock?.sku_unit?.unit_id!,
    ssu_stock_quantity: batchItem.stock?.sku_unit?.quantity!,
  })

  return batch
}

// 转换成需要的数据结构
export function adapterBatch(
  data: ListBatchResponse,
  aid: {
    shelfList: Shelf[]
    routeLst?: Route[]
    customerList?: Customer[]
  },
): BatchData[] {
  const result: BatchData[] = []
  const { category_map, sku_map, suppliers, group_users } = data.additional!
  const skuinfos = combineCategoryAndSku(category_map, sku_map)

  _.each(data.batches, (item) => {
    const { sku_id, shelf_id, supplier_id, purchaser_id } = item
    const sku = skuinfos![sku_id]!
    const shelfSelected = getShelfSelected(aid!.shelfList!, shelf_id)
    const supplier_name = suppliers![supplier_id!]?.name ?? '-'
    const purchaser_name = group_users![purchaser_id!]?.name ?? '-'

    result.push(
      Object.assign({
        ...item,
        ...createSelectedBatchFactory(sku, item),
        shelf_name: getSelectedShelfName(aid!.shelfList!, shelfSelected),

        ssu_quantity: null,
        sku_base_quantity: null,
        ssu_quantity_show: null,
        sku_base_quantity_show: null,

        target_customer_id: item.target_customer_id,
        target_customer_name:
          item.target_customer_id && item.target_customer_id !== '0'
            ? _.find(aid?.customerList, {
                customer_id: item.target_customer_id,
              })?.name
            : '',
        target_route_id: item.target_route_id,
        target_route_name: +item.target_route_id!
          ? _.find(aid?.routeLst, { route_id: item.target_route_id })
              ?.route_name
          : '',

        supplier_name, // 供应商
        purchaser_name,
      }),
    )
  })

  return result
}

export const adapterBatchLog = (
  data: ListBatchLogResponse,
  aid: {
    shelfList: Shelf[]
  },
): BatchData[] => {
  // 可以使用additional中的批次，唯一有区别的是，这里需要批次流水中的数量来做整合，以对应领料数

  const result: BatchData[] = []

  const batchLogMap: { [key: string]: BatchLog[] } = {}
  const batchOutNumMap: {
    [key: string]: { sku_base_material_out: number }
  } = {}

  _.each(data.batch_logs, (batch_log) => {
    if (batchLogMap[batch_log.batch_id]) {
      batchLogMap[batch_log.batch_id].push(batch_log)
    } else {
      batchLogMap[batch_log.batch_id] = [batch_log]
    }
  })

  // 获取领料数
  _.each(batchLogMap, (batchLogs, key) => {
    let sku_base_material_out = 0
    // let ssu_material_out = 0
    // batchLog存在领料和退料和对应反审，由于stock数据内有加减,所以直接加减即可。
    // 由于领料数肯定大于退料数，所以得到的值肯定为负数（领料是出库所以为负数），结果需要取反
    _.each(batchLogs, (batchLog) => {
      sku_base_material_out = +Big(sku_base_material_out || 0).plus(
        batchLog?.update_stock?.stock?.base_unit?.quantity || 0,
      ) // 领料数基本单位
      // ssu_material_out = +Big(ssu_material_out || 0).plus(
      //   batchLog.update_stock?.stock?.sku_unit?.quantity!,
      // ) // 领料数包装单位(废弃)
    })
    batchOutNumMap[key] = {
      sku_base_material_out: -sku_base_material_out,
      // ssu_material_out: -ssu_material_out,
    }
  })

  _.each(data.additional?.batches, (item) => {
    // 因为批次会返回虚拟批次，因此以批次流水为准，批次流水有的数据才是真正的可选择的批次数据
    if (!batchOutNumMap[item.batch_id]) {
      return
    }

    const skuBaseUnit = globalStore.getUnit(item.base_unit_id!)!

    const shelfSelected = getShelfSelected(aid!.shelfList!, item.shelf_id)

    result.push({
      ...item,
      batch_delete_time: item.delete_time!,
      batch_id: item.batch_id,
      in_stock_time: item.in_stock_time,
      production_time: item.production_time,
      batch_serial_no: item.batch_serial_no,
      batch_average_price: +item.stock?.base_unit?.price!,
      shelf_id: item.shelf_id,
      shelf_name: getSelectedShelfName(aid!.shelfList!, shelfSelected),
      ssu_unit_id: item.stock?.sku_unit?.unit_id!,
      ssu_stock_quantity: item.stock?.sku_unit?.quantity!,
      sku_stock_base_quantity: item.stock?.base_unit?.quantity!,
      sku_base_unit_id: item.stock?.base_unit?.unit_id!,
      sku_base_unit_name: skuBaseUnit?.text!,
      sku_base_quantity: batchOutNumMap[item.batch_id].sku_base_material_out,
      sku_base_material_out:
        batchOutNumMap[item.batch_id].sku_base_material_out,
      // ssu_material_out: batchOutNumMap[item.batch_id].ssu_material_out,
    })
  })

  return result
}

export const mergeData = (
  selected: BatchData[],
  data: BatchData[],
  selectKey: keyof BatchData,
): BatchData[] => {
  const totalData: BatchData[] = [...selected]
  _.each(data, (dataItem) => {
    const targetIndex = _.findIndex(totalData, [selectKey, dataItem[selectKey]])
    if (targetIndex !== -1) {
      const selectedItem = totalData.splice(targetIndex, 1)[0]
      totalData.push({
        ...dataItem,
        _origin_sku_base_material_out:
          selectedItem._origin_sku_base_material_out,
        _origin_sku_stock_base_quantity:
          selectedItem._origin_sku_stock_base_quantity,
        sku_base_quantity: selectedItem.sku_base_quantity, // 编辑的取编辑的值
        ssu_quantity: selectedItem.ssu_quantity,
        sku_base_quantity_show: selectedItem.sku_base_quantity_show, // 编辑的取编辑的值
        ssu_quantity_show: selectedItem.ssu_quantity_show,
      })
    } else {
      totalData.push({ ...dataItem })
    }
  })

  return totalData
}

/**
 *
 * 用于获取selected的关联对象
 * @param selected
 * @param data
 * @returns
 */
export const getRouteCustomerInfo = (
  selected: BatchData[],
  data: {
    routeLst?: Route[]
    customerList?: Customer[]
  },
): BatchData[] =>
  _.map(selected, (v) => ({
    target_customer_name: +v.target_customer_id!
      ? _.find(data?.customerList, { customer_id: v.target_customer_id })?.name
      : '',
    target_route_name: +v.target_route_id!
      ? _.find(data?.routeLst, { route_id: v.target_route_id })?.route_name
      : '',
    ...v,
  }))
