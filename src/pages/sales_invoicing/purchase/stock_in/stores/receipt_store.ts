import { makeAutoObservable, toJS } from 'mobx'
import _ from 'lodash'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { Tip } from '@gm-pc/react'

import { history } from '@/common/service'
import { initProductDetail, initReceiptDetail } from './detail_store_init'
import { adapterSelectComData, isValid, sortByMultiRule } from '@/common/util'
import { getSuccessTip } from '@/pages/sales_invoicing/util'
import {
  converNum2StringOfObj,
  getRuleList,
  getShelfSelected,
  getCategoryName,
} from '@/pages/sales_invoicing/util2'
import {
  DiscountState,
  ApportionState,
} from '@/pages/sales_invoicing/components'
import {
  ComSupplier,
  ComPurchaser,
  ReceiptStatusKey,
} from '@/pages/sales_invoicing/interface'
import {
  RECEIPT_STATUS,
  RECEIPT_STATUS_KEY_NAME,
} from '@/pages/sales_invoicing/enum'

import { CategoryInfo, ListSkuV2, Sku } from 'gm_api/src/merchandise'
import {
  OperateType,
  GetPurchaseInStockSheet,
  CreatePurchaseInStockSheet,
  UpdatePurchaseInStockSheet,
  SplitPurchaseInStockSheet,
  Shelf,
  Status_Code,
} from 'gm_api/src/inventory'
import type {
  Additional,
  ReqCreatePurchaseInStockSheet,
  PurchaseInStockSheetDetail,
  Warehouse,
  GetPurchaseInStockSheetResponse,
} from 'gm_api/src/inventory'
import {
  ListSupplier,
  ListGroupUser,
  Role_Type,
  ChinaVatInvoice_InvoiceType,
} from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'
import { SortItem } from '@/common/interface'

interface ReceiptDetailProps
  extends Omit<ReqCreatePurchaseInStockSheet, 'details'> {
  purchase_in_stock_sheet_id?: string

  // 非后端所需参数
  creator_name?: string
  target_attrs_invoice_type?: number // 供应商开票类型
}

export interface ProductItemProps extends PurchaseInStockSheetDetail {
  // 非后端需要的参数
  sku_name?: string
  shelf_name?: string
  shelf_selected?: string[]
  sku_base_unit_id?: string
  sku_base_unit_name?: string
  category_name_1?: string
  category_name_2?: string
  spu_name?: string
  second_base_unit_ratio?: string
  second_base_unit_quantity?: string
}
class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** 详情 */
  receiptDetail: ReceiptDetailProps = initReceiptDetail

  /** 商品详情 */
  productDetails: ProductItemProps[] = [initProductDetail]

  /** 金额转让 */
  discountList: DiscountState[] = []
  /** 费用分摊 */
  apportionList: ApportionState[] = []
  /** 供应商 */
  supplierList: ComSupplier[] = []
  /** 采购员 */
  purchaserList: ComPurchaser[] = []
  /** 仓库 */
  warehouseList: Warehouse[] = []
  /** 加载loading */
  receiptLoading = false
  additional: Additional = {}
  sortItem: SortItem = {
    sort_by: '',
    sort_direction: null,
  }

  /** 出库单价是否等于协议价？ */
  openBasicPriceState: boolean =
    globalStore.salesInvoicingSetting.stock_sheet_price_equal_protocol_price ===
    1

  /**  */
  errorMap: { [key: number]: any[] } = { [Status_Code.CANCEL_USED_BATCH]: [] }

  /** 商品的总入库金额 */
  get skuMoney() {
    let total = 0
    _.each(this.productDetails, (item) => {
      total = +Big(total).plus(item.amount || 0)
    })

    return total
  }

  /** 总出库金额 */
  get totalPrice() {
    return +Big(this.totalDiscount).plus(this.skuMoney)
  }

  /** 金额折让 */
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

  get getCreateReqParams() {
    const result = {
      ..._.omit(this.receiptDetail, [
        'creator_name',
        'target_attrs_invoice_type',
      ]),
      discounts: {
        details: _.map(this.discountList, (item) => {
          return {
            create_time: item?.create_time,
            creator_id: item?.creator_id,
            money: item.money ? item.money.toString() : '0',
            money_type: +item.action,
            reason: +item.reason,
            remark: item.remark,
          }
        }),
      },
      cost_allocation: {
        details: _.map(this.apportionList, (item) => {
          return {
            effected: item?.effected,
            type: +item.method,
            reason: +item.reason,
            money: item.money ? item.money.toString() : '0',
            money_type: +item.action,
            remark: item.remark,
            creator_id: item?.creator_id,
            create_time: item?.create_time,
            sku_units: _.map(item.sku_selected, (item: string) => {
              return {
                unit_id: item.split('_')[1],
                sku_id: item.split('_')[0],
              }
            }),
          }
        }),
      },
      details: _.map(this.productDetails, (item) => {
        return _.omit(converNum2StringOfObj(item), [
          'sku_name',
          'shelf_name',
          'shelf_selected',
          'sku_base_unit_id',
          'sku_base_unit_name',
          'category_name_1',
          'category_name_2',
          'spu_name',
        ])
      }),
    }
    return converNum2StringOfObj(result)
  }

  clear() {
    this.receiptDetail = initReceiptDetail
    this.productDetails = [initProductDetail]
    this.discountList = []
    this.apportionList = []
  }

  changeReceiptLoading(bool: boolean) {
    this.receiptLoading = bool
  }

  /** 获取非空数据 */
  getValidProductListData() {
    const result: ProductItemProps[] = []
    _.forEach(this.productDetails, (item) => {
      const { sku_id, tax_input_price, tax_amount } = item
      if (sku_id || isValid(tax_input_price) || isValid(tax_amount)) {
        // 清除辅助数据
        result.push(item)
      }
    })
    return result
  }

  verifyData() {
    const postData = this.getValidProductListData()
    let canSubmitType = 1
    let currentIndex = 0
    if (!postData.length) {
      Tip.danger(t('请先添加商品明细'))
      return 0
    }

    while (currentIndex < postData.length) {
      const {
        sku_id,
        // 入库单价
        tax_input_price,
        // 入库金额
        tax_amount,
        input_stock: { input },
        second_base_unit_quantity,
        second_base_unit_id,
      } = postData[currentIndex]
      if (
        !sku_id ||
        !isValid(tax_input_price) ||
        !isValid(input?.quantity) ||
        !isValid(tax_amount)
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

  /** 从additional里面获取需要的数据 */
  getAdditionInfo<k>(type: keyof Additional, key: string): k {
    return this.additional[type]?.[key] as k
  }

  /** 税额 */
  tax_money(idx: number) {
    const { tax_amount, input_tax } = this.productDetails[idx]
    const no_tax_amount = _.isNil(tax_amount)
      ? null
      : +tax_amount / (input_tax / 100 + 1)
    return Math.abs(+tax_amount! - +no_tax_amount!)
  }

  // 不含税入库单价
  no_tax_base_price(idx: number) {
    const { tax_input_price, input_tax = 0 } = this.productDetails[idx]
    const value = _.isNil(tax_input_price)
      ? null
      : +tax_input_price / (input_tax / 100 + 1)
    return value
  }

  /** 不含税入库金额 */
  no_tax_amount(idx: number) {
    const { tax_amount, input_tax = 0 } = this.productDetails[idx]
    const value = _.isNil(tax_amount)
      ? null
      : +tax_amount / (input_tax / 100 + 1)
    return value
  }

  /** 收集公共数据 */
  changeReceiptDetail<T extends keyof ReceiptDetailProps>(
    field: T,
    value: ReceiptDetailProps[T],
  ) {
    this.receiptDetail[field] = value
  }

  /** 编辑商品数据 */
  changeProductItem(index: number, content: object) {
    Object.assign(this.productDetails[index], content)
  }

  // 新增一条数据
  addProductDetailsItem() {
    this.productDetails.push(initProductDetail)
  }

  // 删除一条数据
  deleteProductDetails(index: number) {
    this.productDetails.splice(index, 1)
  }

  /** 获取供应商 */
  async fetchSupplier() {
    const { response } = await ListSupplier({ paging: { limit: 999 } })
    this.supplierList = adapterSelectComData(response.suppliers!, 'supplier_id')
    return response
  }

  /** 获取采购员 */
  async fetchPurchaser() {
    const { response } = await ListGroupUser({
      paging: { limit: 999 },
      role_types: [Role_Type.BUILT_IN_PURCHASER],
    })
    this.purchaserList = adapterSelectComData(
      (response?.group_users || []).filter((v) => v.is_valid),
      'group_user_id',
    )
    return response
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
      filter_params: { q },
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
              item.input_tax =
                (sku_infos?.[index]?.supplier_input_taxs?.supplier_input_tax?.[
                  this.receiptDetail.supplier_id!
                ] ??
                  sku_infos?.[index]?.input_tax) ||
                '0'
            } else {
              item.input_tax = '0'
            }
          } else {
            item.input_tax = '0'
          }
        })
      })
  }

  getTax(sku_ids: string[]) {
    return ListSkuV2({ filter_params: { sku_ids }, paging: { limit: 999 } })
  }

  /** 表单数据的校验 */
  isInvalidReceipt(receiptAction?: string) {
    const {
      receiptDetail: { is_replace, purchaser_id, supplier_id, warehouse_id },
    } = this
    if (purchaser_id === '0' && supplier_id === '0') {
      this.changeReceiptLoading(false)
      return Tip.danger(t('请选择供应商或采购员'))
    }
    if (globalStore.isOpenMultWarehouse && !warehouse_id) {
      this.changeReceiptLoading(false)
      return Tip.danger(t('请选择仓库'))
    }
    // 点击反审时
    if (
      (parseInt(is_replace as unknown as string) >> 8).toString(2) === '1' &&
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
    return false
  }

  categoryRelationInfo(category_map: CategoryInfo, sku: Sku) {
    let res: any = {}
    let index = 1
    for (const category of Object.values(category_map)) {
      const category_id = sku?.[`category${index}_id`] as string
      // if (category_id !== '' && category_id !== '0') {
      res = {
        ...res,
        [`category_id_${index}`]: category_id,
        [`category_name_${index}`]: category?.category_name,
      }
      // }
      index++
    }

    return {
      ...res,
      category_name: getCategoryName(category_map, sku),
    }
  }

  /** 整理回显数据 */
  adapterStockSheet(res: GetPurchaseInStockSheetResponse) {
    // const supplier = res.additional.suppliers![res.stock_sheet.supplier_id!] // list数据会过滤已删除的，因此从additional取delete_time
    const { stock_sheet, additional } = res
    const category_map = additional?.category_map

    this.additional = additional
    this.receiptDetail = _.omit(stock_sheet, [
      'discounts',
      'cost_allocation',
      'details',
    ])
    this.productDetails = stock_sheet.details.map((d) => {
      const { sku_id, shelf_id } = d
      const sku = this.getAdditionInfo<Sku>('sku_map', sku_id)
      const shelf = this.getAdditionInfo<Shelf>('shelfs', shelf_id!)
      const baseUnit = globalStore.getUnit(sku?.base_unit_id)
      const shelf_selected = getShelfSelected(
        globalStore.allShelfResponse,
        shelf_id,
      )
      return {
        ...d,
        // 非后端需要的参数
        ...this.categoryRelationInfo(category_map!, sku),
        sku_name: sku?.name,
        shelf_name: shelf?.name,
        second_base_unit_id: sku?.second_base_unit_id,
        second_base_unit_ratio: sku?.second_base_unit_ratio,
        shelf_selected: shelf_selected,
        sku_base_unit_id: sku?.base_unit_id,
        sku_base_unit_name: baseUnit?.name,
        spu_name: category_map?.[sku?.category3_id!]?.category_name,
      }
    })
    this.apportionList = _.map(
      stock_sheet?.cost_allocation?.details,
      (item) => {
        return {
          ...item,
          method: item?.type,
          action: item?.money_type,
          sku_selected: _.map(item?.sku_units, (x) => {
            return `${x.sku_id}_${x.unit_id}`
          }),
          operator_name: this.getAdditionInfo<any>(
            'group_users',
            item.creator_id!,
          )?.name,
        }
      },
    )
    this.discountList = _.map(stock_sheet?.discounts?.details, (item) => {
      return {
        ...item,
        method: item?.type,
        action: item?.money_type,
        sku_selected: _.map(item?.sku_units, (x) => {
          return `${x.sku_id}_${x.unit_id}`
        }),
      }
    })
  }

  /** 获取单据 */
  async fetchStockSheet(stock_sheet_id: string) {
    const req = {
      stock_sheet_id,
      with_additional: true,
    }
    const { response } = await GetPurchaseInStockSheet(req)
    this.adapterStockSheet(response)
    this.changeReceiptLoading(false)
    return response
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

  /** 创建单据 */
  async createReceipt(receiptAction: ReceiptStatusKey = 'toBeSubmitted') {
    if (this.isInvalidReceipt(receiptAction)) {
      return Promise.reject(new Error('校验单据提交错误'))
    }
    const statusName = this.getStatusName(receiptAction)

    const req = {
      stock_sheet: {
        ...this.getCreateReqParams,
        sheet_status: RECEIPT_STATUS[statusName]!,
      },
    }
    const { response } = await CreatePurchaseInStockSheet(req)
    return response
  }

  /** 更新单据 */
  async updateReceipt(receiptAction: ReceiptStatusKey = 'toBeSubmitted') {
    const {
      receiptDetail: { purchase_in_stock_sheet_id },
    } = this
    const statusName = this.getStatusName(receiptAction)

    const req = {
      stock_sheet: {
        ...this.getCreateReqParams,
        sheet_status: RECEIPT_STATUS[statusName]!,
      },
      stock_sheet_id: purchase_in_stock_sheet_id!,
      operate_type: OperateType.OPERATE_TYPE_PURCHASE_IN,
    }

    const { response, code, message } = await UpdatePurchaseInStockSheet(req)
    this.changeReceiptLoading(true)
    await this.fetchStockSheet(purchase_in_stock_sheet_id!)

    if (code === Status_Code.CANCEL_USED_BATCH) {
      Tip.danger(t('不能反审已经被使用的批次！'))
      this.errorMap[Status_Code.CANCEL_USED_BATCH] = [
        message.detail.batch_serial_no,
      ]
      throw new Error(message?.description || '')
    } else {
      Tip.success(
        getSuccessTip(statusName, this.receiptDetail.sheet_status) + t('成功'),
      )
      return response
    }
  }

  /** 批量更新商品状态 */
  async batchUpdateReceipt(
    receiptAction: ReceiptStatusKey = 'split',
    selected: string[],
  ) {
    const { details } = this.getCreateReqParams
    let selectedDetails = _.pickBy(details, (item) => {
      return selected.includes(item?.purchase_in_stock_sheet_detail_id)
    })
    let unSelectedDetails = _.pickBy(details, (item) => {
      return !selected.includes(item?.purchase_in_stock_sheet_detail_id)
    })

    // 特殊情况处理
    if (_.values(unSelectedDetails).length === 0) {
      unSelectedDetails = selectedDetails
      selectedDetails = {}
    }

    const statusName = this.getStatusName(receiptAction)
    const { purchase_in_stock_sheet_id } = this.receiptDetail
    const req = {
      stock_sheet_id: purchase_in_stock_sheet_id,
      origin_stock_sheet: {
        ...this.getCreateReqParams,
        details: _.map(_.values(unSelectedDetails), (item) =>
          _.omit(item, ['purchase_in_stock_sheet_detail_id']),
        ),
      },
      split_details: _.map(_.values(selectedDetails), (item) =>
        _.omit(item, ['purchase_in_stock_sheet_detail_id']),
      ),
    }
    const { response, message, code } = await SplitPurchaseInStockSheet(req)

    if (code === Status_Code.CANCEL_USED_BATCH) {
      Tip.danger(t('不能反审已经被使用的批次！'))
      this.errorMap[Status_Code.CANCEL_USED_BATCH] = [
        message.detail.batch_serial_no,
      ]
      throw new Error(message?.description || '')
    } else {
      Tip.success(
        getSuccessTip(statusName, this.receiptDetail.sheet_status) + t('成功'),
      )
      history.push(
        `/sales_invoicing/purchase/stock_in/detail?sheet_id=${this.receiptDetail.purchase_in_stock_sheet_id}`,
      )
      return response
    }
  }

  // 更新单据并获取提交信息
  async updateAndGetReceipt(receiptAction: ReceiptStatusKey) {
    if (this.isInvalidReceipt(receiptAction)) {
      return Promise.reject(new Error('校验单据提交错误'))
    }

    await this.updateReceipt(receiptAction).catch((err) => {
      this.changeReceiptLoading(false)
      throw Promise.reject(new Error(err))
    })
    this.changeReceiptLoading(false)

    // if (selected) return
  }

  /** 添加费用分摊 */
  addApportionItem(item: ApportionState) {
    this.apportionList.push({ ...item })
  }

  /** 清除费用分摊 */
  clearApportionItem() {
    this.apportionList = []
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

  /** 添加费用折让 */
  addDiscountListItem(item: DiscountState) {
    this.discountList.push({ ...item })
  }

  /** 删除费用折让 */
  deleteDiscountListItem(index: number) {
    this.discountList.splice(index, 1)
  }
}

export default new Store()
