import { ComPurchaser } from '../../../warehousing_data/supplier_manage/interface'
import { computed, makeAutoObservable } from 'mobx'

import {
  ChinaVatInvoice_InvoiceType,
  ListGroupUser,
  ListSupplier,
  Role_Type,
} from 'gm_api/src/enterprise'
import _ from 'lodash'

import {
  ListShelf,
  UpdateStockSheet,
  CreateStockSheet,
  GetStockSheet,
  StockSheet_TargetType,
  Batch_BatchType,
  Shelf,
  GetStockSheetResponse,
  Status_Code,
  SplitPurchaseIn,
} from 'gm_api/src/inventory'

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
import { GetBasicPrice, ListSkuV2, SsuId } from 'gm_api/src/merchandise'
import {
  adapterMoreSelectComData,
  formatDataToTree,
  guid,
  isValid,
  sortByMultiRule,
} from '@/common/util'
import {
  defaultReceiptDetail,
  defaultProductDetail,
} from '@/pages/sales_invoicing/receipt_base_data'
import {
  getDisabledShelfData,
  getSalesInvoicingSheetData,
  getStockSheetData,
  getSuccessTip,
} from '@/pages/sales_invoicing/util'
import Big from 'big.js'
import {
  DiscountState,
  ApportionState,
} from '@/pages/sales_invoicing/components'
import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { history } from '@/common/service'
import { GetInventorySettings } from 'gm_api/src/preference'
import globalStore from '@/stores/global'
import type { SortItem } from '@/common/interface'
import { getRuleList } from '@/pages/sales_invoicing/util2'

interface RDetail
  extends Omit<SalesInvoicingSheet.StockInReceiptDetail, 'details'> {
  details: PDetail[]
}

type PDetail = SalesInvoicingSheet.StockInProductDetail

const initProductDetail: PDetail = {
  ...defaultProductDetail,
  shelf_selected: [],
  type: Batch_BatchType.BATCH_TYPE_CONST,
}

const initReceiptDetail: RDetail = {
  ...defaultReceiptDetail,
  details: [{ ...initProductDetail }],
  target_type: StockSheet_TargetType.SHEET_TARGET_TYPE_SUPPLIER,
  sheet_type: RECEIPT_TYPE.purchaseIn, // 采购入库
}

class Store {
  receiptDetail: RDetail = { ...initReceiptDetail }
  productDetails: PDetail[] = [{ ...initProductDetail }]
  discountList: DiscountState[] = []
  apportionList: ApportionState[] = []
  shelfList: ComShelf[] = []
  supplierList: ComSupplier[] = []
  purchaserList: ComPurchaser[] = []

  allShelfResponse: Shelf[] = [] // 含有删除
  sortItem: SortItem = {
    sort_by: '',
    sort_direction: null,
  }

  errorMap: { [key: number]: any[] } = { [Status_Code.CANCEL_USED_BATCH]: [] }

  receiptLoading = false
  openBasicPriceState = false

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clear() {
    this.receiptDetail = { ...initReceiptDetail }
    this.productDetails = [{ ...initProductDetail }]
    this.discountList = []
    this.apportionList = []
  }

  @computed
  no_tax_amount(idx: number) {
    const { amount_show, tax_rate } = this.productDetails[idx]
    const value = _.isNil(amount_show)
      ? null
      : +amount_show / (tax_rate / 100 + 1)
    return value
  }

  @computed
  no_tax_base_price(idx: number) {
    const { base_price_show, tax_rate } = this.productDetails[idx]
    const value = _.isNil(base_price_show)
      ? null
      : +base_price_show / (tax_rate / 100 + 1)
    return value
  }

  @computed
  tax_money(idx: number) {
    const { amount_show, tax_rate } = this.productDetails[idx]
    const no_tax_amount = _.isNil(amount_show)
      ? null
      : +amount_show / (tax_rate / 100 + 1)
    return Math.abs(+amount_show! - +no_tax_amount!)
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

        ssu: item.ssu,
      }
    })
  }

  get skuMoney() {
    let total = 0

    _.each(this.productDetails, (item) => {
      total = +Big(total).plus(item.amount || 0)
    })

    return total
  }

  get totalDiscount() {
    let total = 0

    _.each(this.discountList, (item) => {
      if (+item.action === 1) {
        total = +Big(total).plus(item.money || 0)
      } else if (+item.action === 2) {
        total = +Big(total).minus(item.money || 0)
      }
    })

    return total
  }

  get totalPrice() {
    return +Big(this.totalDiscount).plus(this.skuMoney)
  }

  changeReceiptLoading(bool: boolean) {
    this.receiptLoading = bool
  }

  changeReceiptDetail<T extends keyof RDetail>(field: T, value: RDetail[T]) {
    this.receiptDetail[field] = value
  }

  changeProductDetailsItem(index: number, changeData: Partial<PDetail>) {
    Object.assign(this.productDetails[index], { ...changeData })
  }

  addProductDetailsItem() {
    this.productDetails.push({ ...initProductDetail, value: guid() })
  }

  deleteProductDetails(index: number) {
    this.productDetails.splice(index, 1)
  }

  addDiscountListItem(item: DiscountState) {
    this.discountList.push({ ...item })
  }

  deleteDiscountListItem(index: number) {
    this.discountList.splice(index, 1)
  }

  addApportionItem(item: ApportionState) {
    this.apportionList.push({ ...item })
  }

  clearApportionItem() {
    this.apportionList = []
  }

  /** @deprecated 估计没用了 */
  changeSpecificationSelected(index: number, selected: ComSsuItem) {
    const {
      shelf_selected,
      shelf_id,
      shelf_name,
      shelf,
      supplier_taxs,
      tax_rate,
    } = this.productDetails[index]
    // 切换或清空时将该行数据全部清空
    const changeData = {
      ...initProductDetail,
      ...this.productSelected[index],
      /** 排除货位 */
      ...{
        shelf_selected,
        shelf_id,
        shelf_name,
        shelf,
        supplier_taxs,
        tax_rate,
      },
    }
    if (selected) {
      Object.assign(changeData, {
        unit_id: selected ? selected.value : '',
        ssu_base_unit_id: selected ? selected.ssu_base_unit_id : '',
        ssu_base_unit_name: selected ? selected.ssu_base_unit_name : '',
        tax_rate,
        supplier_taxs,
      })
    }

    this.productDetails[index] = {
      ...changeData,
      value: this.productDetails[index].value,
    }
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
        tax_rate: selected.input_tax,
      })
    }

    Object.assign(this.productDetails[index], { ...changeData })
  }

  getValidProductListData() {
    const result: PDetail[] = []
    _.each(this.productDetails, (item) => {
      if (item.sku_id || isValid(item.base_price) || isValid(item.amount)) {
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
        // 商品id
        sku_id,
        // 入库单价
        base_price,
        // 入库金额
        amount,
        input_stock: { input },
      } = postData[currentIndex]
      if (
        !sku_id ||
        !isValid(base_price) ||
        !isValid(input?.quantity) ||
        !isValid(amount)
      ) {
        Tip.danger(t('商品明细填写不完善'))
        canSubmitType = 0
        break
      } else if (_.toNumber(input?.quantity) === 0) {
        Tip.danger(
          t(
            globalStore.isLite
              ? '商品入库数为0无法提交，请填写入库数后再提交'
              : '商品入库数（基本单位）为0无法提交，请填写入库数后再提交',
          ),
        )
        canSubmitType = 0
        break
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

  fetchPurchaser() {
    return ListGroupUser({
      paging: { limit: 999 },
      role_types: [Role_Type.BUILT_IN_PURCHASER as number],
    }).then((json) => {
      this.purchaserList = (json.response?.group_users || [])
        .filter((v) => v.is_valid)
        .map((v) => {
          return {
            ...v,
            value: v.group_user_id,
            text: v.name,
          }
        })
    })
  }

  fetchShelf(params = {}) {
    const req = {
      ...params,
      with_deleted: true,
    }
    return ListShelf(req).then((json) => {
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
      this.allShelfResponse = shelves
      this.shelfList = formatDataToTree(
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

  // 切换仓库，重制货位选择
  resetProductShelf() {
    const initShelf = {
      shelf_selected: ['0'],
      shelf_id: undefined,
      shelf_name: '',
      shelf: '',
    }
    _.forEach(this.productDetails, (item) => {
      item = _.assign(item, initShelf)
    })
  }

  fetchSkuList(q: string) {
    return ListSkuV2({
      filter_params: { q, sku_types: [1, 2] },
      paging: { limit: 999 },
      request_data: 1024 + 256,
    })
  }

  /**
   * @description 切换税率
   */
  getListSkuTax() {
    const sku_ids: string[] = _.map(this.productDetails, (item) => item.sku_id)
    const verify = _.every(sku_ids, (item) => item !== '')

    verify &&
      this.getTax(sku_ids).then((res) => {
        const sku_infos = res.response.skus
        _.each(this.productDetails, (item) => {
          const index = _.findIndex(sku_infos, function (o) {
            return o.sku_id === item.sku_id
          })

          if (
            this.receiptDetail.target_attrs_invoice_type ===
            ChinaVatInvoice_InvoiceType.VAT_SPECIAL
          ) {
            if (index !== -1) {
              item.tax_rate =
                Number(
                  sku_infos?.[index]?.supplier_input_taxs?.supplier_input_tax?.[
                    this.receiptDetail.supplier_id!
                  ] ?? sku_infos?.[index]?.input_tax,
                ) || 0
            } else {
              item.tax_rate = 0
            }
          } else {
            item.tax_rate = 0
          }
        })
      })
  }

  getTax(sku_ids: string[]) {
    return ListSkuV2({ filter_params: { sku_ids }, paging: { limit: 999 } })
  }

  isInvalidReceipt(receiptAction?: string) {
    // 点击反审时
    if (
      (parseInt(this.receiptDetail?.status!) >> 8).toString(2) === '1' &&
      receiptAction === 'cancelApproval'
    ) {
      Tip.danger(t('已替代的单据无法反审'))
      return true
    }
    if (this.verifyData() === 0) {
      return true
    }
    if (this.totalPrice < 0) {
      Tip.danger(t('入库金额不能小于0'))
      return true
    }
  }

  createReceipt(receiptAction: ReceiptStatusKey, selected?: Array<string>) {
    const { purchaser_id, supplier_id, warehouse_id } = this.receiptDetail
    if (purchaser_id === '0' && supplier_id === '0') {
      this.changeReceiptLoading(false)
      return Tip.danger(t('请选择供应商或采购员'))
    }
    if (globalStore.isOpenMultWarehouse && !warehouse_id) {
      this.changeReceiptLoading(false)
      return Tip.danger(t('请选择仓库'))
    }
    if (this.isInvalidReceipt()) {
      return Promise.reject(new Error('校验单据提交错误'))
    }
    this.receiptDetail.details = this.getValidProductListData()
    this.receiptDetail.discountList = this.discountList
    this.receiptDetail.apportionList = this.apportionList
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
    const data = getStockSheetData(
      this.receiptDetail,
      {
        type: 'stockIn',
        sheet_status: RECEIPT_STATUS[statusName],
      },
      selected,
    )

    return CreateStockSheet({
      stock_sheet: Object.assign(data, {
        warehouse_id: this.receiptDetail.warehouse_id,
      }),
    }).then((json) => {
      Tip.success(
        getSuccessTip(statusName, this.receiptDetail.sheet_status) + t('成功'),
      )
      return json
    })
  }

  updateReceipt(receiptAction: ReceiptStatusKey, selected?: Array<string>) {
    if (this.isInvalidReceipt(receiptAction)) {
      return Promise.reject(new Error('校验单据提交错误'))
    }
    this.receiptDetail.details = this.getValidProductListData()
    this.receiptDetail.discountList = this.discountList
    this.receiptDetail.apportionList = this.apportionList
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

    const data = getStockSheetData(
      this.receiptDetail,
      {
        type: 'stockIn',
        sheet_status: RECEIPT_STATUS[statusName],
      },
      selected,
    )

    let updateStockSheetObj = {
      stock_sheet: Object.assign(data, {
        warehouse_id: this.receiptDetail.warehouse_id,
      }),
      stock_sheet_id: this.receiptDetail.stock_sheet_id,
    }

    let RequestInterface = UpdateStockSheet

    if (selected) {
      statusName = 'split'
      const [origin_stock_sheet, split_details] = data
      updateStockSheetObj = {
        stock_sheet_id: this.receiptDetail.stock_sheet_id,
        origin_stock_sheet,
        split_details,
      }
      RequestInterface = SplitPurchaseIn
      return RequestInterface(updateStockSheetObj, [
        Status_Code.CANCEL_USED_BATCH,
      ])
        .then((json) => {
          if (json.code === Status_Code.CANCEL_USED_BATCH) {
            Tip.danger(t('不能反审已经被使用的批次！'))

            this.errorMap[Status_Code.CANCEL_USED_BATCH] = [
              json.message.detail.batch_serial_no,
            ]
            throw new Error(json.message?.description || '')
          } else {
            Tip.success(
              getSuccessTip(statusName, this.receiptDetail.sheet_status) +
                t('成功'),
            )
            history.push(
              `/sales_invoicing/purchase/stock_in/detail?sheet_id=${json.response.stock_sheet_id}`,
            )
            return json
          }
        })
        .finally(() => {
          this.changeReceiptLoading(false)
        })
    }

    return RequestInterface(updateStockSheetObj, [
      Status_Code.CANCEL_USED_BATCH,
    ]).then((json) => {
      if (json.code === Status_Code.CANCEL_USED_BATCH) {
        Tip.danger(t('不能反审已经被使用的批次！'))

        this.errorMap[Status_Code.CANCEL_USED_BATCH] = [
          json.message.detail.batch_serial_no,
        ]
        throw new Error(json.message?.description || '')
      } else {
        Tip.success(
          getSuccessTip(statusName, this.receiptDetail.sheet_status) +
            t('成功'),
        )
        return json
      }
    })
  }

  // 分批入库

  adapterStockSheet(res: GetStockSheetResponse) {
    const supplier = res.additional.suppliers![res.stock_sheet.supplier_id!] // list数据会过滤已删除的，因此从additional取delete_time
    const {
      stock_sheet: { warehouse_id },
      additional,
    } = res
    this.receiptDetail = {
      ...getSalesInvoicingSheetData(res, 'stockIn', {
        shelfList: this.allShelfResponse,
        cancelVirtualBase: true,
      }),
      target_delete_time: supplier?.delete_time!,
      target_name: supplier?.name,
      target_customized_code: supplier?.customized_code,
      supplier_name: supplier?.name,
      target_attrs_invoice_type:
        supplier?.attrs?.china_vat_invoice?.invoice_type,
      warehouse_name:
        (warehouse_id && additional.warehouses?.[warehouse_id]?.name) || '',
    }
    this.productDetails = this.receiptDetail.details.map((d) => {
      return {
        ...d,
        value: guid(),
      }
    })
    this.apportionList = this.receiptDetail.apportionList || []
    this.discountList = this.receiptDetail.discountList || []
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
  async updateAndGetReceipt(
    receiptAction: ReceiptStatusKey,
    selected?: Array<string>,
  ) {
    const { purchaser_id, supplier_id, warehouse_id } = this.receiptDetail
    if (purchaser_id === '0' && supplier_id === '0') {
      this.changeReceiptLoading(false)
      return Tip.danger(t('请选择供应商或采购员'))
    }
    if (globalStore.isOpenMultWarehouse && !warehouse_id) {
      this.changeReceiptLoading(false)
      return Tip.danger(t('请选择仓库'))
    }
    this.changeReceiptLoading(true)

    await this.updateReceipt(receiptAction, selected).catch((err) => {
      this.changeReceiptLoading(false)
      throw Promise.reject(new Error(err))
    })
    if (selected) return
    return this.fetchAndAdapterStockSheet(this.receiptDetail.stock_sheet_id)
      .then(() => {
        this.changeReceiptLoading(false)
        return null
      })
      .catch(() => {
        this.changeReceiptLoading(false)
      })
  }

  setOpenBasicPriceState() {
    return GetInventorySettings().then((res) => {
      this.openBasicPriceState =
        res.response.inventory_settings
          .stock_sheet_price_equal_protocol_price === 1
      return res.response
    })
  }

  /** @deprecated 估计没用了 */
  getBasicPrice(ssu_id: SsuId, supplier_id: string) {
    return GetBasicPrice({ supplier_id, ssu_id }).then((res) => {
      return res.response
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
