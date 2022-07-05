import { makeAutoObservable } from 'mobx'
import { ListSkuV2 } from 'gm_api/src/merchandise'
import {
  SkuItem,
  SalesInvoicingSheet,
  ReceiptStatusKey,
  ComSsuItem,
} from '@/pages/sales_invoicing/interface'

import {
  defaultReceiptDetail,
  defaultProductDetail,
} from '@/pages/sales_invoicing/receipt_base_data'
import {
  RECEIPT_TYPE,
  RECEIPT_STATUS,
  POSITION_FILTER,
  RECEIPT_STATUS_KEY_NAME,
} from '@/pages/sales_invoicing/enum'
import {
  getSalesInvoicingSheetData,
  getStockSheetData,
  getSuccessTip,
} from '@/pages/sales_invoicing/util'
import {
  GetStockSheet,
  UpdateStockSheet,
  CreateStockSheet,
  GetSkuUnitStock,
  Shelf,
  ListShelf,
} from 'gm_api/src/inventory'
import { isValid } from '@/common/util'

import { SkuUnitStock, SkuStock } from 'gm_api/src/inventory/types'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Tip } from '@gm-pc/react'

interface PositionFilterType {
  productType: string
  productName: string
}

interface RDetail
  extends Omit<SalesInvoicingSheet.StockOutReceiptDetail, 'details'> {
  out_stock_target_type: number
  details: PDetail[]
}

interface PDetail extends SalesInvoicingSheet.StockOutProductDetail {
  sheet_status?: number
  productStock: SkuUnitStock
  surplus_type: string
  base_unit_quantity: string // 账面库存
  sku_unit_quantity: string
  sku_stock_quantity: number // 盈亏数量
  ssu_stock_quantity: number
}

const initProductDetail: PDetail = {
  ...defaultProductDetail,
  surplus_type: '0',
  batch_selected: [],
  base_unit_quantity: '',
  sku_unit_quantity: '',
  sku_stock_quantity: 0,
  ssu_stock_quantity: 0,
  productStock: { sku_unit_stock_id: '' },
}

const { target_id, target_name, ...notIncludeTarget } = defaultReceiptDetail

const initReceiptDetail: RDetail = {
  ...notIncludeTarget,
  details: [{ ...initProductDetail }],
  sheet_type: RECEIPT_TYPE.inventory, // 采购入库
  out_stock_target_type: 1,
}

class Store {
  receiptDetail: RDetail = { ...initReceiptDetail }
  productList: PDetail[] = [{ ...initProductDetail }]
  // 定位
  positionFilter: PositionFilterType = {
    productType: '0',
    productName: '',
  }

  // shelfResponse: Shelf[] = []

  stockList: Record<string, Partial<SkuStock>> = {}

  receiptLoading = false

  shelfResponse: Shelf[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  init() {
    this.receiptDetail = { ...initReceiptDetail }
    this.productList = [{ ...initProductDetail }]
    // 定位
    this.positionFilter = {
      productType: '0',
      productName: '',
    }

    // shelfResponse: Shelf[] = []

    this.stockList = {}

    this.receiptLoading = false

    this.shelfResponse = []
  }

  get productSelected(): SalesInvoicingSheet.SkuSelectedDetail[] {
    return _.map(this.productList, (item) => {
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

        ssu: item.ssu,

        base_unit_quantity: item.base_unit_quantity,
        sku_unit_quantity: item.sku_unit_quantity,
      }
    })
  }

  get getDetailResult() {
    const { productType } = this.positionFilter
    const statistical = {
      all: 0,
      profit: 0,
      loss: 0,
    }
    let detailResult = this.productList
    if (productType !== '0') {
      detailResult = _.filter(this.productList, { surplus_type: productType })
    }
    _.forEach(detailResult, (v) => {
      switch (v.surplus_type) {
        case POSITION_FILTER.all:
          statistical.all += 1
          break
        case POSITION_FILTER.profit:
          statistical.all += 1
          statistical.profit += 1
          break
        case POSITION_FILTER.loss:
          statistical.all += 1
          statistical.loss += 1
          break
      }
    })
    return statistical
  }

  get productFilterList() {
    const { productType } = this.positionFilter
    let productFilterList: PDetail[]
    if (productType !== '0') {
      productFilterList = _.filter(this.productList, {
        surplus_type: productType,
      })
    } else productFilterList = JSON.parse(JSON.stringify(this.productList))
    return productFilterList
  }

  changeReceiptLoading(bool: boolean) {
    this.receiptLoading = bool
  }

  addProductListItem() {
    this.productList.push({ ...initProductDetail })
  }

  deleteProductList(index: number) {
    this.productList.splice(index, 1)
  }

  changeProductListItem(index: number, changeData: object) {
    Object.assign(this.productList[index], { ...changeData })
  }

  changeReceiptDetail<T extends keyof RDetail>(field: T, value: RDetail[T]) {
    this.receiptDetail[field] = value
  }

  clearProductList() {
    this.productList = [{ ...initProductDetail }]
  }

  changePositionFilter<T extends keyof PositionFilterType>(
    name: T,
    value: PositionFilterType[T],
  ) {
    this.positionFilter[name] = value
  }

  clean() {
    this.receiptDetail = { ...initReceiptDetail }
    this.productList = [{ ...initProductDetail }]
    this.stockList = {}
    this.positionFilter = {
      productType: '0',
      productName: '',
    }
  }

  changeProductNameSelected(index: number, selected: SkuItem) {
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

    Object.assign(this.productList[index], { ...changeData })
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
    this.productList[index] = { ...changeData }
  }

  changeProductDetailsItem(index: number, changeData: Partial<PDetail>) {
    Object.assign(this.productList[index], { ...changeData })
  }

  getSkuList(value: string) {
    return ListSkuV2({
      filter_params: { q: value, sku_types: [1, 2] },
      paging: { limit: 999 },
      request_data: 1024 + 256,
    }).then((json) => json)
  }

  getSkuInventory(sku_id: string, unit_id: string) {
    return GetSkuUnitStock({
      sku_id,
      unit_id,
      warehouse_ids: [this.receiptDetail?.warehouse_id],
    }).then((json) => json.response)
  }

  getValidProductListData() {
    const result: PDetail[] = []
    _.each(this.productList, (item) => {
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
  verifyData() {
    const postData = this.getValidProductListData()
    let canSubmitType = 1

    if (postData.length === 0) {
      Tip.danger(t('请先添加商品明细'))
      return 0
    }

    let currentIndex = 0
    while (currentIndex < postData.length) {
      const { ssu_unit_id, sku_id, batch_selected } = postData[currentIndex]
      // if (!sku_id || !ssu_unit_id) {    // 不需要ssu了
      if (!sku_id) {
        Tip.danger(t('商品明细填写不完善'))
        canSubmitType = 0
        break
      } else if (batch_selected.length === 0) {
        Tip.danger(t('请选择批次后再提交'))
        canSubmitType = 0
        break
      }
      currentIndex++
    }

    return canSubmitType
  }

  createReceipt(receiptAction: ReceiptStatusKey) {
    if (this.verifyData() === 0) {
      return Promise.reject(new Error('校验单据提交错误'))
    }
    this.receiptDetail.details = this.productList

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

    const { warehouse_id } = this.receiptDetail
    const data = getStockSheetData(this.receiptDetail, {
      type: 'stockOut',
      sheet_status: RECEIPT_STATUS[statusName],
    })

    const params = {
      stock_sheet: {
        ...data,
        warehouse_id,
        submit_time: '0',
      },
    }

    return CreateStockSheet(params).then((json) => {
      Tip.success(
        getSuccessTip(statusName, this.receiptDetail.sheet_status) + t('成功'),
      )
      return json
    })
  }

  updateReceipt(receiptAction: ReceiptStatusKey) {
    if (this.verifyData() === 0) {
      return Promise.reject(new Error('校验单据提交错误'))
    }
    this.receiptDetail.details = this.productList

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

    return UpdateStockSheet({
      stock_sheet: { ...data, submit_time: '0' },
      stock_sheet_id: this.receiptDetail.stock_sheet_id,
    }).then((json) => {
      Tip.success(
        getSuccessTip(statusName, this.receiptDetail.sheet_status) + t('成功'),
      )
      return json
    })
  }

  fetchStockSheet(sheet_id: string) {
    return GetStockSheet({
      stock_sheet_id: sheet_id,
      with_additional: true,
    }).then((json) => {
      const { additional } = json.response
      const data = getSalesInvoicingSheetData(json.response, 'stockOut', {
        shelfList: this.shelfResponse,
      })
      const warehouse_name = additional?.warehouses?.[data?.warehouse_id]?.name
      this.receiptDetail = {
        ...data,
        out_stock_target_type: data.target_id !== '0' ? 1 : 2,
        warehouse_name: warehouse_name,
      }

      this.productList = this.receiptDetail.details
      this.stockList = additional?.sku_stocks! // 保存已有规格的账面
      return json
    })
  }

  fetchShelf() {
    return ListShelf({}).then((json) => {
      this.shelfResponse = json.response.shelves
      this.shelfResponse.unshift({
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
      })

      return json
    })
  }

  /**
   * 更新以及重新获取数据,统一管理loading，防止单据异常操作
   * @param receiptAction 同updateStockSheet
   */
  async updateAndGetReceipt(receiptAction: ReceiptStatusKey) {
    this.changeReceiptLoading(true)

    await this.updateReceipt(receiptAction).catch((err) => {
      this.changeReceiptLoading(false)
      throw Promise.reject(new Error(err))
    })
    // 盘点不需要拉货位信息 不做adapter
    return this.fetchStockSheet(this.receiptDetail.stock_sheet_id)
      .then(() => {
        this.changeReceiptLoading(false)
        return null
      })
      .catch(() => {
        this.changeReceiptLoading(false)
      })
  }
}

export default new Store()
export type { PDetail, RDetail, PositionFilterType }
