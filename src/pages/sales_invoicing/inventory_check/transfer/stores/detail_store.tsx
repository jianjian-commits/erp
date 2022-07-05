import { makeAutoObservable } from 'mobx'
import { ListSkuV2 } from 'gm_api/src/merchandise'
import {
  SkuItem,
  SalesInvoicingSheet,
  ReceiptStatusKey,
  ComSsuItem,
  ComShelf,
  ComSupplier,
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
  getDisabledShelfData,
} from '@/pages/sales_invoicing/util'
import {
  GetStockSheet,
  UpdateStockSheet,
  DeleteStockSheet,
  CreateStockSheet,
  GetSkuUnitStock,
  Shelf,
  ListShelf,
} from 'gm_api/src/inventory'
import { adapterMoreSelectComData, formatDataToTree } from '@/common/util'

import {
  SkuUnitStock,
  SkuStock,
  Batch,
  ListShelfRequest,
} from 'gm_api/src/inventory/types'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Tip } from '@gm-pc/react'
import { ListSupplier } from 'gm_api/src/enterprise'

interface PositionFilterType {
  productType: string
  productName: string
}

interface PositionListType {
  index: number
  data: PDetail
  type: string
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
  shelf_selected: Array<string>
  exist_shelf_selected: Array<string>
  transfer_shelf_selected: Array<string>
  inventory_measure_quantity: number
  inventory_package_quantity: number
  batch_selected_single: Batch | any
  transfer_shelf_obj: Record<string, any>
  exist_allShelfResponse: Shelf[]
  exist_shelfList: ComShelf[]
  transfer_allShelfResponse: Shelf[]
  transfer_shelfList: ComShelf[]
  exist_shelf_name: string
  exist_inventory_can_search: boolean // 现存货位需要一个编辑按钮开关
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
  shelf_selected: [],
  exist_shelf_selected: [],
  transfer_shelf_selected: [],
  transfer_measure: 0,
  transfer_package: 0,
  transfer_shlef: [],
  inventory_measure_quantity: 0,
  inventory_package_quantity: 0,
  batch_selected_single: {},
  transfer_shelf_obj: {},
  shelf_id: '',
  exist_shelfList: [],
  exist_inventory_can_search: false,
  exist_allShelfResponse: [],
  transfer_allShelfResponse: [],
  transfer_shelfList: [],
  exist_shelf_name: '',
}

const { target_id, target_name, ...notIncludeTarget } = defaultReceiptDetail

const initReceiptDetail: RDetail = {
  ...notIncludeTarget,
  details: [{ ...initProductDetail }],
  sheet_type: RECEIPT_TYPE.transfer, // 采购入库
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

  stockList: { [key: string]: Partial<SkuStock> } = {}

  receiptLoading = false
  supplierList: ComSupplier[] = []
  allShelfResponse: Shelf[] = []
  allTansferShelfResponse: Shelf[] = []
  shelfList: ComShelf[] = []
  transferShelfList: ComShelf[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
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
        // unit_id: selected.ssu[0]?.unit_id,
        // ssu_base_unit_id: selected.ssu[0]?.ssu_base_unit_id,
        // ssu_unit_id: selected.ssu[0]?.unit_id,
        // ssu_base_unit_name: selected.ssu[0]?.ssu_base_unit_name,
        // ssu_unit_name: selected.ssu[0]?.ssu_unit_name,
        // ssu_base_unit_rate: +selected.ssu[0]?.ssu_base_unit_rate,
        // ssu_display_name: selected.ssu[0]?.ssu_display_name,
        // ssu_unit_rate: +selected.ssu[0]?.ssu_unit_rate,
        // ssu_unit_type: selected.ssu[0]?.ssu_unit_type,
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
    // Object.assign(this.productList[index], { ...changeData })
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
    }).then((json) => json.response)
  }

  getValidProductListData() {
    const result: PDetail[] = []
    _.each(this.productList, (item) => {
      if (
        item.sku_id ||
        item.ssu_unit_id ||
        item.shelf_id ||
        item.batch_selected_single?.batch_id ||
        item.transfer_measure ||
        item.transfer_shelf_obj.shelf_id
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
      const {
        sku_name,
        // ssu_unit_id,
        sku_id,
        batch_selected_single,
        shelf_id,
        transfer_measure,
        transfer_package,
        transfer_shelf_obj,
      } = postData[currentIndex]
      if (!sku_id) {
        Tip.danger(t('商品明细填写不完善'))
        canSubmitType = 0
        break
      } else if (
        !batch_selected_single ||
        !Object.keys(batch_selected_single).length ||
        !shelf_id
      ) {
        Tip.danger(t('请选择现存货位和批次后再提交'))
        canSubmitType = 0
        break
      } else if (!transfer_measure || !transfer_package) {
        Tip.danger(t('请填写移库数后再提交'))
        canSubmitType = 0
        break
      } else if (!Object.keys(transfer_shelf_obj || {}).length) {
        Tip.danger(t('请选择移入货位后再提交'))
        canSubmitType = 0
        break
      } else if (shelf_id === transfer_shelf_obj.shelf_id) {
        Tip.danger(t(`${sku_name}不能移入现存货位`))
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
      type: 'transfer',
      sheet_status: RECEIPT_STATUS[statusName],
    })

    return CreateStockSheet({ stock_sheet: data }).then((json) => {
      Tip.success(
        getSuccessTip(statusName, this.receiptDetail.sheet_status) + t('成功'),
      )
      return json
    })
  }

  updateReceipt(receiptAction: ReceiptStatusKey) {
    if (receiptAction !== 'deleted' && this.verifyData() === 0) {
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
      type: 'transfer',
      sheet_status: RECEIPT_STATUS[statusName],
    })

    if (receiptAction === 'deleted') {
      return DeleteStockSheet({
        stock_sheet_id: this.receiptDetail.stock_sheet_id,
      }).then((json) => {
        Tip.success(
          getSuccessTip(statusName, this.receiptDetail.sheet_status) +
            t('成功'),
        )
        return json
      })
    }

    return UpdateStockSheet({
      stock_sheet: data,
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
      const data = getSalesInvoicingSheetData(json.response, 'transfer', {
        shelfList: [] as Shelf[],
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

  fetchSupplier() {
    return ListSupplier({ paging: { limit: 999 } }).then((json) => {
      this.supplierList = adapterMoreSelectComData(
        json.response.suppliers!,
        'supplier_id',
      )

      return json
    })
  }

  fetchShelf(options: ListShelfRequest) {
    return ListShelf({ ...options, with_deleted: true }).then((json) => {
      this.allShelfResponse = json.response.shelves
      this.shelfList = formatDataToTree(
        getDisabledShelfData(
          _.filter(json.response.shelves!, (item) => {
            return item.delete_time === '0'
          }), // 去掉删除
        ),
        'shelf_id',
        'name',
      )

      return json
    })
  }

  fetchTransferShelf() {
    const { warehouse_id } = this.receiptDetail
    const params = {
      with_deleted: true,
      warehouse_id: warehouse_id || undefined,
    }
    return ListShelf(params).then((json) => {
      const shelves = json.response.shelves
      shelves.unshift({
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
      this.allTansferShelfResponse = shelves
      this.transferShelfList = formatDataToTree(
        getDisabledShelfData(
          _.filter(shelves!, (item) => {
            return item.delete_time === '0'
          }), // 去掉删除
        ),
        'shelf_id',
        'name',
      )

      return json
    })
  }

  // 切换仓库，批量重置货位
  resetProductShelf() {
    _.forEach(this.productList, (item) => {
      item = {
        ...item,
        exist_shelf_selected: ['0'],
        transfer_shelf_selected: [],
      }
    })
  }
}

export default new Store()
export type { PDetail, RDetail, PositionFilterType }
