import { makeAutoObservable, runInAction } from 'mobx'
import _ from 'lodash'

import {
  ListShelf,
  UpdateStockSheet,
  CreateStockSheet,
  GetStockSheet,
  Shelf,
  GetStockSheetResponse,
  Status_Code,
  Status_LackOfStockDetail_Detail,
} from 'gm_api/src/inventory'
import { ListSupplier } from 'gm_api/src/enterprise'
import {
  SalesInvoicingSheet,
  ComSupplier,
  ComShelf,
  ComSkuItem,
  ReceiptStatusKey,
  ComSsuItem,
} from '@/pages/sales_invoicing/interface'
import {
  RECEIPT_STATUS,
  RECEIPT_STATUS_KEY_NAME,
  RECEIPT_TYPE,
} from '@/pages/sales_invoicing/enum'
import { ListSkuV2 } from 'gm_api/src/merchandise'
import {
  adapterMoreSelectComData,
  isValid,
  sortByMultiRule,
  formatDataToTree,
} from '@/common/util'
import {
  defaultReceiptDetail,
  defaultProductDetail,
} from '@/pages/sales_invoicing/receipt_base_data'
import {
  getSalesInvoicingSheetData,
  getStockSheetData,
  getSuccessTip,
} from '@/pages/sales_invoicing/util'
import { ListProcessor, Processor } from 'gm_api/src/production'
import Big from 'big.js'

import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { BatchData } from '@/pages/sales_invoicing/components/batch_select/util'
import type { SortItem } from '@/common/interface'
import AutoBatchModal from '@/pages/sales_invoicing/components/auto_batch_modal'
import type { LevelProcess } from '@/pages/sales_invoicing/interface'

type MySortItem = SortItem<'sku_name' | ''>

interface RDetail
  extends Omit<SalesInvoicingSheet.PlanStockOutReceiptDetail, 'details'> {
  details: PDetail[]
}

interface PDetail extends SalesInvoicingSheet.PlanStockOutProductDetail {
  batch_selected: BatchData[]
  currStockQuantity?: string
}

const initProductDetail: PDetail = {
  ...defaultProductDetail,
  batch_selected: [],
  production_task_serial_no: '',
}

const initReceiptDetail: RDetail = {
  ...defaultReceiptDetail,
  processor_ids: [],
  details: [{ ...initProductDetail }],
  sheet_type: RECEIPT_TYPE.materialOut,
}

const getRuleList = ({ sort_by, sort_direction }: SortItem) => {
  if (!sort_direction) return []

  return [{ sort_by: sort_by, sort_direction }]
}

class Store {
  receiptDetail: RDetail = { ...initReceiptDetail }
  productDetails: PDetail[] = [{ ...initProductDetail }]
  /* 仅用于查看汇总之后的数据(年前临时解决方案) */
  productDetailsMerged: PDetail[] = []
  shelfList: ComShelf[] = []
  supplierList: ComSupplier[] = []
  processorsList: Processor[] = []
  processors: LevelProcess[] = []

  allShelfResponse: Shelf[] = []
  /** 库存不足的sku_ids */
  updateStockSheetErrDetails: Status_LackOfStockDetail_Detail[] = []

  receiptLoading = false

  sortItem: MySortItem = {
    sort_by: '',
    sort_direction: null,
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clear() {
    this.receiptDetail = { ...initReceiptDetail }
    this.productDetails = [{ ...initProductDetail }]
    this.productDetailsMerged = []
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
        category_name: item?.category_name,
        // 当前库存
        currStockQuantity: item?.currStockQuantity || '0',

        ssu: item.ssu,
      }
    })
  }

  get totalPrice() {
    let total = 0

    _.each(this.productDetails, (item) => {
      total = +Big(total).plus(item.amount || item.no_tax_amount || 0)
    })

    return total
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

  changeReceiptAllDetail(value: RDetail) {
    this.receiptDetail = value
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

  changeSpecificationSelected(index: number, selected: ComSsuItem) {
    // 切换或清空时将该行数据(除商品）全部清空
    const changeData = {
      ...initProductDetail,
      ...this.productSelected[index],
    }

    if (selected) {
      Object.assign(changeData, {
        unit_id: selected.value,
        ssu_base_unit_id: selected.ssu_base_unit_id,
        ssu_base_unit_name: selected.ssu_base_unit_name,
        ssu_unit_name: selected.ssu_unit_name,
        ssu_unit_id: selected.unit_id,
        ssu_display_name: selected.ssu_display_name,
        ssu_unit_rate: +selected.ssu_unit_rate,
        ssu_base_unit_rate: selected.ssu_base_unit_rate,
        ssu_unit_type: selected.ssu_unit_type,
      })
    }

    this.productDetails[index] = { ...changeData }
  }

  changeProductNameSelected(index: number, selected: ComSkuItem) {
    // 切换或清空时将该行数据全部清空
    const changeData = {
      ...initProductDetail,
      shelf_id: '0',
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
        category_name: selected?.category_name,
      })
    }

    // Object.assign(this.productDetails[index], { ...changeData })
    runInAction(() => {
      this.productDetails[index] = { ...changeData }
    })
  }

  handleScanData(data: any) {
    // 过滤没有商品的数据
    const productList = _.filter(this.productDetails, ({ sku_id }) => sku_id)
    _.each(data, (item) => {
      const { sku_base_quantity } = item
      _.set(item, 'input_stock', {
        input: {
          quantity: sku_base_quantity,
        },
        input2: {
          quantity: sku_base_quantity,
        },
      })
      productList.push({
        ...initProductDetail,
        ...item,
      })
    })
    this.productDetails = productList as PDetail[]
  }

  sortProductList({ sort_by, sort_direction }: MySortItem) {
    let sortItem: MySortItem = {} as MySortItem
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

  sortProductListMerged({ sort_by, sort_direction }: MySortItem) {
    let sortItem: MySortItem = {} as MySortItem
    if (!sort_direction) {
      sortItem = { sort_by: '', sort_direction: null }
    } else {
      sortItem = { sort_by, sort_direction }
      this.productDetailsMerged = sortByMultiRule(
        this.productDetailsMerged,
        getRuleList(sortItem),
      )
    }
    this.sortItem = sortItem
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
        base_quantity,
        // ssu_quantity,
        // production_task_id,
        batch_selected,
        // ssu_base_unit_rate,
      } = postData[currentIndex]

      if (
        !sku_id ||
        !isValid(base_quantity)
        // !isValid(ssu_quantity)
      ) {
        Tip.danger(t('商品明细填写不完善'))
        canSubmitType = 0
        break
      }
      // else if (!production_task_id) {
      //   Tip.danger(t('请选择生产计划后再提交'))
      //   canSubmitType = 0
      //   break
      // }
      else if (isCheckBatch && batch_selected.length === 0) {
        if (receiptAction === 'approved') {
          break
        }
        const OpenAutoBatchModal = () => {
          AutoBatchModal(
            this,
            '/sales_invoicing/produce/picking_stock_out/detail?sheet_id=',
          )
        }
        OpenAutoBatchModal()
        return 0
      }
      currentIndex++
    }

    return canSubmitType
  }

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
    return ListShelf({}).then((json) => {
      this.allShelfResponse = json.response.shelves

      return json
    })
  }

  fetchProcess() {
    return ListProcessor().then((response) => {
      const data = response.response.processors
      this.processorsList = data
      this.processors = formatDataToTree(data, 'processor_id', 'name')
    })
  }

  fetchSkuList(q: string) {
    return ListSkuV2({
      filter_params: { q, sku_types: [1, 2] },
      paging: { limit: 999 },
      request_data: 1024 + 256,
    })
  }

  createReceipt(receiptAction: ReceiptStatusKey, isUseAutoBatch = false) {
    const checkBatchStatus = ['submitted', 'approved']
    if (
      !isUseAutoBatch &&
      this.isInvalidReceipt(
        receiptAction,
        checkBatchStatus.includes(receiptAction),
      )
    ) {
      return Promise.reject(new Error('校验单据提交错误'))
    }
    // this.receiptDetail.details = this.getValidProductListData().concat(
    //   this.getValidTurnoverData(),
    // )
    this.receiptDetail.details = this.getValidProductListData()

    // this.receiptDetail.turnoverList = this.turnoverList
    this.receiptDetail.total_price = this.totalPrice.toString()

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
        // TODO: 领料单号
        // material_order_id: 'string',
        // material_order_serial_no: 'string'
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
          message: { details },
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
      this.isInvalidReceipt(
        receiptAction,
        checkBatchStatus.includes(receiptAction),
      )
    ) {
      return Promise.reject(new Error('校验单据提交错误'))
    }

    this.receiptDetail.details = this.getValidProductListData()

    this.receiptDetail.total_price = this.totalPrice.toString()

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

    const stock_sheet = Object.assign(data, {
      warehouse_id: this.receiptDetail.warehouse_id,
    })

    const requestParams = {
      stock_sheet: stock_sheet,
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
        Tip.danger(t('批次库存不足'))

        this.handleSubmitError(json.code, json.message)
        throw Promise.reject(new Error(t('批次库存不足')))
      } else {
        this.productDetailsMerged = []
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

  adapterStockSheet(res: GetStockSheetResponse, union_sku = false) {
    const {
      stock_sheet: { warehouse_id },
      additional,
    } = res
    this.receiptDetail = {
      ...getSalesInvoicingSheetData(res, 'planStockOut', {
        shelfList: this.allShelfResponse,
        processors: this.processorsList,
      }),
      warehouse_name:
        (warehouse_id && additional.warehouses?.[warehouse_id]?.name) || '',
    }
    const details = _.map(this.receiptDetail.details, (item) => {
      item.currStockQuantity =
        res?.additional?.sku_stocks?.[item.sku_id]?.stock?.base_unit
          ?.quantity || '0'
      return item
    })

    if (union_sku) {
      // 如果是请求合并之后的数据，则不需要更新原productDetails，
      this.productDetailsMerged = details
      return
    }

    this.productDetails = details
  }

  fetchStockSheet(sheet_id: string, union_sku?: boolean) {
    return GetStockSheet({
      stock_sheet_id: sheet_id,
      with_additional: true,
      union_sku,
    })
  }

  /**
   * 区分fetchStockSheet(这个不做adapter)，需要保证adapter依赖数据已经拉取到才用这个
   * @param sheet_id string
   * @param union_sku boolean 是否将商品汇总
   */
  fetchAndAdapterStockSheet(sheet_id: string, union_sku = false) {
    return this.fetchStockSheet(sheet_id, union_sku).then((json) => {
      this.adapterStockSheet(json.response, union_sku)
      return json
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

  fetchSummaryData() {
    this.fetchAndAdapterStockSheet(this.receiptDetail.stock_sheet_id, true)
  }
}

export default new Store()
export type { PDetail, RDetail }
