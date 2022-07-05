import { makeAutoObservable, runInAction, toJS } from 'mobx'
import _ from 'lodash'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { Tip } from '@gm-pc/react'
import {
  CreateWarehouseTransferSheet,
  UpdateWarehouseTransferSheet,
  GetWarehouseTransferSheet,
} from 'gm_api/src/inventory'
import type {
  Additional,
  WarehouseTransferSheetDetail,
  CreateWarehouseTransferSheetRequest,
  UpdateWarehouseTransferSheetRequest,
} from 'gm_api/src/inventory'
import { isValid, sortByMultiRule } from '@/common/util'
import { formatSkuListV2 } from '@/pages/sales_invoicing/util'
import { warehouseTransferDetails } from '@/pages/sales_invoicing/receipt_base_data'
import { ListSkuV2 } from 'gm_api/src/merchandise'
import type {
  Sku,
  ListSkuV2Response,
  CategoryTreeCache_CategoryInfo,
} from 'gm_api/src/merchandise'
import commonStore from '@/pages/sales_invoicing/store'
import { ApportionState } from './../components/apportion_form_modal'
import { getInfoByArgs } from '@/pages/sales_invoicing/allocation_inventory/util'
import { ReceiptStatusKey } from '@/pages/sales_invoicing/interface'
import {
  RECEIPT_STATUS,
  RECEIPT_STATUS_KEY_NAME,
} from '@/pages/sales_invoicing/enum'
import type { SortItem } from '@/common/interface'
import {
  converNum2StringOfObj,
  getRuleList,
} from '@/pages/sales_invoicing/util2'

const initProductDetails = {
  ...warehouseTransferDetails,
  // 自定义新增属性
  sku: {
    category_name_1: '',
    category_name_2: '',
    spu_name: '',
    base_unit_id: '',
  },
  sku_base_unit_name: '',
  currStockQuantity: undefined,
  second_base_unit_ratio: '',
  second_base_unit_quantity: '',
}

const initReceiptDetail = {
  warehouse_transfer_sheet_id: undefined,
  out_stock_amount: undefined,
  in_stock_amount: undefined,
  out_warehouse_id: '',
  in_warehouse_id: '',
  type: 1,
  remark: '',
  serial_no: undefined,
  creator_id: undefined,
  submitter_id: undefined,
  auditor_id: undefined,
  status: -1,
  submit_time: undefined,
  create_time: undefined,
  // warehouse_transfer_sheet_id: undefined,
  transfer_fee: {
    details: [],
  },
  details: [],
}

export type InitReceiptDetailProps = typeof initReceiptDetail

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  receiptLoading = false
  /** 1. 用于向后端提交的数据结构--最外层base info */
  receiptDetail: InitReceiptDetailProps = initReceiptDetail
  /** 2. 用于向后端提交的数据结构--details */
  productDetails: WarehouseTransferSheetDetail[] = [initProductDetails]
  /** 4. 调拨费用相关 */
  costAllocations: ApportionState[] = []

  additional: Additional = {}

  skus: Sku[] = []
  category_map: Record<string, CategoryTreeCache_CategoryInfo> = {}
  sortItem: SortItem = {
    sort_by: '',
    sort_direction: null,
  }

  // 过滤商品空数据
  get validCostAllocations() {
    return _.filter(this.costAllocations, (item) => item?.type)
  }

  // 过滤商品空数据
  get validProductDetails() {
    return _.filter(this.productDetails, (item) => item.sku_id)
  }

  // 整理要提交的数据
  get getParams() {
    /**
     * 包含关系 receiptDetail |--> productDetails -> input_out_stocks
     *                       |--> costAllocations
     */
    const { receiptDetail, costAllocations } = this
    const productDetails = this.validProductDetails
    _.forEach(productDetails, (product) => {
      // 出库数
      const { input, input2 } = product.input_out_stock
      // 入库数默认给0
      product.input_in_stock = {
        input: {
          ...input,
          quantity: '0',
          price: '0',
        },
        input2: {
          ...input2,
          quantity: '0',
          price: '0',
        },
      }
    })
    receiptDetail.details = _.map(productDetails, (d) =>
      _.omit(d, [
        'sku_base_unit_name',
        'sku',
        'currStockQuantity',
        'sku_base_unit_id',
        'units',
      ]),
    )
    receiptDetail.transfer_fee.details = _.map(costAllocations, (item) => {
      return {
        ...item,
        money: item.money && item.money.toString(),
      }
    })

    return receiptDetail
  }

  // 表单校验
  validateField(isAddCost = false) {
    const { out_warehouse_id, in_warehouse_id, type } = this.receiptDetail
    if (this.validProductDetails.length === 0) {
      Tip.danger(t('请先添加商品明细'))
      return false
    }
    // 商品是否填写完整
    let isFinishedSecond = false
    const isFinished = this.validProductDetails.some((item, index) => {
      const {
        input_out_stock,
        second_base_unit_id,
        second_base_unit_quantity,
      } = this.productDetails[index]
      if (
        !!_.toNumber(second_base_unit_id) &&
        !isValid(second_base_unit_quantity)
      ) {
        isFinishedSecond = true
        return true
      }
      return (
        !isValid(item?.unit_id) || !isValid(input_out_stock.input?.quantity)
      )
    })

    if (isFinishedSecond) {
      // 开启了辅助单位且辅助单位没有值
      Tip.danger(t('请填写入库数(辅助单位)后再提交'))
      return false
    }

    if (isFinished) {
      Tip.danger(t('商品明细填写不完善'))
      return false
    }

    if (!out_warehouse_id) {
      Tip.danger(t('请先选择调出仓库'))
      return false
    }
    if (!in_warehouse_id) {
      Tip.danger(t('请先选择调入仓库'))
      return false
    }
    if (type === 1 && isAddCost) {
      // 异价调拨，必须要有费用分摊
      Tip.danger(t('平价调拨不需要费用分摊'))
      return false
    }
    if (type === 2 && this.validCostAllocations.length === 0 && !isAddCost) {
      // 异价调拨，必须要有费用分摊
      Tip.danger(t('异价调拨必须进行费用分摊'))
      return false
    }
    return true
  }

  // 整理返回的数据
  async fixResponseData(data) {
    const { warehouse_transfer_sheet, additional } = data
    const {
      transfer_fee: { details: costAllocations },
      details,
      transfer_status,
    } = warehouse_transfer_sheet
    runInAction(async () => {
      this.receiptDetail = warehouse_transfer_sheet
      this.costAllocations = costAllocations
      this.additional = additional
      this.productDetails = await Promise.all(
        _.map(details, async (detail) => {
          const { sku_id } = detail
          const category_map = additional?.category_map
          const skuinfo = this.getRelationInfo('sku_map', sku_id)
          // 当前商品
          const _sku = formatSkuListV2([skuinfo], category_map)[0]
          const currStockQuantity = await this.getStockQuantity(_sku?.sku_id)
          return {
            ...detail,
            currStockQuantity,
            transfer_status,
            unit_id: _sku?.sku_base_unit_id,
            sku_base_unit_name: _sku?.sku_base_unit_name,
            sku: _sku,
            units: _sku?.units || {}, // 自定义单位
            sku_base_unit_id: _sku?.sku_base_unit_id, // 商品unit_id
            second_base_unit_id: _sku?.second_base_unit_id, // 辅助单位
            second_base_unit_ratio: _sku?.second_base_unit_ratio, // 辅助单位
          }
        }),
      )
    })
  }

  clear() {
    this.receiptDetail = initReceiptDetail
    this.productDetails = [initProductDetails]
    this.costAllocations = []
  }

  // initSku(res: ListSkuV2Response) {
  //   const { skus, category_map } = res
  //   this.skus = skus!
  //   this.category_map = category_map!
  // }

  // 获取商品列表
  fetchSkuList(q?: string) {
    return ListSkuV2({
      filter_params: { q, sku_types: [1, 2] },
      paging: { limit: 999 },
      request_data: 1024 + 256,
    })
  }

  // 新增一条
  addProductDetailsItem() {
    this.productDetails.push(initProductDetails)
  }

  // 删除一条
  deleteProductDetails(index: number) {
    this.productDetails.splice(index, 1)
  }

  // 更新最外层头部基本信息
  updateReceiptDetail<T extends keyof InitReceiptDetailProps>(
    key: T,
    value: InitReceiptDetailProps[T],
  ) {
    this.receiptDetail[key] = value
  }

  changeProductDetailsItem(
    index: number,
    changeData: Partial<WarehouseTransferSheetDetail>,
  ) {
    Object.assign(this.productDetails[index], { ...changeData })
  }

  // 更新向商品列表
  updateProductDetailsItem(
    index: number,
    key: object | string,
    value?: string | number,
  ) {
    const targert = this.productDetails[index]
    if (typeof key === 'object') {
      this.productDetails[index] = {
        ...targert,
        ...key,
      }
    } else {
      this.productDetails[index][key] = value
    }
  }

  // 获取单个商品库存
  async getStockQuantity(sku_id: string) {
    const { out_warehouse_id } = this.receiptDetail
    const { sku_stock } = await commonStore.getStock(sku_id, [out_warehouse_id])
    /** 当前库存数 */
    const currStockQuantity = sku_stock?.stock?.base_unit?.quantity || '0'
    return currStockQuantity
  }

  // 修改选中的商品
  async changeProductNameSelected(index: number, sku: Sku) {
    const currStockQuantity = await this.getStockQuantity(sku?.sku_id)
    this.updateProductDetailsItem(index, {
      sku_id: sku?.sku_id,
      unit_id: sku?.sku_base_unit_id,
      sku_base_unit_name: sku?.sku_base_unit_name,
      currStockQuantity: currStockQuantity,
      sku: sku,
      units: sku?.units || {}, // 自定义单位
      sku_base_unit_id: sku?.sku_base_unit_id, // 商品unit_id
      category_name: sku?.category_name, // 分类
      second_base_unit_id: sku?.second_base_unit_id, // 辅助单位
      second_base_unit_ratio: sku?.second_base_unit_ratio, // 辅助单位
    })
  }

  // 更新数据出入库数
  updateInputOutStock(index: number, key: string, value: number) {
    const productDetail = this.productDetails[index]
    const sku = productDetail?.sku
    const { second_base_unit_id, sku_base_unit_id } = sku
    const { input, input2 } = productDetail.input_out_stock
    // 基本单位
    const inputValue = value
    const input2Value = value ? +Big(+value).times(1) : ''

    const _input_out_stock = {
      input: {
        ...input,
        quantity: inputValue ? inputValue.toString() : '',
        unit_id: sku_base_unit_id,
        price: '0',
      },
      input2: {
        ...input2,
        quantity: input2Value ? input2Value.toString() : '',
        unit_id:
          second_base_unit_id && +second_base_unit_id
            ? second_base_unit_id
            : sku_base_unit_id,
        price: '0',
      },
    }
    _.set(productDetail, key, _input_out_stock)
    this.productDetails[index] = productDetail
  }

  getRelationInfo(k: keyof Additional, keyId: string) {
    if (!this.additional) return {}
    const target = this.additional[k]
    return getInfoByArgs(target, keyId)
  }

  clearApportionItem() {
    this.costAllocations = []
  }

  // 添加费用分摊
  addApportionItem(data: any) {
    const costTarget = this.costAllocations[0]
    const result = _.assign(costTarget, data)

    this.costAllocations[0] = result
  }

  // 已有单据的更新
  updateAndGetReceipt(receiptAction: ReceiptStatusKey, needValid?: boolean) {
    // 如果是删除分摊，needValid为true
    if (!needValid) {
      const canSubmit = this.validateField()
      if (!canSubmit) return Promise.reject(new Error())
    }

    const { status, warehouse_transfer_sheet_id } = this.receiptDetail
    const keepStatus = ['notApproved']
    let statusName: ReceiptStatusKey

    if (
      keepStatus.includes(RECEIPT_STATUS_KEY_NAME[status]) &&
      receiptAction === 'toBeSubmitted' // 驳回下保存草稿保持原有状态
    ) {
      statusName = RECEIPT_STATUS_KEY_NAME[status]
    } else {
      statusName = receiptAction
    }

    const warehouse = {
      ...this.getParams,
      status: RECEIPT_STATUS[statusName],
    }

    const req: UpdateWarehouseTransferSheetRequest = {
      warehouse_transfer_sheet_id: warehouse_transfer_sheet_id,
      warehouse_transfer_sheet: warehouse,
    }

    return UpdateWarehouseTransferSheet(req).then((json) => {
      const { warehouse_transfer_sheet_id } = this.receiptDetail
      this.getTransferSheetDetail(warehouse_transfer_sheet_id)
      return json
    })
  }

  // 全新单据的创建
  createReceipt(receiptAction: ReceiptStatusKey) {
    const canSubmit = this.validateField()
    if (!canSubmit) return Promise.reject(new Error(''))

    const keepStatus = ['notApproved']
    let statusName: ReceiptStatusKey

    if (
      keepStatus.includes(RECEIPT_STATUS_KEY_NAME[this.receiptDetail.status]) &&
      receiptAction === 'toBeSubmitted' // 驳回下保存草稿保持原有状态
    ) {
      statusName = RECEIPT_STATUS_KEY_NAME[this.receiptDetail.status]
    } else {
      statusName = receiptAction
    }

    const req: CreateWarehouseTransferSheetRequest = {
      warehouse_transfer_sheet: {
        ...this.getParams,
        status: RECEIPT_STATUS[statusName],
      },
    }

    return CreateWarehouseTransferSheet(req).then((json) => {
      this.fixResponseData(json.response)
      return json
    })
  }

  changeReceiptLoading(bool: boolean) {
    this.receiptLoading = bool
  }

  // 获取调拨单详情
  getTransferSheetDetail(warehouse_transfer_sheet_id: string) {
    const req = {
      warehouse_transfer_sheet_id,
      is_printed: false,
      with_additional: true,
    }
    return GetWarehouseTransferSheet(req).then((json) => {
      this.fixResponseData(json.response)
    })
  }

  // 批量更新当前商品的库存
  async batchUpdateStock() {
    const {
      productDetails,
      receiptDetail: { out_warehouse_id },
    } = this

    if (!this.validProductDetails.length) return
    this.changeReceiptLoading(true)

    this.productDetails =
      await commonStore.batchGetSkuStock<WarehouseTransferSheetDetail>(
        productDetails,
        out_warehouse_id,
      )
    this.changeReceiptLoading(false)
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
