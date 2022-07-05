import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import Big from 'big.js'
import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import {
  ListShelf,
  UpdateStockSheet,
  CreateStockSheet,
  GetStockSheet,
  Shelf,
  GetStockSheetResponse,
  CreateStockSheetRequest,
} from 'gm_api/src/inventory'
import { ListSkuV2 } from 'gm_api/src/merchandise'
import { formatDataToTree, guid, isValid, sortByMultiRule } from '@/common/util'

import {
  SalesInvoicingSheet,
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
import {
  getDisabledShelfData,
  getSalesInvoicingSheetData,
  getStockSheetData,
  getSuccessTip,
} from '@/pages/sales_invoicing/util'
import {
  defaultReceiptDetail,
  defaultProductDetail,
} from '@/pages/sales_invoicing/receipt_base_data'
import type { SortItem } from '@/common/interface'
import { getRuleList } from '@/pages/sales_invoicing/util2'

interface RDetail
  extends Omit<SalesInvoicingSheet.StockInReceiptDetail, 'details'> {
  details: PDetail[]
}

type PDetail = SalesInvoicingSheet.StockInProductDetail

const { target_id, target_name, ...notIncludeTarget } = defaultReceiptDetail

const initProductDetail: PDetail = {
  ...defaultProductDetail,
  shelf_selected: [],
  type: 1,
}

const initReceiptDetail: RDetail = {
  ...notIncludeTarget,
  details: [{ ...initProductDetail }],
  sheet_type: RECEIPT_TYPE.otherIn, // 采购入库
}

class Store {
  receiptDetail: RDetail = { ...initReceiptDetail }
  productDetails: PDetail[] = [{ ...initProductDetail }]

  productList: PDetail[] = [{ ...initProductDetail }] // 详细信息
  shelfList: ComShelf[] = [] // 货位

  shelfResponse: Shelf[] = []

  receiptLoading = false
  sortItem: SortItem = {
    sort_by: '',
    sort_direction: null,
  }

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
      }
    })
  }

  get skuMoney() {
    let total = 0

    _.each(this.productList, (item) => {
      total = +Big(total).plus(item.amount || 0)
    })

    return total
  }

  clean() {
    this.receiptDetail = { ...initReceiptDetail }
    this.productList = [{ ...initProductDetail }]
  }

  changeReceiptLoading(bool: boolean) {
    this.receiptLoading = bool
  }

  addProductListItem() {
    this.productList.push({ ...initProductDetail })
  }

  deleteProductDetails(index: number) {
    this.productList.splice(index, 1)
  }

  changeProductListItem(index: number, changeData: object) {
    Object.assign(this.productList[index], { ...changeData })
  }

  changeReceiptDetail<T extends keyof RDetail>(field: T, value: RDetail[T]) {
    this.receiptDetail[field] = value
  }

  deleteProductList(index: number) {
    this.productList.splice(index, 1)
  }

  changeProductDetailsItem(index: number, changeData: Partial<PDetail>) {
    Object.assign(this.productList[index], { ...changeData })
  }

  changeSpecificationSelected(index: number, selected: ComSsuItem) {
    const { shelf_selected, shelf_id, shelf_name, shelf } =
      this.productList[index]

    // 切换或清空时将该行数据全部清空
    const changeData = {
      ...initProductDetail,
      ...this.productSelected[index],
      /** 排除货位 */
      ...{ shelf_selected, shelf_id, shelf_name, shelf },
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
    Object.assign(this.productList[index], { ...changeData })
  }

  fetchShelf() {
    return ListShelf({}).then((json) => {
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
      this.shelfResponse = shelves
      this.shelfList = formatDataToTree(
        getDisabledShelfData(shelves!),
        'shelf_id',
        'name',
      )

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
  verifyData(receiptAction?: string) {
    const postData = this.getValidProductListData()
    let canSubmitType = 1

    // 点击反审时
    if (
      (parseInt(this.receiptDetail?.status!) >> 8).toString(2) === '1' &&
      receiptAction === 'cancelApproval'
    ) {
      Tip.danger(t('已替代的单据无法反审'))
      return 0
    }

    if (postData.length === 0) {
      Tip.danger(t('请先添加商品明细'))
      return 0
    }

    let currentIndex = 0
    while (currentIndex < postData.length) {
      const {
        sku_id,
        base_price,
        input_stock: { input },
        second_base_unit_id,
        second_base_unit_quantity,
      } = postData[currentIndex]
      if (!sku_id || !isValid(base_price)) {
        Tip.danger(t('商品明细填写不完善'))
        canSubmitType = 0
        break
      } else if (!isValid(input?.quantity)) {
        Tip.danger(t('商品入库数（基本单位）为0无法提交，请填写入库数后再提交'))
        canSubmitType = 0
        break
      } else if (
        !!_.toNumber(second_base_unit_id) &&
        !isValid(second_base_unit_quantity)
      ) {
        // 开启了辅助单位且辅助单位没有值
        Tip.danger(t('请填写入库数(辅助单位)后再提交'))
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

    const data = getStockSheetData(this.receiptDetail, {
      type: 'stockIn',
      sheet_status: RECEIPT_STATUS[statusName],
    })

    const stock_sheet = Object.assign(data, {
      warehouse_id: this.receiptDetail.warehouse_id,
    })

    return CreateStockSheet({ stock_sheet } as CreateStockSheetRequest).then(
      (json) => {
        Tip.success(
          getSuccessTip(statusName, this.receiptDetail.sheet_status) +
            t('成功'),
        )
        return json
      },
    )
  }

  updateReceipt(receiptAction: ReceiptStatusKey) {
    if (this.verifyData(receiptAction) === 0) {
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
      type: 'stockIn',
      sheet_status: RECEIPT_STATUS[statusName],
    })

    const stock_sheet = Object.assign(data, {
      warehouse_id: this.receiptDetail.warehouse_id,
    })

    return UpdateStockSheet({
      stock_sheet: stock_sheet,
      stock_sheet_id: this.receiptDetail.stock_sheet_id,
    }).then((json) => {
      Tip.success(
        getSuccessTip(statusName, this.receiptDetail.sheet_status) + t('成功'),
      )
      return json
    })
  }

  adapterStockSheet(res: GetStockSheetResponse) {
    const { warehouse_id } = res.stock_sheet
    this.receiptDetail = {
      ...getSalesInvoicingSheetData(res, 'stockIn', {
        shelfList: this.shelfResponse,
        cancelVirtualBase: true,
      }),
      warehouse_name:
        (warehouse_id && res.additional.warehouses?.[warehouse_id]?.name) || '',
    }
    this.productList = this.receiptDetail.details
    // this.productList = this.receiptDetail.details.map((d) => {
    //   return {
    //     ...d,
    //     value: guid(),
    //   }
    // })
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
      this.adapterStockSheet(json.response)
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
    return this.fetchAndAdapterStockSheet(this.receiptDetail.stock_sheet_id)
      .then(() => {
        this.changeReceiptLoading(false)
        return null
      })
      .catch(() => {
        this.changeReceiptLoading(false)
      })
  }

  // 切换仓库，重制货位选择
  resetProductShelf() {
    const initShelf = {
      shelf_selected: ['0'],
      shelf_id: undefined,
      shelf_name: '',
      shelf: '',
    }
    _.forEach(this.productList, (item) => {
      item = _.assign(item, initShelf)
    })
  }

  sortProductList({ sort_by, sort_direction }: SortItem) {
    let sortItem: SortItem = {} as SortItem
    if (!sort_direction) {
      sortItem = { sort_by: '', sort_direction: null }
    } else {
      sortItem = { sort_by, sort_direction }
      this.productList = sortByMultiRule(
        this.productList,
        getRuleList(sortItem),
      )
    }
    console.log(sortItem)
    this.sortItem = sortItem
  }
}

export default new Store()
export type { PDetail, RDetail }
