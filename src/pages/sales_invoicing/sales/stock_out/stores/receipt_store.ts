import { makeAutoObservable, runInAction } from 'mobx'
import { t } from 'gm-i18n'
import Big from 'big.js'
import _ from 'lodash'
import { Tip } from '@gm-pc/react'

// 接口
import {
  CreateSaleOutStockSheet,
  UpdateSaleOutStockSheet,
  GetSaleOutStockSheet,
  ListShelf,
} from 'gm_api/src/inventory'
import { ListSupplier, ListCustomer } from 'gm_api/src/enterprise'
import { ListSkuV2 } from 'gm_api/src/merchandise'
// 类型
import {
  CreateSaleOutStockSheetRequest,
  UpdateSaleOutStockSheetRequest,
  GetSaleOutStockSheetResponse,
  Status_LackOfStockDetail_Detail,
  StockSheet_TargetType,
  Status_Code,
  Shelf,
} from 'gm_api/src/inventory/types'

import {
  SalesInvoicingSheet,
  ComSupplier,
  ComCustomer,
  ComSkuItem,
  ReceiptStatusKey,
  ComSsuItem,
} from '@/pages/sales_invoicing/interface'
import {
  RECEIPT_TYPE,
  RECEIPT_STATUS,
  RECEIPT_STATUS_KEY_NAME,
} from '@/pages/sales_invoicing/enum'
import {
  adapterMoreSelectComData,
  isValid,
  sortByMultiRule,
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
import AutoBatchModal from '@/pages/sales_invoicing/components/auto_batch_modal'
import type { SortItem } from '@/common/interface'
import { getRuleList } from '@/pages/sales_invoicing/util2'

interface RDetail
  extends Omit<SalesInvoicingSheet.StockOutReceiptDetail, 'details'> {
  out_stock_target_type: number
  order_id?: string | number
  order_serial_no: string
  customer_name?: string
  out_stock_time?: string
  sale_out_stock_sheet_serial_no?: string
  sale_out_stock_sheet_id?: string
  amount?: string
  details: PDetail[]
}

type PDetail = SalesInvoicingSheet.StockOutProductDetail & {
  currStockQuantity?: string
}

const initProductDetail: PDetail = {
  ...defaultProductDetail,
  batch_selected: [],
}

const initReceiptDetail: RDetail = {
  ...defaultReceiptDetail,
  details: [{ ...initProductDetail }],
  target_type: StockSheet_TargetType.SHEET_TARGET_TYPE_CUSTOMER,
  sheet_type: RECEIPT_TYPE.saleOut, // 销售出库
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

  target_id_parent = ''

  receiptLoading = false
  sortItem: SortItem = {
    sort_by: '',
    sort_direction: null,
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
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

  clear() {
    this.receiptDetail = { ...initReceiptDetail }
    this.productDetails = [{ ...initProductDetail }]
    this.changeStockSheetErrDetails([])
  }

  clearProductList() {
    this.productDetails = [{ ...initProductDetail }]
  }

  changeReceiptLoading(bool: boolean) {
    this.receiptLoading = bool
  }

  changeStockSheetErrDetails(updateStockSheetErrDetails = []) {
    this.updateStockSheetErrDetails = updateStockSheetErrDetails
  }

  get totalPrice() {
    let total = 0

    _.each(this.productDetails, (item) => {
      total = +Big(total).plus(item.amount || item.no_tax_amount || 0)
    })

    return total
  }

  changeTargetIdParent(str: string) {
    this.target_id_parent = str
  }

  changeReceiptDetail<T extends keyof RDetail>(field: T, value: RDetail[T]) {
    this.receiptDetail[field] = value
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
    // 切换或清空时将该行数据全部清空
    const changeData = {
      ...initProductDetail,
      ...this.productSelected[index],
    }

    if (selected) {
      Object.assign(changeData, {
        unit_id: selected ? selected.value : '',
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
      })
    }

    runInAction(() => {
      this.productDetails[index] = { ...changeData }
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
      const { sku_id, batch_selected } = postData[currentIndex]

      // const total = batch_selected.reduce(
      //   (a, c) => a + (c.sku_base_quantity ?? 0),
      //   0,
      // )
      // const eq =
      //   total - +Big(ssu_base_quantity ?? 0).times(ssu_base_unit_rate ?? 1)
      if (!sku_id) {
        Tip.danger(t('商品明细填写不完善'))
        canSubmitType = 0
        break
      } /* else if (eq !== 0) {
        const tips =
          eq > 0
            ? t('已选的批次出库数大于商品出库数， 请重新确认出库数')
            : t('已选的批次出库数小于商品出库数， 请重新确认出库数')
        Tip.danger(tips)
        canSubmitType = 0
        break
      } */
      // else if (ssu_base_quantity === 0) {
      //   Tip.danger(t('商品出库数（基本单位）为0无法提交，请填写出库数后再提交'))
      //   canSubmitType = 0
      //   break
      // }
      // else if (ssu_quantity === 0) {
      //   Tip.danger(t('商品出库数（包装单位(废弃)）为0无法提交，请填写出库数后再提交'))
      //   canSubmitType = 0
      //   break
      // }
      else if (isCheckBatch && batch_selected.length === 0) {
        // Tip.danger(t('请选择批次后再提交'))
        // canSubmitType = 0
        if (receiptAction === 'approved') {
          break
        }
        const OpenAutoBatchModal = () => {
          AutoBatchModal(
            this,
            '/sales_invoicing/sales/stock_out/detail?sheet_id=',
          )
        }
        OpenAutoBatchModal()
        return 0
        // break
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
      Tip.danger(t('出库金额不能小于0'))
      return true
    }

    return false
  }

  /** 创建单据 */
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
    this.receiptDetail.details = this.getValidProductListData()
    this.receiptDetail.amount = this.totalPrice.toString()

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

    const requestParams: CreateSaleOutStockSheetRequest = {
      stock_sheet: Object.assign(data, {
        warehouse_id: this.receiptDetail.warehouse_id,
      }),
    }

    if (isUseAutoBatch) {
      requestParams.match_batch_commit = true
    }

    return CreateSaleOutStockSheet({ ...requestParams }, [
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

  /** 更新单据 */
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
    this.receiptDetail.amount = this.totalPrice.toString()

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

    const requestParams: UpdateSaleOutStockSheetRequest = {
      stock_sheet: stock_sheet,
      stock_sheet_id: this.receiptDetail.sale_out_stock_sheet_id,
    }

    if (isUseAutoBatch) {
      requestParams.match_batch_commit = true
    }

    return UpdateSaleOutStockSheet(
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

  /** 处理详情数据 */
  adapterStockSheet(res: GetSaleOutStockSheetResponse) {
    const {
      stock_sheet: { warehouse_id, customer_id, sale_out_stock_sheet_id },
      additional: { customers, sku_stocks, warehouses },
    } = res
    const data = getSalesInvoicingSheetData(res, 'stockOut', {
      shelfList: this.allShelfResponse,
    })

    const customer = customers![customer_id!] // list数据会过滤已删除的，因此从additional取delete_time
    this.receiptDetail = {
      ...data,
      out_stock_target_type: data?.target_type || 1,
      target_delete_time: customer?.delete_time!,
      target_customized_code: customer?.customized_code,
      customer_name: customer ? customer.name : data.customer_name,
      warehouse_name: (warehouse_id && warehouses?.[warehouse_id]?.name) || '',
      sale_out_stock_sheet_id,
    }

    this.productDetails = _.map(this.receiptDetail.details, (item) => {
      return {
        ...item,
        currStockQuantity:
          sku_stocks?.[item.sku_id]?.stock?.base_unit?.quantity || '0',
      }
    })
  }

  /** 获取单个销售出库单 */
  fetchStockSheet(sheet_id: string) {
    // 接口请求
    return GetSaleOutStockSheet({
      stock_sheet_id: sheet_id,
      with_additional: true,
    })
  }

  /**
   * 区分fetchStockSheet(这个不做adapter)，需要保证adapter依赖数据已经拉取到才用这个
   * @param sheet_id string
   */
  fetchAndAdapterStockSheet(sheet_id: string) {
    return this.fetchStockSheet(sheet_id).then((json) => {
      this.adapterStockSheet(json.response)
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
    return this.fetchAndAdapterStockSheet(
      this.receiptDetail.sale_out_stock_sheet_id,
    )
      .then(() => {
        this.changeReceiptLoading(false)
        return null
      })
      .catch(() => {
        this.changeReceiptLoading(false)
      })
  }

  /** 请求货位 */
  fetchShelf() {
    return ListShelf({
      with_deleted: true,
      warehouse_id: this.receiptDetail.warehouse_id,
    }).then((json) => {
      this.allShelfResponse = json.response.shelves

      return json
    })
  }

  /** 请求供应商 */
  fetchSupplier() {
    return ListSupplier({ paging: { limit: 999 } }).then((json) => {
      this.supplierList = adapterMoreSelectComData(
        json.response.suppliers!,
        'supplier_id',
      )

      return json
    })
  }

  /** 请求商品数据 */
  fetchSkuList(q: string) {
    return ListSkuV2({
      filter_params: { q, sku_types: [1, 2] },
      paging: { limit: 999 },
      request_data: 1024 + 256,
    }).then((json) => {
      return json
    })
  }

  /** 请求客户列表 */
  fetchCustomer() {
    return ListCustomer({ paging: { limit: 999 }, level: 2 }).then((json) => {
      this.customerList = adapterMoreSelectComData(
        json.response.customers!,
        'customer_id',
        'name',
      )

      return json
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
