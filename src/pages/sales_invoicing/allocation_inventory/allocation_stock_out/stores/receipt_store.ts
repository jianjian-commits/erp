import { makeAutoObservable, runInAction } from 'mobx'
import _ from 'lodash'

import {
  UpdateStockSheet,
  CreateStockSheet,
  GetStockSheet,
  StockSheet_TargetType,
  ListShelf,
  Shelf,
  GetStockSheetResponse,
  Status_Code,
  Status_LackOfStockDetail_Detail,
  Warehouse,
} from 'gm_api/src/inventory'
import { ListSupplier, GroupUser } from 'gm_api/src/enterprise'
import {
  SalesInvoicingSheet,
  ComSupplier,
  ComSkuItem,
  ReceiptStatusKey,
  ComSsuItem,
} from '@/pages/sales_invoicing/interface'
import {
  RECEIPT_TYPE,
  RECEIPT_STATUS,
  RECEIPT_STATUS_KEY_NAME,
} from '@/pages/sales_invoicing/enum'
// 后续可更换为V2
import { ListSku } from 'gm_api/src/merchandise'
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
  combineCategoryAndSku,
} from '@/pages/sales_invoicing/util'
import Big from 'big.js'
import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import AutoBatchModal from '@/pages/sales_invoicing/components/auto_batch_modal'
import type { SortItem } from '@/common/interface'
import { getRuleList } from '@/pages/sales_invoicing/util2'

interface RDetail
  extends Omit<SalesInvoicingSheet.StockOutReceiptDetail, 'details'> {
  out_stock_target_type: number
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

  allShelfResponse: Shelf[] = []
  /** 库存不足的sku_ids */
  updateStockSheetErrDetails: Status_LackOfStockDetail_Detail[] = []

  target_id_parent = ''

  receiptLoading = false

  warehouses: { [key: string]: Warehouse } | undefined = {}

  group_users: { [key: string]: GroupUser } | undefined = {}
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
        ssu_base_unit_id: selected ? selected.ssu_base_unit_id : '',
        ssu_unit_id: selected ? selected.unit_id : '',
        ssu_base_unit_name: selected ? selected.ssu_base_unit_name : '',
        ssu_unit_name: selected ? selected.ssu_unit_name : '',
        ssu_base_unit_rate: selected ? +selected.ssu_base_unit_rate : 1,
        ssu_display_name: selected ? selected.ssu_display_name : '',
        ssu_unit_rate: selected ? +selected.ssu_unit_rate : 1,
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
      const {
        sku_id,
        ssu_base_quantity,
        base_quantity_show,
        batch_selected,
        ssu_base_unit_rate,
        second_base_unit_id,
        second_base_unit_quantity,
      } = postData[currentIndex]
      const total = batch_selected.reduce(
        (a, c) => a + (c.sku_base_quantity ?? 0),
        0,
      )
      const eq =
        total - +Big(ssu_base_quantity ?? 0).times(ssu_base_unit_rate ?? 1)
      if (
        !sku_id ||
        [null, undefined, ''].includes(
          base_quantity_show as string | null | undefined,
        )
      ) {
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

  fetchSupplier() {
    return ListSupplier({ paging: { limit: 999 } }).then((json) => {
      this.supplierList = adapterMoreSelectComData(
        json.response.suppliers!,
        'supplier_id',
      )

      return json
    })
  }

  // 暂时未用到, 先不废弃, 后续更换为 ListSkuV2
  fetchSkuList(q: string) {
    return ListSku({
      q: q,
      paging: { limit: 999 },
      request_data: 1024 + 256,
    }).then((json) => {
      return json
    })
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
      stock_sheet: data,
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

    const requestParams = {
      stock_sheet: data,
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

  fetchShelf() {
    return ListShelf({ with_deleted: true }).then((json) => {
      this.allShelfResponse = json.response.shelves

      return json
    })
  }

  adapterStockSheet(res: GetStockSheetResponse) {
    const {
      additional: { group_users, sku_stocks, sku_map, category_map, units },
    } = res
    const data = getSalesInvoicingSheetData(res, 'stockOut', {
      shelfList: this.allShelfResponse,
    })
    const skuinfos = combineCategoryAndSku(category_map, sku_map)

    this.group_users = group_users
    this.warehouses = res.additional.warehouses
    const customer = res.additional.customers![res.stock_sheet.target_id!] // list数据会过滤已删除的，因此从additional取delete_time

    this.receiptDetail = {
      ...data,
      out_stock_target_type: data.target_id !== '0' ? 1 : 2,
      target_delete_time: customer?.delete_time!,
      target_customized_code: customer?.customized_code,
      target_name: customer ? customer.name : data.target_name,
    }
    // this.productDetails = this.receiptDetail.details
    this.productDetails = _.map(this.receiptDetail.details, (item) => {
      const sku = skuinfos?.[item.sku_id]
      return {
        ...item,
        currStockQuantity:
          sku_stocks?.[item.sku_id]?.stock?.base_unit?.quantity || '0',
        units: sku?.sku?.units,
        sku_base_unit_id: sku?.sku?.base_unit_id,
        second_base_unit_name: units![item.second_base_unit_id]?.name, // 辅助单位
      }
    })
  }

  fetchStockSheet(sheet_id: string) {
    return GetStockSheet({
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
      const {
        additional: { group_users },
      } = json.response
      this.group_users = group_users
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
    return this.fetchAndAdapterStockSheet(this.receiptDetail.stock_sheet_id)
      .then(() => {
        this.changeReceiptLoading(false)
        return null
      })
      .catch(() => {
        this.changeReceiptLoading(false)
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
