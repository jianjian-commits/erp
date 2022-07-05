import { makeAutoObservable, runInAction } from 'mobx'
import _ from 'lodash'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { Tip } from '@gm-pc/react'

import {
  ListMaterialOrderResponse,
  ListProcessor,
  MaterialOrder,
  Processor,
} from 'gm_api/src/production'
import {
  CreateMaterialOutStockSheet,
  GetMaterialOutStockSheet,
  UpdateMaterialOutStockSheet,
  ListShelf,
} from 'gm_api/src/inventory'
import {
  CreateMaterialOutStockSheetRequest,
  MaterialOutStockSheet,
  MaterialOutStockSheetDetail,
  GetMaterialOutStockSheetResponse,
  Shelf,
  Status_Code,
  Status_LackOfStockDetail_Detail,
  Additional,
  SkuStock,
} from 'gm_api/src/inventory/types'

import { Sku } from 'gm_api/src/merchandise'

import {
  isValid,
  sortByMultiRule,
  formatDataToTree,
  toFixedSalesInvoicing,
  getTimestamp,
} from '@/common/util'

import type { SortItem } from '@/common/interface'

import {
  ComShelf,
  ComSkuItem,
  ReceiptStatusKey,
} from '@/pages/sales_invoicing/interface'

import {
  RECEIPT_STATUS,
  RECEIPT_STATUS_KEY_NAME,
  RECEIPT_TYPE,
} from '@/pages/sales_invoicing/enum'

import { getSuccessTip, getProcessName } from '@/pages/sales_invoicing/util'
import {
  converNum2StringOfObj,
  getRuleList,
} from '@/pages/sales_invoicing/util2'
import { BatchData } from '@/pages/sales_invoicing/components/batch_select/util'
import AutoBatchModal from '@/pages/sales_invoicing/components/auto_batch_modal'
import type { LevelProcess } from '@/pages/sales_invoicing/interface'

import { defaultReceiptDetails, defaultProductDetail } from './init_data'
import globalStore from '@/stores/global'

interface ReceiptDetailProps
  extends Omit<
    MaterialOutStockSheet,
    'material_out_stock_sheet_id' | 'warehouse_id' | 'details'
  > {
  material_out_stock_sheet_id?: string | undefined

  // 领用部门
  processor_ids?: string[]
  processor_name?: string
  // 仓库名称
  warehouse_name?: string
  // 建单人
  creator_name?: string
  warehouse_id?: string | undefined
  details?: ProductDetailProps
}

interface ProductDetailProps
  extends Omit<
    MaterialOutStockSheetDetail,
    'materail_out_stock_sheet_detail_id' | 'amount'
  > {
  materail_out_stock_sheet_detail_id?: string | undefined
  batch_selected: BatchData[]
  sku_name?: string
  amount: string | number
  out_stock_base_price?: string | number
}

// const getRuleList = ({ sort_by, sort_direction }: SortItem) => {
//   if (!sort_direction) return []

//   return sort_by === 'sku_name' ? [{ sort_by: 'sku_name', sort_direction }] : []
// }

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** header details */
  receiptDetail: ReceiptDetailProps = defaultReceiptDetails
  /** 商品详情 */
  productDetails: ProductDetailProps[] = [defaultProductDetail]

  /* 仅用于查看汇总之后的数据(年前临时解决方案) */
  productDetailsMerged: ProductDetailProps[] = []

  /** 货位列表 */
  shelfList: ComShelf[] = []
  /** 领用部门 */
  processorsList: Processor[] = []
  processors: LevelProcess[] = []

  allShelfResponse: Shelf[] = []
  /** 库存不足的sku_ids */
  updateStockSheetErrDetails: Status_LackOfStockDetail_Detail[] = []
  // 领料单
  materialOrder: MaterialOrder[] = []

  receiptLoading = false

  sortItem: SortItem = {
    sort_by: '',
    sort_direction: null,
  }

  // 单据类型
  sheet_type = RECEIPT_TYPE.materialOut

  additional: Additional = {}

  /** 获取单据详情 */
  fetchStockSheet(sheet_id: string) {
    return GetMaterialOutStockSheet({
      stock_sheet_id: sheet_id,
      with_additional: true,
    })
  }

  /** 按生产计划展示 */
  fetchSummaryData() {
    this.fetchAndAdapterStockSheet(
      this.receiptDetail.material_out_stock_sheet_id!,
      true,
    )
  }

  /**
   * 区分fetchStockSheet(这个不做adapter)，需要保证adapter依赖数据已经拉取到才用这个
   * @param sheet_id string
   * @param union_sku boolean 是否将商品汇总
   */
  fetchAndAdapterStockSheet(sheet_id: string, union_sku = false) {
    return this.fetchStockSheet(sheet_id).then((json) => {
      this.adapterStockSheet(json.response, union_sku)
      return json
    })
  }

  /** 从additional里面获取需要的数据 */
  getAdditionInfo<k>(type: keyof Additional, key: string): k {
    return this.additional[type]?.[key] as k
  }

  getProcessSelect(data: any, id: string) {
    const result = []
    if (id && id !== '0') {
      result.unshift(id)
      const processor = _.find(data, { processor_id: id })
      if (processor?.parent_id)
        !!+processor?.parent_id && result.unshift(processor?.parent_id)
    }
    return result
  }

  /** 处理单据详情 */
  adapterStockSheet(res: GetMaterialOutStockSheetResponse, union_sku = false) {
    const {
      stock_sheet,
      stock_sheet: { creator_id, processor_id, warehouse_id },
      additional,
    } = res

    const processor_ids = this.processorsList?.length
      ? this.getProcessSelect(this.processorsList, processor_id!)
      : []

    this.additional = additional
    const { category_map, batches, suppliers, group_users, sub_batches } =
      additional!

    const { username } = this.getAdditionInfo('group_users', creator_id!)
    const { name: warehouse_name } = this.getAdditionInfo(
      'warehouses',
      warehouse_id!,
    )

    this.receiptDetail = {
      ...stock_sheet,
      creator_name: username,
      // 领用部门
      processor_ids,
      processor_name: getProcessName(this.processorsList, processor_ids),
      warehouse_name: (warehouse_id && warehouse_name) || '', // 仓库名字
      out_stock_time:
        stock_sheet.out_stock_time && stock_sheet.out_stock_time !== '0'
          ? stock_sheet.out_stock_time
          : getTimestamp(new Date()),
    }

    this.productDetails = stock_sheet.details!.map((item) => {
      const { sku_id, batch_details, second_base_unit_id } = item
      const sku_map = this.getAdditionInfo<Sku>('sku_map', sku_id)
      const currStockQuantity = this.getAdditionInfo<SkuStock>(
        'sku_stocks',
        sku_id,
      )?.stock?.base_unit?.quantity

      const { category1_id, category2_id, category3_id } = sku_map

      // 虚拟批次
      const virtualBatchList =
        batch_details
          ?.filter((item) => item.is_virtual_batch === true)
          .map((j) => {
            const { stock, input_stock, batch_parent_id } = j

            const batches_obj = batches![batch_parent_id!]

            return {
              ...j,
              batch_serial_no: '虚拟批次号',
              batch_average_price: +stock!.base_unit?.price!,
              sku_base_quantity: +input_stock?.input?.quantity!,
              sku_base_quantity_show: toFixedSalesInvoicing(
                +input_stock?.input?.quantity!,
              ),
              sku_base_unit_name: globalStore.getUnit(
                stock?.base_unit?.unit_id!,
              ).text!,
              sku_stock_base_quantity: stock?.base_unit?.quantity!,
              in_stock_time: batches_obj ? batches_obj?.in_stock_time : '',
              batch_delete_time: batches_obj ? batches_obj?.delete_time : '',
              supplier_name: suppliers![batches_obj.supplier_id]?.name ?? '-',
              purchaser_name:
                group_users![batches_obj?.purchaser_id]?.name ?? '-',
            }
          }) ?? []

      // 非虚拟批次
      const noVirtualBatchList =
        JSON.stringify(batches) === '{}'
          ? []
          : batch_details
              ?.filter((item) => item.is_virtual_batch === false)
              .map((item) => {
                const batch_obj = batches![item.batch_parent_id!]
                return {
                  ...batches![item.batch_parent_id!],
                  // 使用 batch_details 里面的库存
                  ...item,
                  parent_id: item.batch_parent_id,
                  batch_delete_time: batch_obj ? batch_obj?.delete_time : '',
                  in_stock_time: batch_obj ? batch_obj?.in_stock_time : '',
                  supplier_name:
                    suppliers![batch_obj?.supplier_id]?.name ?? '-',
                  purchaser_name:
                    group_users![batch_obj?.purchaser_id]?.name ?? '-',
                  // 获取子批次的 batch_id
                  batch_id:
                    sub_batches![item.batch_parent_id!]?.sub_batches[
                      item?.shelf_id!
                    ]?.batch_id ?? '',
                }
              })

      const categories = {
        category_name_1:
          category1_id !== '0'
            ? category_map?.[category1_id!].category_name
            : '',
        category_name_2:
          category2_id !== '0'
            ? category_map?.[category2_id!].category_name
            : '',
        category_name_3:
          category3_id !== '0'
            ? category_map?.[category3_id!].category_name
            : '',
      }

      const sku_maps = {
        sku_name: sku_map!.name,
        sku_base_unit_id: sku_map?.base_unit_id!,
        sku_type: sku_map?.sku_type!,
        units: sku_map?.units,
        sku_base_unit_name: globalStore.getUnitName(sku_map?.base_unit_id!),
        second_base_unit_ratio: sku_map?.second_base_unit_ratio,
        second_base_unit_id: sku_map?.second_base_unit_id,
      }
      return {
        ...item,
        // 非后端需要的参数
        ...sku_maps,
        ...categories,
        no_tax_amount: item.amount, // 出库成本
        operator_name:
          item.operator_id && item.operator_id !== '0'
            ? this.getAdditionInfo('group_users', item.operator_id)?.username
            : '-',
        batch_selected: noVirtualBatchList
          ?.map((item) => {
            const { stock, input_stock } = item
            return {
              ...item,
              batch_average_price: +stock!.base_unit?.price!,
              sku_base_quantity: +input_stock?.input?.quantity!,
              sku_base_quantity_show: toFixedSalesInvoicing(
                +input_stock?.input?.quantity!,
              ),
              sku_base_unit_name: globalStore.getUnit(
                stock?.base_unit?.unit_id!,
              ).text!,
              sku_stock_base_quantity: stock?.base_unit?.quantity!,
            }
          })
          .concat(virtualBatchList),
        base_quantity: item.input_stock.input?.quantity,
        no_tax_base_price: item.input_stock?.input?.price,
        second_base_unit_name:
          globalStore.getUnitName(item?.second_base_unit_id) ?? '',
        currStockQuantity, // 当前库存
      }
    })

    if (union_sku) {
      // 如果是请求合并之后的数据，则不需要更新原productDetails，
      this.productDetailsMerged = this.productDetails
    }
  }

  get totalPrice() {
    let total = 0

    _.each(this.productDetails, (item) => {
      total = +Big(total).plus(item.amount || 0)
    })

    return total
  }

  changeStockSheetErrDetails(updateStockSheetErrDetails = []) {
    this.updateStockSheetErrDetails = updateStockSheetErrDetails
  }

  /** 商品名称选择 */
  changeProductNameSelected(index: number, selected: ComSkuItem) {
    const changeData = {
      ...defaultProductDetail,
    }

    runInAction(() => {
      this.productDetails[index] = Object.assign(changeData, { ...selected })
    })
  }

  /** 改变商品明细触发 */
  changeProductDetailsItem(
    index: number,
    changeData: Partial<ProductDetailProps>,
  ) {
    Object.assign(this.productDetails[index], { ...changeData })
  }

  handleScanData(data: any) {
    // 过滤没有商品的数据
    const productList = _.filter(this.productDetails, ({ sku_id }) => sku_id)
    _.each(data, (item) => {
      const { base_quantity, unit_id, second_base_unit_ratio } = item

      const isValidValue = !_.isNil(base_quantity)
      const secondInputValue = isValidValue
        ? +Big(base_quantity).div(+second_base_unit_ratio || 1)
        : ''
      productList.push({
        ...defaultProductDetail,
        ...item,
        input_stock: {
          input: {
            unit_id,
            quantity: toFixedSalesInvoicing(base_quantity),
          },
          input2: {
            unit_id,
            quantity: base_quantity,
          },
        },
        second_base_unit_quantity: toFixedSalesInvoicing(secondInputValue || 0),
      })
    })
    this.productDetails = productList as ProductDetailProps[]
  }

  /** 商品名称排序 */
  sortProductList({ sort_by, sort_direction }: SortItem) {
    let sortItem: SortItem = {} as SortItem
    if (!sort_direction) {
      sortItem = { sort_by: '', sort_direction: null }
    } else {
      sortItem = { sort_by, sort_direction }
      this.productDetails = sortByMultiRule(
        this.productDetails,
        getRuleList(sortItem),
      )
    }
    this.sortItem = sortItem
  }

  /**
   * @description 校验商品数据必填
   * @returns {{canSubmitType: number}} 0: 不允许提交， 1: 可提交
   */
  verifyData(receiptAction: ReceiptStatusKey, isCheckBatch?: boolean) {
    const postData = this.getValidProductListData()
    let currentIndex = 0
    let canSubmitType = 1

    if (postData.length === 0) {
      Tip.danger(t('请先添加商品明细'))
      canSubmitType = 0
    }

    while (currentIndex < postData.length) {
      const {
        sku_id,
        input_stock: { input },
        // production_task_id,
        batch_selected,
        second_base_unit_id,
        second_base_unit_quantity,
      } = postData[currentIndex]

      if (sku_id === '0' || !isValid(input?.quantity)) {
        Tip.danger(t('商品明细填写不完善'))
        canSubmitType = 0
        break
      }

      if (second_base_unit_id !== '0' && !second_base_unit_quantity) {
        Tip.danger(t('请填写入库数(辅助单位)后再提交'))
        canSubmitType = 0
        break
      }

      // if (production_task_id === '0') {
      //   Tip.danger(t('请选择生产计划后再提交'))
      //   canSubmitType = 0
      //   break
      // }
      if (isCheckBatch && batch_selected.length === 0) {
        if (receiptAction === 'approved') {
          break
        }
        const OpenAutoBatchModal = () => {
          AutoBatchModal(
            this,
            '/sales_invoicing/produce/picking_stock_out/detail?sheet_id=',
            'material',
          )
        }
        OpenAutoBatchModal()
        canSubmitType = 0
      }
      currentIndex++
    }

    return canSubmitType
  }

  /**
   * @returns true: 不通过, false: 通过
   */
  isInvalidReceipt(receiptAction: ReceiptStatusKey, isCheckBatch?: boolean) {
    if (this.verifyData(receiptAction, isCheckBatch) === 0) {
      return true
    }
    if (this.totalPrice < 0) {
      Tip.danger(t('入库金额不能小于0'))
      return true
    }

    return false
  }

  validateBatchStatus(
    receiptAction: ReceiptStatusKey,
    isUseAutoBatch: boolean,
    type: 'create' | 'update',
  ): any {
    /** 更新和创建的条件判断 */
    const defaultCondition =
      !isUseAutoBatch &&
      this.isInvalidReceipt(
        receiptAction,
        ['submitted', 'approved'].includes(receiptAction),
      )

    const finallyCondition =
      type === 'create'
        ? defaultCondition
        : receiptAction !== 'cancelApproval' && defaultCondition

    return !finallyCondition
  }

  /** 抽出公共处理参数statusName的部分 */
  getStatusName(receiptAction: ReceiptStatusKey) {
    const keepStatus = ['notApproved', 'cancelApproval']
    /** 至少给个初始化 */
    let statusName: ReceiptStatusKey
    if (
      keepStatus.includes(
        RECEIPT_STATUS_KEY_NAME[this.receiptDetail.sheet_status],
      ) &&
      receiptAction === 'toBeSubmitted' // 驳回和反审下保存草稿保持原有状态
    ) {
      statusName = RECEIPT_STATUS_KEY_NAME[this.receiptDetail.sheet_status]
    } else {
      statusName = receiptAction
    }

    return statusName
  }

  /** 获取验证后的商品列表数据 */
  getValidProductListData() {
    const result: ProductDetailProps[] = []
    _.each(this.productDetails, (item) => {
      if (item.sku_id !== '0') {
        result.push({
          ...item,
          batch_details: item.batch_selected,
        })
      }
    })

    return result
  }

  /** 获取请求参数 */
  getCreateParams(statusName: ReceiptStatusKey, isUseAutoBatch: boolean) {
    const details = this.productDetails.map((item) => {
      return {
        ...item,
        batch_details:
          item.batch_details && item.batch_details.length > 0
            ? item.batch_details
            : item.batch_selected.map((item) => {
                // 参数 batch_detail_id 取值 parent_id
                return {
                  ..._.pick(item, [
                    'batch_serial_no',
                    'input_stock',
                    'stock',
                    'shelf_id',
                  ]),
                  batch_parent_id: item.parent_id,
                  is_virtual_batch: isUseAutoBatch,
                }
              }),
        batch_selected: null,
        sku_unit_id: item.sku_id,
        input_stock: {
          input: {
            ...item.input_stock.input,
            unit_id: item.base_unit_id,
            price: '0',
          },
          input2: {
            ...item.input_stock.input2,
            unit_id: item.base_unit_id,
            price: '0',
          },
        },
      }
    })

    const { processor_ids, material_order_id } = this.receiptDetail!

    const stock_sheet = {
      ...this.receiptDetail,
      processor_id: processor_ids
        ? processor_ids![processor_ids!.length - 1]
        : '0',
      amount: this.totalPrice.toString(),
      sheet_status: RECEIPT_STATUS[statusName],
      details: converNum2StringOfObj(details),
      material_order_serial_no: this.materialOrder.find(
        (x) => x.material_order_id === material_order_id,
      )?.serial_no,
    }

    const requestParams: CreateMaterialOutStockSheetRequest = {
      stock_sheet,
      match_batch_commit: isUseAutoBatch,
    }

    return requestParams
  }

  /** 新建出库 */
  createReceipt(receiptAction: ReceiptStatusKey, isUseAutoBatch = false) {
    // 如果没有满足提交条件, 不请求接口
    if (!this.validateBatchStatus(receiptAction, isUseAutoBatch, 'create')) {
      return Promise.reject(new Error('校验单据提交错误'))
    }
    const statusName = this.getStatusName(receiptAction)
    const requestParams = this.getCreateParams(statusName, isUseAutoBatch)

    return CreateMaterialOutStockSheet({ ...requestParams }, [
      Status_Code.BATCH_DELETED_OR_NOT_EXISTS,
      Status_Code.LACK_OF_STOCK,
    ]).then((json) => {
      this.getBatchReceiptStatus(statusName, json, 'create')
      return json
    })
  }

  /** 更新单据 */
  updateReceipt(receiptAction: ReceiptStatusKey, isUseAutoBatch = false) {
    // 如果没有满足提交条件, 不请求接口
    if (!this.validateBatchStatus(receiptAction, isUseAutoBatch, 'update')) {
      return Promise.reject(new Error('校验单据提交错误'))
    }
    const statusName = this.getStatusName(receiptAction)

    const requestParams = this.getCreateParams(statusName, isUseAutoBatch)

    return UpdateMaterialOutStockSheet(
      {
        ...requestParams,
        stock_sheet_id: this.receiptDetail.material_out_stock_sheet_id,
      },
      [Status_Code.BATCH_DELETED_OR_NOT_EXISTS, Status_Code.LACK_OF_STOCK],
    ).then((json) => {
      this.getBatchReceiptStatus(statusName, json, 'update')
      return json
    })
  }

  /** 创建/更新接口完成后判断批次状况 */
  getBatchReceiptStatus(
    statusName: ReceiptStatusKey,
    json: any,
    type: 'create' | 'update',
  ) {
    if (json.code === Status_Code.BATCH_DELETED_OR_NOT_EXISTS) {
      Tip.danger(t('批次不存在或已被删除'))
      this.handleSubmitError(json.code, json.message)
      throw Promise.reject(new Error(t('批次不存在或已被删除')))
    } else if (json.code === Status_Code.LACK_OF_STOCK) {
      Tip.danger(t('批次库存不足'))
      const {
        message: {
          detail: { details },
        },
      } = json
      this.changeStockSheetErrDetails(details)

      this.handleSubmitError(json.code, json.message)
      throw Promise.reject(new Error(t('批次库存不足')))
    } else {
      if (type === 'update') {
        this.productDetailsMerged = []
      }
      Tip.success(
        getSuccessTip(statusName, this.receiptDetail.sheet_status) + t('成功'),
      )
    }
  }

  /** 错误提交 */
  handleSubmitError(
    code: Status_Code,
    message: { description: string; detail: any },
  ) {
    const errorBatch: { [key: string]: any } = {}
    _.each(message.detail.details, (batch) => {
      if (batch.batch_id) {
        errorBatch[batch.batch_id] = batch
      }
    })

    _.each(this.productDetails, (detail) => {
      _.each(detail.batch_selected, (batch) => {
        if (errorBatch[batch.batch_id]) {
          if (code === Status_Code.BATCH_DELETED_OR_NOT_EXISTS) {
            batch.batch_delete_time = errorBatch[batch.batch_id].delete_time
            detail.batch_selected = detail.batch_selected.slice()
          }

          if (code === Status_Code.LACK_OF_STOCK) {
            batch.stock = errorBatch[batch.batch_id].stock
            batch.ssu_stock_quantity =
              errorBatch[batch.batch_id].stock.sku_unit.quantity
            batch.sku_stock_base_quantity =
              errorBatch[batch.batch_id].stock.base_unit.quantity
            detail.batch_selected = detail.batch_selected.slice()
          }
        }
      })
    })
  }

  /**
   * 更新以及重新获取数据,统一管理loading，防止单据异常操作
   * @param receiptAction 同updateStockSheet
   */
  async updateAndGetReceipt(
    receiptAction: ReceiptStatusKey,
    isUseAutoBatch = false,
  ) {
    this.changeReceiptLoading(true)

    await this.updateReceipt(receiptAction, isUseAutoBatch).catch((err) => {
      this.changeReceiptLoading(false)
      throw Promise.reject(new Error(err))
    })
    return this.fetchAndAdapterStockSheet(
      this.receiptDetail.material_out_stock_sheet_id!,
    )
      .then(() => {
        this.changeReceiptLoading(false)
        return null
      })
      .catch(() => {
        this.changeReceiptLoading(false)
      })
  }

  /** 清空数据 */
  clear() {
    this.receiptDetail = defaultReceiptDetails
    this.productDetails = [{ ...defaultProductDetail }]
    this.productDetailsMerged = []
    this.changeStockSheetErrDetails([])
  }

  /** 改变loading 状态 */
  changeReceiptLoading(bool: boolean) {
    this.receiptLoading = bool
  }

  /** 改边 header details item 触发 */
  changeReceiptDetail<T extends keyof ReceiptDetailProps>(
    field: T,
    value: ReceiptDetailProps[T],
  ) {
    this.receiptDetail[field] = value
  }

  changeReceiptAllDetail(value: ReceiptDetailProps) {
    this.receiptDetail = value
  }

  /** 商品列表 */
  clearProductList() {
    this.productDetails = [{ ...defaultProductDetail }]
  }

  addProductDetailsItem() {
    this.productDetails.push({ ...defaultProductDetail })
  }

  deleteProductDetails(index: number) {
    this.productDetails.splice(index, 1)
  }

  /** 获取货位列表 */
  fetchShelf() {
    return ListShelf({}).then((json) => {
      this.allShelfResponse = json.response.shelves
      return json
    })
  }

  /** 获取领用部门 */
  fetchProcess() {
    return ListProcessor().then((response) => {
      const data = response.response.processors
      this.processorsList = data
      this.processors = formatDataToTree(data, 'processor_id', 'name')
    })
  }

  getMaterialOrder(res: ListMaterialOrderResponse) {
    this.materialOrder = res?.material_orders
    return res?.material_orders
  }
}

export default new Store()
export type { ProductDetailProps }
