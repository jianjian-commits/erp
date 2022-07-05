/* eslint-disable no-fallthrough */
import * as React from 'react'
import moment from 'moment'
import Big from 'big.js'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { Flex, MoreSelectGroupDataItem, TreeListItem } from '@gm-pc/react'
import {
  Batch,
  BatchLog,
  StockSheet,
  CostAllocations,
  GetStockSheetResponse,
  Shelf,
  StockSheet_Details,
  StockSheet_UpdateBatch,
  StockSheet_Detail,
  CustomerTurnover,
  StockSheet_TargetType,
} from 'gm_api/src/inventory'
import { ListSkuResponse_SkuInfo } from 'gm_api/src/merchandise'
import {
  SalesInvoicingSheet,
  ObjectOfKey,
  ReceiptType,
  ComSkuItem,
  ReceiptStatusKey,
  SkuUnitMoreSelect,
  SkuInfoMoreSelect,
  SkuStockExpand,
  CustomerTurnoverExpand,
  BatchExpand,
  SkuInfoExpand,
  CustomerSheetType,
  UnitValueExpand,
  ComRouter,
  CategoryType,
  StockValueExpand,
  LevelProcess,
} from './interface'
import {
  RECEIPT_ACTIONABLE_LIST,
  RECEIPT_ACTION_TYPE_NAME,
  RECEIPT_STATUS_KEY_NAME,
  RECEIPT_TYPE,
  RECEIPT_STATUS,
  PAY_STATUS,
  MODULE_SELECT,
} from './enum'
import {
  StockLog,
  Additional,
  SkuStock,
  AdjustSheet_Details,
  Batch_BatchType,
  PayStatus,
  OperateType,
  ProcessorCheck,
} from 'gm_api/src/inventory/types'
import {
  UnitValue,
  GetSkuResponse,
  SsuInfo,
  Unit,
  GetManySkuResponse_SkuInfo,
  UnitType,
  SystemUnitId,
  UnitStock,
  Sku,
  CategoryTreeCache_CategoryInfo,
} from 'gm_api/src/merchandise/types'
import { Customer, GroupUser } from 'gm_api/src/enterprise'

import {
  formatDataToTree,
  getEnumText,
  toFixedByType,
  toFixedSalesInvoicing,
  getCategoryName,
  getTimestamp,
} from '@/common/util'

import { ApportionState as ApportionStateV2 } from '@/pages/sales_invoicing/allocation_inventory/allocation_order/components/apportion_form_modal'

import { StockSheetInfo } from './turnover/interface'
import { Processor } from 'gm_api/src/production'
import { getCategoryName as getCategoryNameV2 } from './util2'

import { ApportionState, SignTip } from './components'
import { BatchData } from './components/batch_select/util'

import { PDetail } from './inventory_check/manage/stores/detail_store'
import { BatchDetail } from './sales_invoicing_type'

import globalStore from '@/stores/global'

export const backEndDp = 8 // 进销存后台需要的数据精度

/**
 * 判断商品是不是在分摊列表内
 * @param {array} apportionList 分摊字段
 * @param {string} skuId sku_id
 * @param {string} ssuUnitId ssu_unit_id
 * @return {boolean}
 */
export const isInShare = (
  apportionList: ApportionState[],
  skuId: string,
  ssuUnitId?: string,
): boolean => {
  if (apportionList.length >= 0) {
    if (_.includes(apportionList[0]?.sku_selected, skuId + '_' + ssuUnitId)) {
      return true
    }
  }
  return false
}

/**
 * 判断商品是不是在分摊列表内
 * @param {array} apportionList 分摊字段
 * @param {string} skuId sku_id
 * @return {boolean}
 */
export const isInShareV2 = (
  apportionList: ApportionState[] | ApportionStateV2[],
  skuId: string,
): boolean => {
  if (apportionList.length >= 0) {
    const bol = _.some(
      apportionList[0]?.sku_units,
      (item) => item?.sku_id === skuId,
    )
    return bol
  }
  return false
}

/**
 * 处理成MoreSelect数据
 * 进销存的单据中规格都添加上按基本单位的规格
 * @param data ListSku接口返回
 * @param cancelVirtualBase  一部分不需要虚拟基本单位 先传参处理 后续全部不需要
 */
export const formatSkuList = (
  data: ListSkuResponse_SkuInfo[] = [],
  cancelVirtualBase?: boolean,
): ComSkuItem[] => {
  const skuList: ComSkuItem[] = []
  _.each(data, (item) => {
    const skuBaseUnit = globalStore.getUnit(item?.sku?.base_unit_id!)
    skuList.push({
      _originalData: item,
      ...item.sku!,
      sku_base_unit_id: item.sku?.base_unit_id!,
      sku_base_unit_name: skuBaseUnit?.text,
      category_id_1: item.category_infos?.[0]?.category_id!,
      category_id_2: item.category_infos?.[1]?.category_id!,

      category_name_1: item.category_infos?.[0]?.category_name!,
      category_name_2: item.category_infos?.[1]?.category_name!,
      spu_name: item.category_infos?.[2]?.category_name!,
      // category_name: getCategoryNameV2(item.category_infos!),
      text: item.sku?.name!,
      value: item.sku?.sku_id!,
      input_tax: item.sku?.input_tax!,
      tax_rate: item.sku?.input_tax!,
      supplier_taxs: item.sku?.supplier_input_taxs?.supplier_input_tax,
    })
  })
  return skuList
}

export const formatSkuListV2 = (
  skus: Sku[] = [],
  categoryMap: Record<string, CategoryTreeCache_CategoryInfo> = {},
) => {
  const skuList: MoreSelectGroupDataItem<string>[] = []
  _.each(skus, (sku) => {
    const skuBaseUnit = globalStore.getUnit(sku?.base_unit_id!)
    skuList.push({
      _originalData: sku,
      ...sku,
      value: sku?.sku_id,
      text: sku.name,
      sku_name: sku.name,
      lastCategoryName: categoryMap[sku?.category_id!]?.name,
      categoryName: getCategoryName(categoryMap, sku?.category_id!),
      category_name: getCategoryNameV2(categoryMap, sku),
      sku_base_unit_id: sku?.base_unit_id!,
      sku_base_unit_name: skuBaseUnit?.text,
      category_id_1: sku.category1_id,
      category_id_2: sku.category2_id,
      category_id_3: sku.category3_id,

      category_name_1: categoryMap[sku.category1_id!]?.name,
      category_name_2: categoryMap[sku.category2_id!]?.name,
      category_name_3: categoryMap[sku.category3_id!]?.name,

      spu_name: categoryMap[sku.category3_id!]?.name,
      input_tax: sku?.input_tax,
      // tax_rate: sku?.input_tax,
      supplier_taxs: sku?.supplier_input_taxs?.supplier_input_tax,
    })
  })
  return skuList
}

/**
 * 将业务数据转换成后台接口需要的结构
 * @param data 待转换的提交数据
 */
export function getStockSheetData(
  receiptDetail: SalesInvoicingSheet.StockInReceiptDetail,
  options: { type: 'stockIn'; sheet_status?: number },
  selected?: Array<string>,
): StockSheet | [StockSheet, any]
export function getStockSheetData(
  receiptDetail: SalesInvoicingSheet.StockOutReceiptDetail,
  options: { type: 'stockOut'; sheet_status?: number },
): StockSheet
export function getStockSheetData(
  receiptDetail: SalesInvoicingSheet.RefundPlanStockInReceiptDetail,
  options: { type: 'refundStockIn'; sheet_status?: number },
): StockSheet
export function getStockSheetData(
  receiptDetail: any,
  options: { type: 'transfer'; sheet_status?: number },
): StockSheet
export function getStockSheetData(
  receiptDetail:
    | SalesInvoicingSheet.StockOutReceiptDetail
    | SalesInvoicingSheet.StockInReceiptDetail
    | SalesInvoicingSheet.RefundPlanStockInReceiptDetail,
  options: {
    type: 'stockIn' | 'stockOut' | 'refundStockIn' | 'transfer'
    sheet_status?: number
  },
  selected?: Array<string>,
): StockSheet | [StockSheet, any] {
  const result: StockSheet = {
    ...receiptDetail.originalStockSheet,
    stock_sheet_id: receiptDetail.stock_sheet_id,
    sheet_type: receiptDetail.sheet_type,
    sheet_status: receiptDetail.sheet_status,
    batch_index: receiptDetail.batch_index, // 后台需要用来做反审用
    // customer_id: receiptDetail.target_id,
    target_type: receiptDetail.target_type,
    target_id: receiptDetail.target_id,
    details: [],
  }

  // discounts 折让
  const discounts: CostAllocations = { details: [] }
  _.each(receiptDetail.discountList, (item) => {
    discounts.details!.push({
      ...item,
      create_time: item.create_time,
      creator_id: item.creator_id,
      money: item.money ? item.money.toString() : '0',
      money_type: +item.action,
      reason: +item.reason,
      remark: item.remark,
    })
  })

  // apportion 分摊
  const apportions: CostAllocations = { details: [] }
  _.each(receiptDetail.apportionList, (item) => {
    apportions.details!.push({
      ...item,
      create_time: item.create_time,
      creator_id: item.creator_id,
      money: item.money ? item.money.toString() : '0',
      type: +item.method,
      reason: +item.reason,
      remark: item.remark,
      money_type: +item.action,
      sku_units: _.map(item.sku_selected, (item: string) => {
        return {
          unit_id: item.split('_')[1],
          sku_id: item.split('_')[0],
        }
      }),
    })
  })

  // details 单据详情
  const details: StockSheet_Details = []

  let split_detail = []

  for (let i = 0; i < receiptDetail.details.length; i++) {
    const item:
      | SalesInvoicingSheet.StockInProductDetail
      | SalesInvoicingSheet.StockOutProductDetail = receiptDetail.details[i]
    // batch 批次
    const createBatches: Batch[] = []
    const updateBatches: StockSheet_UpdateBatch[] = []

    /** 对于入库来说，createBatches的批次对应商品一条条目，
     * 目前来说，一个createBatches只有一条批次信息，对应页面一条条目，
     * 因此这里下标取0数据从detail中取
     */
    if (options.type === 'stockIn') {
      const {
        batch_id,
        create_time,
        in_stock_time,
        update_time,
        delete_time,
        group_id,
        station_id,
        in_stock_sheet_id,
        batch_serial_no,
        stock,
        origin_stock,
        spu_id,
        sku_id,
        sku_base_unit_id,
        base_quantity,
        production_time,
        supplier_id,
        shelf_id,
        remark,
        production_task_id,
        production_task_serial_no,
        type,
        module,
        base_price,
      } = item as SalesInvoicingSheet.StockInProductDetail
      createBatches[0] = {
        batch_id: batch_id!,
        create_time,
        in_stock_time,
        update_time,
        delete_time,
        group_id,
        station_id,
        in_stock_sheet_id,
        batch_serial_no,
        stock,
        origin_stock,
        type,

        spu_id: spu_id!,
        sku_id,
        base_unit_id: sku_base_unit_id,
        sku_unit_id: sku_base_unit_id,
        input_stock: {
          input: {
            unit_id: sku_base_unit_id,
            quantity: Big(base_quantity || 0).toString(),
            price: Big(base_price || 0).toString(),
          },
          input2: {
            unit_id: sku_base_unit_id,
            quantity: Big(base_quantity || 0).toString(),
            price: '0', // 暂时用不到，后台需要默认为0
          },
        },
        base_unit_quantity: base_quantity?.toString(),
        production_time:
          production_time !== '0' && production_time
            ? '' + +moment(+production_time)
            : undefined,
        supplier_id,
        shelf_id,
        remark,
        production_task_id,
        production_task_serial_no,
        target_customer_id:
          module === MODULE_SELECT.customer ? item.target_customer_id : '0',
        target_route_id:
          module === MODULE_SELECT.route ? item.target_route_id : '0',
      }
    }
    if (options.type === 'stockOut' || options.type === 'refundStockIn') {
      const { batch_selected, shelf_id } =
        item as SalesInvoicingSheet.StockOutProductDetail
      // 退料入库
      const isRefundStockIn = options.type === 'refundStockIn'
      _.each(batch_selected, (selected) => {
        const batch = {
          // 虚拟批次或退料入库才选择batch_id
          batch_id:
            isRefundStockIn || selected.type === Batch_BatchType.BATCH_TYPE_TMP
              ? selected.batch_id
              : selected.parent_id,
          batch_serial_no: selected.batch_serial_no!,
          stock: selected.stock!,
          input_stock: {
            input: {
              quantity: selected.sku_base_quantity?.toString(),
              unit_id: selected.sku_base_unit_id, // 出库update_batch选择基本单位
              price: '0',
            },
            input2: {
              quantity: selected.sku_base_quantity?.toString(),
              unit_id: selected.sku_base_unit_id,
              price: '0',
            },
          },
          type: selected.type,
          update_price: selected.update_price,
          shelf_id: isRefundStockIn ? shelf_id : selected.shelf_id, // 只有退料取shelf_id
        }

        // 虚拟批次
        if (selected.type === Batch_BatchType.BATCH_TYPE_TMP) {
          createBatches[0] = {
            ...selected.origin_create_batch!,
          } // 虚拟批次原则上不改变，因此原封不动返回就好
        }
        updateBatches.push(batch)
      })
    }

    const detail: StockSheet_Detail = {
      // ...receiptDetail.originalStockSheet.details.details[i],
      // 后台数据，原样返回就好
      /** start */
      related_detail_id: item.related_detail_id,
      stock_sheet_detail_id: item?.stock_sheet_detail_id,
      detail_id: item.detail_id,
      origin_stock: item.origin_stock,
      station_id: item.station_id,
      group_id: item.group_id,
      stock: item.stock,
      original_input_stock: item.original_input_stock,
      replace_batch_id: item.replace_batch_id,
      target_customer_id: item.target_customer_id,
      second_base_unit_ratio: item.second_base_unit_ratio,
      /** end */

      // 货位
      shelf_id: item.shelf_id,
      spu_id: item.spu_id,
      sku_id: item.sku_id,
      base_unit_id: item.base_unit_id || item.sku_base_unit_id,
      sku_unit_id: item.sku_unit_id || item.sku_base_unit_id,
      remark: item.remark || undefined,
      input_tax: _.isNil(item.tax_rate) ? '0' : item.tax_rate.toString(),
      amount: _.isNil(item.no_tax_amount) ? '0' : item.no_tax_amount.toString(), // 不含税
      tax_amount: _.isNil(item.amount) ? '0' : item.amount.toString(), // 含税
      tax_input_price: Big(item.base_price || 0).toString(),
      origin_tax_input_price: item.origin_tax_input_price,
      related_order_price: item.related_order_price,
      input_stock: {
        input: {
          unit_id: item?.base_unit_id || item.sku_base_unit_id,
          quantity: Big(item?.input_stock?.input?.quantity || 0).toString(),
          price: Big(item.base_price || 0).toString(),
        },
        input2: {
          unit_id: item.base_unit_id || item.sku_base_unit_id,
          quantity: Big(item?.input_stock?.input2?.quantity || 0).toString(),
          price: '0', // 暂时用不到，后台需要默认为0
        },
      },
      // 辅助单位
      second_base_unit_id: item?.second_base_unit_id?.toString(),
      second_base_unit_quantity: item?.second_base_unit_quantity?.toString(),

      production_task_id: item.production_task_id || undefined,
      production_task_serial_no: item.production_task_serial_no,

      is_by_product: item.is_by_product,

      batches: {
        create_batches: createBatches,
        update_batches: updateBatches,
      },
    }

    if (options.type === 'transfer') {
      detail.input_stock = {
        input: {
          quantity: `${item.transfer_measure}`,
          unit_id: item?.sku_base_unit_id,
          price: '0',
        },
        input2: {
          quantity: `${item.transfer_package}`,
          unit_id: item.sku_base_unit_id,
          price: '0',
        },
      }
      const { batch_selected_single, transfer_shelf_obj } = item as any
      const existing_batch = {
        batch_id: batch_selected_single?.parent_id,
        shelf_id: batch_selected_single?.shelf_id,
        input_stock: {
          input: {
            quantity: `${item.transfer_measure}`,
            unit_id: item?.sku_base_unit_id,
            price: '0',
          },
          input2: {
            quantity: `${item.transfer_package}`,
            unit_id: item.sku_base_unit_id,
            price: '0',
          },
        },
        operate_type: OperateType.OPERATE_TYPE_TRANSFER_OUT,
      }
      const transfer_batch = {
        batch_id: batch_selected_single?.parent_id,
        shelf_id: transfer_shelf_obj?.shelf_id,
        input_stock: {
          input: {
            quantity: `${item.transfer_measure}`,
            unit_id: item?.sku_base_unit_id,
            price: '0',
          },
          input2: {
            quantity: `${item.transfer_package}`,
            unit_id: item.sku_base_unit_id,
            price: '0',
          },
        },
        operate_type: OperateType.OPERATE_TYPE_TRANSFER_IN,
      }
      updateBatches.push(existing_batch, transfer_batch)
    }

    if (options.type === 'stockOut') {
      detail.amount = _.isNil(item.no_tax_amount)
        ? '0'
        : `${item.no_tax_amount}`
      detail.input_stock.input!.price = _.isNil(item.no_tax_base_price)
        ? '0'
        : `${item.no_tax_base_price}`
      detail.tax_amount = _.isNil(item.amount) ? '0' : `${item.amount}`
      detail.tax_input_price = _.isNil(item.ssu_base_price)
        ? '0'
        : `${item.ssu_base_price}`
    }

    if (selected) {
      if (selected.includes(item.value)) {
        split_detail.push(detail)
      } else {
        details.push(detail)
      }
    } else {
      details.push(detail)
    }
  }
  // ReceiptDetail
  Object.assign(result, {
    // 后台数据，原样返回就好
    /** start */
    stock_sheet_id: receiptDetail.stock_sheet_id || undefined,
    create_time: receiptDetail.create_time || undefined,
    update_time: receiptDetail.update_time || undefined,
    delete_time: receiptDetail.delete_time || undefined,
    sheet_type: receiptDetail.sheet_type,
    group_id: receiptDetail.group_id || undefined,
    station_id: receiptDetail.station_id || undefined,
    statement_id: receiptDetail.statement_id || undefined,
    related_sheet_id: receiptDetail.related_sheet_id || undefined,
    related_sheet_type: receiptDetail.related_sheet_type || undefined,
    commit_time: receiptDetail.commit_time || undefined,
    creator_id: receiptDetail.creator_id || undefined,
    last_adjust_time: receiptDetail.last_adjust_time || undefined,
    stock_sheet_serial_no: receiptDetail.stock_sheet_serial_no || undefined,
    response_time: receiptDetail.response_time,
    pay_status: receiptDetail.pay_status,
    /** end */
    sku_id: receiptDetail.sku_id, // 针对周转物借出归还记录
    // tmd前人这里写的有问题，注释掉了先，会引起什么问题，后边遇到再说
    // target_id:
    //   receiptDetail.supplier_id || receiptDetail.purchaser_id || undefined,
    supplier_id:
      options.type === 'stockIn' || options.type === 'stockOut'
        ? receiptDetail.supplier_id || '0'
        : '0', // 如果是采购入库或者采购退货入库就要传supplier_id 其他暂时传0
    target_name: receiptDetail.target_name,
    purchaser_id:
      options.type === 'stockIn'
        ? receiptDetail.purchaser_id || '0'
        : undefined,
    // purchaser_name: receiptDetail.purchaser_name,
    sheet_status: options.sheet_status ?? receiptDetail.sheet_status,
    submit_time: receiptDetail.submit_time,
    estimated_time: receiptDetail.estimated_time,
    remark: receiptDetail.remark,
    discounts: discounts.details!.length > 0 ? discounts : undefined,
    cost_allocation: apportions.details!.length > 0 ? apportions : undefined,
    total_price: receiptDetail.total_price,
    details: details,
    processor_id: _.last(receiptDetail.processor_ids) ?? '0',
    processor_name: receiptDetail.processor_name,
    is_no_processor: !receiptDetail.processor_ids?.length,
    out_stock_time: receiptDetail.out_stock_time
      ? receiptDetail.out_stock_time
      : getTimestamp(new Date()),
    amount: receiptDetail.amount,
    order_serial_no: receiptDetail.order_serial_no,
    customer_name: receiptDetail.customer_name,
    customer_id: receiptDetail.customer_id,
  })

  if (selected) {
    if (result.details!.length === 0) {
      result.details!.push(...split_detail.slice())
      split_detail = []
    }
    return [result, split_detail]
  }

  return result
}

/**
 * 将后台接口的数据转换成业务数据
 * @param data 后台数据
 * @param type 需要的类型
 * @param additional 额外需要的辅助数据
 */
export function getSalesInvoicingSheetData(
  data: GetStockSheetResponse,
  type: 'stockIn',
  additional: { shelfList: Shelf[]; cancelVirtualBase: boolean },
): SalesInvoicingSheet.StockInReceiptDetail
export function getSalesInvoicingSheetData(
  data: GetStockSheetResponse,
  type: 'stockOut',
  additional: { shelfList: Shelf[] }, // 出库必传
): SalesInvoicingSheet.StockOutReceiptDetail
export function getSalesInvoicingSheetData(
  data: GetStockSheetResponse,
  type: 'planStockIn',
  additional?: { shelfList?: Shelf[]; route: ComRouter[] },
): SalesInvoicingSheet.PlanStockInReceiptDetail
export function getSalesInvoicingSheetData(
  data: GetStockSheetResponse,
  type: 'refundPlanStockIn',
  additional?: { shelfList?: Shelf[] },
): SalesInvoicingSheet.RefundPlanStockInReceiptDetail
export function getSalesInvoicingSheetData(
  data: GetStockSheetResponse,
  type: 'planStockOut',
  additional: { shelfList: Shelf[]; processors: Processor[] }, // 出库必传
): SalesInvoicingSheet.PlanStockOutReceiptDetail
export function getSalesInvoicingSheetData(
  data: GetStockSheetResponse,
  type: 'transfer',
  additional?: { shelfList: Shelf[] },
): SalesInvoicingSheet.StockOutReceiptDetail
export function getSalesInvoicingSheetData(
  data: GetStockSheetResponse,
  type:
    | 'stockIn'
    | 'stockOut'
    | 'transfer'
    | 'planStockIn'
    | 'planStockOut'
    | 'refundPlanStockIn',
  additional?: { shelfList?: Shelf[] },
):
  | SalesInvoicingSheet.StockInReceiptDetail
  | SalesInvoicingSheet.StockOutReceiptDetail
  | SalesInvoicingSheet.PlanStockInReceiptDetail
  | SalesInvoicingSheet.PlanStockOutReceiptDetail
  | SalesInvoicingSheet.RefundPlanStockInReceiptDetail {
  /** 采购入库（stockIn)和生产入库（planStockIn) */
  const isStockIn = type === 'stockIn' || type === 'planStockIn'
  /** 出库（stockIn)和领料出库（planStockOut) */
  const isStockOut = type === 'stockOut' || type === 'planStockOut'
  /** 退料入库 */
  const isRefundStockIn = type === 'refundPlanStockIn'
  /** 调拨管理 */
  const isTransfer = type === 'transfer'

  const { group_users, suppliers } = data.additional

  const purchaserInfo = group_users?.[data?.stock_sheet?.purchaser_id ?? '0']
  const supplierInfo = suppliers?.[data?.stock_sheet?.supplier_id ?? '0']
  const processorList = additional?.processors
  // const cancelVirtualBase = additional?.cancelVirtualBase

  const result:
    | SalesInvoicingSheet.StockInReceiptDetail
    | SalesInvoicingSheet.StockOutReceiptDetail
    | SalesInvoicingSheet.PlanStockInReceiptDetail
    | SalesInvoicingSheet.PlanStockOutReceiptDetail
    | SalesInvoicingSheet.RefundPlanStockInReceiptDetail = {
    ...data.stock_sheet,
    details: [],
    target_delete_time: '',
    submit_time:
      data.stock_sheet.submit_time !== '0'
        ? data.stock_sheet.submit_time
        : undefined,
    batch_index: data.stock_sheet.batch_index,
    originalStockSheet: _.cloneDeep(data.stock_sheet),
    creator_name: handleCreator(
      data.additional.group_users,
      data.stock_sheet.creator_id!,
      'username',
    ),
    supplier_id: data.stock_sheet.supplier_id || '0',
    supplier_name: supplierInfo?.name,
    supplier_delete_time: supplierInfo?.delete_time,
    purchaser_id: data.stock_sheet.purchaser_id || '0',
    purchaser_name: purchaserInfo?.name,
    purchaser_delete_time: purchaserInfo?.delete_time,
    processor_ids: processorList?.length
      ? getProcessSelect(processorList, data.stock_sheet.processor_id)
      : [],
  }
  const sheet_status = data.stock_sheet.sheet_status

  const details:
    | SalesInvoicingSheet.StockInProductDetail[]
    | SalesInvoicingSheet.StockOutProductDetail[] = []

  _.each(data.stock_sheet?.details, (detail) => {
    const sku_map = data.additional.sku_map![detail.sku_id]
    const { category1_id, category2_id, category3_id, category_id } = sku_map
    const { category_map } = data.additional

    const categories = {
      category_id_1:
        category1_id !== '0' ? category_map?.[category1_id!].category_id : '',
      category_id_2:
        category2_id !== '0' ? category_map?.[category2_id!].category_id : '',
      category_id_3:
        category3_id !== '0' ? category_map?.[category3_id!].category_id : '',
      category_name_1:
        category1_id !== '0' ? category_map?.[category1_id!].category_name : '',
      category_name_2:
        category2_id !== '0' ? category_map?.[category2_id!].category_name : '',
      category_name_3:
        category3_id !== '0' ? category_map?.[category3_id!].category_name : '',
      spu_name:
        category3_id !== '0' ? category_map?.[category_id!].category_name : '',
      category_name: getCategoryNameV2(category_map!, sku_map),
    }

    const sku_maps = {
      sku_name: sku_map!.name,
      sku_base_unit_id: sku_map?.base_unit_id!,
      sku_base_unit_name: globalStore.getUnitName(sku_map?.base_unit_id!),
      sku_type: sku_map?.sku_type!,
      units: sku_map?.units,
      second_base_unit_ratio: sku_map?.second_base_unit_ratio,
      second_base_unit_id: sku_map?.second_base_unit_id, // 辅助单位id
      second_base_unit_name: globalStore.getUnitName(
        sku_map?.second_base_unit_id!,
      ), // 辅助单位名字
    }

    const create_batches = detail?.batches?.create_batches || []
    const create_batches_first = create_batches[0] || {}

    const update_batches = detail?.batches?.update_batches || []
    const update_batches_first = update_batches[0] || {}

    if (isStockIn) {
      const shelfSelected = getShelfSelected(
        additional?.shelfList || [],
        create_batches_first.shelf_id,
      )
      const targetShelf = _.find(
        additional?.shelfList,
        (item) => item.shelf_id === create_batches_first.shelf_id,
      )

      const {
        sku_unit_id,
        input_stock,
        production_time,
        // target_customer_id,
        target_route_id,
      } = detail?.batches?.create_batches![0] || {}
      const detailItem = {
        ..._.omit(detail, ['create_batches', 'update_batches']),
        ...detail?.batches?.create_batches![0],
        production_time: production_time !== '0' ? production_time : undefined,
        station_id: detail?.station_id,
        group_id: detail?.group_id,

        // sku_map
        ...sku_maps,
        sku_id: sku_map?.sku_id,
        second_base_unit_id: sku_map?.second_base_unit_id,
        second_base_unit_quantity: detail?.second_base_unit_quantity,
        // sku_tax:

        // 分类
        ...categories,

        // ssu规格
        unit_id: sku_unit_id,
        base_price: +detail?.tax_input_price! || +input_stock?.input?.price!,
        base_quantity: +input_stock?.input?.quantity!,

        // different_price: Math.abs(
        //   +Big(detail.amount).minus(
        //     Big(input_stock?.input?.price!).times(
        //       input_stock?.input?.quantity!,
        //     ),
        //   ),
        // ),
        amount: +detail?.tax_amount! || +detail.amount,
        no_tax_base_price: +input_stock?.input?.price!,
        no_tax_amount: +detail?.amount!,
        tax_money: Math.abs(
          +Big(detail.tax_amount || 0)
            .minus(+detail.amount)
            .toFixed(2),
        ),
        tax_rate: detail.input_tax as unknown as number,
        origin_tax_input_price: detail.origin_tax_input_price,

        operator_name:
          detail.creator_id && detail.creator_id !== '0'
            ? data.additional.group_users![detail.creator_id!].username!
            : '-',
        // 货位
        shelf_name:
          getSelectedShelfName(additional!.shelfList!, shelfSelected) ||
          t('未分配'),
        shelf_selected: targetShelf?.delete_time !== '0' ? [] : shelfSelected,
        shelf: targetShelf,

        // 生产对象
        target_customer_id: detail?.target_customer_id,
        target_customer_name: +detail?.target_customer_id!
          ? data.additional.customers![detail?.target_customer_id!].name
          : '',
        target_route_id,
        target_route_name: +target_route_id!
          ? _.find(additional.route, { route_id: target_route_id })?.route_name
          : '',
      }
      ;(
        details as (
          | SalesInvoicingSheet.StockInProductDetail
          | SalesInvoicingSheet.PlanStockInProductDetail
        )[]
      ).push(
        Object.assign(detailItem, {
          amount_show: toFixedByType(
            detailItem.tax_amount || 0,
            'dpInventoryAmount',
          ),
          base_quantity_show: toFixedSalesInvoicing(detailItem.base_quantity),
          base_price_show: _.isNil(detailItem.base_price)
            ? null
            : toFixedByType(detailItem.base_price, 'dpInventoryAmount'),
        }),
      )
    } else if (isStockOut || isRefundStockIn) {
      const shelfSelected = isRefundStockIn
        ? getShelfSelected(additional!.shelfList!, detail.shelf_id)
        : undefined
      const targetShelf = isRefundStockIn
        ? _.find(
            additional?.shelfList,
            (item) => item.shelf_id === detail.shelf_id,
          )
        : undefined

      const stockOutDetailItem = {
        ...detail,

        // sku_map
        ...sku_maps,
        base_unit_id: detail.base_unit_id!,

        // 分类
        ...categories,
        spu_id: category_map?.[category_id!]?.category_id,

        // ssu规格
        unit_id: detail.sku_unit_id,
        base_price: +detail.input_stock?.input?.price!,
        base_quantity: +detail.input_stock?.input?.quantity!,

        // 货位
        shelf_name: isRefundStockIn
          ? getSelectedShelfName(additional!.shelfList!, shelfSelected)
          : '',
        shelf_selected: targetShelf?.delete_time !== '0' ? [] : shelfSelected,
        shelf: targetShelf,

        // 状态
        sheet_status,
        different_price: +Big(detail.amount).minus(
          Big(detail.input_stock?.input?.price!).times(
            detail.input_stock?.input?.quantity!,
          ),
        ),
        amount: +detail.tax_amount!,
        no_tax_base_price: +detail?.input_stock?.input?.price!,
        no_tax_amount: +detail?.amount!,
        tax_money: Math.abs(
          +Big(detail.tax_amount || 0)
            .minus(+detail.amount)
            .toFixed(2),
        ),
        tax_rate: detail.input_tax,

        operator_name:
          detail.operator_id && detail.operator_id !== '0'
            ? data?.additional?.group_users?.[detail?.operator_id]?.username
            : '-',

        batch_selected: _.map(
          update_batches,
          (batch: StockSheet_UpdateBatch) => {
            const isVirtualBatch =
              create_batches!.length > 0 &&
              create_batches_first.batch_id === batch.batch_id &&
              create_batches_first.type === Batch_BatchType.BATCH_TYPE_TMP // 当虚拟批次时，create_batches里面的type判断

            // 新增sub_batches表示从属批次 需从从属批次中或许shelf_id
            // 退料入库选的为主批次 直接从batch里获取
            const originBatch = isVirtualBatch
              ? create_batches_first // 如果是虚拟批次，详情从create_batches里面取
              : isRefundStockIn
              ? data.additional.batches![batch.batch_id]
              : data.additional.sub_batches![batch.batch_id].sub_batches![
                  batch.shelf_id!
                ]
            const { stock, input_stock } = batch

            const skuBaseUnit = globalStore.getUnit(stock?.base_unit?.unit_id!)

            const shelfSelected = getShelfSelected(
              additional!.shelfList!,
              originBatch.shelf_id,
            )
            // 关联对象
            const batchInfo = data!.additional!.batches![batch.batch_id]

            // 由于数据不完善且存在库存共享，因此所有商品数据，以originBatch为准，数量以updateBatch为准
            return {
              ...batch!,
              ...batchInfo,
              supplier_name: suppliers![batchInfo?.supplier_id]?.name ?? '-',
              purchaser_name:
                group_users![batchInfo?.purchaser_id]?.name ?? '-',
              batch_id: originBatch.batch_id,
              parent_id: originBatch.parent_id,
              origin_create_batch: isVirtualBatch ? originBatch : undefined,
              batch_delete_time: originBatch.delete_time!,
              in_stock_time: originBatch.in_stock_time,
              production_time: originBatch.production_time,
              batch_average_price: +stock!.base_unit?.price!,
              sku_base_quantity: +input_stock.input?.quantity!,
              sku_base_quantity_show: toFixedSalesInvoicing(
                +input_stock.input?.quantity!,
              ),
              // ssu_unit_name: ssuUnit?.name!,
              sku_base_unit_name: skuBaseUnit?.text!,
              sku_base_unit_id: stock?.base_unit?.unit_id!,

              spu_id: detail.spu_id!,
              sku_id: detail.sku_unit_id,
              base_unit_id: detail.base_unit_id!,
              sku_unit_id: detail.sku_unit_id,
              type: isVirtualBatch
                ? Batch_BatchType.BATCH_TYPE_TMP
                : Batch_BatchType.BATCH_TYPE_CONST, // 只有create_batch中取得的虚拟批次才有type,用做标示虚拟批次

              // 批次剩余库存
              // ssu_stock_quantity: originBatch.stock?.sku_unit?.quantity!,
              sku_stock_base_quantity: originBatch.stock?.base_unit?.quantity!,
              shelf_name: getSelectedShelfName(
                additional!.shelfList!,
                shelfSelected,
              ),
              // 关联生产对象
              target_customer_id: batchInfo?.target_customer_id,
              target_route_id: batchInfo?.target_route_id,
            }
          },
        ),
      }
      ;(
        details as (
          | SalesInvoicingSheet.StockOutProductDetail
          | SalesInvoicingSheet.PlanStockOutProductDetail
          | SalesInvoicingSheet.RefundPlanStockInProductDetail
        )[]
      ).push(
        Object.assign(stockOutDetailItem, {
          amount_show: toFixedByType(
            stockOutDetailItem.tax_amount || 0,
            'dpInventoryAmount',
          ),
          base_quantity_show: toFixedSalesInvoicing(
            stockOutDetailItem.base_quantity,
          ),
          base_price_show: toFixedByType(
            stockOutDetailItem.base_price,
            'dpInventoryAmount',
          ),
          different_price_show: toFixedByType(
            stockOutDetailItem.different_price,
            'dpInventoryAmount',
          ),
        }),
      )
    } else if (isTransfer) {
      const shelfs = data?.additional?.shelfs
      shelfs['0'] = {
        shelf_id: '0',
        create_time: '0',
        update_time: '0',
        delete_time: '0',
        group_id: '0',
        station_id: '0',
        parent_id: '0',
        name: '未分配',
        remark: '',
        is_leaf: true,
      }
      const exist_shelfSelected = getShelfSelected(
        data.additional!.shelfs!,
        update_batches_first.shelf_id,
      )
      const exist_targetShelf = _.find(
        data.additional!.shelfs!,
        (item) => item.shelf_id === update_batches_first.shelf_id,
      )

      const transfer_shelfSelected = getShelfSelected(
        shelfs,
        update_batches[1].shelf_id,
      )
      const transfer_targetShelf = _.find(
        data.additional!.shelfs!,
        (item) => item.shelf_id === update_batches[1].shelf_id,
      )
      const suppliers = data?.additional?.suppliers
      const supplier_id =
        data?.additional?.batches![update_batches_first?.batch_id].supplier_id

      const stockOutDetailItem = {
        ...detail,
        // sku
        ...sku_maps,
        base_unit_id: detail.base_unit_id!,

        // 分类
        ...categories,
        spu_id: category_map?.[category_id!]?.category_id,

        // ssu规格
        unit_id: detail.sku_unit_id,

        // 货位
        shelf_name: getSelectedShelfName(shelfs, exist_shelfSelected),
        shelf_selected:
          exist_targetShelf?.delete_time !== '0' ? [] : exist_shelfSelected,
        shelf: exist_targetShelf,

        exist_shelf_name: getSelectedShelfName(
          data.additional!.shelfs!,
          exist_shelfSelected,
        ),
        exist_shelf_selected:
          exist_targetShelf?.delete_time !== '0' ? [] : exist_shelfSelected,
        exist_shelf: exist_targetShelf,

        transfer_shelf_name: getSelectedShelfName(
          shelfs,
          transfer_shelfSelected,
        ),
        transfer_shelf_selected:
          transfer_targetShelf?.delete_time !== '0'
            ? []
            : transfer_shelfSelected,
        transfer_shelf: transfer_targetShelf,
        transfer_shelfList: formatDataToTree(
          getDisabledShelfData(
            _.filter(data.additional.shelfs!, (item) => {
              return item.delete_time === '0'
            }), // 去掉删除
          ),
          'shelf_id',
          'name',
        ),
        transfer_shelf_obj: transfer_targetShelf,

        // 如果没有其他情况不用改变这里的值 先问问天浩
        batch_selected_single:
          data?.additional?.sub_batches![update_batches_first?.batch_id]
            ?.sub_batches![update_batches_first?.shelf_id ?? 0],
        // 调拨数
        transfer_measure: update_batches_first?.input_stock?.input?.quantity,
        transfer_package: update_batches_first?.input_stock?.input2?.quantity,
        // 状态
        sheet_status,
        different_price: +Big(detail.amount).minus(
          Big(detail.input_stock?.input?.price!).times(
            detail.input_stock?.input?.quantity!,
          ),
        ),
        amount: +detail.tax_amount!,
        no_tax_base_price: +detail?.input_stock?.input?.price!,
        no_tax_amount: +detail?.amount!,
        tax_money: Math.abs(
          +Big(detail.tax_amount || 0)
            .minus(+detail.amount)
            .toFixed(2),
        ),
        tax_rate: detail.input_tax,

        operator_name:
          detail.creator_id && detail.creator_id !== '0'
            ? data.additional.group_users![detail.creator_id!].username!
            : '-',
        supplier_info: suppliers![supplier_id ?? 0],
      }
      details.push(stockOutDetailItem)
    }
  })

  result.details = details
  result.discountList = _.map(data.stock_sheet?.discounts?.details, (item) => {
    return {
      ...item,
      money: +item.money,
      action: '' + item.money_type,
      reason: '' + item.reason,
      remark: _.isNil(item.remark) ? '' : item.remark.toString(),
      operator_name: item.creator_id
        ? handleCreator(
            data.additional.group_users,
            item.creator_id!,
            'username',
          )
        : '-',
    }
  })

  result.apportionList = _.map(
    data.stock_sheet?.cost_allocation?.details,
    (item) => {
      return {
        ...item,
        money: +item.money,
        action: '' + item.money_type,
        reason: '' + item.reason,
        remark: item.remark ?? '',
        method: '' + item.type,
        sku_selected: _.map(item.sku_units, (item) => {
          return item.sku_id + '_' + item.unit_id
        }),
        operator_name: item.creator_id
          ? handleCreator(
              data.additional.group_users,
              item.creator_id!,
              'username',
            )
          : '-',
      }
    },
  )

  return result
}

interface LinkCalculateArgs {
  currentField: 'base_quantity' | 'base_price' | 'amount'
  currentValue: number | null
  data: Pick<
    SalesInvoicingSheet.ProductDetail,
    'amount' | 'base_quantity' | 'base_price' | 'different_price'
  >
  canPackage?: boolean // 数量包装单位(废弃)是否引起联动
}
type LinkCalculateReturn = Pick<
  SalesInvoicingSheet.ProductDetail,
  | 'amount'
  | 'different_price'
  | 'amount_show'
  | 'base_quantity'
  | 'base_price_show'
  | 'base_price'
> & {
  tax_input_price?: string
  tax_amount?: string
}
type LinkCalculate = (args: LinkCalculateArgs) => LinkCalculateReturn
/**
 * TODO: 后面删掉
 * 根据当前输入的值和data以及计算逻辑得出相应数据
 * @param currentField 当前输入的值
 * @param options 一些辅助换算的信息
 */
export const getLinkCalculate: LinkCalculate = ({
  currentField,
  currentValue,
  data,
  canPackage,
}) => {
  const {
    ssu_base_price,
    amount,
    ssu_base_quantity,
    ssu_unit_rate,
    ssu_quantity,
    different_price,
  } = data

  const result: LinkCalculateReturn = {
    amount,
    ssu_base_quantity,
    ssu_quantity,
    ssu_base_price,
    different_price,
    amount_show: null,
    ssu_base_quantity_show: null,
    ssu_quantity_show: null,
    ssu_base_price_show: null,
    different_price_show: null,
  }
  result[currentField] = currentValue
  switch (currentField) {
    case 'ssu_base_quantity':
      // 基本单位=》包装单位(废弃)、金额、单价
      // 包装单位(废弃)
      if (_.isNil(currentValue) || _.isNil(ssu_unit_rate)) {
        result.ssu_quantity = null
        result.amount = null
      } else {
        result.ssu_quantity = +Big(currentValue)
          .div(ssu_unit_rate)
          .toFixed(backEndDp)
      }

      // 金额
      if (!_.isNil(ssu_base_price) && !_.isNil(currentValue)) {
        result.amount = +Big(ssu_base_price)
          .times(currentValue)
          .toFixed(backEndDp)
      }

      // 基本单位单价
      if (
        !_.isNil(currentValue) &&
        !_.isNil(amount) &&
        _.isNil(ssu_base_price)
      ) {
        result.ssu_base_price = +Big(amount)
          .div(currentValue)
          .toFixed(backEndDp)
      }
      break

    case 'ssu_base_price':
      if (_.isNil(currentValue)) {
        result.amount = null
      }
      if (!_.isNil(currentValue) && !_.isNil(ssu_base_quantity)) {
        result.amount = +Big(currentValue)
          .times(ssu_base_quantity)
          .toFixed(backEndDp)
      }
      break

    case 'amount':
      if (_.isNil(currentValue)) {
        result.ssu_base_price = null
      }
      if (!_.isNil(currentValue) && !_.isNil(ssu_base_quantity)) {
        result.ssu_base_price = +Big(currentValue)
          .div(ssu_base_quantity)
          .toFixed(backEndDp)
      }
      break
    case 'ssu_quantity':
      // 开启包装单位(废弃)联动，包装单位(废弃)只会直接影响基本单位数量，后续操作相当于改变基本单位（会改变金额、单价）。
      if (canPackage) {
        // 基本单位
        if (_.isNil(currentValue) || _.isNil(ssu_unit_rate)) {
          result.ssu_base_quantity = null // 数量基本单位也为空
          result.amount = null
        } else {
          result.ssu_base_quantity = +Big(currentValue)
            .times(ssu_unit_rate) // 包装=》计量需要乘法
            .toFixed(backEndDp)
        }

        // 金额,以基本单位为准，因此这里使用基本单位换算
        if (
          !_.isNil(result.ssu_base_price) &&
          !_.isNil(result.ssu_base_quantity)
        ) {
          result.amount = +Big(result.ssu_base_price)
            .times(result.ssu_base_quantity)
            .toFixed(backEndDp)
        }

        // 基本单位单价，以基本单位为准，因此这里使用基本单位换算
        if (
          !_.isNil(result.ssu_base_quantity) &&
          !_.isNil(amount) &&
          _.isNil(ssu_base_price)
        ) {
          result.ssu_base_price = +Big(amount)
            .div(result.ssu_base_quantity)
            .toFixed(backEndDp)
        }
      }
      break

    default:
      break
  }

  Object.assign(result, {
    amount_show: _.isNil(result.amount)
      ? result.amount
      : toFixedByType(+Big(result.amount), 'dpInventoryAmount'),
    ssu_base_quantity_show: _.isNil(result.ssu_base_quantity)
      ? result.ssu_base_quantity
      : toFixedByType(+Big(result.ssu_base_quantity), 'salesInvoicing'),
    ssu_quantity_show: _.isNil(result.ssu_quantity)
      ? result.ssu_quantity
      : toFixedByType(+Big(result.ssu_quantity), 'salesInvoicing'),
    ssu_base_price_show: _.isNil(result.ssu_base_price)
      ? result.ssu_base_price
      : toFixedByType(+Big(result.ssu_base_price), 'dpInventoryAmount'),
    different_price_show: _.isNil(result.different_price)
      ? result.different_price
      : toFixedByType(+Big(result.different_price), 'dpInventoryAmount'),
  })

  return result
}
export const getLinkCalculateV2: LinkCalculate = ({
  currentField,
  currentValue,
  data,
}) => {
  const {
    amount,
    base_price,
    tax_amount,
    tax_input_price,
    // base_quantity,
    // input_stock: { input },
  } = data
  // 调拨申请是input_in_stock
  let input_stock = data?.input_stock || {}
  // const { input, input2 } = input_stock
  let quantity = input_stock?.input?.quantity || 1
  const result: LinkCalculateReturn = {
    quantity,
    amount,
    base_price,
    tax_amount,
    tax_input_price,
    amount_show: null,
    [currentField]: currentValue,
  }

  switch (currentField) {
    case 'input_stock':
      input_stock = data?.input_stock
      quantity = input_stock?.input?.quantity || 1
    case 'input_in_stock':
      input_stock = data?.input_in_stock
      quantity = input_stock?.input?.quantity || 1
    case 'input_out_stock':
      input_stock = data?.input_out_stock
      quantity = input_stock?.input?.quantity || 1
    case 'base_quantity':
      // 基本单位=》包装单位(废弃)、金额、单价
      // 包装单位(废弃)
      if (_.isNil(currentValue)) {
        result.tax_amount = null
      }
      // 金额
      if (!_.isNil(tax_input_price) && !_.isNil(currentValue)) {
        result.tax_amount = +Big(tax_input_price)
          .times(currentValue)
          .toFixed(backEndDp)
      }
      // 基本单位单价
      if (
        !_.isNil(currentValue) &&
        !_.isNil(tax_amount) &&
        _.isNil(tax_input_price)
      ) {
        result.tax_input_price = +Big(tax_amount)
          .div(currentValue || 1)
          .toFixed(backEndDp)
      }
      break
    case 'base_price':
      if (_.isNil(currentValue)) {
        result.amount = null
      }
      if (!_.isNil(currentValue) && !_.isNil(quantity)) {
        result.amount = +Big(currentValue).times(quantity).toFixed(backEndDp)
      }
      break
    case 'amount':
      if (_.isNil(currentValue)) {
        result.base_price = null
      }
      if (!_.isNil(currentValue) && !_.isNil(quantity)) {
        result.base_price = +Big(currentValue)
          .div(quantity || 1)
          .toFixed(backEndDp)
      }
      break

    case 'tax_input_price':
      if (_.isNil(currentValue)) {
        result.tax_amount = null
      }
      if (!_.isNil(currentValue) && !_.isNil(quantity)) {
        result.tax_amount = +Big(currentValue)
          .times(quantity)
          .toFixed(backEndDp)
      }
      break

    case 'tax_amount':
      if (_.isNil(currentValue)) {
        result.tax_input_price = null
      }
      if (!_.isNil(currentValue) && !_.isNil(quantity)) {
        result.tax_input_price = +Big(currentValue)
          .div(quantity || 1)
          .toFixed(backEndDp)
      }
      break
    default:
      break
  }

  Object.assign(result, {
    amount_show:
      _.isNil(result.amount) || !result?.amount
        ? result.amount
        : toFixedByType(+Big(result.amount), 'dpInventoryAmount'),
    base_quantity_show: _.isNil(result.base_quantity || result.quantity)
      ? result.base_quantity || result.quantity
      : toFixedByType(
          +Big(result.base_quantity || result.quantity),
          'salesInvoicing',
        ),

    base_price_show: _.isNil(result.base_price)
      ? result.base_price
      : toFixedByType(+Big(result.base_price), 'dpInventoryAmount'),
  })

  return result
}
// 根据id获取货位名
export const getSelectedShelfName = (data: Shelf[], selected?: string[]) => {
  let resultName = ''

  _.each(selected, (selectedValue) => {
    const target = _.find(data, (item) => selectedValue === item.shelf_id)
    resultName += '/' + target?.name
  })
  return resultName.replace('/', '')
}

/**
 * 根据货位id获取货位选择数组
 * @param {Shelf[]} data 平铺的object，内自带parent_id
 * @param {string} shelfId 货位id
 */
export const getShelfSelected = (data: Shelf[], shelfId?: string) => {
  const result: string[] = []
  let levelShelfId = shelfId
  const idMap: ObjectOfKey<any> = {}

  _.each(data, (item) => {
    idMap[item.shelf_id] = {
      ...item,
      value: item.shelf_id,
      text: item.name,
      parent_id: item.parent_id,
    }
  })

  // 存在货位不填的情况，因此需要对货位未选择做校验
  if (levelShelfId && idMap[levelShelfId]) {
    result.unshift(levelShelfId)
    while (
      idMap[levelShelfId!]?.parent_id &&
      idMap[levelShelfId!]?.parent_id !== '0'
    ) {
      result.unshift(idMap[levelShelfId!].parent_id!)
      levelShelfId = idMap[levelShelfId!].parent_id
    }
  }
  return result
}

/**
 * 获取商品分类树状数据
 */
export const getCategoryProductTree = (
  data: SalesInvoicingSheet.ProductDetail[],
): TreeListItem[] => {
  const treeData: TreeListItem[] = []

  const flaseValue = (value: string) =>
    value === '' || value === '0' || value === undefined

  const trueValue = (value: string) =>
    value !== '' && value !== '0' && value !== undefined

  // 分类级别划分
  const one = new Map()
  const two = new Map()
  const three = new Map()
  // sku划分
  const sku = new Map()
  // 规格划分
  const ssu = new Map()

  _.each(data, (item) => {
    one.set(item.category_id_1, {
      value: item.category_id_1,
      text: item.category_name_1,
      children: [],
    })
    two.set(item.category_id_2, {
      value: item.category_id_2,
      text: item.category_name_2,
      category_id_1: item.category_id_1,
      children: [],
    })
    three.set(item.category_id_3, {
      value: item.category_id_3,
      text: item.category_name_3,
      category_id_2: item.category_id_2,
      children: [],
    })
    sku.set(item.sku_id, {
      value: item.sku_id,
      text: item.sku_name || item.name,
      category_id_1: item.category_id_1,
      category_id_2: item.category_id_2,
      category_id_3: item.category_id_3,
      children: [],
    })
    ssu.set(item.sku_id + '_' + item.base_unit_id, {
      value: item.sku_id + '_' + item.base_unit_id,
      text: item.ssu_display_name || item.sku_base_unit_name,
      sku_id: item.sku_id,
    })
  })

  // ssu 放到 sku
  for (const v of ssu.values()) {
    sku.get(v.sku_id).children.push({
      ...v,
    })
  }

  // sku 根据二三级是否有值, 放到不同层级
  for (const v of sku.values()) {
    if (flaseValue(v.category_id_2)) {
      one.get(v.category_id_1).children.push({
        ...v,
      })
    }
    if (flaseValue(v.category_id_3) && trueValue(v.category_id_2)) {
      two.get(v.category_id_2).children.push({
        ...v,
      })
    }
    if (trueValue(v.category_id_3)) {
      three.get(v.category_id_3).children.push({
        ...v,
      })
    }
  }

  // 三级分类 放到二级分类
  for (const v of three.values()) {
    if (trueValue(v.text)) {
      two.get(v.category_id_2).children.push({
        ...v,
      })
    }
  }

  // 放到一级分类
  for (const v of two.values()) {
    if (trueValue(v.text)) {
      one.get(v.category_id_1).children.push({
        ...v,
      })
    }
  }

  // 放到treeData
  for (const v of one.values()) {
    treeData.push({
      ...v,
    })
  }
  return treeData
}

const get_ssu_base_unit_name = (
  skuInfo: GetManySkuResponse_SkuInfo,
  units: { [key: string]: Unit },
  unit_id: string,
): string => {
  const ssuInfo = skuInfo?.ssu_map![unit_id!]
  return ssuInfo
    ? globalStore.getUnitName(ssuInfo.ssu?.unit?.parent_id!)
    : units![unit_id!]?.name
}

const getSomeInfo = <T extends keyof Additional>(
  additional_Info: Additional[T],
  id: string,
) => additional_Info![id!] || {}

const getUnitInfo = (
  skuInfo: GetManySkuResponse_SkuInfo,
  sku_unit_id: string,
) => _.find(skuInfo?.ssu_map, (value) => value.ssu?.unit_id === sku_unit_id)
// 统一判定是否为真实ssu

const getShelfName = (
  shelves: { [key: string]: Shelf },
  id: string,
  shelf_names: string[],
): void | string[] => {
  const shelf_name = shelves![id!]?.name
  const parent_id = shelves![id!]?.parent_id
  if (shelf_name) {
    shelf_names.unshift(shelf_name)
    return parent_id === '0'
      ? shelf_names
      : getShelfName(shelves, parent_id!, shelf_names)
  }
  return shelf_names
}

/**
 *
 * @param categories 新返回的商品分类数据
 * @param skus skus 数据
 * @returns 返回一个组装后的数据, 和之前的 skuInfos 类似
 */
export const combineCategoryAndSku = (categories: any, skus: any) => {
  const skuInfo = {}
  const skuArray = Object.entries(skus).map((item: any) => {
    const { category1_id, category2_id, category3_id } = item[1]
    const category1 = categories[category1_id] || []
    const category2 = categories[category2_id] || []
    const category3 = categories[category3_id] || []

    return Object.assign(
      {},
      {
        [item[0]]: {
          sku: item[1],
          category_infos: [].concat(category1, category2, category3),
          ssu_map: {},
        },
      },
    )
  })

  for (const item of skuArray) {
    Object.assign(skuInfo, item)
  }

  return skuInfo
}

/**
 * 获取log的additional信息
 */
export const getLogAdditional = ({
  data,
  additional,
  showSuppliers,
  showCustomer,
  showUser,
  showDriver,
  showLabel,
  showPurchasers,
}: {
  data: StockLog[]
  additional: Additional
  showSuppliers?: boolean
  showPurchasers?: boolean
  showCustomer?: boolean
  showUser?: boolean
  showDriver?: boolean
  showSsuPrice?: boolean
  showLabel?: boolean
}): StockLog[] => {
  const {
    category_map,
    sku_map,
    suppliers,
    customers,
    group_users,
    units,
    customer_label_relation,
    customer_labels,
    shelfs,
  } = additional
  shelfs['0'] = {
    shelf_id: '0',
    create_time: '0',
    update_time: '0',
    delete_time: '0',
    group_id: '0',
    station_id: '0',
    parent_id: '0',
    name: '未分配',
    remark: '',
    is_leaf: true,
  }

  const skuinfos = combineCategoryAndSku(category_map, sku_map)

  const log_data = _.map(
    data,
    ({
      sku_unit_id,
      sku_id,
      target_id,
      target_customer_id,
      operator_id,
      base_unit_id,
      driver_id,
      purchaser_id,
      supplier_id,
      warehouse_id,
      ...other
    }) => {
      const skuInfo = getSomeInfo(
        skuinfos!,
        sku_id!,
      ) as GetManySkuResponse_SkuInfo
      return {
        ...other,
        shelfs,
        skuInfo,
        target_id, // 界面判断
        unit_info: getUnitInfo(skuInfo, sku_unit_id!),
        supperInfo: showSuppliers
          ? getSomeInfo(suppliers!, supplier_id! ?? '0')
          : {},
        purchaserInfo: showPurchasers
          ? getSomeInfo(group_users, purchaser_id ?? '0')
          : {},
        // target_customer_id 为商户 target_id需要通过target_type联合判断
        customerInfo: showCustomer
          ? getSomeInfo(
              customers!,
              _.toNumber(target_customer_id!)
                ? target_customer_id!
                : target_id!,
            )
          : {},
        customerLabel: showLabel
          ? customer_labels[
              customer_label_relation[target_customer_id]?.values[0]
            ]
          : {},
        groupUserInfo: showUser ? getSomeInfo(group_users!, operator_id!) : {},
        driverInfo: showDriver ? getSomeInfo(group_users!, driver_id!) : {},
        base_unit_name: units![base_unit_id!]?.name,
        sku_base_unit_name: units![base_unit_id!]?.name,
        purchaser_name: group_users?.[purchaser_id ?? '0']?.name,
        warehouse_name: additional?.warehouses?.[warehouse_id]?.name,
      }
    },
  )
  return log_data
}

/**
 * 获取盘点的additional信息
 */
export const getPDAdditional = (data: PDetail[], additional: Additional) => {
  const { sku_stocks } = additional!
  // 增加stock、 base_unit_quantity、sku_unit_quantity
  _.forEach(data, (value, key) => {
    const { sku_id, sku_unit_id } = value
    const productStock = sku_stocks![sku_id!].unit_stocks![sku_unit_id!]
    const base_unit_quantity = productStock?.stock?.base_unit?.quantity
    const sku_unit_quantity = productStock?.stock?.sku_unit?.quantity
    Object.assign(data[key], {
      productStock,
      base_unit_quantity,
      sku_unit_quantity,
    })
  })

  return data
}

/**
 * 获取调整单的additional信息
 */
export const getAdjustAdditional = (
  data: AdjustSheet_Details,
  additional: Additional,
) => {
  const { category_map, sku_map, batches, units } = additional
  const skuinfos = combineCategoryAndSku(category_map, sku_map)

  const { details } = data
  _.forEach(details, (value, key) => {
    const { sku_id, unit_id, batch_id } = value
    const skuInfo = getSomeInfo(
      skuinfos!,
      sku_id!,
    ) as GetManySkuResponse_SkuInfo
    Object.assign(details![key], {
      skuInfo,
      batchedInfo: getSomeInfo(batches!, batch_id!),
      ssu_info: getUnitInfo(skuInfo, unit_id!),
      ssu_base_unit_name: get_ssu_base_unit_name(skuInfo, units!, unit_id!),
    })
  })
  return details
}

/**
 * 获取batch的additional信息
 */
export const getBatchAdditional = (
  data: Batch[],
  additional: Additional,
): BatchExpand[] => {
  const { category_map, sku_map, shelfs, units, suppliers, group_users } =
    additional
  const skuinfos = combineCategoryAndSku(category_map, sku_map)

  const batch_data = _.map(
    data,
    ({
      sku_unit_id,
      sku_id,
      shelf_id,
      base_unit_id,
      supplier_id,
      purchaser_id,
      ...other
    }) => {
      const purchaser_name = group_users![purchaser_id!]?.name ?? '-'
      const supplier_name = suppliers?.[supplier_id!]?.name ?? '-'

      const skuInfo = getSomeInfo(
        skuinfos!,
        sku_id!,
      ) as GetManySkuResponse_SkuInfo
      return {
        ...other,
        sku_id,
        base_unit_id,
        sku_unit_id,
        skuInfo,
        base_unit_name: units![base_unit_id!].name,
        second_base_unit_name: globalStore.getUnitName(
          skuInfo?.sku?.second_base_unit_id,
        ),
        shelfNames: getShelfName(shelfs!, shelf_id!, []),
        supplier_name,
        purchaser_name,
      }
    },
  )
  return batch_data
}

/**
 * 获取batchLog的additional信息
 */
export const getBatchLogAdditional = (
  data: BatchLog[],
  additional: Additional,
): BatchLog[] => {
  const sku_unit_id = data[0]?.sku_unit_id
  const base_unit_id = data[0]?.base_unit_id
  const sku_id = data[0]?.sku_id
  const { category_map, sku_map, units } = additional
  const skuinfos = combineCategoryAndSku(category_map, sku_map)

  const skuInfo = getSomeInfo(skuinfos!, sku_id!) as GetManySkuResponse_SkuInfo
  _.forEach(data, (value) => {
    Object.assign(value, {
      ssu_info: getUnitInfo(skuInfo, sku_unit_id!),
      base_unit_name: units![base_unit_id!].name,
    })
  })
  return data
}
/**
 * 获取SkuStock商品信息和供应商
 */
export const getStockAdditional = (
  data: SkuStock[],
  additional: Additional,
  type?: string, // 超支或库存
): SkuStockExpand[] => {
  const { category_map, sku_map, units } = additional
  const skuinfos = combineCategoryAndSku(category_map, sku_map)

  const ifInventory = type === 'inventory'
  const stock_data = _.map(
    data,
    ({ unit_stock_list, batches, sku_id, base_unit_id, ...other }) => {
      const skuInfo = sku_map?.[sku_id]
      const base_unit_name = units?.[skuInfo?.base_unit_id!]?.name
      const second_base_unit_name =
        globalStore?.getUnitName(skuInfo?.second_base_unit_id) ?? ''

      // 超支库存
      const batch_data = !ifInventory
        ? getBatchAdditional(batches!, additional)
        : batches

      // 库存总览
      const unit_stock_list_data = ifInventory
        ? _.map(unit_stock_list, ({ sku_unit_id, sku_id, ...unit_other }) => {
            const unitSkuInfo = getSomeInfo(
              skuinfos!,
              sku_id!,
            ) as GetManySkuResponse_SkuInfo
            const ssu_base_unit_name = get_ssu_base_unit_name(
              unitSkuInfo,
              units!,
              sku_unit_id!,
            )
            return {
              ...unit_other,
              sku_unit_id,
              sku_id,
              base_unit_name,
              ssu_base_unit_name,
              ssu_info: _.find(
                unitSkuInfo?.ssu_map,
                ({ ssu }) => ssu!.unit_id === sku_unit_id,
              ),
            }
          })
        : unit_stock_list
      return {
        ...other,
        sku_id,
        base_unit_id,
        batches: batch_data,
        second_base_unit_id: skuInfo?.second_base_unit_id,
        sku_base_unit_id: skuInfo?.base_unit_id,
        second_base_unit_name,

        base_unit_name,
        skuInfo: getSomeInfo(skuinfos!, sku_id!) as GetManySkuResponse_SkuInfo,
        unit_stock_list: unit_stock_list_data,
        children: batch_data,
        batchArray: _.map(batch_data, ({ batch_id }) => batch_id), // 用于页面select
      }
    },
  )
  return stock_data
}

/**
 * 获取CustomerTurnover商品信息和供应商
 */
export const getTurnoverAdditional = (
  data: CustomerTurnover[],
  additional: Additional,
): CustomerTurnoverExpand[] => {
  const { customers, category_map, sku_map } = additional
  const skuinfos = combineCategoryAndSku(category_map, sku_map)

  const turn_data = _.map(data, ({ stocks, customer_id, ...other }) => {
    const customer_info = getSomeInfo(customers!, customer_id!) as Customer

    // 获取与moreSelect相同的数据结构
    const unit_stocks = _.map(
      stocks?.unit_stocks,
      ({ base_unit, ...other }, key) => {
        const skuInfo = getSomeInfo(skuinfos!, key!) as SkuInfoExpand
        // 只有一个ssu返回
        const ssu_info = skuInfo.ssu_map![Object.keys(skuInfo.ssu_map!)[0]]
        const ssu_price = ssu_info?.ssu!.package_price! || '0'
        const base_unit_info = base_unit as UnitValueExpand
        base_unit_info.ssu_price = ssu_price
        base_unit_info.total_price = +Big(+ssu_price).times(
          base_unit?.quantity!,
        )
        return {
          sku_id: key,
          skuInfo,
          customer_id,
          customer_info,
          base_unit: base_unit_info,
          base_unit_name: globalStore.getUnitName(skuInfo.sku!.base_unit_id),
          ...other,
        }
      },
    )
    return {
      stocks: unit_stocks,
      customer_id,
      customer_info,
      ...other,
    }
  })

  return turn_data
}
/**
 * 获取StockSheet的additional信息
 */
export const getSheetAdditional = (
  data: StockSheet[],
  additional: Additional,
): StockSheetInfo[] => {
  const { category_map, sku_map, customers, group_users } = additional
  const skuinfos = combineCategoryAndSku(category_map, sku_map)
  const sheet_data = _.map(
    data,
    ({
      sku_id,
      driver_id,
      target_id,
      details,
      sheet_status,
      warehouse_id,
      ...other
    }) => ({
      ...other,
      details,
      sku_id, // 更新单据
      driver_id, // 编辑传入select
      sheet_status,
      target_id,
      old_sheet_status: sheet_status,
      skuInfo: getSomeInfo(skuinfos!, sku_id!) as GetManySkuResponse_SkuInfo,
      base_unit_name: globalStore.getUnitName(details![0].base_unit_id!),
      customerInfo: getSomeInfo(customers!, target_id!) as Customer,
      groupUserInfo: getSomeInfo(group_users!, driver_id!) as GroupUser,
      quantity: +details![0].input_stock.input?.quantity!,
      edit: false, // 操作控制
      warehouse_name: additional?.warehouses?.[warehouse_id]?.name,
      warehouse_id,
    }),
  )
  return sheet_data
}

/**
 * 周转物单据的创建
 */
export const getSearchCustomer = (
  sheetInfo: CustomerSheetType,
  sheet_type: keyof Pick<ReceiptType, 'turnoverLoan' | 'turnoverRevert'>,
) => {
  const {
    customer,
    group_user_id,
    quantity,
    related_sheet_serial_no,
    sku,
    warehouse_id,
  } = sheetInfo
  const {
    original: { sku_id, spu_id, ssu_infos, base_unit_id },
  } = sku!
  const sheetDetail: Omit<StockSheet, 'stock_sheet_id'> = {
    sku_id,
    related_sheet_serial_no,
    sheet_type: RECEIPT_TYPE[sheet_type],
    sheet_status: RECEIPT_STATUS.toBeSubmitted,
    target_id: customer?.value,
    target_type: StockSheet_TargetType.SHEET_TARGET_TYPE_CUSTOMER,
    driver_id: group_user_id,
    details: [],
    warehouse_id: warehouse_id,
    // details: [],
  }
  const productDetail: StockSheet_Detail[] = [
    {
      spu_id,
      sku_id,
      base_unit_id,
      sku_unit_id: base_unit_id,
      input_stock: {
        input: {
          price: '0',
          quantity: quantity!.toString(),
          unit_id: base_unit_id,
        },
        input2: {
          price: '0',
          quantity: quantity!.toString(),
          unit_id: base_unit_id,
        },
      },
      amount: '0',
    },
  ]
  return {
    stock_sheet: _.assign(sheetDetail, { details: productDetail }),
  }
}

/**
 **货值成本StockValue的其他信息
 */
export const getStockValueAdditional = ({
  data,
  additional,
  base_unit_name,
  sku_info, // 获取ssu时不用每个ssu重新查询skuInfo
}: {
  data: Partial<StockValueExpand>[]
  additional: Additional
  sku_info?: GetManySkuResponse_SkuInfo
  base_unit_name?: string
}): Partial<StockValueExpand>[] => {
  const { category_map, sku_map, units } = additional
  const skuinfos = combineCategoryAndSku(category_map, sku_map)

  const stockData = _.map(data, ({ sku_id, warehouse_id, ...other }) => {
    const skuInfo =
      sku_info ??
      (getSomeInfo(skuinfos!, sku_id!) as GetManySkuResponse_SkuInfo)
    return {
      sku_id,
      sku_info: skuInfo,
      base_unit_name: base_unit_name ?? units![skuInfo.sku!.base_unit_id]?.name,
      warehouse_name: additional?.warehouses?.[warehouse_id!]?.name,
      ...other,
    }
  })
  return stockData
}

/**
 ** 车间商品盘点
 */
export const getProcessorCheckAdditional = (
  data: ProcessorCheck[],
  additional: Additional,
): ProcessorCheck[] => {
  const { category_map, sku_map } = additional
  const skuinfos = combineCategoryAndSku(category_map, sku_map)

  const turn_data = _.map(
    data,
    ({ unit_stock, sku_id, processor_check_id, ...other }) => {
      const skuInfo = getSomeInfo(
        skuinfos!,
        sku_id!,
      ) as GetManySkuResponse_SkuInfo
      // 获取与moreSelect相同的数据结构
      const unit_stocks = _.map(unit_stock, (base_unit, key) => {
        const base_unit_info = base_unit as UnitValueExpand
        return {
          sku_id: key,
          skuInfo,
          base_unit: base_unit_info,
          base_unit_name: globalStore.getUnitName(skuInfo.sku!.base_unit_id),
          ...other,
        }
      })
      return {
        stocks: unit_stocks,
        customize_code: skuInfo?.sku?.customize_code,
        sku_name: skuInfo?.sku?.name,
        base_unit_name: unit_stocks[0]?.base_unit_name,
        quantity: unit_stocks[0]?.base_unit?.quantity,
        price: unit_stocks[0]?.base_unit?.price,
        amount: unit_stocks[0]?.amount,
        skuInfo,
        processor_check_id,
        ...other,
      }
    },
  )
  return turn_data
}

/**
 * 车间用料成本表
 */
export const getProcessorStatisticsAdditional = (
  data: Partial<ProcessorCheck>[],
  additional: Additional,
): ProcessorCheck[] => {
  if (data.length === 0) return []
  const { category_map, sku_map } = additional
  const skuinfos = combineCategoryAndSku(category_map, sku_map)

  const turn_data = _.map(data, ({ sku_id, ...other }) => {
    const skuInfo = getSomeInfo(
      skuinfos!,
      sku_id!,
    ) as GetManySkuResponse_SkuInfo
    return {
      skuInfo,
      sku_id,
      customize_code: skuInfo?.sku?.customize_code,
      sku_name: skuInfo?.sku?.name,
      base_unit_name: globalStore.getUnitName(skuInfo.sku!.base_unit_id),
      ...other,
    }
  })
  return turn_data
}

/**
 **商品筛选
 */
export const getSearchCategory = (category_ids: CategoryType) => {
  const { category1_ids, category2_ids } = category_ids!
  return _.concat(
    [],
    category2_ids.length ? [] : _.map(category1_ids, ({ value }) => value),
    _.map(category2_ids, ({ value }) => value),
  )
}

/**
 * 表单规格的显示
 */
export const showUnitText = (
  ssu_info: SsuInfo, // 判定是否为真实ssu
  ssu_base_unit_name: string,
): string => {
  const ssuInfo = ssu_info?.ssu
  return ssuInfo
    ? ssuInfo!?.unit_type === 1
      ? ssu_base_unit_name
      : `${ssuInfo!.unit!.rate} ${ssu_base_unit_name}/${ssuInfo!.unit!.name}`
    : `${ssu_base_unit_name}(基本单位)`
}

/**
 * 商品筛选显示 sku
 */
export const getSkuList = (
  data: ListSkuResponse_SkuInfo[],
): SkuInfoMoreSelect[] =>
  _.reduce(
    data,
    (result, value) => {
      const { sku: skuInfo } = value
      result.push({
        text:
          `${skuInfo!.name!}(${skuInfo!.customize_code!})` ||
          skuInfo!.customize_code!,
        value: skuInfo!.sku_id!,
        sku_type: skuInfo!.sku_type!,
        ssu: getSkuUnit(value)!,
      })
      return result
    },
    [] as SkuInfoMoreSelect[],
  )

/**
 * 商品筛选显示 spu
 */
export const getSkuUnit = (
  data: GetSkuResponse | ListSkuResponse_SkuInfo | SkuInfoExpand,
): SkuUnitMoreSelect[] => {
  const { ssu_infos, sku } = data
  const unitList: SkuUnitMoreSelect[] = _.map(
    ssu_infos as SsuInfo[],
    (value) => {
      const { ssu } = value
      const ssu_base_unit_name = globalStore.getUnitName(ssu?.unit?.parent_id!)
      const showText =
        ssu?.unit_type === 1
          ? ssu_base_unit_name
          : `${ssu?.unit?.rate!} ${ssu_base_unit_name}/${ssu?.unit?.name!}`
      return {
        text: showText,
        value: ssu?.unit_id!,
        isVirtualBase: false,
      }
    },
  )
  unitList.unshift({
    text: globalStore.getUnitName(sku?.base_unit_id!),
    value: sku?.base_unit_id!,
    isVirtualBase: true,
  })
  return unitList
}

/**
 * 时间戳转换
 */
export const formatSecond = (time: string) => {
  return moment(parseInt(time)).format('YYYY-MM-DD HH:mm')
}

export const formatDay = (time: string) => {
  return moment(parseInt(time)).format('YYYY-MM-DD')
}

export const ssuBaseToSkuBase = (
  stock: UnitStock,
  ssu_base_unit_rate: number,
) => {
  if (stock.base_unit?.unit_id && ssu_base_unit_rate) {
    stock.base_unit.quantity =
      '' + Big(stock.base_unit.quantity!).div(ssu_base_unit_rate)
  }
  return stock
}

export const ssuBaseToSkuBaseQ = (
  quantity: number,
  ssu_base_unit_rate: number,
) => {
  if (quantity !== 0) {
    quantity = _.toNumber(
      toFixedSalesInvoicing(Big(quantity).div(ssu_base_unit_rate || 1)),
    )
  }
  return quantity
}

const fixedMinus = (newMoney: Big | string, oldMoney: Big | string): Big => {
  const toFixed = (num) => toFixedByType(num, 'dpInventoryAmount')
  return Big(toFixed(newMoney)).minus(toFixed(oldMoney))
}
/**
 * log单位明细
  // const placeholderText = 输入商品名称、商品编码或采购入库单号搜索
 */
export const changeLogNum = ({
  new_stock,
  old_stock,
  unit,
  type,
}: {
  new_stock?: UnitValue
  old_stock?: UnitValue
  unit?: UnitValue
  type: string
}) => {
  let num: Big, newMoney, oldMoney
  const logType: { [key: string]: number } = {
    changeQuantity: 1, // 库存变动
    changePrice: 2, // 单价变动
    goodsValue: 3, // 变动前后货值
    stockMoney: 4, // 出入库金额-变动货值
    StockOutCost: 5, // 出库金额
  }
  // 金额相关 先四舍五入
  switch (logType[type]) {
    case 1:
      num = Big(new_stock?.quantity!).minus(old_stock?.quantity!)
      break
    case 2:
      num = fixedMinus(new_stock?.price!, old_stock?.price!)
      break
    case 3:
      num = Big(unit?.price!).times(unit?.quantity!)
      break
    case 4:
      newMoney = Big(new_stock?.price!).times(new_stock?.quantity!)
      oldMoney = Big(old_stock?.price!).times(old_stock?.quantity!)
      num = fixedMinus(newMoney, oldMoney).abs()
      break
    case 5:
      newMoney = Big(new_stock?.price!).times(new_stock?.quantity!)
      oldMoney = Big(old_stock?.price!).times(old_stock?.quantity!)
      num = fixedMinus(oldMoney, newMoney).div(
        Big(old_stock?.quantity!).minus(new_stock?.quantity!),
      )
      break
  }
  const moneyType = [2, 3, 4, 5]
  return moneyType.includes(logType[type])
    ? toFixedByType(num!, 'dpInventoryAmount')
    : toFixedSalesInvoicing(num!)
}
export const getReceiptActionableList = (
  status: number,
  sheet_type?: keyof ReceiptType,
) => {
  return RECEIPT_ACTIONABLE_LIST[status]
}

export const canDeleteReceipt = (status: number): boolean => {
  const canList: ReceiptStatusKey[] = [
    'toBeSubmitted', // 待提交
    'cancelApproval', // 被反审
    'notApproved', // 被驳回
  ]
  return canList.includes(RECEIPT_STATUS_KEY_NAME[status])
}

export const canEdit = (status: number): boolean => {
  const canList: ReceiptStatusKey[] = [
    'toBeSubmitted', // 待提交
    'cancelApproval', // 被反审
    'notApproved', // 被驳回
  ]
  return canList.includes(RECEIPT_STATUS_KEY_NAME[status])
}

export const getSuccessTip = (
  receiptAction: ReceiptStatusKey,
  currentStatus: number,
) => {
  let tip = RECEIPT_ACTION_TYPE_NAME[receiptAction]
  if (
    (receiptAction === 'cancelApproval' || receiptAction === 'notApproved') &&
    receiptAction === RECEIPT_STATUS_KEY_NAME[currentStatus]
  ) {
    // 反审和驳回只能操作一次，因此当前状态与操作状态相同时，即是保存草稿操作，因为保存草稿不修改状态
    tip = RECEIPT_ACTION_TYPE_NAME.toBeSubmitted
  }

  return tip
}

export const getDisabledShelfData = (data: Shelf[]): Shelf[] => {
  return _.map(data, (item) => {
    return {
      ...item,
      disabled: !item.is_leaf, // 不是最小级则disabled
    }
  })
}

/**
 * 是否是系统基本单位
 * 系统基本单位大于SystemUnitId.SYSTEM_UNIT_ID_BEGIN
 * @param ssu_unit_id ssu unit id
 */
export const isSystemBaseUnit = (ssu_unit_id: string) => {
  return Big(ssu_unit_id).gte(SystemUnitId.SYSTEM_UNIT_ID_BEGIN)
}

/**
 * ssu的unit类型，是否是按系统基本单位
 * @param ssu_unit_type ssu?.unit_type
 */
export const isSystemSsuUnitType = (ssu_unit_type: UnitType) => {
  return ssu_unit_type && ssu_unit_type === UnitType.SYSTEM_UNIT
}

const getAllSelectedBatch = (
  data: { batch_selected: BatchDetail[] }[],
): any[] => {
  const total: any[] = []
  _.each(data, (v, detailIndex) => {
    _.each(v.batch_selected, (selected) => {
      total.push({
        ...selected,
        sku_base_quantity: selected.sku_base_quantity,
        ssu_quantity: selected.ssu_quantity,
        sku_id: selected.sku_id,
        ssu_unit_id: selected.sku_unit_id,
        batch_id: selected.batch_id,
        sku_stock_base_quantity: selected.sku_stock_base_quantity,
        ssu_stock_quantity: selected.ssu_stock_quantity,
        detail_index: detailIndex,
      })
    })
  })

  return total
}

/**
 * 在以选择的批次中，去掉该批次以外已被选择的数量
 * @param batchData 批次列表
 * @param batchSelectedList 选中批次的列表
 * @param changeKey 需要更改值的字段
 * @param selectedIndex 当前选择批次的是batchSelectedList中的第几条数据
 */
export const calculateSurplusByBatchSelected = (
  batchData: BatchData[],
  batchSelectedList: { batch_selected: BatchDetail[] }[],
  changeKey: 'sku_stock_base_quantity' | 'sku_base_material_out',
  selectedIndex: number,
) => {
  const result = batchData
  const allSelectedBatch = getAllSelectedBatch(batchSelectedList)
  _.each(batchData, (v, batchIndex) => {
    // 针对selected记录一下未处理过的数据，以免多次扣减
    result[batchIndex]._origin_sku_stock_base_quantity =
      v._origin_sku_stock_base_quantity ?? v.sku_stock_base_quantity
    result[batchIndex]._origin_ssu_stock_quantity =
      v._origin_ssu_stock_quantity ?? v.ssu_stock_quantity

    result[batchIndex]._origin_sku_base_material_out =
      v._origin_sku_base_material_out ?? v.sku_base_material_out
    result[batchIndex]._origin_ssu_material_out =
      v._origin_ssu_material_out ?? v.ssu_material_out

    let restSkuStockBaseQuantity =
      result[batchIndex]._origin_sku_stock_base_quantity!
    let restSkuBaseMaterialOut =
      result[batchIndex]._origin_sku_base_material_out!

    let restSsuStockQuantity = result[batchIndex]._origin_ssu_stock_quantity!
    let restSsuMaterialOut = result[batchIndex]._origin_ssu_material_out!

    _.each(allSelectedBatch, (selected) => {
      if (
        v.batch_id === selected.batch_id &&
        selected.detail_index !== selectedIndex
      ) {
        if (changeKey === 'sku_stock_base_quantity') {
          restSkuStockBaseQuantity = toFixedSalesInvoicing(
            Big(restSkuStockBaseQuantity ?? 0).minus(
              selected.sku_base_quantity ?? 0,
            ),
          ).toString()
          restSsuStockQuantity = toFixedSalesInvoicing(
            Big(restSsuStockQuantity ?? 0).minus(selected.ssu_quantity ?? 0),
          ).toString()
        } else if (changeKey === 'sku_base_material_out') {
          restSkuBaseMaterialOut = +toFixedSalesInvoicing(
            Big(restSkuBaseMaterialOut ?? 0).minus(
              selected.sku_base_quantity ?? 0,
            ),
          )
          restSsuMaterialOut = +toFixedSalesInvoicing(
            Big(restSsuMaterialOut ?? 0).minus(selected.ssu_material_out ?? 0),
          )
        }
      }
    })

    result[batchIndex].sku_stock_base_quantity = restSkuStockBaseQuantity
    result[batchIndex].sku_base_material_out = restSkuBaseMaterialOut
    result[batchIndex].ssu_stock_quantity = restSsuStockQuantity
    result[batchIndex].ssu_material_out = restSsuMaterialOut
  })

  return result
}

export const sortByCustomerId = (
  batchData: BatchData[],
  customer_id: string,
): BatchData[] => {
  const targetData: BatchData[] = []
  const unTargetData: BatchData[] = []

  _.each(batchData, (item) => {
    if (item.target_customer_id === customer_id) {
      targetData.push(item)
    } else {
      unTargetData.push(item)
    }
  })

  return targetData.concat(unTargetData)
}

// 单据中最小出入库时间
export const getMinStockTime = (): Date => {
  return moment().subtract(90, 'day').toDate()
}

export const unit = (transferBaseUnit: any, baseRate: any, rate: any): any => {
  return (transferBaseUnit / (baseRate / rate)).toFixed(8)
}

/**
 * 打印不需要太细区分单据，因此可以单独处理，单据字段改变的时候记得改这里
 * @param data
 * @param additional
 */
export function getCommonSheetData(
  data: GetStockSheetResponse,
  additional?: { shelfList?: Shelf[] },
): SalesInvoicingSheet.CommonReceiptDetail {
  const result: SalesInvoicingSheet.CommonReceiptDetail = {
    ...data.stock_sheet,
    details: [],
    target_delete_time: '',
    submit_time:
      data.stock_sheet.submit_time !== '0'
        ? data.stock_sheet.submit_time
        : undefined,
    batch_index: data.stock_sheet.batch_index,
    originalStockSheet: _.cloneDeep(data.stock_sheet),
    creator_name: handleCreator(
      data.additional.group_users,
      data.stock_sheet.creator_id!,
      'username',
    ),
  }

  const { category_map, sku_map } = data.additional
  const skuinfos = combineCategoryAndSku(category_map, sku_map)

  const sheet_status = data.stock_sheet.sheet_status

  const details: SalesInvoicingSheet.commonProductDetail[] = []

  const isNeedShelf = additional && _.isArray(additional?.shelfList) // 传了shelfList就是需要货位

  _.each(data.stock_sheet?.details, (detail) => {
    const { sku, category_infos } = skuinfos![detail.sku_id]

    // create_batches的批次
    const shelfSelected = isNeedShelf
      ? getShelfSelected(additional!.shelfList!, detail?.shelf_id)
      : undefined
    // 调拨单的调出货位
    let trans_out_shelf
    // 调拨单的掉入货位
    let trans_in_shelf

    let targetShelf
    let batches = {} as Batch
    let production_time

    // 创建的批次相关详细信息
    if (detail?.batches?.create_batches![0]) {
      targetShelf = isNeedShelf
        ? _.find(
            additional?.shelfList,
            (item) =>
              item.shelf_id === detail?.batches?.create_batches![0].shelf_id,
          )
        : undefined
      batches = detail?.batches?.create_batches![0]
      production_time = batches.production_time
    }

    // 调拨单
    if (
      detail?.batches?.update_batches![0] &&
      detail?.batches?.update_batches![1]
    ) {
      // 调拨单单调出货位对象
      trans_out_shelf = isNeedShelf
        ? getShelfSelected(
            additional!.shelfList!,
            detail?.batches?.update_batches![0].shelf_id,
          )
        : undefined
      // 调拨单的调入货位对象
      trans_in_shelf = isNeedShelf
        ? getShelfSelected(
            additional!.shelfList!,
            detail?.batches?.update_batches![1].shelf_id,
          )
        : undefined
      targetShelf = isNeedShelf
        ? _.find(
            additional?.shelfList,
            (item) =>
              item.shelf_id === detail?.batches?.update_batches![0].shelf_id,
          )
        : undefined
      batches = detail?.batches?.update_batches![0]
      production_time = batches.production_time
    }

    const { sku_unit_id } = detail
    const detailItem = {
      ..._.omit(detail, ['create_batches', 'update_batches']),
      // 来自create_batches和update_batch批次
      ...batches,

      // 调拨单additional的batches
      additional_batches_items: data?.additional?.batches![batches.batch_id!],
      // 调拨单的供应商
      additional_supplier:
        data?.additional?.suppliers?.[
          data?.additional?.batches?.[batches.batch_id!]?.supplier_id!
        ],
      production_time: production_time !== '0' ? production_time : undefined,

      // create_batches货位名字
      shelf_name: isNeedShelf
        ? getSelectedShelfName(additional!.shelfList!, shelfSelected)
        : '',
      // 调拨单的调出货位
      trans_out_shelf_name: isNeedShelf
        ? getSelectedShelfName(additional!.shelfList!, trans_out_shelf)
        : '',
      // 调拨单的调入货位
      trans_in_shelf_name: isNeedShelf
        ? getSelectedShelfName(additional!.shelfList!, trans_in_shelf)
        : '',
      // 调拨单的账面库存（基本单位）区分审核通过和其他
      transfer_base_unit:
        sheet_status === 4
          ? unit(
              detail?.old_stock?.base_unit?.quantity,
              data?.additional?.units?.[detail?.input_stock.input!.unit_id]
                ?.rate,
              data?.additional?.units?.[detail?.old_stock?.base_unit?.unit_id!]
                ?.rate,
            )
          : unit(
              data?.additional?.sub_batches?.[batches.batch_id]?.sub_batches?.[
                batches.shelf_id!
              ]?.stock?.base_unit?.quantity,
              data?.additional?.units?.[detail?.input_stock.input!.unit_id]
                ?.rate,
              data?.additional?.units?.[detail.stock?.base_unit?.unit_id!]
                ?.rate,
            ),
      // 调拨单的账面库存(包装单位(废弃)) 区分审核通过和其他
      transfer_sku_unit:
        sheet_status === 4
          ? detail?.old_stock?.sku_unit?.quantity
          : data?.additional?.sub_batches?.[batches.batch_id]?.sub_batches?.[
              batches.shelf_id!
            ]?.stock?.sku_unit?.quantity,

      shelf_selected: targetShelf?.delete_time !== '0' ? [] : shelfSelected,
      shelf: targetShelf,

      // sku
      sku_id: sku!.sku_id,
      sku_customized_code: sku?.customize_code,
      sku_name: sku!.name,
      sku_base_unit_id: sku?.base_unit_id!,
      sku_base_unit_name: globalStore.getUnitName(sku?.base_unit_id!),
      sku_type: sku?.sku_type!,
      // 保质期
      sku_expiry_date: sku?.expiry_date,

      // 分类
      category_id_1: category_infos![0] ? category_infos![0].category_id! : '',
      category_id_2: category_infos![1] ? category_infos![1].category_id! : '',
      category_id_3: category_infos![2] ? category_infos![2].category_id! : '',
      category_name_1: category_infos![0]
        ? category_infos![0].category_name!
        : '',
      category_name_2: category_infos![1]
        ? category_infos![1].category_name!
        : '',
      category_name_3: category_infos![2]
        ? category_infos![2].category_name!
        : '',
      // 逐渐弃用
      spu_name: category_map![sku.category_id]?.category_name!,

      // ssu规格
      unit_id: sku_unit_id,
      amount: +detail.amount,

      operator_name:
        detail.creator_id && detail.creator_id !== '0'
          ? data.additional.group_users![detail.creator_id!].username!
          : '-',

      // 生产对象
      target_customer_id: detail.target_customer_id,
      target_customer_name:
        detail.target_customer_id && detail.target_customer_id !== '0'
          ? data.additional.customers![detail.target_customer_id].name
          : '',

      // todo 为什么要这个字段？状态
      sheet_status,
      batch_selected: _.map(
        detail?.batches?.update_batches,
        (batch: StockSheet_UpdateBatch) => {
          const isVirtualBatch =
            detail?.batches?.create_batches!.length > 0 &&
            detail?.batches?.create_batches![0].batch_id === batch.batch_id &&
            detail?.batches?.create_batches![0].type ===
              Batch_BatchType.BATCH_TYPE_TMP // 当虚拟批次时，create_batches里面的type判断

          const originBatch = isVirtualBatch
            ? detail?.batches?.create_batches![0] // 如果是虚拟批次，详情从create_batches里面取
            : data.additional.batches![batch.batch_id]
          const { stock, input_stock } = batch

          const skuBaseUnit = globalStore.getUnit(stock?.base_unit?.unit_id!)

          const shelfSelected = isNeedShelf
            ? getShelfSelected(additional!.shelfList!, originBatch.shelf_id)
            : undefined

          // 由于数据不完善且存在库存共享，因此所有商品数据，以originBatch为准，数量以updateBatch为准
          return {
            ...batch!,
            origin_create_batch: isVirtualBatch ? originBatch : undefined,
            batch_delete_time: originBatch.delete_time!,
            in_stock_time: originBatch.in_stock_time,
            production_time: originBatch.production_time,
            batch_average_price: +stock!.base_unit?.price!,
            ssu_quantity: +input_stock.input2?.quantity!,
            ssu_quantity_show: toFixedSalesInvoicing(
              +input_stock.input2?.quantity!,
            ),
            sku_base_quantity: +input_stock.input?.quantity!,
            sku_base_quantity_show: toFixedSalesInvoicing(
              +input_stock.input?.quantity!,
            ),

            sku_base_unit_name: skuBaseUnit?.text!,
            sku_base_unit_id: stock?.base_unit?.unit_id!,

            ssu_unit_id: stock?.sku_unit?.unit_id!,
            spu_id: detail.spu_id!,
            sku_id: detail.sku_unit_id,
            base_unit_id: detail.base_unit_id!,
            sku_unit_id: detail.sku_unit_id,
            type: isVirtualBatch
              ? Batch_BatchType.BATCH_TYPE_TMP
              : Batch_BatchType.BATCH_TYPE_CONST, // 只有create_batch中取得的虚拟批次才有type,用做标示虚拟批次
            // 批次剩余库存
            ssu_stock_quantity: originBatch.stock?.sku_unit?.quantity!,
            sku_stock_base_quantity: originBatch.stock?.base_unit?.quantity!,
            shelf_name: isNeedShelf
              ? getSelectedShelfName(additional!.shelfList!, shelfSelected)
              : '',
          }
        },
      ),
    }

    ;(details as SalesInvoicingSheet.commonProductDetail[]).push(
      Object.assign(detailItem, {
        amount_show: toFixedByType(detailItem.amount, 'dpInventoryAmount'),
        ssu_base_quantity_show: toFixedSalesInvoicing(
          detailItem.ssu_base_quantity,
        ),
        ssu_quantity_show: toFixedSalesInvoicing(detailItem.ssu_quantity),
        ssu_base_price_show: toFixedByType(
          detailItem.ssu_base_price,
          'dpInventoryAmount',
        ),
        different_price_show: toFixedByType(
          detailItem.different_price,
          'dpInventoryAmount',
        ),
      }),
    )
  })

  result.details = details

  result.discountList = _.map(data.stock_sheet?.discounts?.details, (item) => {
    return {
      ...item,
      money: +item.money,
      action: '' + item.money_type,
      reason: '' + item.reason,
      remark: _.isNil(item.remark) ? '' : item.remark.toString(),
      operator_name:
        item.creator_id && item.creator_id !== '0'
          ? data.additional.group_users![item.creator_id!].username
          : '-',
    }
  })

  result.apportionList = _.map(
    data.stock_sheet?.cost_allocation?.details,
    (item) => {
      return {
        ...item,
        money: +item.money,
        action: '' + item.money_type,
        reason: '' + item.reason,
        remark: item.remark ?? '',
        method: '' + item.type,
        sku_selected: _.map(item.sku_units, (item) => {
          return item.sku_id + '_' + item.unit_id
        }),
        operator_name:
          item.creator_id && item.creator_id !== '0'
            ? data.additional.group_users![item.creator_id!].username
            : '-',
      }
    },
  )

  return result
}

/**
 * 用来进销存以salesInvoicingDp位数比较，需要先统一四舍五入再比较
 * @param type 比较类型
 * @param num1
 * @param num2
 */
export const compareInDp = (
  type: 'lt' | 'gt' | 'lte' | 'gte',
  num1?: number | string | null,
  num2?: number | string | null,
) => {
  let result = false

  const dpNum1 = toFixedSalesInvoicing(_.isNil(num1) ? 0 : +num1)
  const dpNum2 = toFixedSalesInvoicing(_.isNil(num2) ? 0 : +num2)
  switch (type) {
    case 'lt':
      result = Big(dpNum1).lt(dpNum2)
      break
    case 'gt':
      result = Big(dpNum1).gt(dpNum2)
      break
    case 'lte':
      result = Big(dpNum1).lte(dpNum2)
      break
    case 'gte':
      result = Big(dpNum1).gte(dpNum2)
      break

    default:
      break
  }

  return result
}

export const skuGroupByCategory = (
  skuList: ComSkuItem[],
  supplier_id?: string,
): MoreSelectGroupDataItem<string>[] => {
  const result: MoreSelectGroupDataItem<string>[] = []
  const spuMap: { [key: string]: MoreSelectGroupDataItem<string> } = {}
  _.each(skuList, (item) => {
    if (spuMap[item.spu_id]) {
      spuMap[item.spu_id].children.push(item)
    } else {
      spuMap[item.spu_id] = {
        label: (
          <Flex alignCenter>
            {`${item.category_name_1}/${item.category_name_2}/${item.spu_name}`}
            {supplier_id && (
              <SignTip
                text={
                  item.supplier_id === supplier_id
                    ? t('当前供应商')
                    : t('其他供应商')
                }
              />
            )}
          </Flex>
        ),
        children: [item],
      }
    }
  })

  _.each(spuMap, (value) => {
    result.push(value)
  })
  return result
}
export const skuGroupByCategoryV2 = (
  skuList: Sku[] = [],
  supplier_id?: string,
): MoreSelectGroupDataItem<string>[] => {
  const result: MoreSelectGroupDataItem<string>[] = []
  const spuMap: { [key: string]: MoreSelectGroupDataItem<string> } = {}
  _.each(skuList, (item) => {
    if (spuMap[item?.category_id]) {
      spuMap[item?.category_id].children.push(item)
    } else {
      spuMap[item?.category_id] = {
        label: (
          <Flex alignCenter>
            {`${item?.lastCategoryName}`}
            {supplier_id && (
              <SignTip
                text={
                  item.supplier_id === supplier_id
                    ? t('当前供应商')
                    : t('其他供应商')
                }
              />
            )}
          </Flex>
        ),
        children: [item],
      }
    }
  })

  _.each(spuMap, (value) => {
    result.push(value)
  })
  return result
}
// 兼容后台返回create_id为o的情况
export const handleCreator = (data: any, id: string, nameField: string) => {
  return id === '0' ? t('系统') : data![id][nameField]
}

export const handlePayStatus = (pay_status: PayStatus) => {
  const result: { name: string; value?: PayStatus[] } = {
    name: '',
    value: undefined,
  }

  if (
    pay_status === PayStatus.PAY_STATUS_NOT_PAID ||
    pay_status === PayStatus.PAY_STATUS_READY_TO_PAY
  ) {
    result.name = getEnumText(PAY_STATUS, PayStatus.PAY_STATUS_NOT_PAID)
    result.value = [
      PayStatus.PAY_STATUS_NOT_PAID,
      PayStatus.PAY_STATUS_READY_TO_PAY,
    ]
  } else if (pay_status === PayStatus.PAY_STATUS_UNSPECIFIED) {
    result.value = undefined
    result.name = getEnumText(PAY_STATUS, pay_status)
  } else {
    result.name = getEnumText(PAY_STATUS, pay_status)
    result.value = [pay_status]
  }

  return result
}

export const getDoneQuantity = ({
  reduce_select,
  type,
}: {
  reduce_select: StockSheet_UpdateBatch[]
  type: number
}) => {
  const quantity = _.toNumber(
    Big(
      _.reduce(
        reduce_select,
        (sum, n) => {
          const {
            // input_stock: { input, input2 },
            // old_stock,
            stock,
            operate_type,
          } = n
          let quantity = 0
          if (operate_type === 1000) {
            // 盘亏
            quantity = -stock?.base_unit?.quantity!
          }
          if (operate_type === 1001) {
            // 盘盈
            quantity = +stock?.base_unit?.quantity!
          }

          return sum + quantity
        },
        0,
      ),
    ),
  )
  return quantity
}

export const getQuantity = ({
  reduce_select,
  parm_one,
  parm_two,
}: {
  reduce_select: any
  parm_one: string
  parm_two: string
}) => {
  const quantity = _.toNumber(
    Big(
      _.reduce(
        reduce_select,
        (sum, n) => {
          return sum + (n[parm_one] - n[parm_two])
        },
        0,
      ),
    ),
  )
  return quantity
}

// 工厂模型
export const getProcessorId = (processors: LevelProcess[], ids: string[]) => {
  if (!ids.length || ids[0] === '0') return
  const result: string[] = ids[1] ? [ids[1]] : [ids[0]]
  !ids[1] &&
    result.push(
      ..._.map(
        _.find(processors, { processor_id: ids[0] })?.children,
        (v) => v.value,
      ),
    )
  return result
}

export const getProcessName = (data: Processor[], ids: string[]) => {
  return _.map(
    ids,
    (value) => _.find(data, { processor_id: value })?.name,
  ).join('/')
}

const getProcessSelect = (data: Processor[], id: string) => {
  const result = []
  if (id && id !== '0') {
    result.unshift(id)
    const processor = _.find(data, { processor_id: id })
    if (processor?.parent_id)
      !!+processor?.parent_id && result.unshift(processor?.parent_id)
  }
  return result
}

/**
 * 没有开启多仓时，正常请求各个入库页面的列表
 * @param fn
 */
export const execMutiWarehouseJudge = (fn: Function) => {
  if (!globalStore.isOpenMultWarehouse) {
    fn()
  }
}

/**
 * 各出入的出\入库数的转换
 * @param val 传入的字符串数字
 * @returns 返回的number或者null
 */
export const transferAvaiValue = (val: string) => {
  return val ? _.toNumber(val) : null
}
