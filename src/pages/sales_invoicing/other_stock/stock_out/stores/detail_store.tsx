import { runInAction, makeAutoObservable } from 'mobx'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { Tip } from '@gm-pc/react'
import _ from 'lodash'
import { PagingResult } from 'gm_api/src/common'
import {
  adapterMoreSelectComData,
  isValid,
  getTimestamp,
  toFixedSalesInvoicing,
  sortByMultiRule,
} from '@/common/util'

import {
  UpdateStockSheet,
  CreateStockSheet,
  GetStockSheet,
  ListShelf,
  Shelf,
  ListStockSheet,
  StockSheet,
  StockSheet_SheetType,
  GetStockSheetResponse,
  Status_Code,
  Status_LackOfStockDetail_Detail,
  Additional,
} from 'gm_api/src/inventory'
import { ListSupplier, ListCustomer } from 'gm_api/src/enterprise'
import { ListSkuV2 } from 'gm_api/src/merchandise'
import {
  combineCategoryAndSku,
  getSalesInvoicingSheetData,
  getStockSheetData,
  getSuccessTip,
} from '@/pages/sales_invoicing/util'

import {
  SalesInvoicingSheet,
  ComSupplier,
  ComCustomer,
  ReceiptStatusKey,
  ComSkuItem,
  ComSsuItem,
} from '@/pages/sales_invoicing/interface'
import {
  RECEIPT_TYPE,
  RECEIPT_STATUS,
  RECEIPT_STATUS_KEY_NAME,
} from '@/pages/sales_invoicing/enum'
import {
  defaultReceiptDetail,
  defaultProductDetail,
} from '@/pages/sales_invoicing/receipt_base_data'
import AutoBatchModal from '@/pages/sales_invoicing/components/auto_batch_modal'
import { createSelectedBatchFactory } from '@/pages/sales_invoicing/components/batch_select/util'
import moment from 'moment'
import type { SortItem } from '@/common/interface'
import { getRuleList } from '@/pages/sales_invoicing/util2'
import globalStore from '@/stores/global'

interface RDetail
  extends Omit<SalesInvoicingSheet.StockOutReceiptDetail, 'details'> {
  out_stock_target_type: number
  details: PDetail[]
}

type PDetail = SalesInvoicingSheet.StockOutProductDetail & {
  currStockQuantity?: string
}

type ModalRightFilter = {
  paging: {
    offset: number
    limit: number
  }
  q?: string
  begin_time?: Date
  end_time?: Date
  time_type?: number
  stock_sheet_type?: number
  supplier_ids?: {
    text: string
    value: string
  }
}

const initProductDetail: PDetail = {
  ...defaultProductDetail,
  batch_selected: [],
}

const { target_id, target_name, ...notIncludeTarget } = defaultReceiptDetail

const initReceiptDetail: RDetail = {
  ...notIncludeTarget,
  details: [{ ...initProductDetail }],
  // target_type: StockSheet.TargetType.SHEET_TARGET_TYPE_CUSTOMER,
  sheet_type: RECEIPT_TYPE.otherOut, // 其他出库
  out_stock_target_type: 1,
}

class Store {
  receiptDetail: RDetail = { ...initReceiptDetail }
  productDetails: PDetail[] = [{ ...initProductDetail }]

  supplierList: ComSupplier[] = []
  customerList: ComCustomer[] = []

  allShelfResponse: Shelf[] = []
  /** 库存不足的sku_ids */
  updateStockSheetErrDetails: Status_LackOfStockDetail_Detail[] = []

  receiptLoading = false

  paging: PagingResult = {
    count: '0',
  }

  modalRightFilter = {
    stock_sheet_status: 4,
    with_additional: true,
    without_details: true,
    q: '',
    begin_time: moment().subtract(1, 'month').startOf('D').toDate(),
    end_time: moment().endOf('D').toDate(),
    time_type: 1,
    stock_sheet_type: StockSheet_SheetType.SHEET_TYPE_PURCHASE_IN,
    supplier_ids: undefined,
  }

  sortItem: SortItem = {
    sort_by: '',
    sort_direction: null,
  }

  modalRightData: StockSheet[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clear() {
    this.receiptDetail = { ...initReceiptDetail }
    this.productDetails = [{ ...initProductDetail }]
    this.changeStockSheetErrDetails([])
  }

  get productSelected(): SalesInvoicingSheet.SkuSelectedDetail[] {
    return _.map(this.productDetails, (item) => {
      return {
        spu_id: item.spu_id!,
        spu_name: item.spu_name,
        sku_id: item.sku_id,
        sku_name: item.sku_name,
        sku_base_unit_id: item.sku_base_unit_id,
        sku_base_unit_name: item.sku_base_unit_name,
        sku_type: item.sku_type,
        // 商品分类
        category_id_1: item.category_id_1,
        category_id_2: item.category_id_2,
        category_name_1: item.category_name_1,
        category_name_2: item.category_name_2,
        // 当前库存
        currStockQuantity: item?.currStockQuantity || '0',

        ssu: item.ssu,
      }
    })
  }

  get skuMoney() {
    let total = 0

    _.each(this.productDetails, (item) => {
      total = +Big(total).plus(item?.amount || item?.no_tax_amount || 0)
    })

    return total
  }

  changeModalRightFilter<T extends keyof ModalRightFilter>(
    name: T,
    value: ModalRightFilter[T],
  ) {
    this.modalRightFilter[name] = value
  }

  changeReceiptLoading(bool: boolean) {
    this.receiptLoading = bool
  }

  changeStockSheetErrDetails(updateStockSheetErrDetails = []) {
    this.updateStockSheetErrDetails = updateStockSheetErrDetails
  }

  changeReceiptDetail<T extends keyof RDetail>(field: T, value: RDetail[T]) {
    this.receiptDetail[field] = value
  }

  clearProductList() {
    this.productDetails = [{ ...initProductDetail }]
  }

  changeProductDetailsItem(index: number, changeData: Partial<PDetail>) {
    Object.assign(this.productDetails[index], { ...changeData })
  }

  addProductDetailsItem() {
    this.productDetails.push({ ...initProductDetail })
  }

  deleteProductDetails(index: number) {
    this.productDetails.splice(index, 1)
  }

  pushProductDetails(productDetails: PDetail[]) {
    this.productDetails.push(...productDetails)
  }

  changeSpecificationSelected(index: number, selected: ComSsuItem) {
    // 切换或清空时将该行数据全部清空
    const changeData = {
      ...initProductDetail,
      ...this.productSelected[index],
    }

    if (selected) {
      Object.assign(changeData, {
        unit_id: selected.value,
        ssu_base_unit_id: selected.ssu_base_unit_id,
        ssu_unit_id: selected.unit_id,
        ssu_base_unit_name: selected.ssu_base_unit_name,
        ssu_unit_name: selected.ssu_unit_name,
        ssu_base_unit_rate: +selected.ssu_base_unit_rate,
        ssu_display_name: selected.ssu_display_name,
        ssu_unit_rate: +selected.ssu_unit_rate,
        ssu_unit_type: selected.ssu_unit_type,
      })
    }

    this.productDetails[index] = { ...changeData }
  }

  changeProductNameSelected(index: number, selected: ComSkuItem) {
    // 切换或清空时将该行数据全部清空
    const changeData = {
      ...initProductDetail,
    }
    if (selected) {
      Object.assign(changeData, {
        ...selected,
        sku_name: selected.name,
        sku_id: selected.sku_id,
        category_id_1: selected.category_id_1,
        category_id_2: selected.category_id_2,
        category_name_1: selected.category_name_1,
        category_name_2: selected.category_name_2,
        spu_id: selected.spu_id,
      })
    }

    // Object.assign(this.productDetails[index], { ...changeData })
    runInAction(() => {
      this.productDetails[index] = { ...changeData }
    })
  }

  fetchSupplier() {
    return ListSupplier({ paging: { limit: 999 } }).then((json) => {
      this.supplierList = adapterMoreSelectComData(
        json.response.suppliers!,
        'supplier_id',
      )

      return json
    })
  }

  fetchShelf() {
    return ListShelf({ with_deleted: true }).then((json) => {
      this.allShelfResponse = json.response.shelves

      return json
    })
  }

  fetchSkuList(q: string) {
    return ListSkuV2({
      filter_params: { q, sku_types: [1, 2] },
      paging: { limit: 999 },
      request_data: 1024 + 256,
    })
  }

  getValidProductListData() {
    const result: PDetail[] = []
    _.each(this.productDetails, (item) => {
      if (
        item.sku_id ||
        item.ssu_unit_id ||
        isValid(item.ssu_base_quantity) ||
        isValid(item.ssu_quantity)
      ) {
        // 清除辅助数据
        // const data = _.omit(item, ['shelfSelected', 'uniqueKeyForSelect'])

        result.push({
          ...item,
        })
      }
    })

    return result
  }

  /**
   * 校验数据
   * @returns {{canSubmitType: number}} 0: 不允许提交， 1: 可提交
   */
  verifyData(receiptAction: ReceiptStatusKey, isCheckBatch?: boolean) {
    const postData = this.getValidProductListData()
    let canSubmitType = 1
    if (postData.length === 0) {
      Tip.danger(t('请先添加商品明细'))
      return 0
    }

    let currentIndex = 0
    while (currentIndex < postData.length) {
      const {
        sku_id,
        input_stock: { input },
        batch_selected,
        second_base_unit_id,
        second_base_unit_quantity,
      } = postData[currentIndex]

      if (!sku_id || !isValid(input?.quantity)) {
        Tip.danger(t('商品明细填写不完善'))
        canSubmitType = 0
        break
      } else if (second_base_unit_id !== '0' && !second_base_unit_quantity) {
        Tip.danger(t('请填写入库数(辅助单位)后再提交'))
        canSubmitType = 0
        break
      } else if (isCheckBatch && batch_selected.length === 0) {
        if (receiptAction === 'approved') {
          break
        }
        const OpenAutoBatchModal = () => {
          AutoBatchModal(
            this,
            '/sales_invoicing/other_stock/stock_out/detail?sheet_id=',
          )
        }
        OpenAutoBatchModal()
        return 0
      }
      currentIndex++
    }

    return canSubmitType
  }

  createReceipt(receiptAction: ReceiptStatusKey, isUseAutoBatch = false) {
    const checkBatchStatus = ['submitted', 'approved']
    if (
      !isUseAutoBatch &&
      this.verifyData(
        receiptAction,
        checkBatchStatus.includes(receiptAction),
      ) === 0
    ) {
      return Promise.reject(new Error('校验单据提交错误'))
    }
    this.receiptDetail.details = this.getValidProductListData()

    const keepStatus = ['notApproved', 'cancelApproval']
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

    const data = getStockSheetData(this.receiptDetail, {
      type: 'stockOut',
      sheet_status: RECEIPT_STATUS[statusName],
    })

    const requestParams = {
      stock_sheet: Object.assign(data, {
        warehouse_id: this.receiptDetail.warehouse_id,
      }),
    }

    if (isUseAutoBatch) {
      requestParams.match_batch_commit = true
    }

    return CreateStockSheet({ ...requestParams }, [
      Status_Code.BATCH_DELETED_OR_NOT_EXISTS,
      Status_Code.LACK_OF_STOCK,
    ]).then((json) => {
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
        Tip.success(
          getSuccessTip(statusName, this.receiptDetail.sheet_status) +
            t('成功'),
        )
      }
      return json
    })
  }

  updateReceipt(receiptAction: ReceiptStatusKey, isUseAutoBatch = false) {
    const checkBatchStatus = ['submitted', 'approved']
    if (
      receiptAction !== 'cancelApproval' &&
      !isUseAutoBatch &&
      this.verifyData(
        receiptAction,
        checkBatchStatus.includes(receiptAction),
      ) === 0
    ) {
      return Promise.reject(new Error('校验单据提交错误'))
    }
    this.receiptDetail.details = this.productDetails

    const keepStatus = ['notApproved', 'cancelApproval']
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

    const data = getStockSheetData(this.receiptDetail, {
      type: 'stockOut',
      sheet_status: RECEIPT_STATUS[statusName],
    })

    const requestParams = {
      stock_sheet: Object.assign(data, {
        warehouse_id: this.receiptDetail.warehouse_id,
      }),
      stock_sheet_id: this.receiptDetail.stock_sheet_id,
    }

    if (isUseAutoBatch) {
      requestParams.match_batch_commit = true
    }

    return UpdateStockSheet(
      {
        ...requestParams,
      },
      [Status_Code.BATCH_DELETED_OR_NOT_EXISTS, Status_Code.LACK_OF_STOCK],
    ).then((json) => {
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
        Tip.success(
          getSuccessTip(statusName, this.receiptDetail.sheet_status) +
            t('成功'),
        )
      }
      return json
    })
  }

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

  // 工具函数，处理复制入库单的数据
  combineProductItemUtil(additional: Additional, productDetail: PDetail) {
    const { category_map, sku_map } = additional
    const skuinfos = combineCategoryAndSku(category_map, sku_map)

    // 处理复制入库单情况
    /** 默认选中的批次 */
    const batchSelected = []
    const batch = productDetail?.batches?.create_batches![0]
    const sku = skuinfos![batch?.sku_id]!
    const relation_sub_batchInfo =
      additional?.sub_batches?.[batch?.batch_id]?.sub_batches[batch?.shelf_id]

    /** 当前剩余库存 */
    const currStockQuantity = relation_sub_batchInfo?.stock?.base_unit?.quantity
    // 批次库存为 0 商品的不展示了
    if (!currStockQuantity || +currStockQuantity === 0) {
      // Tip.danger(t('批次库存不足'))
      return undefined
    }

    productDetail.currStockQuantity = currStockQuantity
    batchSelected.push(
      Object.assign(relation_sub_batchInfo, {
        ...createSelectedBatchFactory(sku, relation_sub_batchInfo),
        sku_base_quantity: +currStockQuantity,
        sku_base_quantity_show: +currStockQuantity,
        ssu_quantity_show: toFixedSalesInvoicing(
          Big(currStockQuantity).div(+productDetail?.sku_unit_rate),
        ),
      }),
    )
    let amount = 0
    _.each(batchSelected, (selected) => {
      amount = +Big(amount).plus(
        Big(selected.batch_average_price || 0).times(
          selected.sku_base_quantity || 0,
        ),
      )
    })

    const newItem = Object.assign(
      _.omit(productDetail, [
        'detail_id',
        'is_by_product',
        'origin_stock',
        'production_task_id',
        'production_task_serial_no',
        'related_detail_id',
        'replace_batch_id',
        'shelf_id',
        'stock',
        'target_customer_id',
      ]),
      {
        batch_selected: batchSelected,
        amount,
      },
    )
    return newItem
  }

  adapterStockSheet(
    res: GetStockSheetResponse,
    isCopy?: boolean,
  ): boolean | undefined {
    const {
      additional: { sku_stocks, skuinfos },
    } = res
    const data = getSalesInvoicingSheetData(res, 'stockOut', {
      shelfList: this.allShelfResponse,
    })

    const productDetails = _.map(data.details, (item) => {
      if (!isCopy) {
        const sku = skuinfos?.[item.sku_id]
        return {
          ...item,
          currStockQuantity:
            sku_stocks?.[item.sku_id]?.stock?.base_unit?.quantity || '0',
          units: sku?.sku?.units,
          sku_base_unit_id: sku?.sku?.base_unit_id,
          second_base_unit_name: globalStore.getUnitName(
            item.second_base_unit_id,
          ), // 辅助单位名称
        }
      }
      // 处理复制入库单情况
      const conbinedItem = this.combineProductItemUtil(res.additional, item)

      return conbinedItem
    })
    // 如果当前库存全是0
    if (productDetails.every((item) => item === undefined)) {
      Tip.danger(t('该批次已全部出库'))
      return false
    }
    // 是不是入库单操作：复制入库单，更新productDetails即可，无需重新赋值
    if (isCopy) {
      this.pushProductDetails(productDetails.filter((item) => item))
      return
    }

    const { warehouse_id } = res.stock_sheet

    this.receiptDetail = {
      ...data,
      out_stock_target_type: data.target_id !== '0' ? 1 : 2,
      warehouse_name:
        (warehouse_id && res.additional.warehouses?.[warehouse_id]?.name) || '',
    }
    this.productDetails = productDetails
    return undefined
  }

  fetchStockSheet(stock_sheet_id: string) {
    return GetStockSheet({
      stock_sheet_id: stock_sheet_id,
      with_additional: true,
    })
  }

  /**
   * 区分fetchStockSheet(这个不做adapter)，需要保证adapter依赖数据已经拉取到才用这个
   * @param sheet_id string
   * @param isCopy 是否是复制入库单进来的，默认false
   */
  fetchAndAdapterStockSheet(sheet_id: string, isCopy = false) {
    return this.fetchStockSheet(sheet_id).then((json) => {
      const isAllStockOut = this.adapterStockSheet(json.response, isCopy)
      return Object.assign(json, {
        isAllStockOut: isAllStockOut, // 是否全部库存为0
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
    return this.fetchAndAdapterStockSheet(this.receiptDetail.stock_sheet_id)
      .then(() => {
        this.changeReceiptLoading(false)
        return null
      })
      .catch(() => {
        this.changeReceiptLoading(false)
      })
  }

  fetchCustomer() {
    return ListCustomer({ paging: { limit: 999 } }).then((json) => {
      this.customerList = adapterMoreSelectComData(
        json.response.customers!,
        'customer_id',
        'name',
      )
      return json
    })
  }

  /** 获取入库单据数据 */
  fetchStockSheetList(params) {
    const { begin_time, end_time, supplier_ids } = this.modalRightFilter
    const req = Object.assign(
      {},
      {
        ...this.modalRightFilter,
        begin_time: getTimestamp(moment(begin_time).startOf('D').toDate()),
        end_time: getTimestamp(moment(end_time).endOf('D').toDate()),
        supplier_ids: supplier_ids ? [supplier_ids?.value] : supplier_ids,
        paging: params.paging,
      },
    )

    return ListStockSheet(req).then((json) => {
      this.modalRightData = json.response.stock_sheets
      this.paging = json.response.paging
      return json.response
    })
  }

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
}

export default new Store()
export type { PDetail, RDetail }
